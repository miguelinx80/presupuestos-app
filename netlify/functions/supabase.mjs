// Netlify serverless function — proxy to Supabase REST API
// Env vars required:
//   SUPABASE_URL          — e.g. https://xxxx.supabase.co
//   SUPABASE_SERVICE_KEY  — service_role key from Settings → API

const URL_BASE = process.env.SUPABASE_URL;
const KEY      = process.env.SUPABASE_SERVICE_KEY;

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type":                 "application/json",
};

function sbHeaders() {
  return {
    "Content-Type":  "application/json",
    "apikey":        KEY,
    "Authorization": `Bearer ${KEY}`,
    "Prefer":        "return=representation",
  };
}

async function sbFetch(path, method = "GET", body) {
  const r = await fetch(`${URL_BASE}/rest/v1${path}`, {
    method,
    headers: sbHeaders(),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const text = await r.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  if (!r.ok) throw new Error(json?.message || json || `Supabase error ${r.status}`);
  return json;
}

export const handler = async (event) => {
  // Preflight CORS
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: CORS, body: "" };
  }

  if (!URL_BASE || !KEY) {
    return { statusCode: 500, headers: CORS,
      body: JSON.stringify({ error: "SUPABASE_URL or SUPABASE_SERVICE_KEY not set" }) };
  }

  try {
    // ── GET: list all projects ────────────────────────────────────────────────
    if (event.httpMethod === "GET") {
      const rows = await sbFetch("/projects?select=id,data&order=updated_at.desc");
      const projects = rows.map(r => ({ ...r.data, id: r.id }));
      return { statusCode: 200, headers: CORS, body: JSON.stringify(projects) };
    }

    // ── POST: create / update / delete ────────────────────────────────────────
    if (event.httpMethod === "POST") {
      const { action, id, project } = JSON.parse(event.body || "{}");

      if (action === "create") {
        const { id: _ignore, ...rest } = project || {};
        const rows = await sbFetch("/projects", "POST", { data: rest });
        const row  = Array.isArray(rows) ? rows[0] : rows;
        return { statusCode: 200, headers: CORS,
          body: JSON.stringify({ ...row.data, id: row.id }) };
      }

      if (action === "update") {
        const { id: _ignore, ...rest } = project || {};
        const rows = await sbFetch(
          `/projects?id=eq.${id}`, "PATCH",
          { data: rest, updated_at: new Date().toISOString() }
        );
        const row = Array.isArray(rows) ? rows[0] : rows;
        return { statusCode: 200, headers: CORS,
          body: JSON.stringify({ ...row.data, id: row.id }) };
      }

      if (action === "delete") {
        await sbFetch(`/projects?id=eq.${id}`, "DELETE");
        return { statusCode: 200, headers: CORS,
          body: JSON.stringify({ success: true }) };
      }

      return { statusCode: 400, headers: CORS,
        body: JSON.stringify({ error: "Unknown action" }) };
    }

    return { statusCode: 405, headers: CORS,
      body: JSON.stringify({ error: "Method not allowed" }) };

  } catch (err) {
    console.error("Supabase error:", err);
    return { statusCode: 500, headers: CORS,
      body: JSON.stringify({ error: err.message }) };
  }
};
