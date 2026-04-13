// Vercel serverless function — proxy to Notion API
// Env vars required:
//   NOTION_TOKEN        — Integration token (secret_...)
//   NOTION_DATABASE_ID  — Proyectos database ID

const TOKEN = process.env.NOTION_TOKEN;
const DB_ID = process.env.NOTION_DATABASE_ID || "b386fccd-93fd-405b-ad41-759dbf7a86af";
const NOTION_VER = "2022-06-28";
const BASE = "https://api.notion.com/v1";
const CHUNK = 1990; // Notion rich_text max chars per element

// ─── Helpers ─────────────────────────────────────────────────────────────────

function headers() {
  return {
    Authorization: `Bearer ${TOKEN}`,
    "Content-Type": "application/json",
    "Notion-Version": NOTION_VER,
  };
}

function toChunks(str) {
  const out = [];
  for (let i = 0; i < str.length; i += CHUNK)
    out.push({ type: "text", text: { content: str.slice(i, i + CHUNK) } });
  return out.length ? out : [{ type: "text", text: { content: "" } }];
}

function fromChunks(arr) {
  if (!arr || !arr.length) return "";
  return arr.map(r => r.plain_text || r.text?.content || "").join("");
}

function rt(str) {
  // rich_text array from a plain string
  const s = str ? String(str).slice(0, 2000) : "";
  return [{ type: "text", text: { content: s } }];
}

// Status mapping: app "Facturado" <-> Notion "Completado"
function statusToNotion(s)   { return s === "Facturado" ? "Completado" : (s || "Pendiente"); }
function statusFromNotion(s) { return s === "Completado" ? "Facturado" : (s || "Pendiente"); }
function optToNotion(o)      { return o ? `Opción ${o}` : null; }
function optFromNotion(s)    { return s ? s.replace("Opción ", "") : null; }

// ─── Notion page → app project ────────────────────────────────────────────────

function pageToProject(page) {
  const p = page.properties || {};

  let app = {};
  try {
    const raw = fromChunks(p.AppData?.rich_text);
    if (raw) app = JSON.parse(raw);
  } catch {}

  const ubicacion = fromChunks(p.Ubicación?.rich_text) || "";
  const parts = ubicacion.split(",").map(s => s.trim());

  return {
    id:           page.id,
    ref:          p.Proyecto?.title?.[0]?.plain_text || "",
    brand:        p.Marca?.select?.name || "",
    client:       fromChunks(p.Cliente?.rich_text) || "",
    city:         app.city  || parts[0] || "",
    country:      app.country || parts.slice(1).join(", ") || "",
    sqm:          parseFloat(fromChunks(p.Size?.rich_text)) || null,
    status:       statusFromNotion(p.Estado?.select?.name),
    chosenOption: optFromNotion(p["Opción seleccionada"]?.select?.name),
    startDate:    p.Fecha?.date?.start || "",
    photoFee:     p["Photography Fee"]?.number || "",
    notes:        fromChunks(p.Notas?.rich_text) || "",
    year:         p["Año"]?.number || app.year || (p.Fecha?.date?.start ? new Date(p.Fecha.date.start + "T12:00:00").getFullYear() : new Date().getFullYear()),
    duration:     p["Duración (h)"]?.number || app.duration || null,
    locations:    app.locations  || [],
    expenses:     app.expenses   || [],
    options:      app.options    || { A: { subtotal: 0, total: 0 } },
    documents:    app.documents  || [],
    checklist:    app.checklist  || [],
  };
}

// ─── App project → Notion properties ─────────────────────────────────────────

function projectToProps(project) {
  // Detailed data stored as JSON chunks in AppData
  const appData = JSON.stringify({
    city:      project.city      || "",
    country:   project.country   || "",
    year:      project.year      || new Date().getFullYear(),
    duration:  project.duration  || null,
    locations: project.locations || [],
    expenses:  project.expenses  || [],
    options:   project.options   || {},
    documents: project.documents || [],
    checklist: project.checklist || [],
  });

  const opt = project.chosenOption;
  const expSub = opt && project.options?.[opt] ? project.options[opt].subtotal : null;

  const props = {
    Proyecto:           { title: [{ text: { content: project.ref || "" } }] },
    Cliente:            { rich_text: rt(project.client) },
    Estado:             { select: { name: statusToNotion(project.status) } },
    Marca:              { select: { name: project.brand || "Otro" } },
    "Photography Fee":  { number: project.photoFee ? Number(project.photoFee) : null },
    Size:               { rich_text: rt(project.sqm != null ? String(project.sqm) : "") },
    "Gastos Cliente":   { number: expSub },
    Notas:              { rich_text: rt(project.notes) },
    Ubicación:          { rich_text: rt([project.city, project.country].filter(Boolean).join(", ")) },
    AppData:            { rich_text: toChunks(appData) },
    "Año":              { number: project.year ? Number(project.year) : null },
    "Duración (h)":     { number: project.duration ? Number(project.duration) : null },
    "Opción seleccionada": project.chosenOption
      ? { select: { name: optToNotion(project.chosenOption) } }
      : { select: null },
    Fecha: project.startDate
      ? { date: { start: project.startDate } }
      : { date: null },
  };

  return props;
}

// ─── Fetch all pages (handles pagination) ─────────────────────────────────────

async function queryAll() {
  let results = [];
  let cursor;
  do {
    const body = {
      sorts: [{ property: "Fecha", direction: "descending" }],
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {}),
    };
    const r = await fetch(`${BASE}/databases/${DB_ID}/query`, {
      method: "POST", headers: headers(), body: JSON.stringify(body),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || `Notion error ${r.status}`);
    results = results.concat(data.results || []);
    cursor = data.has_more ? data.next_cursor : null;
  } while (cursor);
  return results;
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (!TOKEN) return res.status(500).json({ error: "NOTION_TOKEN not set" });

  try {
    // ── GET: list all projects ──────────────────────────────────────────────
    if (req.method === "GET") {
      const pages = await queryAll();
      return res.status(200).json(pages.map(pageToProject));
    }

    // ── POST: create / update / delete ──────────────────────────────────────
    if (req.method === "POST") {
      const { action, id, project } = req.body || {};

      if (action === "create") {
        const r = await fetch(`${BASE}/pages`, {
          method: "POST", headers: headers(),
          body: JSON.stringify({
            parent: { database_id: DB_ID },
            properties: projectToProps(project),
          }),
        });
        const page = await r.json();
        if (!r.ok) throw new Error(page.message || `Notion error ${r.status}`);
        return res.status(200).json(pageToProject(page));
      }

      if (action === "update") {
        const r = await fetch(`${BASE}/pages/${id}`, {
          method: "PATCH", headers: headers(),
          body: JSON.stringify({ properties: projectToProps(project) }),
        });
        const page = await r.json();
        if (!r.ok) throw new Error(page.message || `Notion error ${r.status}`);
        return res.status(200).json(pageToProject(page));
      }

      if (action === "delete") {
        const r = await fetch(`${BASE}/pages/${id}`, {
          method: "PATCH", headers: headers(),
          body: JSON.stringify({ archived: true }),
        });
        if (!r.ok) { const e = await r.json(); throw new Error(e.message); }
        return res.status(200).json({ success: true });
      }

      return res.status(400).json({ error: "Unknown action" });
    }

    return res.status(405).json({ error: "Method not allowed" });

  } catch (err) {
    console.error("Notion API error:", err);
    return res.status(500).json({ error: err.message });
  }
}
