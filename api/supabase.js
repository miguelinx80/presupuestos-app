// Vercel serverless function — proxy to Supabase REST API
// Env vars required:
//   SUPABASE_URL          — e.g. https://xxxx.supabase.co
//   SUPABASE_SERVICE_KEY  — service_role key from Settings → API

const URL_BASE = process.env.SUPABASE_URL;
const KEY      = process.env.SUPABASE_SERVICE_KEY;

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

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (!URL_BASE || !KEY) {
    return res.status(500).json({ error: "SUPABASE_URL or SUPABASE_SERVICE_KEY not set" });
  }

  try {
    // ── GET: list all projects ─────────────────────────────────────────────────
    if (req.method === "GET") {
      const rows = await sbFetch("/projects?select=id,data&order=updated_at.desc");
      const projects = rows.map(r => ({ ...r.data, id: r.id }));
      return res.status(200).json(projects);
    }

    // ── POST: create / update / delete ─────────────────────────────────────────
    if (req.method === "POST") {
      const { action, id, project } = req.body || {};

      if (action === "create") {
        const { id: _ignore, ...rest } = project || {};
        const rows = await sbFetch("/projects", "POST", { data: rest });
        const row  = Array.isArray(rows) ? rows[0] : rows;
        return res.status(200).json({ ...row.data, id: row.id });
      }

      if (action === "update") {
        const { id: _ignore, ...rest } = project || {};
        const rows = await sbFetch(
          `/projects?id=eq.${id}`,
          "PATCH",
          { data: rest, updated_at: new Date().toISOString() }
        );
        const row = Array.isArray(rows) ? rows[0] : rows;
        return res.status(200).json({ ...row.data, id: row.id });
      }

      if (action === "delete") {
        await sbFetch(`/projects?id=eq.${id}`, "DELETE");
        return res.status(200).json({ success: true });
      }

      return res.status(400).json({ error: "Unknown action" });
    }

    return res.status(405).json({ error: "Method not allowed" });

  } catch (err) {
    console.error("Supabase error:", err);
    return res.status(500).json({ error: err.message });
  }
}
