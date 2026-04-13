import { useState, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  Building2, Search, Plus, ChevronRight, ArrowLeft, MapPin, User,
  Calendar, Ruler, TrendingUp, CheckCircle2, Clock, XCircle,
  Euro, Edit3, Trash2, Save, X, Plane, Car, Hotel,
  Utensils, Bus, ExternalLink, ChevronDown, ChevronUp, Navigation, FileText,
  Copy, CloudSun, ClipboardCheck, Check
} from "lucide-react";

// ─── THEME ───────────────────────────────────────────────────────────────────
const C = {
  navy:       "#1a2a4a",
  navyDark:   "#0f1e38",
  navyLight:  "#243460",
  green:      "#1B5E20",
  greenLight: "#43a047",
  gold:       "#F1C232",
  bg:         "#f4f6fb",
  card:       "#ffffff",
  border:     "#e2e8f0",
  textDark:   "#1a2a4a",
  textMid:    "#475569",
  textLight:  "#94a3b8",
};

const STATUS_CONFIG = {
  Pendiente:  { color: "#b45309", bg: "#fef3c7", icon: Clock },
  Confirmado: { color: "#0369a1", bg: "#e0f2fe", icon: CheckCircle2 },
  Facturado:  { color: "#166534", bg: "#dcfce7", icon: CheckCircle2 },
  Cancelado:  { color: "#991b1b", bg: "#fee2e2", icon: XCircle },
};

const OPTION_COLORS = {
  A: { bg: "#fff7e6", border: "#F1C232", text: "#92400e", badge: "#d97706" },
  B: { bg: "#f0fdf4", border: "#43a047", text: "#14532d", badge: "#16a34a" },
  C: { bg: "#eff6ff", border: "#3b82f6", text: "#1e3a8a", badge: "#2563eb" },
  D: { bg: "#fdf4ff", border: "#a855f7", text: "#581c87", badge: "#9333ea" },
};

function getCatIcon(desc = "") {
  const d = desc.toLowerCase();
  if (d.includes(">") || d.includes("vuelo") || d.includes("airline")) return Plane;
  if (d.includes("hotel") || d.includes("alojamiento")) return Hotel;
  if (d.includes("coche") || d.includes("car") || d.includes("gasolina") || d.includes("peaje")) return Car;
  if (d.includes("dieta") || d.includes("restaur") || d.includes("día")) return Utensils;
  if (d.includes("transporte") || d.includes("taxi") || d.includes("bus")) return Bus;
  return Euro;
}

// Format date from YYYY-MM-DD to DD/MM/YYYY for display
const fmtDate = (s) => {
  if (!s) return "—";
  const [y, m, d] = s.split("-");
  if (!y) return s;
  return d ? `${d}/${m}/${y}` : m ? `${m}/${y}` : y;
};

// ─── SAMPLE DATA ─────────────────────────────────────────────────────────────
// Location object: { id, name, mapsUrl, date (YYYY-MM-DD), time, notes }
const INITIAL_PROJECTS = [
  {
    id: 1,
    ref: "CKO Roppenheim",
    brand: "CKO",
    city: "Roppenheim",
    country: "Francia",
    client: "COS – H&M Group",
    sqm: 359,
    status: "Confirmado",
    chosenOption: "A",
    year: 2024,
    startDate: "2024-07-28",
    duration: 6,
    locations: [
      { id: 1, name: "COS Roppenheim – Designers Outlet", mapsUrl: "https://maps.google.com/?q=Roppenheim+The+Style+Outlets", date: "2024-07-29", time: "10:00", notes: "Reunión con el responsable de tienda" },
      { id: 2, name: "Hotel – Restaurante La Couronne", mapsUrl: "https://maps.google.com/?q=Roppenheim+hotel", date: "2024-07-29", time: "20:00", notes: "Alojamiento" },
    ],
    options: { A: { subtotal: 1025, total: 1230 } },
    expenses: [
      { id: 1, desc: "SVQ>BCN>BSL", url: "https://www.google.com/travel/flights", date: "2024-07-29", time: "6:50 – 13:30", provider: "Vueling", tarifa: "178/205", optA: 205, optB: null, optC: null, optD: null },
      { id: 2, desc: "BSL>BCN>SVQ", url: "https://www.google.com/travel/flights", date: "2024-07-30", time: "13:30 – 23:30", provider: "Vueling", tarifa: "188/215", optA: 215, optB: null, optC: null, optD: null },
      { id: 3, desc: "Alquiler coche BSL", url: "https://www.europcar.com", date: "", time: "", provider: "Europcar", tarifa: "", optA: 180, optB: null, optC: null, optD: null },
      { id: 4, desc: "Gasolina+peajes", url: "https://tollguru.com", date: "", time: "", provider: "", tarifa: "", optA: 55, optB: null, optC: null, optD: null },
      { id: 5, desc: "Hotel Roppenheim", url: "https://booking.com", date: "", time: "", provider: "Hotel - Restaurante La Co...", tarifa: "90", optA: 90, optB: null, optC: null, optD: null },
      { id: 6, desc: "Dietas", url: "", date: "", time: "", provider: "", tarifa: "", optA: 150, optB: null, optC: null, optD: null },
      { id: 7, desc: "Días fuera", url: "", date: "", time: "", provider: "", tarifa: "", optA: 80, optB: null, optC: null, optD: null },
      { id: 8, desc: "Transporte Sevilla", url: "", date: "", time: "", provider: "", tarifa: "", optA: 50, optB: null, optC: null, optD: null },
    ]
  },
  {
    id: 2,
    ref: "CKO Getafe",
    brand: "CKO",
    city: "Getafe",
    country: "España",
    client: "COS – H&M Group",
    sqm: 180,
    status: "Facturado",
    chosenOption: "B",
    year: 2024,
    startDate: "2024-01-15",
    duration: 4,
    locations: [
      { id: 1, name: "COS Getafe – X-Madrid", mapsUrl: "https://maps.google.com/?q=X-Madrid+Getafe", date: "2024-01-15", time: "11:00", notes: "" },
    ],
    options: { A: { subtotal: 354, total: 424.8 }, B: { subtotal: 390, total: 468 } },
    expenses: [
      { id: 1, desc: "SVQ>MAD", url: "", date: "2024-01-15", time: "7:00 – 8:30", provider: "Iberia", tarifa: "89/110", optA: 89, optB: 110, optC: null, optD: null },
      { id: 2, desc: "MAD>SVQ", url: "", date: "2024-01-16", time: "19:00 – 20:30", provider: "Iberia", tarifa: "79/95", optA: 79, optB: 95, optC: null, optD: null },
      { id: 3, desc: "Hotel Getafe", url: "", date: "", time: "", provider: "NH Hotels", tarifa: "95", optA: 95, optB: 95, optC: null, optD: null },
      { id: 4, desc: "Transporte Madrid", url: "", date: "", time: "", provider: "", tarifa: "", optA: 45, optB: 45, optC: null, optD: null },
      { id: 5, desc: "Dietas", url: "", date: "", time: "", provider: "", tarifa: "", optA: 46, optB: 45, optC: null, optD: null },
    ]
  },
  {
    id: 3,
    ref: "TH Molfetta",
    brand: "TH",
    city: "Molfetta",
    country: "Italia",
    client: "Tommy Hilfiger",
    sqm: 460,
    status: "Pendiente",
    chosenOption: null,
    year: 2024,
    startDate: "2024-05-12",
    duration: 6,
    locations: [
      { id: 1, name: "TH Molfetta – Molfetta Outlet", mapsUrl: "https://maps.google.com/?q=Molfetta+Outlet", date: "2024-05-12", time: "14:00", notes: "Primera visita" },
      { id: 2, name: "TH Molfetta – revisita montaje", mapsUrl: "https://maps.google.com/?q=Molfetta+Outlet", date: "2024-05-14", time: "9:00", notes: "Supervisión final" },
    ],
    options: { A: { subtotal: 844, total: 1012.8 }, B: { subtotal: 909, total: 1090.8 }, C: { subtotal: 772, total: 926.4 } },
    expenses: [
      { id: 1, desc: "SVQ>BCN>BRI", url: "", date: "2024-05-12", time: "6:30 – 12:45", provider: "Vueling", tarifa: "145/175/195", optA: 145, optB: 175, optC: 195, optD: null },
      { id: 2, desc: "BRI>BCN>SVQ", url: "", date: "2024-05-14", time: "15:00 – 21:30", provider: "Vueling", tarifa: "138/168/185", optA: 138, optB: 168, optC: 185, optD: null },
      { id: 3, desc: "Alquiler coche BRI", url: "", date: "", time: "", provider: "Hertz", tarifa: "", optA: 95, optB: 95, optC: 95, optD: null },
      { id: 4, desc: "Hotel Molfetta", url: "", date: "", time: "", provider: "B&B Molfetta", tarifa: "110", optA: 110, optB: 110, optC: 110, optD: null },
      { id: 5, desc: "Gasolina+peajes", url: "", date: "", time: "", provider: "", tarifa: "", optA: 60, optB: 60, optC: 60, optD: null },
      { id: 6, desc: "Dietas", url: "", date: "", time: "", provider: "", tarifa: "", optA: 150, optB: 150, optC: 80, optD: null },
      { id: 7, desc: "Días fuera", url: "", date: "", time: "", provider: "", tarifa: "", optA: 80, optB: 80, optC: 80, optD: null },
    ]
  },
  {
    id: 4,
    ref: "Loewe Cernobbio",
    brand: "Loewe",
    city: "Cernobbio",
    country: "Italia",
    client: "LVMH – Loewe",
    sqm: 310,
    status: "Facturado",
    chosenOption: "B",
    year: 2024,
    startDate: "2024-04-08",
    duration: 4,
    locations: [
      { id: 1, name: "Loewe – McArthurGlen Serravalle", mapsUrl: "https://maps.google.com/?q=McArthurGlen+Serravalle+Designer+Outlet", date: "2024-04-08", time: "10:30", notes: "" },
    ],
    options: { A: { subtotal: 689, total: 826.8 }, B: { subtotal: 790, total: 948 }, C: { subtotal: 768, total: 921.6 } },
    expenses: [
      { id: 1, desc: "SVQ>MXP", url: "", date: "2024-04-08", time: "7:15 – 10:30", provider: "Ryanair", tarifa: "120/155/145", optA: 120, optB: 155, optC: 145, optD: null },
      { id: 2, desc: "MXP>SVQ", url: "", date: "2024-04-10", time: "18:00 – 21:00", provider: "Ryanair", tarifa: "115/148/138", optA: 115, optB: 148, optC: 138, optD: null },
      { id: 3, desc: "Hotel Cernobbio", url: "https://booking.com", date: "", time: "", provider: "Villa d'Este", tarifa: "250", optA: 250, optB: 280, optC: 280, optD: null },
      { id: 4, desc: "Transporte aeropuerto", url: "", date: "", time: "", provider: "Taxi", tarifa: "", optA: 60, optB: 60, optC: 60, optD: null },
      { id: 5, desc: "Dietas", url: "", date: "", time: "", provider: "", tarifa: "", optA: 144, optB: 147, optC: 145, optD: null },
    ]
  },
  {
    id: 5,
    ref: "TH Kalverstraat",
    brand: "TH",
    city: "Amsterdam",
    country: "Países Bajos",
    client: "Tommy Hilfiger",
    sqm: 520,
    status: "Facturado",
    chosenOption: "A",
    year: 2024,
    startDate: "2024-06-03",
    duration: 7,
    locations: [
      { id: 1, name: "TH Kalverstraat – flagship Amsterdam", mapsUrl: "https://maps.google.com/?q=Kalverstraat+Amsterdam", date: "2024-06-03", time: "11:00", notes: "Reunión equipo local" },
      { id: 2, name: "TH Kalverstraat – revisita", mapsUrl: "https://maps.google.com/?q=Kalverstraat+Amsterdam", date: "2024-06-05", time: "9:00", notes: "Supervisión montaje final" },
    ],
    options: { A: { subtotal: 986, total: 1183.2 }, B: { subtotal: 1023, total: 1227.6 } },
    expenses: [
      { id: 1, desc: "SVQ>AMS", url: "", date: "2024-06-03", time: "8:00 – 12:30", provider: "KLM", tarifa: "210/245", optA: 210, optB: 245, optC: null, optD: null },
      { id: 2, desc: "AMS>SVQ", url: "", date: "2024-06-05", time: "15:00 – 19:30", provider: "KLM", tarifa: "195/228", optA: 195, optB: 228, optC: null, optD: null },
      { id: 3, desc: "Hotel Amsterdam", url: "", date: "", time: "", provider: "Marriott", tarifa: "220", optA: 220, optB: 220, optC: null, optD: null },
      { id: 4, desc: "Transporte local", url: "", date: "", time: "", provider: "", tarifa: "", optA: 35, optB: 35, optC: null, optD: null },
      { id: 5, desc: "Dietas", url: "", date: "", time: "", provider: "", tarifa: "", optA: 180, optB: 180, optC: null, optD: null },
      { id: 6, desc: "Días fuera", url: "", date: "", time: "", provider: "", tarifa: "", optA: 146, optB: 115, optC: null, optD: null },
    ]
  },
  // ── 2025 ──────────────────────────────────────────────────────────────────
  {
    id: 6,
    ref: "Loewe Fidenza",
    brand: "Loewe",
    city: "Fidenza",
    country: "Italia",
    client: "LVMH – Loewe",
    sqm: 295,
    status: "Confirmado",
    chosenOption: "B",
    year: 2025,
    startDate: "2025-02-10",
    duration: 5,
    locations: [
      { id: 1, name: "Loewe – Fidenza Village", mapsUrl: "https://maps.google.com/?q=Fidenza+Village+outlet", date: "2025-02-10", time: "10:00", notes: "" },
    ],
    options: { A: { subtotal: 720, total: 864 }, B: { subtotal: 850, total: 1020 } },
    expenses: [
      { id: 1, desc: "SVQ>MXP", url: "", date: "2025-02-10", time: "7:00 – 10:15", provider: "Ryanair", tarifa: "110/140", optA: 110, optB: 140, optC: null, optD: null },
      { id: 2, desc: "MXP>SVQ", url: "", date: "2025-02-12", time: "17:30 – 20:30", provider: "Ryanair", tarifa: "105/132", optA: 105, optB: 132, optC: null, optD: null },
      { id: 3, desc: "Alquiler coche MXP", url: "", date: "", time: "", provider: "Hertz", tarifa: "", optA: 130, optB: 130, optC: null, optD: null },
      { id: 4, desc: "Hotel Fidenza", url: "", date: "", time: "", provider: "Hotel Astoria", tarifa: "85", optA: 85, optB: 170, optC: null, optD: null },
      { id: 5, desc: "Dietas", url: "", date: "", time: "", provider: "", tarifa: "", optA: 120, optB: 148, optC: null, optD: null },
      { id: 6, desc: "Gasolina+peajes", url: "", date: "", time: "", provider: "", tarifa: "", optA: 70, optB: 70, optC: null, optD: null },
    ]
  },
  {
    id: 7,
    ref: "CK Maasmechelen",
    brand: "CK",
    city: "Maasmechelen",
    country: "Bélgica",
    client: "Calvin Klein",
    sqm: 340,
    status: "Pendiente",
    chosenOption: null,
    year: 2025,
    startDate: "2025-04-22",
    duration: 5,
    locations: [
      { id: 1, name: "CK – Maasmechelen Village", mapsUrl: "https://maps.google.com/?q=Maasmechelen+Village+outlet", date: "2025-04-22", time: "11:00", notes: "Primera visita de medición" },
    ],
    options: { A: { subtotal: 810, total: 972 }, B: { subtotal: 890, total: 1068 } },
    expenses: [
      { id: 1, desc: "SVQ>BCN>BRU", url: "", date: "2025-04-22", time: "6:45 – 11:30", provider: "Vueling", tarifa: "165/195", optA: 165, optB: 195, optC: null, optD: null },
      { id: 2, desc: "BRU>BCN>SVQ", url: "", date: "2025-04-24", time: "14:00 – 19:45", provider: "Vueling", tarifa: "155/182", optA: 155, optB: 182, optC: null, optD: null },
      { id: 3, desc: "Alquiler coche BRU", url: "", date: "", time: "", provider: "Avis", tarifa: "", optA: 140, optB: 140, optC: null, optD: null },
      { id: 4, desc: "Hotel Maasmechelen", url: "", date: "", time: "", provider: "Ibis", tarifa: "95", optA: 95, optB: 95, optC: null, optD: null },
      { id: 5, desc: "Gasolina+peajes", url: "", date: "", time: "", provider: "", tarifa: "", optA: 65, optB: 65, optC: null, optD: null },
      { id: 6, desc: "Dietas", url: "", date: "", time: "", provider: "", tarifa: "", optA: 130, optB: 130, optC: null, optD: null },
    ]
  },
  {
    id: 8,
    ref: "TH La Vallée",
    brand: "TH",
    city: "Serris",
    country: "Francia",
    client: "Tommy Hilfiger",
    sqm: 410,
    status: "Pendiente",
    chosenOption: null,
    year: 2025,
    startDate: "2025-05-15",
    duration: 6,
    locations: [
      { id: 1, name: "TH – La Vallée Village (Disneyland Paris)", mapsUrl: "https://maps.google.com/?q=La+Vallee+Village+outlet+Paris", date: "2025-05-15", time: "10:30", notes: "" },
    ],
    options: { A: { subtotal: 920, total: 1104 }, B: { subtotal: 1050, total: 1260 } },
    expenses: [
      { id: 1, desc: "SVQ>CDG", url: "", date: "2025-05-15", time: "8:00 – 11:00", provider: "Air France", tarifa: "175/210", optA: 175, optB: 210, optC: null, optD: null },
      { id: 2, desc: "CDG>SVQ", url: "", date: "2025-05-17", time: "16:00 – 19:00", provider: "Air France", tarifa: "168/200", optA: 168, optB: 200, optC: null, optD: null },
      { id: 3, desc: "Hotel Serris", url: "", date: "", time: "", provider: "Marriott", tarifa: "180", optA: 180, optB: 240, optC: null, optD: null },
      { id: 4, desc: "Transporte CDG–hotel", url: "", date: "", time: "", provider: "RER B + navette", tarifa: "", optA: 40, optB: 40, optC: null, optD: null },
      { id: 5, desc: "Dietas", url: "", date: "", time: "", provider: "", tarifa: "", optA: 180, optB: 200, optC: null, optD: null },
      { id: 6, desc: "Días fuera", url: "", date: "", time: "", provider: "", tarifa: "", optA: 80, optB: 80, optC: null, optD: null },
    ]
  },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt  = (n) => n != null ? `€${Number(n).toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : "—";
const fmtD = (n) => n != null ? `€${Number(n).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—";
const optKey = (o) => `opt${o}`;
const newLocId = () => Date.now() + Math.random();

// ─── SUPABASE SYNC ───────────────────────────────────────────────────────────

const CACHE_KEY = "presupuestos_sb_cache";

function useProjects() {
  const [projects, setProjectsRaw] = useState(() => {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY) || "null") || INITIAL_PROJECTS; }
    catch { return INITIAL_PROJECTS; }
  });
  const [loading, setLoading] = useState(true);
  const [syncErr, setSyncErr] = useState(null);

  const byDate = (list) =>
    [...list].sort((a, b) => (b.startDate || "").localeCompare(a.startDate || ""));

  const persist = (list) => {
    const sorted = byDate(list);
    setProjectsRaw(sorted);
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(sorted)); } catch {}
  };

  useEffect(() => {
    let cancelled = false;
    fetch("/api/supabase")
      .then(r => r.ok ? r.json() : r.json().then(e => Promise.reject(e.error)))
      .then(data => { if (!cancelled) { persist(data); setSyncErr(null); } })
      .catch(err => { if (!cancelled) setSyncErr(String(err)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const post = (body) =>
    fetch("/api/supabase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(r => r.ok ? r.json() : r.json().then(e => Promise.reject(e.error)));

  const save = async (updated) => {
    persist(projects.map(p => p.id === updated.id ? updated : p));
    try {
      const fresh = await post({ action: "update", id: updated.id, project: updated });
      persist(projects.map(p => p.id === updated.id ? { ...fresh, id: updated.id } : p));
    } catch (e) { setSyncErr(String(e)); }
  };

  const create = async (project) => {
    try {
      const fresh = await post({ action: "create", project });
      const list = [fresh, ...projects];
      persist(list);
      return fresh;
    } catch (e) { setSyncErr(String(e)); return null; }
  };

  const remove = async (id) => {
    persist(projects.filter(p => p.id !== id));
    try { await post({ action: "delete", id }); }
    catch (e) { setSyncErr(String(e)); }
  };

  return { projects, loading, syncErr, save, create, remove };
}

// ─── MY INFO ─────────────────────────────────────────────────────────────────
const MY_INFO = {
  name:     "Miguel Jiménez Fernández",
  vat:      "VAT: ES77804626L",
  phone:    "(+34) 687 650 005",
  websites: ["www.migueljimenez.com", "www.espaciosdeluz.com"],
};

const DOC_TYPES = ["Plano", "Foto", "Shoot list", "Contrato", "Presupuesto", "Referencia", "Otro"];
const DOC_ICONS = { "Plano":"📐","Foto":"🖼️","Shoot list":"📋","Contrato":"📝","Presupuesto":"💼","Referencia":"🔗","Otro":"📄" };

// Quote number: DDMMYY_1
function defaultQuoteRef() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2,"0");
  const mm = String(d.getMonth()+1).padStart(2,"0");
  const yy = String(d.getFullYear()).slice(2);
  return `${dd}${mm}${yy}_1`;
}

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Pendiente;
  const Icon = cfg.icon;
  return (
    <span style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30` }}
      className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full">
      <Icon size={11} />{status}
    </span>
  );
}

function StatCard({ label, value, sub, icon: Icon, accent }) {
  return (
    <div className="rounded-xl p-4 flex flex-col gap-1" style={{ background: C.card, border: `1px solid ${C.border}` }}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium" style={{ color: C.textMid }}>{label}</span>
        <span className="rounded-lg p-1.5" style={{ background: accent + "18" }}>
          <Icon size={15} style={{ color: accent }} />
        </span>
      </div>
      <span className="text-2xl font-bold" style={{ color: C.textDark }}>{value}</span>
      {sub && <span className="text-xs" style={{ color: C.textLight }}>{sub}</span>}
    </div>
  );
}

// ─── WEATHER HELPER ──────────────────────────────────────────────────────────
function buildWeatherUrl(city, country) {
  const place = [city, country].filter(Boolean).join(", ");
  if (!place) return null;
  return `https://wttr.in/${encodeURIComponent(place)}?lang=es`;
}

// ─── LOCATIONS SECTION ────────────────────────────────────────────────────────
function LocationsSection({ locations = [], editing, onChange, city = "", country = "" }) {
  const addLoc = () => onChange([...locations, { id: newLocId(), name: "", mapsUrl: "", suncalcUrl: "", date: "", time: "", notes: "" }]);
  const updateLoc = (id, field, val) => onChange(locations.map(l => l.id === id ? { ...l, [field]: val } : l));
  const deleteLoc = (id) => onChange(locations.filter(l => l.id !== id));

  const inputSt = { background: "#f8fafc", border: `1px solid ${C.border}`, color: C.textDark };

  return (
    <div className="rounded-xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: C.textDark }}>
          <Navigation size={15} style={{ color: C.navy }} /> Ubicaciones
        </h3>
        {editing && (
          <button type="button" onClick={addLoc}
            className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg"
            style={{ background: C.navy + "12", color: C.navy }}>
            <Plus size={12} /> Añadir ubicación
          </button>
        )}
      </div>

      {locations.length === 0 && !editing && (
        <p className="text-xs" style={{ color: C.textLight }}>Sin ubicaciones registradas.</p>
      )}
      {locations.length === 0 && editing && (
        <p className="text-xs" style={{ color: C.textLight }}>
          Añade ubicaciones con su fecha, hora y enlace a Google Maps.
        </p>
      )}

      <div className="space-y-3">
        {locations.map((loc, i) => (
          <div key={loc.id} className="rounded-lg p-3"
            style={{ background: "#f8fafc", border: `1px solid ${C.border}` }}>
            {editing ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: C.navy, color: "#fff" }}>{i + 1}</span>
                  <input value={loc.name} onChange={e => updateLoc(loc.id, "name", e.target.value)}
                    placeholder="Nombre del lugar (ej. COS Roppenheim – Designers Outlet)"
                    className="flex-1 rounded px-2 py-1.5 text-sm outline-none font-medium"
                    style={inputSt} />
                  <button type="button" onClick={() => deleteLoc(loc.id)}
                    className="text-red-400 hover:text-red-600 flex-shrink-0"><X size={15} /></button>
                </div>
                <div className="grid grid-cols-2 gap-2 pl-7">
                  <div>
                    <label className="text-xs block mb-1" style={{ color: C.textLight }}>Fecha</label>
                    <input type="date" value={loc.date} onChange={e => updateLoc(loc.id, "date", e.target.value)}
                      className="w-full rounded px-2 py-1.5 text-sm outline-none"
                      style={inputSt} />
                  </div>
                  <div>
                    <label className="text-xs block mb-1" style={{ color: C.textLight }}>Hora</label>
                    <input type="time" value={loc.time} onChange={e => updateLoc(loc.id, "time", e.target.value)}
                      className="w-full rounded px-2 py-1.5 text-sm outline-none"
                      style={inputSt} />
                  </div>
                  <div>
                    <label className="text-xs block mb-1" style={{ color: C.textLight }}>Enlace Google Maps</label>
                    <input value={loc.mapsUrl} onChange={e => updateLoc(loc.id, "mapsUrl", e.target.value)}
                      placeholder="https://maps.google.com/?q=..."
                      className="w-full rounded px-2 py-1.5 text-sm outline-none"
                      style={inputSt} />
                  </div>
                  <div>
                    <label className="text-xs block mb-1" style={{ color: C.textLight }}>Enlace SunCalc ☀️</label>
                    <input value={loc.suncalcUrl || ""} onChange={e => updateLoc(loc.id, "suncalcUrl", e.target.value)}
                      placeholder="https://www.suncalc.org/#/..."
                      className="w-full rounded px-2 py-1.5 text-sm outline-none"
                      style={inputSt} />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs block mb-1" style={{ color: C.textLight }}>Notas</label>
                    <input value={loc.notes} onChange={e => updateLoc(loc.id, "notes", e.target.value)}
                      placeholder="Reunión con responsable, supervisión montaje..."
                      className="w-full rounded px-2 py-1.5 text-sm outline-none"
                      style={inputSt} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <span className="text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: C.navy, color: "#fff" }}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {loc.mapsUrl
                      ? <a href={loc.mapsUrl} target="_blank" rel="noopener noreferrer"
                          className="font-semibold text-sm hover:underline flex items-center gap-1"
                          style={{ color: "#2563eb" }}>
                          <MapPin size={13} />{loc.name || "Ver en mapa"}
                          <ExternalLink size={11} />
                        </a>
                      : <span className="font-semibold text-sm" style={{ color: C.textDark }}>
                          <MapPin size={13} className="inline mr-1" style={{ color: C.textLight }} />
                          {loc.name || "Sin nombre"}
                        </span>}
                    {loc.suncalcUrl && (
                      <a href={loc.suncalcUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full hover:opacity-80"
                        style={{ background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" }}
                        title="Ver posición del sol en SunCalc">
                        ☀️ SunCalc
                      </a>
                    )}
                    {(() => {
                      const weatherUrl = buildWeatherUrl(city, country);
                      return weatherUrl ? (
                        <a href={weatherUrl} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full hover:opacity-80"
                          style={{ background: "#e0f2fe", color: "#0369a1", border: "1px solid #bae6fd" }}
                          title="Ver previsión meteorológica">
                          <CloudSun size={11}/> Meteo
                        </a>
                      ) : null;
                    })()}
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {loc.date && (
                      <span className="text-xs flex items-center gap-1" style={{ color: C.textMid }}>
                        <Calendar size={10} />{fmtDate(loc.date)}{loc.time ? ` · ${loc.time}` : ""}
                      </span>
                    )}
                    {loc.notes && (
                      <span className="text-xs" style={{ color: C.textMid }}>{loc.notes}</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const ALL_OPTS = ["A", "B", "C", "D"];

// ─── EXPENSE TEMPLATES ──────────────────────────────────────────────────────
const EXPENSE_TEMPLATES = {
  "Viaje Europa (avión)": [
    { desc: "Vuelo ida", provider: "", tarifa: "" },
    { desc: "Vuelo vuelta", provider: "", tarifa: "" },
    { desc: "Hotel", provider: "", tarifa: "" },
    { desc: "Transporte aeropuerto", provider: "", tarifa: "" },
    { desc: "Dietas", provider: "", tarifa: "" },
    { desc: "Días fuera", provider: "", tarifa: "" },
  ],
  "Viaje Europa (coche)": [
    { desc: "Alquiler coche", provider: "", tarifa: "" },
    { desc: "Gasolina+peajes", provider: "", tarifa: "" },
    { desc: "Hotel", provider: "", tarifa: "" },
    { desc: "Dietas", provider: "", tarifa: "" },
    { desc: "Días fuera", provider: "", tarifa: "" },
  ],
  "Nacional (avión)": [
    { desc: "Vuelo ida", provider: "", tarifa: "" },
    { desc: "Vuelo vuelta", provider: "", tarifa: "" },
    { desc: "Hotel", provider: "", tarifa: "" },
    { desc: "Transporte local", provider: "", tarifa: "" },
    { desc: "Dietas", provider: "", tarifa: "" },
  ],
  "Nacional (tren/coche)": [
    { desc: "Transporte ida/vuelta", provider: "", tarifa: "" },
    { desc: "Hotel", provider: "", tarifa: "" },
    { desc: "Dietas", provider: "", tarifa: "" },
  ],
  "Local (sin alojamiento)": [
    { desc: "Transporte Sevilla", provider: "", tarifa: "" },
    { desc: "Dietas", provider: "", tarifa: "" },
  ],
};

function applyExpenseTemplate(templateName) {
  const tpl = EXPENSE_TEMPLATES[templateName];
  if (!tpl) return [];
  return tpl.map((t, i) => ({
    id: Date.now() + i,
    desc: t.desc, url: "", date: "", time: "",
    provider: t.provider, tarifa: t.tarifa,
    optA: null, optB: null, optC: null, optD: null,
  }));
}

// Qué opciones tienen al menos un valor en los gastos
function usedExpOpts(expenses = []) {
  return ALL_OPTS.filter(o => expenses.some(e => e[optKey(o)] != null));
}

// ─── EXPENSE ROW ─────────────────────────────────────────────────────────────
function ExpenseRow({ row, optKeys, activeOpt, editing, onChange, onDelete }) {
  const Icon = getCatIcon(row.desc);
  // En edición mostramos siempre A·B·C·D; en lectura solo las opciones del proyecto
  const editOpts = editing ? ALL_OPTS : optKeys;

  if (editing) {
    return (
      <tr style={{ borderTop: `1px solid ${C.border}` }}>
        <td className="py-2 pr-2">
          <button type="button" onClick={onDelete} className="text-red-400 hover:text-red-600">
            <X size={14} />
          </button>
        </td>
        <td className="py-2 pr-2">
          <input value={row.desc} onChange={e => onChange("desc", e.target.value)}
            placeholder="Descripción"
            className="w-full rounded px-2 py-1 text-xs outline-none"
            style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.textDark, minWidth: 120 }} />
        </td>
        <td className="py-2 pr-2">
          <input value={row.url} onChange={e => onChange("url", e.target.value)}
            placeholder="https://..."
            className="w-full rounded px-2 py-1 text-xs outline-none"
            style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.textDark, minWidth: 90 }} />
        </td>
        <td className="py-2 pr-2">
          <input type="date" value={row.date} onChange={e => onChange("date", e.target.value)}
            className="rounded px-2 py-1 text-xs outline-none w-32"
            style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.textDark }} />
        </td>
        <td className="py-2 pr-2">
          <input value={row.time} onChange={e => onChange("time", e.target.value)}
            placeholder="6:50 – 13:30"
            className="rounded px-2 py-1 text-xs outline-none w-28"
            style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.textDark }} />
        </td>
        <td className="py-2 pr-2">
          <input value={row.provider} onChange={e => onChange("provider", e.target.value)}
            placeholder="Vueling, Booking..."
            className="w-full rounded px-2 py-1 text-xs outline-none"
            style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.textDark, minWidth: 100 }} />
        </td>
        <td className="py-2 pr-2">
          <input value={row.tarifa} onChange={e => onChange("tarifa", e.target.value)}
            placeholder="178/205"
            className="rounded px-2 py-1 text-xs outline-none w-20"
            style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.textDark }} />
        </td>
        {optKeys.map(o => (
          <td key={o} className="py-2 pr-1">
            <input type="number"
              value={row[optKey(o)] ?? ""}
              onChange={e => onChange(optKey(o), e.target.value === "" ? null : parseFloat(e.target.value))}
              placeholder="—"
              className="rounded px-2 py-1 text-xs outline-none text-right w-16"
              style={{ background: OPTION_COLORS[o].bg, border: `1px solid ${OPTION_COLORS[o].border}50`, color: C.textDark }} />
          </td>
        ))}
      </tr>
    );
  }

  return (
    <tr style={{ borderTop: `1px solid ${C.border}` }}>
      <td className="py-2.5 pr-3 w-7">
        <Icon size={14} style={{ color: C.textLight }} />
      </td>
      <td className="py-2.5 pr-3 font-medium text-sm" style={{ color: C.textDark }}>{row.desc}</td>
      <td className="py-2.5 pr-3">
        {row.url
          ? <a href={row.url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs hover:underline" style={{ color: "#2563eb" }}>
              <ExternalLink size={11} /> Enlace
            </a>
          : <span style={{ color: C.textLight }}>—</span>}
      </td>
      <td className="py-2.5 pr-3 text-xs" style={{ color: C.textMid }}>{fmtDate(row.date)}</td>
      <td className="py-2.5 pr-3 text-xs whitespace-nowrap" style={{ color: C.textMid }}>{row.time || "—"}</td>
      <td className="py-2.5 pr-3 text-xs" style={{ color: C.textMid }}>{row.provider || "—"}</td>
      <td className="py-2.5 pr-3 text-xs" style={{ color: C.textMid }}>{row.tarifa || "—"}</td>
      {optKeys.map(o => (
        <td key={o} className="py-2.5 pr-1 text-right text-sm font-semibold"
          style={{ color: row[optKey(o)] != null ? (o === activeOpt ? C.green : C.textDark) : C.textLight }}>
          {row[optKey(o)] != null ? fmt(row[optKey(o)]) : "—"}
        </td>
      ))}
    </tr>
  );
}

// ─── DOCUMENTS SECTION ────────────────────────────────────────────────────────
function DocumentsSection({ documents = [], editing, onChange }) {
  const addDoc = () => onChange([...documents, { id: Date.now(), name: "", type: "Otro", url: "", date: "" }]);
  const upd    = (id, f, v) => onChange(documents.map(d => d.id === id ? { ...d, [f]: v } : d));
  const del    = (id) => onChange(documents.filter(d => d.id !== id));
  const ist = { background: "#f8fafc", border: `1px solid ${C.border}`, color: C.textDark };

  return (
    <div className="rounded-xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: C.textDark }}>
          📁 Documentos Drive
        </h3>
        {editing && (
          <button type="button" onClick={addDoc}
            className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg"
            style={{ background: C.navy+"12", color: C.navy }}>
            <Plus size={12}/> Añadir documento
          </button>
        )}
      </div>
      {documents.length === 0 && !editing && (
        <p className="text-xs" style={{ color: C.textLight }}>Sin documentos adjuntos.</p>
      )}
      {documents.length === 0 && editing && (
        <p className="text-xs" style={{ color: C.textLight }}>Añade enlaces de Google Drive: planos, fotos, shoot lists...</p>
      )}
      <div className="space-y-2">
        {documents.map(doc => editing ? (
          <div key={doc.id} className="rounded-lg p-3 space-y-2"
            style={{ background: "#f8fafc", border: `1px solid ${C.border}` }}>
            <div className="flex gap-2">
              <select value={doc.type} onChange={e => upd(doc.id,"type",e.target.value)}
                className="rounded px-2 py-1.5 text-sm outline-none"
                style={{ ...ist, width: 120, flexShrink: 0 }}>
                {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
              <input value={doc.name} onChange={e => upd(doc.id,"name",e.target.value)}
                placeholder="Nombre del documento"
                className="flex-1 rounded px-2 py-1.5 text-sm outline-none" style={ist}/>
              <button type="button" onClick={() => del(doc.id)} className="text-red-400 hover:text-red-600 flex-shrink-0">
                <X size={15}/>
              </button>
            </div>
            <input value={doc.url} onChange={e => upd(doc.id,"url",e.target.value)}
              placeholder="https://drive.google.com/..."
              className="w-full rounded px-2 py-1.5 text-sm outline-none" style={ist}/>
          </div>
        ) : (
          <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:shadow-sm transition-shadow"
            style={{ background: "#f8fafc", border: `1px solid ${C.border}`, textDecoration:"none" }}>
            <span className="text-base flex-shrink-0">{DOC_ICONS[doc.type] || "📄"}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate" style={{ color: "#2563eb" }}>{doc.name || "Sin título"}</div>
              <div className="text-xs" style={{ color: C.textLight }}>{doc.type}</div>
            </div>
            <ExternalLink size={13} style={{ color: C.textLight, flexShrink: 0 }}/>
          </a>
        ))}
      </div>
    </div>
  );
}

// ─── CHECKLIST DE EQUIPO ─────────────────────────────────────────────────────
const DEFAULT_CHECKLIST = [
  "Cámara (cuerpo)", "Objetivo gran angular", "Objetivo 50mm", "Trípode",
  "Flash externo", "Baterías extra", "Tarjetas SD", "Portátil + cargador",
  "Disco duro externo", "Nivel láser", "Cinta métrica", "Gaffer tape",
  "Paños de limpieza", "Filtros ND/polarizador", "Light meter",
];

function getDefaultChecklist() {
  try { return JSON.parse(localStorage.getItem("presupuestos_defaultChecklist") || "null") || DEFAULT_CHECKLIST; }
  catch { return DEFAULT_CHECKLIST; }
}
function saveDefaultChecklist(items) {
  try { localStorage.setItem("presupuestos_defaultChecklist", JSON.stringify(items)); } catch {}
}

function ChecklistSection({ checklist = [], editing, onChange }) {
  const [editingDefaults, setEditingDefaults] = useState(false);
  const [defaults, setDefaults]               = useState(getDefaultChecklist);
  const [newItem, setNewItem]                 = useState("");

  // Initialize checklist from defaults if empty and in edit mode
  const initFromDefaults = () => {
    const items = getDefaultChecklist().map((name, i) => ({ id: Date.now() + i, name, checked: false }));
    onChange(items);
  };

  const toggle = (id) => onChange(checklist.map(c => c.id === id ? { ...c, checked: !c.checked } : c));
  const addItem = () => {
    if (!newItem.trim()) return;
    onChange([...checklist, { id: Date.now(), name: newItem.trim(), checked: false }]);
    setNewItem("");
  };
  const delItem = (id) => onChange(checklist.filter(c => c.id !== id));
  const saveAsDefault = () => {
    saveDefaultChecklist(checklist.map(c => c.name));
    setEditingDefaults(false);
  };

  const total = checklist.length;
  const checked = checklist.filter(c => c.checked).length;

  return (
    <div className="rounded-xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: C.textDark }}>
          <ClipboardCheck size={15} style={{ color: C.navy }} /> Checklist de equipo
          {total > 0 && (
            <span className="text-xs font-normal ml-1 px-2 py-0.5 rounded-full"
              style={{ background: checked === total ? "#dcfce7" : "#fef3c7",
                color: checked === total ? "#166534" : "#92400e" }}>
              {checked}/{total}
            </span>
          )}
        </h3>
        <div className="flex items-center gap-2">
          {checklist.length === 0 && editing && (
            <button type="button" onClick={initFromDefaults}
              className="text-xs font-medium flex items-center gap-1 px-2.5 py-1 rounded-lg"
              style={{ background: C.navy+"12", color: C.navy }}>
              <Plus size={11}/> Cargar lista base
            </button>
          )}
          {editing && checklist.length > 0 && (
            <button type="button" onClick={saveAsDefault}
              className="text-xs font-medium px-2 py-1 rounded-lg"
              style={{ background: "#f0fdf4", color: C.green }}
              title="Guardar esta lista como predeterminada">
              <Save size={11} className="inline mr-1"/>Guardar como base
            </button>
          )}
        </div>
      </div>

      {checklist.length === 0 && !editing && (
        <p className="text-xs" style={{ color: C.textLight }}>Sin checklist configurada.</p>
      )}

      <div className="space-y-1">
        {checklist.map(item => (
          <div key={item.id} className="flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-slate-50 group">
            <button type="button" onClick={() => toggle(item.id)}
              className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors"
              style={{ background: item.checked ? C.green : "transparent",
                border: `2px solid ${item.checked ? C.green : C.border}` }}>
              {item.checked && <Check size={12} color="#fff"/>}
            </button>
            <span className="text-sm flex-1" style={{
              color: item.checked ? C.textLight : C.textDark,
              textDecoration: item.checked ? "line-through" : "none" }}>
              {item.name}
            </span>
            {editing && (
              <button type="button" onClick={() => delItem(item.id)}
                className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <X size={13}/>
              </button>
            )}
          </div>
        ))}
      </div>

      {editing && (
        <div className="flex gap-2 mt-3">
          <input value={newItem} onChange={e => setNewItem(e.target.value)}
            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addItem())}
            placeholder="Añadir elemento..."
            className="flex-1 rounded-lg px-2 py-1.5 text-sm outline-none"
            style={{ background: "#f8fafc", border: `1px solid ${C.border}`, color: C.textDark }}/>
          <button type="button" onClick={addItem}
            className="text-xs font-medium px-2.5 py-1.5 rounded-lg"
            style={{ background: C.navy+"12", color: C.navy }}>
            <Plus size={12}/>
          </button>
        </div>
      )}
    </div>
  );
}

// ─── PROJECT TIMELINE ────────────────────────────────────────────────────────
function ProjectTimeline({ project }) {
  // Collect all dated events: locations, expenses (flights, hotels)
  const events = [];

  (project.locations || []).forEach(loc => {
    if (loc.date) events.push({
      date: loc.date, time: loc.time || "", type: "location",
      label: loc.name || "Ubicación", icon: MapPin, color: C.navy,
    });
  });

  (project.expenses || []).forEach(exp => {
    if (exp.date) {
      const Icon = getCatIcon(exp.desc);
      let color = C.textMid;
      const d = exp.desc.toLowerCase();
      if (d.includes(">") || d.includes("vuelo")) color = "#0369a1";
      else if (d.includes("hotel")) color = "#7c3aed";
      else if (d.includes("coche") || d.includes("car")) color = "#059669";
      events.push({
        date: exp.date, time: exp.time || "", type: "expense",
        label: exp.desc, icon: Icon, color,
        sub: [exp.provider, exp.tarifa ? `${exp.tarifa}` : ""].filter(Boolean).join(" · "),
      });
    }
  });

  if (events.length === 0) return null;

  events.sort((a, b) => {
    const dc = a.date.localeCompare(b.date);
    return dc !== 0 ? dc : (a.time || "").localeCompare(b.time || "");
  });

  // Group by date
  const grouped = {};
  events.forEach(ev => {
    if (!grouped[ev.date]) grouped[ev.date] = [];
    grouped[ev.date].push(ev);
  });

  return (
    <div className="rounded-xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
      <h3 className="text-sm font-semibold flex items-center gap-2 mb-4" style={{ color: C.textDark }}>
        <Calendar size={15} style={{ color: C.navy }} /> Timeline del proyecto
      </h3>
      <div className="relative pl-6">
        {/* Vertical line */}
        <div className="absolute left-2.5 top-1 bottom-1 w-0.5 rounded" style={{ background: C.border }} />

        {Object.entries(grouped).map(([date, evts], gi) => (
          <div key={date} className={gi > 0 ? "mt-4" : ""}>
            {/* Date header */}
            <div className="flex items-center gap-2 mb-2 -ml-6">
              <div className="w-5 h-5 rounded-full flex items-center justify-center z-10 flex-shrink-0"
                style={{ background: C.navy }}>
                <Calendar size={10} color="#fff" />
              </div>
              <span className="text-xs font-bold" style={{ color: C.textDark }}>{fmtDate(date)}</span>
              <span className="text-xs" style={{ color: C.textLight }}>
                {new Date(date + "T12:00:00").toLocaleDateString("es-ES", { weekday: "long" })}
              </span>
            </div>

            {/* Events for this date */}
            {evts.map((ev, i) => {
              const Icon = ev.icon;
              return (
                <div key={i} className="flex items-start gap-2 ml-0 mb-2">
                  <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: ev.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Icon size={12} style={{ color: ev.color, flexShrink: 0 }} />
                      <span className="text-sm font-medium" style={{ color: C.textDark }}>{ev.label}</span>
                      {ev.time && <span className="text-xs" style={{ color: C.textLight }}>{ev.time}</span>}
                    </div>
                    {ev.sub && <div className="text-xs mt-0.5" style={{ color: C.textMid }}>{ev.sub}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── QUOTE HTML GENERATOR ─────────────────────────────────────────────────────
function generateQuoteHTML({ quoteRef, quoteDate, website, lang, client, lines, pageNotes }) {
  const isES = lang === "es";
  const fmtN = (n) => n != null ? Number(n).toLocaleString("es-ES",{minimumFractionDigits:0,maximumFractionDigits:0})+" €" : "";
  const fmtDate = (s) => { if(!s) return ""; const [y,m,d]=s.split("-"); return `${d}-${m}-${y}`; };
  const total = lines.reduce((s,l) => s + (Number(l.subtotal)||0), 0);

  const rows = lines.map(l => {
    const hasBrk = l.unitPrice !== "" && l.unitPrice != null && l.qty !== "" && l.qty != null;
    const sub = hasBrk
      ? Number(l.unitPrice) * Number(l.qty) * (l.discount ? (1 - Number(l.discount)/100) : 1)
      : Number(l.subtotal)||0;
    return `<tr>
      <td class="desc"><strong>${l.title||""}</strong>${l.detail ? `<br><span class="det">${l.detail.replace(/\n/g,"<br>")}</span>` : ""}</td>
      <td class="num">${hasBrk ? fmtN(l.unitPrice) : ""}</td>
      <td class="num">${hasBrk ? l.qty : ""}</td>
      <td class="num">${l.discount ? `-${l.discount}%` : ""}</td>
      <td class="num"><strong>${fmtN(sub)}</strong></td>
    </tr>`;
  }).join("");

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Arial,sans-serif;font-size:12px;color:#000;padding:50px 60px}
.ref{text-align:right;margin-bottom:28px}
.ref h2{font-size:13px;font-weight:bold;margin-bottom:5px}
.hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:48px}
.mine h2{font-size:13px;font-weight:bold;margin-bottom:3px}
.mine p{font-size:12px;margin-top:8px}
.mine a{color:#000}
.cbox{border:1px solid #000;padding:14px 18px;min-width:230px;text-align:right}
.clabel{font-size:8px;text-transform:uppercase;color:#888;margin-bottom:8px}
.cbox p{font-weight:bold;font-size:13px;margin-bottom:2px}
table{width:100%;border-collapse:collapse;margin-top:8px}
thead tr{border-bottom:2px solid #000}
th{padding:7px 0;font-size:12px;font-weight:bold;text-align:right}
th.desc{text-align:left}
td{padding:13px 8px 13px 0;vertical-align:top;border-bottom:1px solid #e8e8e8;font-size:12px}
td.desc{padding-right:20px;text-align:left}
td.num{text-align:right;white-space:nowrap}
.det{color:#444;font-size:11px;line-height:1.5}
.tot{margin-top:18px;text-align:right;font-size:14px;font-weight:bold}
.notes{page-break-before:always;padding-top:50px;font-size:12px;line-height:1.7}
.pbtn{position:fixed;top:18px;right:18px;padding:9px 18px;background:#1a2a4a;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:13px;font-weight:bold;box-shadow:0 2px 8px #0003}
@media print{.pbtn{display:none}@page{margin:15mm 20mm}body{padding:0}}
</style></head><body>
<button class="pbtn" onclick="window.print()">🖨️ Guardar como PDF</button>
<div class="ref">
  <h2>${isES?"Presupuesto":"QUOTATION"} # ${quoteRef}</h2>
  <h2>${isES?"Fecha":"Date"}: ${fmtDate(quoteDate)}</h2>
</div>
<div class="hdr">
  <div class="mine">
    <h2>Miguel Jiménez Fernández</h2>
    <p style="font-weight:bold">VAT: ES77804626L</p>
    <p style="margin-top:14px"><a href="https://${website}">${website}</a></p>
    <p>(+34) 687 650 005</p>
  </div>
  <div class="cbox">
    <div class="clabel">${isES?"CLIENTE":"COMPANY"}</div>
    ${client.name?`<p>${client.name}</p>`:""}
    ${client.vat?`<p>${client.vat}</p>`:""}
    ${client.address?`<p style="margin-top:10px">${client.address.replace(/\n/g,"<br>")}</p>`:""}
  </div>
</div>
<table>
  <thead><tr>
    <th class="desc">${isES?"Descripción":"Description"}</th>
    <th style="padding-right:16px">${isES?"Precio":"Price"}</th>
    <th style="padding-right:16px">U.</th>
    <th style="padding-right:16px"></th>
    <th>Sub Total</th>
  </tr></thead>
  <tbody>${rows}</tbody>
</table>
<div class="tot">Total excl VAT:&nbsp;&nbsp;&nbsp;${fmtN(total)}</div>
${pageNotes?`<div class="notes">${pageNotes.replace(/\n/g,"<br>")}</div>`:""}
</body></html>`;
}

// ─── CLIENT HISTORY ──────────────────────────────────────────────────────────
function getClientHistory() {
  try { return JSON.parse(localStorage.getItem("presupuestos_clients") || "[]"); }
  catch { return []; }
}
function saveClientToHistory(client) {
  if (!client.name?.trim()) return;
  const hist = getClientHistory().filter(c => c.name !== client.name);
  hist.unshift(client);
  try { localStorage.setItem("presupuestos_clients", JSON.stringify(hist.slice(0, 20))); } catch {}
}

// ─── SMART QUOTE REF ─────────────────────────────────────────────────────────
function smartQuoteRef() {
  // Reads existing quote refs from localStorage to auto-increment
  const d = new Date();
  const dd = String(d.getDate()).padStart(2,"0");
  const mm = String(d.getMonth()+1).padStart(2,"0");
  const yy = String(d.getFullYear()).slice(2);
  const prefix = `${dd}${mm}${yy}_`;
  try {
    const hist = JSON.parse(localStorage.getItem("presupuestos_quoteRefs") || "[]");
    const todayRefs = hist.filter(r => r.startsWith(prefix));
    const maxN = todayRefs.reduce((mx, r) => {
      const n = parseInt(r.split("_")[1], 10);
      return n > mx ? n : mx;
    }, 0);
    return `${prefix}${maxN + 1}`;
  } catch { return `${prefix}1`; }
}
function saveQuoteRef(ref) {
  try {
    const hist = JSON.parse(localStorage.getItem("presupuestos_quoteRefs") || "[]");
    if (!hist.includes(ref)) { hist.push(ref); localStorage.setItem("presupuestos_quoteRefs", JSON.stringify(hist.slice(-100))); }
  } catch {}
}

// ─── QUOTE MODAL ──────────────────────────────────────────────────────────────
function QuoteModal({ project, onClose }) {
  const today = new Date().toISOString().split("T")[0];
  const travelTotal = project.expenses.reduce((s,e) => s + (e[`opt${project.chosenOption||"A"}`]||0), 0);
  const clientHist = useMemo(() => getClientHistory(), []);

  const [quoteRef,   setQuoteRef]   = useState(smartQuoteRef());
  const [quoteDate,  setQuoteDate]  = useState(today);
  const [lang,       setLang]       = useState("es");
  const [website,    setWebsite]    = useState(MY_INFO.websites[0]);
  const [client,     setClient]     = useState({ name: project.client||"", vat:"", address:"" });
  const [pageNotes,  setPageNotes]  = useState("");
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [lines, setLines] = useState([
    { id:1, title: project.ref, detail:"", unitPrice:"", qty:"", discount:"", subtotal: project.options[project.chosenOption||Object.keys(project.options)[0]]?.subtotal || "" },
    ...(travelTotal > 0 ? [{ id:2, title: lang==="es"?"Gastos de viaje (transporte, alojamiento y dietas)":"Travel expenses (transport, accommodation and meals)", detail:"", unitPrice:"", qty:"", discount:"", subtotal: travelTotal }] : []),
  ]);

  const setC = (k,v) => setClient(c => ({...c,[k]:v}));
  const addLine = () => setLines(l => [...l, { id: Date.now(), title:"", detail:"", unitPrice:"", qty:"", discount:"", subtotal:"" }]);
  const delLine = (id) => setLines(l => l.filter(x => x.id !== id));
  const updLine = (id, f, v) => setLines(l => l.map(x => {
    if (x.id !== id) return x;
    const upd = {...x, [f]: v};
    // Auto-calc subtotal when unitPrice or qty changes
    if ((f==="unitPrice"||f==="qty"||f==="discount") && upd.unitPrice!==""&&upd.qty!=="") {
      const raw = Number(upd.unitPrice)*Number(upd.qty);
      upd.subtotal = upd.discount ? Math.round(raw*(1-Number(upd.discount)/100)) : Math.round(raw);
    }
    return upd;
  }));

  const handlePreview = () => {
    saveClientToHistory(client);
    saveQuoteRef(quoteRef);
    const w = window.open("","_blank");
    w.document.write(generateQuoteHTML({ quoteRef, quoteDate, website, lang, client, lines, pageNotes }));
    w.document.close();
  };

  const ist = { background: C.bg, border:`1px solid ${C.border}`, color: C.textDark };
  const icl = "rounded-lg px-2 py-1.5 text-sm outline-none";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-6 px-4"
      style={{ background:"rgba(0,0,0,0.5)" }}>
      <div className="w-full max-w-4xl rounded-2xl shadow-2xl" style={{ background: C.card }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: C.border }}>
          <h2 className="font-bold text-base" style={{ color: C.textDark }}>📄 Generar presupuesto</h2>
          <div className="flex items-center gap-2">
            <button onClick={handlePreview}
              className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl hover:opacity-90"
              style={{ background: C.navy, color:"#fff" }}>
              <ExternalLink size={14}/> Vista previa / Imprimir
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 ml-1"><X size={20}/></button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5 overflow-y-auto" style={{ maxHeight:"80vh" }}>
          {/* Meta */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: C.textMid }}>Nº Presupuesto</label>
              <input value={quoteRef} onChange={e=>setQuoteRef(e.target.value)} className={`w-full ${icl}`} style={ist}/>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: C.textMid }}>Fecha</label>
              <input type="date" value={quoteDate} onChange={e=>setQuoteDate(e.target.value)} className={`w-full ${icl}`} style={ist}/>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: C.textMid }}>Idioma</label>
              <select value={lang} onChange={e=>setLang(e.target.value)} className={`w-full ${icl}`} style={ist}>
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: C.textMid }}>Web</label>
              <select value={website} onChange={e=>setWebsite(e.target.value)} className={`w-full ${icl}`} style={ist}>
                {MY_INFO.websites.map(w=><option key={w}>{w}</option>)}
              </select>
            </div>
          </div>

          {/* Client */}
          <div className="rounded-xl p-4 space-y-3" style={{ background:"#f8fafc", border:`1px solid ${C.border}` }}>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.textMid }}>
                {lang==="es"?"Cliente":"Client / Company"}
              </h3>
              {clientHist.length > 0 && (
                <div className="relative">
                  <button type="button" onClick={() => setShowClientPicker(v => !v)}
                    className="text-xs font-medium flex items-center gap-1 px-2 py-0.5 rounded-lg"
                    style={{ background: C.navy+"12", color: C.navy }}>
                    <Clock size={10}/> Recientes
                  </button>
                  {showClientPicker && (
                    <div className="absolute right-0 top-7 z-50 rounded-xl shadow-lg py-1 w-56"
                      style={{ background: C.card, border: `1px solid ${C.border}` }}>
                      {clientHist.map((c, i) => (
                        <button key={i} type="button"
                          className="w-full text-left px-3 py-2 hover:bg-slate-50 text-xs"
                          style={{ color: C.textDark }}
                          onClick={() => { setClient(c); setShowClientPicker(false); }}>
                          <div className="font-medium">{c.name}</div>
                          {c.vat && <div style={{ color: C.textLight }}>{c.vat}</div>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs block mb-1" style={{ color: C.textLight }}>Empresa</label>
                <input value={client.name} onChange={e=>setC("name",e.target.value)} placeholder="PVH Europe B.V." className={`w-full ${icl}`} style={ist}/>
              </div>
              <div>
                <label className="text-xs block mb-1" style={{ color: C.textLight }}>NIF / VAT</label>
                <input value={client.vat} onChange={e=>setC("vat",e.target.value)} placeholder="NL852634250B01" className={`w-full ${icl}`} style={ist}/>
              </div>
              <div className="col-span-2">
                <label className="text-xs block mb-1" style={{ color: C.textLight }}>Dirección (una línea por Enter)</label>
                <textarea value={client.address} onChange={e=>setC("address",e.target.value)}
                  rows={3} placeholder={"Danzigerkade 165\n1013 AP - Amsterdam\nThe Netherlands"}
                  className={`w-full ${icl} resize-none`} style={ist}/>
              </div>
            </div>
          </div>

          {/* Line items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.textMid }}>Líneas de presupuesto</h3>
              <button type="button" onClick={addLine}
                className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg"
                style={{ background: C.navy+"12", color: C.navy }}>
                <Plus size={12}/> Añadir línea
              </button>
            </div>
            <div className="space-y-3">
              {lines.map((l,i) => (
                <div key={l.id} className="rounded-xl p-3 space-y-2"
                  style={{ background:"#f8fafc", border:`1px solid ${C.border}` }}>
                  <div className="flex gap-2">
                    <span className="text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                      style={{ background: C.navy, color:"#fff" }}>{i+1}</span>
                    <input value={l.title} onChange={e=>updLine(l.id,"title",e.target.value)}
                      placeholder="Título de la línea (ej. Retoque PRIO. 3 fotos)"
                      className={`flex-1 ${icl} font-medium`} style={ist}/>
                    <button type="button" onClick={()=>delLine(l.id)} className="text-red-400 hover:text-red-600 flex-shrink-0">
                      <X size={14}/>
                    </button>
                  </div>
                  <div className="pl-7">
                    <textarea value={l.detail} onChange={e=>updLine(l.id,"detail",e.target.value)}
                      rows={2} placeholder="Descripción adicional (opcional)..."
                      className={`w-full ${icl} resize-none text-xs`} style={{ ...ist, fontSize:11 }}/>
                  </div>
                  <div className="pl-7 grid grid-cols-4 gap-2">
                    {[["Precio €","unitPrice","250"],["Uds","qty","3"],["Dto %","discount","15"],["Sub Total €","subtotal","750"]].map(([label,field,ph])=>(
                      <div key={field}>
                        <label className="text-xs block mb-1" style={{ color: C.textLight }}>{label}</label>
                        <input type="number" value={l[field]} onChange={e=>updLine(l.id,field,e.target.value)}
                          placeholder={ph} className={`w-full ${icl} text-right`}
                          style={{ ...ist, background: field==="subtotal"?"#e8f5e9":C.bg,
                            fontWeight: field==="subtotal"?"bold":"normal" }}/>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total preview */}
          <div className="text-right text-sm font-bold py-2 border-t" style={{ borderColor: C.border, color: C.green }}>
            Total excl VAT: &nbsp;
            {(() => {
              const t = lines.reduce((s,l) => {
                if (l.unitPrice!==""&&l.qty!=="") {
                  const raw = Number(l.unitPrice)*Number(l.qty);
                  return s + (l.discount ? raw*(1-Number(l.discount)/100) : raw);
                }
                return s + (Number(l.subtotal)||0);
              }, 0);
              return `€${Math.round(t).toLocaleString("es-ES")}`;
            })()}
          </div>

          {/* Page 2 notes */}
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: C.textMid }}>
              Notas / Página 2 (opcional — aparece en hoja separada)
            </label>
            <textarea value={pageNotes} onChange={e=>setPageNotes(e.target.value)}
              rows={3} placeholder={"x3 imágenes PRIO (edición el mismo día/24h)\nx10 imágenes NON PRIO (edición en los siguientes días)"}
              className={`w-full ${icl} resize-none`} style={ist}/>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── RESUMEN VIEW ─────────────────────────────────────────────────────────────
function ResumeView({ projects, onSelect, onNewProject }) {
  const [search, setSearch]             = useState("");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [filterYear, setFilterYear]     = useState("Todos");

  const years = useMemo(() => [...new Set(projects.map(p => p.year))].sort(), [projects]);

  const filtered = useMemo(() => projects.filter(p => {
    const q = search.toLowerCase();
    return (!q || p.ref.toLowerCase().includes(q) || p.city.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q))
      && (filterStatus === "Todos" || p.status === filterStatus)
      && (filterYear === "Todos" || p.year === Number(filterYear));
  }), [projects, search, filterStatus, filterYear]);

  const totalBilled    = projects.filter(p => p.status === "Facturado"  && p.chosenOption).reduce((s, p) => s + (p.options[p.chosenOption]?.total || 0), 0);
  const totalConfirmed = projects.filter(p => p.status === "Confirmado" && p.chosenOption).reduce((s, p) => s + (p.options[p.chosenOption]?.total || 0), 0);

  const chartData = useMemo(() => {
    const by = {};
    projects.forEach(p => {
      if (!by[p.year]) by[p.year] = { year: String(p.year), Facturado: 0, Confirmado: 0, Pendiente: 0 };
      const v = p.chosenOption ? (p.options[p.chosenOption]?.total || 0) : 0;
      if      (p.status === "Facturado")  by[p.year].Facturado  += v;
      else if (p.status === "Confirmado") by[p.year].Confirmado += v;
      else if (p.status === "Pendiente")  by[p.year].Pendiente  += v;
    });
    return Object.values(by).sort((a, b) => a.year - b.year);
  }, [projects]);

  return (
    <div className="min-h-screen" style={{ background: C.bg }}>
      <div style={{ background: C.navy }} className="px-6 pt-8 pb-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">📊 Presupuestos</h1>
              <p className="text-sm mt-0.5" style={{ color: "#94a3b8" }}>{projects.length} proyectos · {years.join(", ")}</p>
            </div>
            <button onClick={onNewProject}
              className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90"
              style={{ background: C.gold, color: C.navy }}>
              <Plus size={16} /> Nuevo proyecto
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Proyectos activos" value={projects.filter(p => p.status !== "Cancelado").length} icon={Building2} accent={C.gold} />
            <StatCard label="Facturado" value={fmt(totalBilled)} sub="proyectos cerrados" icon={Euro} accent={C.greenLight} />
            <StatCard label="Confirmado" value={fmt(totalConfirmed)} sub="en ejecución" icon={CheckCircle2} accent="#3b82f6" />
            <StatCard label="Pendiente" value={projects.filter(p => p.status === "Pendiente").length} sub="por confirmar" icon={Clock} accent="#f59e0b" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">
        {chartData.length > 0 && (
          <div className="rounded-xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <h2 className="text-sm font-semibold mb-4" style={{ color: C.textDark }}>Volumen por año</h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{ fontSize: 12, fill: C.textMid }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: C.textLight }} axisLine={false} tickLine={false}
                  tickFormatter={v => `€${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v, n) => [fmt(v), n]}
                  contentStyle={{ borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 12 }} />
                <Bar dataKey="Facturado"  stackId="a" fill={C.greenLight} />
                <Bar dataKey="Confirmado" stackId="a" fill="#3b82f6" />
                <Bar dataKey="Pendiente"  stackId="a" fill={C.gold} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2 justify-center">
              {[["Facturado", C.greenLight], ["Confirmado", "#3b82f6"], ["Pendiente", C.gold]].map(([l, c]) => (
                <span key={l} className="flex items-center gap-1.5 text-xs" style={{ color: C.textMid }}>
                  <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: c }} />{l}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex-1 min-w-48 flex items-center gap-2 rounded-xl px-3 py-2"
            style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <Search size={14} style={{ color: C.textLight }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar proyecto, ciudad, marca..."
              className="flex-1 text-sm outline-none bg-transparent" style={{ color: C.textDark }} />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="text-sm rounded-xl px-3 py-2 outline-none"
            style={{ background: C.card, border: `1px solid ${C.border}`, color: C.textDark }}>
            <option>Todos</option>
            {Object.keys(STATUS_CONFIG).map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={filterYear} onChange={e => setFilterYear(e.target.value)}
            className="text-sm rounded-xl px-3 py-2 outline-none"
            style={{ background: C.card, border: `1px solid ${C.border}`, color: C.textDark }}>
            <option>Todos</option>
            {years.map(y => <option key={y}>{y}</option>)}
          </select>
        </div>

        <div className="space-y-2">
          {filtered.length === 0 && (
            <div className="text-center py-12 text-sm" style={{ color: C.textLight }}>No hay proyectos que coincidan.</div>
          )}
          {filtered.map(p => {
            const chosen   = p.chosenOption ? p.options[p.chosenOption] : null;
            const expenses = chosen ? chosen.subtotal : null;
            const fee      = p.photoFee ? Number(p.photoFee) : null;
            const total    = chosen ? chosen.total : null;
            const feePerSqm = fee && p.sqm ? fee / p.sqm : null;
            return (
              <button key={p.id} onClick={() => onSelect(p)}
                className="w-full text-left rounded-xl px-5 py-4 flex items-center gap-4 hover:shadow-md transition-shadow"
                style={{ background: C.card, border: `1px solid ${C.border}` }}>
                <div className="hidden sm:flex w-12 h-12 rounded-lg items-center justify-center font-bold text-sm flex-shrink-0"
                  style={{ background: C.navy + "12", color: C.navy }}>{p.brand}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm" style={{ color: C.textDark }}>{p.ref}</span>
                    <StatusBadge status={p.status} />
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-xs flex items-center gap-1" style={{ color: C.textMid }}>
                      <MapPin size={10} />{p.city}, {p.country}
                    </span>
                    <span className="text-xs flex items-center gap-1" style={{ color: C.textMid }}>
                      <User size={10} />{p.client}
                    </span>
                    {p.sqm && (
                      <span className="text-xs flex items-center gap-1" style={{ color: C.textMid }}>
                        <Ruler size={10} />{p.sqm} m²
                      </span>
                    )}
                    {p.startDate && (
                      <span className="text-xs flex items-center gap-1" style={{ color: C.textMid }}>
                        <Calendar size={10} />{fmtDate(p.startDate)}{p.duration ? ` · ${p.duration}h` : ""}
                      </span>
                    )}
                    {p.locations?.length > 0 && (
                      <span className="text-xs flex items-center gap-1" style={{ color: "#2563eb" }}>
                        <Navigation size={10} />{p.locations.length} ubicación{p.locations.length > 1 ? "es" : ""}
                      </span>
                    )}
                  </div>
                  {/* Fee + gastos en línea secundaria */}
                  {(fee || expenses) && (
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      {fee && (
                        <span className="text-xs font-semibold flex items-center gap-1"
                          style={{ color: C.navy }}>
                          📷 {fmt(fee)}
                          {feePerSqm && <span className="font-normal" style={{ color: C.textLight }}>· {fmtD(feePerSqm)}/m²</span>}
                        </span>
                      )}
                      {expenses && (
                        <span className="text-xs flex items-center gap-1" style={{ color: C.textMid }}>
                          ✈️ {fmt(expenses)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  {total
                    ? <div className="font-bold text-base" style={{ color: C.green }}>{fmt(total)}</div>
                    : <div className="text-sm" style={{ color: C.textLight }}>Sin opción</div>}
                </div>
                <ChevronRight size={16} style={{ color: C.textLight }} className="flex-shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── DETAIL VIEW ──────────────────────────────────────────────────────────────
function DetailView({ project: initial, onBack, onSave, onDelete, onDuplicate }) {
  const [project, setProject]           = useState(initial);
  const [editing, setEditing]           = useState(false);
  const [draft, setDraft]               = useState(initial);
  const [activeOpt, setActiveOpt]       = useState(initial.chosenOption || Object.keys(initial.options)[0]);
  const [showExpenses, setShowExpenses] = useState(true);
  const [showQuote, setShowQuote]       = useState(false);
  // Columnas de gasto visibles: arranca con las que ya tienen datos (mínimo A)
  const initExpOpts = () => { const u = usedExpOpts(initial.expenses); return u.length ? u : ["A"]; };
  const [visibleExpOpts, setVisibleExpOpts] = useState(initExpOpts);

  // Compute totals dynamically from expenses for ALL options — must be before optKeys
  const computedOpts = useMemo(() => {
    const src  = editing ? draft : project;
    const exps = src.expenses || [];
    const result = {};
    ALL_OPTS.forEach(opt => {
      const sub = Math.round(exps.reduce((s, e) => s + (Number(e[optKey(opt)]) || 0), 0) * 100) / 100;
      if (sub > 0) result[opt] = { subtotal: sub, total: Math.round(sub * 1.2 * 100) / 100 };
    });
    // Keep stored options that have no expenses (e.g. manually set totals)
    Object.entries(src.options || {}).forEach(([opt, val]) => {
      if (!result[opt]) result[opt] = val;
    });
    return result;
  }, [editing, draft, project]);

  const optKeys    = ALL_OPTS.filter(o => computedOpts[o]);
  const chosenData = computedOpts[activeOpt];
  const cpm        = chosenData && project.sqm ? chosenData.total / project.sqm : null;
  const computedSubtotal = computedOpts[activeOpt]?.subtotal || 0;

  const handleSave = () => {
    const withOpts = { ...draft, options: computedOpts };
    setProject(withOpts); onSave(withOpts); setEditing(false);
  };
  const setD = (k, v) => setDraft(d => ({ ...d, [k]: v }));

  const updateRow = (id, field, val) => setDraft(d => ({ ...d, expenses: d.expenses.map(e => e.id === id ? { ...e, [field]: val } : e) }));
  const deleteRow = (id)             => setDraft(d => ({ ...d, expenses: d.expenses.filter(e => e.id !== id) }));
  const addRow    = ()               => setDraft(d => ({ ...d, expenses: [...d.expenses, { id: Date.now(), desc: "", url: "", date: "", time: "", provider: "", tarifa: "", optA: null, optB: null, optC: null, optD: null }] }));

  const updateChosenOption = (opt) => {
    const updated = { ...project, chosenOption: opt };
    setProject(updated); setDraft(updated); onSave(updated);
  };

  const p = editing ? draft : project;
  const inputSt = { background: C.bg, border: `1px solid ${C.border}`, color: C.textDark };
  const inputCl = "w-full rounded-lg px-2 py-1.5 text-sm outline-none";

  return (
    <div className="min-h-screen" style={{ background: C.bg }}>
      <div style={{ background: `linear-gradient(135deg, ${C.navyDark} 0%, ${C.navyLight} 100%)` }} className="px-6 pt-6 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-medium text-white/70 hover:text-white">
              <ArrowLeft size={16} /> Volver
            </button>
            <div className="flex items-center gap-2">
              {!editing ? (
                <>
                  <button onClick={() => setShowQuote(true)}
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg"
                    style={{ background: C.gold, color: C.navy }}>
                    <FileText size={13} /> Presupuesto
                  </button>
                  <button onClick={() => onDuplicate(project)}
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}
                    title="Duplicar proyecto">
                    <Copy size={13} /> Duplicar
                  </button>
                  <button onClick={() => { setDraft(project); setEditing(true); }}
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}>
                    <Edit3 size={13} /> Editar
                  </button>
                  <button onClick={() => { if (window.confirm("¿Eliminar este proyecto?")) onDelete(project.id); }}
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg"
                    style={{ background: "rgba(239,68,68,0.2)", color: "#fca5a5" }}>
                    <Trash2 size={13} /> Eliminar
                  </button>
                </>
              ) : (
                <>
                  <button onClick={handleSave}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
                    style={{ background: C.gold, color: C.navy }}>
                    <Save size={13} /> Guardar
                  </button>
                  <button onClick={() => setEditing(false)}
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}>
                    <X size={13} /> Cancelar
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0"
              style={{ background: C.gold, color: C.navy }}>{project.brand}</div>
            <div className="flex-1">
              {editing
                ? <input value={draft.ref} onChange={e => setD("ref", e.target.value)}
                    className="text-xl font-bold text-white bg-transparent border-b border-white/30 outline-none w-full mb-1" />
                : <h2 className="text-xl font-bold text-white">{project.ref}</h2>}
              <div className="flex items-center gap-3 flex-wrap mt-1">
                <span className="text-sm text-white/70 flex items-center gap-1">
                  <MapPin size={12} />{project.city}, {project.country}
                </span>
                <StatusBadge status={project.status} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">

        {/* Metadata */}
        <div className="rounded-xl p-5 grid grid-cols-2 sm:grid-cols-3 gap-4"
          style={{ background: C.card, border: `1px solid ${C.border}` }}>
          {[
            ["Cliente",   "client",    <User size={13} />],
            ["País",      "country",   <MapPin size={13} />],
            ["Ciudad",    "city",      <MapPin size={13} />],
            ["Superficie","sqm",       <Ruler size={13} />, " m²"],
            ["Duración",  "duration",  <Clock size={13} />, " h"],
          ].map(([label, key, icon, suffix]) => (
            <div key={key}>
              <div className="flex items-center gap-1 text-xs mb-1" style={{ color: C.textLight }}>{icon} {label}</div>
              {editing
                ? <input value={draft[key] || ""} onChange={e => setD(key, e.target.value)} className={inputCl} style={inputSt} />
                : <div className="text-sm font-semibold" style={{ color: C.textDark }}>{project[key]}{suffix || ""}</div>}
            </div>
          ))}

          {/* Fee fotografía */}
          <div>
            <div className="flex items-center gap-1 text-xs mb-1" style={{ color: C.textLight }}>
              📷 Fee fotografía (€)
            </div>
            {editing
              ? <input type="number" value={draft.photoFee || ""} onChange={e => setD("photoFee", e.target.value ? Number(e.target.value) : "")}
                  className={inputCl} style={inputSt} placeholder="0" />
              : <div className="text-sm font-semibold" style={{ color: C.navy }}>
                  {project.photoFee ? fmt(project.photoFee) : <span style={{ color: C.textLight }}>—</span>}
                  {project.photoFee && project.sqm
                    ? <span className="text-xs font-normal ml-2" style={{ color: C.textLight }}>
                        {fmtD(project.photoFee / project.sqm)}/m²
                      </span>
                    : null}
                </div>}
          </div>

          {/* Start date with calendar picker */}
          <div>
            <div className="flex items-center gap-1 text-xs mb-1" style={{ color: C.textLight }}>
              <Calendar size={13} /> Fecha inicio
            </div>
            {editing
              ? <input type="date" value={draft.startDate || ""} onChange={e => setD("startDate", e.target.value)}
                  className={inputCl} style={inputSt} />
              : <div className="text-sm font-semibold" style={{ color: C.textDark }}>{fmtDate(project.startDate)}</div>}
          </div>

          {/* Year — editable so it affects chart grouping */}
          <div>
            <div className="flex items-center gap-1 text-xs mb-1" style={{ color: C.textLight }}>
              <Calendar size={13} /> Año
            </div>
            {editing
              ? <input type="number" value={draft.year || ""} onChange={e => setD("year", Number(e.target.value))}
                  className={inputCl} style={inputSt} />
              : <div className="text-sm font-semibold" style={{ color: C.textDark }}>{project.year}</div>}
          </div>

          {/* Status */}
          <div>
            <div className="flex items-center gap-1 text-xs mb-1" style={{ color: C.textLight }}>
              <CheckCircle2 size={13} /> Estado
            </div>
            {editing
              ? <select value={draft.status} onChange={e => setD("status", e.target.value)} className={inputCl} style={inputSt}>
                  {Object.keys(STATUS_CONFIG).map(s => <option key={s}>{s}</option>)}
                </select>
              : <StatusBadge status={project.status} />}
          </div>

          {/* Notes — full width */}
          <div className="col-span-2 sm:col-span-3">
            <div className="flex items-center gap-1 text-xs mb-1" style={{ color: C.textLight }}>
              <FileText size={13} /> Notas
            </div>
            {editing
              ? <textarea value={draft.notes || ""} onChange={e => setD("notes", e.target.value)}
                  rows={3} placeholder="Observaciones, condiciones especiales, contactos..."
                  className="w-full rounded-lg px-2 py-1.5 text-sm outline-none resize-none"
                  style={inputSt} />
              : project.notes
                ? <div className="text-sm whitespace-pre-wrap" style={{ color: C.textDark }}>{project.notes}</div>
                : <div className="text-sm" style={{ color: C.textLight }}>—</div>}
          </div>
        </div>

        {/* Locations */}
        <LocationsSection
          locations={p.locations || []}
          editing={editing}
          onChange={(locs) => setDraft(d => ({ ...d, locations: locs }))}
          city={p.city} country={p.country}
        />

        {/* Timeline (solo modo lectura) */}
        {!editing && <ProjectTimeline project={p} />}

        {/* Documents */}
        <DocumentsSection
          documents={p.documents || []}
          editing={editing}
          onChange={(docs) => setDraft(d => ({ ...d, documents: docs }))}
        />

        {/* Checklist de equipo */}
        <ChecklistSection
          checklist={p.checklist || []}
          editing={editing}
          onChange={(cl) => setDraft(d => ({ ...d, checklist: cl }))}
        />

        {/* Options */}
        <div className="rounded-xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: C.textDark }}>Opciones de presupuesto</h3>
          <div className="flex gap-2 flex-wrap mb-4">
            {optKeys.map(opt => {
              const oc = OPTION_COLORS[opt];
              const isActive = activeOpt === opt;
              const isChosen = project.chosenOption === opt;
              return (
                <button key={opt} onClick={() => setActiveOpt(opt)}
                  className="flex-1 min-w-24 rounded-xl p-3 text-center transition-all"
                  style={{ background: isActive ? oc.bg : "#f8fafc", border: `2px solid ${isActive ? oc.border : C.border}` }}>
                  <div className="font-bold text-sm" style={{ color: isActive ? oc.text : C.textMid }}>Opción {opt}</div>
                  <div className="font-bold text-lg mt-0.5" style={{ color: isActive ? oc.text : C.textDark }}>
                    {fmt(computedOpts[opt]?.total)}</div>
                  <div className="text-xs mt-0.5" style={{ color: C.textLight }}>Sub: {fmt(computedOpts[opt]?.subtotal)}</div>
                  {isChosen && <div className="text-xs font-bold mt-1 rounded px-1 py-0.5 inline-block text-white"
                    style={{ background: oc.badge }}>✓ Elegida</div>}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs" style={{ color: C.textMid }}>Opción elegida:</span>
            <div className="flex gap-1.5">
              {[null, ...optKeys].map(opt => (
                <button key={opt || "none"} onClick={() => updateChosenOption(opt)}
                  className="text-xs font-bold px-2.5 py-1 rounded-full transition-all"
                  style={{ background: project.chosenOption === opt ? (opt ? OPTION_COLORS[opt].badge : "#64748b") : "#f1f5f9",
                    color: project.chosenOption === opt ? "#fff" : C.textMid }}>
                  {opt || "—"}
                </button>
              ))}
            </div>
            {cpm && <span className="text-xs ml-auto" style={{ color: C.textMid }}>
              <TrendingUp size={11} className="inline mr-1" />{fmtD(cpm)}/m²</span>}
          </div>
        </div>

        {/* Expense table */}
        <div className="rounded-xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <div className="flex items-center justify-between mb-3">
            <button type="button" className="flex items-center gap-2 text-sm font-semibold"
              style={{ color: C.textDark }} onClick={() => setShowExpenses(v => !v)}>
              Desglose de gastos {showExpenses ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
            {editing && (
              <div className="flex items-center gap-2">
                {/* Plantilla de gastos */}
                <select
                  defaultValue=""
                  onChange={e => {
                    if (!e.target.value) return;
                    const rows = applyExpenseTemplate(e.target.value);
                    setDraft(d => ({ ...d, expenses: [...d.expenses, ...rows] }));
                    e.target.value = "";
                  }}
                  className="text-xs rounded-lg px-2 py-1 outline-none"
                  style={{ background: "#f0fdf4", border: `1px solid ${C.border}`, color: C.textMid }}>
                  <option value="">📋 Plantilla...</option>
                  {Object.keys(EXPENSE_TEMPLATES).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {/* Botón para añadir la siguiente columna de opción */}
                {(() => {
                  const next = ALL_OPTS.find(o => !visibleExpOpts.includes(o));
                  return next ? (
                    <button type="button"
                      onClick={() => setVisibleExpOpts(v => [...v, next])}
                      className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg"
                      style={{ background: OPTION_COLORS[next].bg, border: `1px solid ${OPTION_COLORS[next].border}60`, color: OPTION_COLORS[next].text }}>
                      <Plus size={11} /> Op. {next}
                    </button>
                  ) : null;
                })()}
                <button type="button" onClick={addRow}
                  className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg"
                  style={{ background: C.navy + "12", color: C.navy }}>
                  <Plus size={12} /> Añadir fila
                </button>
              </div>
            )}
          </div>

          {showExpenses && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ minWidth: editing ? 800 + visibleExpOpts.length * 80 : 680 }}>
                <thead>
                  <tr>
                    {editing && <th className="w-7" />}
                    <th className="w-7" />
                    {["Descripción","Enlace","Fecha","Horario","Proveedor/Aerolínea","Tarifa"].map(h => (
                      <th key={h} className="text-left pb-2 font-medium text-xs pr-3" style={{ color: C.textLight }}>{h}</th>
                    ))}
                    {(editing ? visibleExpOpts : usedExpOpts(project.expenses).length ? usedExpOpts(project.expenses) : optKeys).map(o => (
                      <th key={o} className="text-right pb-2 font-bold text-xs px-1 whitespace-nowrap"
                        style={{ color: OPTION_COLORS[o].badge }}>
                        Op. {o}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {p.expenses.map(row => (
                    <ExpenseRow key={row.id} row={row}
                      optKeys={editing ? visibleExpOpts : usedExpOpts(project.expenses).length ? usedExpOpts(project.expenses) : optKeys}
                      activeOpt={activeOpt}
                      editing={editing}
                      onChange={(field, val) => updateRow(row.id, field, val)}
                      onDelete={() => deleteRow(row.id)} />
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: `2px solid ${C.border}` }}>
                    <td colSpan={editing ? 8 : 7} className="pt-2.5 font-semibold text-sm" style={{ color: C.textDark }}>
                      Subtotal (Op. {activeOpt})
                    </td>
                    <td colSpan={(editing ? visibleExpOpts : optKeys).length} className="pt-2.5 text-right font-bold" style={{ color: C.textDark }}>
                      {fmt(computedSubtotal)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={editing ? 8 : 7} className="pt-1 font-bold text-sm" style={{ color: C.green }}>
                      Total (+20% gastos finales)
                    </td>
                    <td colSpan={(editing ? visibleExpOpts : optKeys).length} className="pt-1 text-right font-bold text-base" style={{ color: C.green }}>
                      {fmt(computedSubtotal * 1.2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
      {showQuote && <QuoteModal project={project} onClose={() => setShowQuote(false)} />}
    </div>
  );
}

// ─── NEW PROJECT FORM ─────────────────────────────────────────────────────────
function NewProjectView({ onBack, onCreate }) {
  const [form, setForm] = useState({
    ref: "", brand: "", city: "", country: "España", client: "",
    sqm: "", status: "Pendiente", chosenOption: null,
    year: new Date().getFullYear(), startDate: "", duration: "",
    notes: "",
    locations: [],
    documents: [],
    checklist: [],
    options: { A: { subtotal: 0, total: 0 } },
    expenses: []
  });
  const [optCount, setOptCount]         = useState(1);
  const [visibleExpOpts, setVisibleExpOpts] = useState(["A"]);
  const setF    = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const optKeys = Object.keys(form.options);

  const addOption = () => {
    const next = ["A","B","C","D"][optCount];
    if (next) { setForm(f => ({ ...f, options: { ...f.options, [next]: { subtotal: 0, total: 0 } } })); setOptCount(c => c + 1); }
  };
  const addRow    = () => setForm(f => ({ ...f, expenses: [...f.expenses, { id: Date.now(), desc: "", url: "", date: "", time: "", provider: "", tarifa: "", optA: null, optB: null, optC: null, optD: null }] }));
  const updateRow = (id, field, val) => setForm(f => ({ ...f, expenses: f.expenses.map(e => e.id === id ? { ...e, [field]: val } : e) }));
  const deleteRow = (id)             => setForm(f => ({ ...f, expenses: f.expenses.filter(e => e.id !== id) }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.ref.trim()) return;
    onCreate({ ...form, id: Date.now(), sqm: form.sqm ? Number(form.sqm) : null, year: Number(form.year), duration: form.duration ? Number(form.duration) : null });
  };

  const inputSt = { background: C.bg, border: `1px solid ${C.border}`, color: C.textDark };
  const inputCl = "w-full rounded-lg px-3 py-2 text-sm outline-none";

  return (
    <div className="min-h-screen" style={{ background: C.bg }}>
      <div style={{ background: C.navy }} className="px-6 py-5">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button onClick={onBack} className="text-white/70 hover:text-white"><ArrowLeft size={18} /></button>
          <h2 className="text-lg font-bold text-white">Nuevo proyecto</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        {/* Info general */}
        <div className="rounded-xl p-5 space-y-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <h3 className="text-sm font-semibold" style={{ color: C.textDark }}>Información general</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium block mb-1" style={{ color: C.textMid }}>Nombre del proyecto *</label>
              <input required value={form.ref} onChange={e => setF("ref", e.target.value)} placeholder="CKO Roppenheim" style={inputSt} className={inputCl} />
            </div>
            {[["Marca","brand","CKO, TH..."],["Cliente","client","Tommy Hilfiger..."],
              ["Ciudad","city","París"],["País","country","Francia"],
              ["Superficie (m²)","sqm","350"],["Duración (h)","duration","8"],
              ["Fee fotografía (€)","photoFee","1200"]].map(([label, key, ph]) => (
              <div key={key}>
                <label className="text-xs font-medium block mb-1" style={{ color: C.textMid }}>{label}</label>
                <input value={form[key] || ""} onChange={e => setF(key, e.target.value)} placeholder={ph} style={inputSt} className={inputCl} />
              </div>
            ))}
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: C.textMid }}>Año</label>
              <input value={form.year || ""} onChange={e => setF("year", e.target.value)} style={inputSt} className={inputCl} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: C.textMid }}>Fecha inicio</label>
              <input type="date" value={form.startDate} onChange={e => setF("startDate", e.target.value)} style={inputSt} className={inputCl} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: C.textMid }}>Estado</label>
              <select value={form.status} onChange={e => setF("status", e.target.value)} style={inputSt} className={inputCl}>
                {Object.keys(STATUS_CONFIG).map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium block mb-1" style={{ color: C.textMid }}>Notas</label>
              <textarea value={form.notes || ""} onChange={e => setF("notes", e.target.value)}
                rows={3} placeholder="Observaciones, condiciones especiales, contactos..."
                className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none"
                style={inputSt} />
            </div>
          </div>
        </div>

        {/* Locations */}
        <LocationsSection
          locations={form.locations}
          editing={true}
          onChange={(locs) => setF("locations", locs)}
          city={form.city} country={form.country}
        />

        {/* Documents */}
        <DocumentsSection
          documents={form.documents}
          editing={true}
          onChange={(docs) => setF("documents", docs)}
        />

        {/* Checklist de equipo */}
        <ChecklistSection
          checklist={form.checklist || []}
          editing={true}
          onChange={(cl) => setF("checklist", cl)}
        />

        {/* Options */}
        <div className="rounded-xl p-5 space-y-3" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold" style={{ color: C.textDark }}>Opciones de presupuesto</h3>
            {optCount < 4 && (
              <button type="button" onClick={addOption}
                className="text-xs font-medium flex items-center gap-1 px-2.5 py-1 rounded-lg"
                style={{ background: C.navy + "12", color: C.navy }}>
                <Plus size={12} /> Añadir opción
              </button>
            )}
          </div>
          {optKeys.map(opt => {
            const oc = OPTION_COLORS[opt];
            return (
              <div key={opt} className="rounded-lg p-3 flex items-center gap-3"
                style={{ background: oc.bg, border: `1px solid ${oc.border}30` }}>
                <span className="font-bold text-sm w-6 text-center" style={{ color: oc.text }}>{opt}</span>
                <div className="flex-1 grid grid-cols-2 gap-2">
                  {[["Subtotal (€)","subtotal"],["Total +20% (€)","total"]].map(([label, key]) => (
                    <div key={key}>
                      <label className="text-xs font-medium block mb-1" style={{ color: oc.text }}>{label}</label>
                      <input type="number" value={form.options[opt][key] || ""}
                        onChange={e => {
                          const n = parseFloat(e.target.value) || 0;
                          setForm(f => {
                            const opts = { ...f.options, [opt]: { ...f.options[opt], [key]: n } };
                            if (key === "subtotal") opts[opt].total = +(n * 1.2).toFixed(2);
                            return { ...f, options: opts };
                          });
                        }}
                        style={{ ...inputSt, background: "#fff" }} className={inputCl} placeholder="0" />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Expenses */}
        <div className="rounded-xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold" style={{ color: C.textDark }}>Gastos de viaje y producción</h3>
            <div className="flex items-center gap-2">
              {/* Plantilla */}
              <select
                defaultValue=""
                onChange={e => {
                  if (!e.target.value) return;
                  const rows = applyExpenseTemplate(e.target.value);
                  setForm(f => ({ ...f, expenses: [...f.expenses, ...rows] }));
                  e.target.value = "";
                }}
                className="text-xs rounded-lg px-2 py-1 outline-none"
                style={{ background: "#f0fdf4", border: `1px solid ${C.border}`, color: C.textMid }}>
                <option value="">📋 Plantilla...</option>
                {Object.keys(EXPENSE_TEMPLATES).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {(() => {
                const next = ALL_OPTS.find(o => !visibleExpOpts.includes(o));
                return next ? (
                  <button type="button"
                    onClick={() => setVisibleExpOpts(v => [...v, next])}
                    className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg"
                    style={{ background: OPTION_COLORS[next].bg, border: `1px solid ${OPTION_COLORS[next].border}60`, color: OPTION_COLORS[next].text }}>
                    <Plus size={11} /> Op. {next}
                  </button>
                ) : null;
              })()}
              <button type="button" onClick={addRow}
                className="text-xs font-medium flex items-center gap-1 px-2.5 py-1 rounded-lg"
                style={{ background: C.navy + "12", color: C.navy }}>
                <Plus size={12} /> Añadir gasto
              </button>
            </div>
          </div>
          {form.expenses.length === 0
            ? <p className="text-xs text-center py-4" style={{ color: C.textLight }}>
                Pulsa "Añadir gasto" para registrar vuelos, hotel, dietas...
              </p>
            : <div className="overflow-x-auto">
                <table className="w-full text-sm" style={{ minWidth: 680 + visibleExpOpts.length * 80 }}>
                  <thead>
                    <tr>
                      <th className="w-7" />
                      {["Descripción","Enlace","Fecha","Horario","Proveedor","Tarifa",...visibleExpOpts.map(o => `Op. ${o}`)].map(h => (
                        <th key={h} className="text-left pb-2 font-medium text-xs pr-2" style={{ color: C.textLight }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {form.expenses.map(row => (
                      <ExpenseRow key={row.id} row={row} optKeys={visibleExpOpts} activeOpt="A"
                        editing={true}
                        onChange={(field, val) => updateRow(row.id, field, val)}
                        onDelete={() => deleteRow(row.id)} />
                    ))}
                  </tbody>
                </table>
              </div>}
        </div>

        <button type="submit"
          className="w-full py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
          style={{ background: C.navy, color: "#fff" }}>
          Crear proyecto
        </button>
      </form>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const { projects, loading, syncErr, save, create, remove } = useProjects();
  const [view, setView]             = useState("list");
  const [selectedId, setSelectedId] = useState(null);

  const selected = projects.find(p => p.id === selectedId);

  const handleSelect = (p) => { setSelectedId(p.id); setView("detail"); };

  const handleSave = async (updated) => {
    await save(updated);
  };

  const handleDelete = async (id) => {
    await remove(id);
    setView("list");
  };

  const handleCreate = async (project) => {
    const fresh = await create(project);
    if (fresh) setView("list");
  };

  const handleDuplicate = async (p) => {
    const dup = {
      ...JSON.parse(JSON.stringify(p)),
      ref: p.ref + " (copia)",
      status: "Pendiente",
      chosenOption: null,
    };
    delete dup.id; // Notion will assign a new UUID
    const fresh = await create(dup);
    if (fresh) { setSelectedId(fresh.id); setView("detail"); }
  };

  if (loading && projects.length === 0) {
    return (
      <div style={{ minHeight:"100vh", background:C.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16 }}>
        <div style={{ width:48, height:48, border:`4px solid ${C.border}`, borderTopColor:C.navy, borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
        <p style={{ color:C.textMid, fontFamily:"sans-serif" }}>Cargando proyectos…</p>
        <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      {syncErr && (
        <div style={{ position:"fixed", bottom:16, right:16, zIndex:9999, background:"#fee2e2", border:"1px solid #fca5a5", borderRadius:8, padding:"10px 16px", color:"#991b1b", fontFamily:"sans-serif", fontSize:13, maxWidth:320 }}>
          ⚠️ Sin conexión con Supabase — trabajando en local
        </div>
      )}
      {view === "detail" && selected
        ? <DetailView project={selected} onBack={() => setView("list")} onSave={handleSave} onDelete={handleDelete} onDuplicate={handleDuplicate} />
        : view === "new"
        ? <NewProjectView onBack={() => setView("list")} onCreate={handleCreate} />
        : <ResumeView projects={projects} onSelect={handleSelect} onNewProject={() => setView("new")} />
      }
    </>
  );
}
