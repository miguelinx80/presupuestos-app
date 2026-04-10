import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  Building2, Search, Plus, ChevronRight, ArrowLeft, MapPin, User,
  Calendar, Ruler, TrendingUp, CheckCircle2, Clock, XCircle,
  Euro, Edit3, Trash2, Save, X, Plane, Car, Hotel,
  Utensils, Bus, ExternalLink, ChevronDown, ChevronUp, Navigation
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
    status: "Confirmado",
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
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt  = (n) => n != null ? `€${Number(n).toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : "—";
const fmtD = (n) => n != null ? `€${Number(n).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—";
const optKey = (o) => `opt${o}`;
const newLocId = () => Date.now() + Math.random();

function useLocalStorage(key, initial) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : initial; }
    catch { return initial; }
  });
  const set = (v) => {
    const next = typeof v === "function" ? v(val) : v;
    setVal(next);
    try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
  };
  return [val, set];
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

// ─── LOCATIONS SECTION ────────────────────────────────────────────────────────
function LocationsSection({ locations = [], editing, onChange }) {
  const addLoc = () => onChange([...locations, { id: newLocId(), name: "", mapsUrl: "", date: "", time: "", notes: "" }]);
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
                  <div className="col-span-2">
                    <label className="text-xs block mb-1" style={{ color: C.textLight }}>Enlace Google Maps</label>
                    <input value={loc.mapsUrl} onChange={e => updateLoc(loc.id, "mapsUrl", e.target.value)}
                      placeholder="https://maps.google.com/?q=..."
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

// ─── EXPENSE ROW ─────────────────────────────────────────────────────────────
function ExpenseRow({ row, optKeys, activeOpt, editing, onChange, onDelete }) {
  const Icon = getCatIcon(row.desc);

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
              placeholder="0"
              className="rounded px-2 py-1 text-xs outline-none text-right w-20"
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
        <div className="max-w-5xl mx-auto">
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

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
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
            const chosen = p.chosenOption ? p.options[p.chosenOption] : null;
            const oc     = p.chosenOption ? OPTION_COLORS[p.chosenOption] : null;
            const cpm    = chosen && p.sqm ? chosen.total / p.sqm : null;
            const primaryLoc = p.locations?.[0];
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
                    {p.chosenOption && (
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded text-white" style={{ background: oc.badge }}>
                        Op. {p.chosenOption}
                      </span>
                    )}
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
                        <Calendar size={10} />{fmtDate(p.startDate)}
                      </span>
                    )}
                    {p.locations?.length > 0 && (
                      <span className="text-xs flex items-center gap-1" style={{ color: "#2563eb" }}>
                        <Navigation size={10} />{p.locations.length} ubicación{p.locations.length > 1 ? "es" : ""}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  {chosen
                    ? <><div className="font-bold text-base" style={{ color: C.green }}>{fmt(chosen.total)}</div>
                        {cpm && <div className="text-xs" style={{ color: C.textLight }}>{fmtD(cpm)}/m²</div>}</>
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
function DetailView({ project: initial, onBack, onSave, onDelete }) {
  const [project, setProject]           = useState(initial);
  const [editing, setEditing]           = useState(false);
  const [draft, setDraft]               = useState(initial);
  const [activeOpt, setActiveOpt]       = useState(initial.chosenOption || Object.keys(initial.options)[0]);
  const [showExpenses, setShowExpenses] = useState(true);

  const optKeys    = Object.keys(project.options);
  const chosenData = project.options[activeOpt];
  const cpm        = chosenData && project.sqm ? chosenData.total / project.sqm : null;

  const computedSubtotal = useMemo(() =>
    (editing ? draft : project).expenses.reduce((s, e) => s + (e[optKey(activeOpt)] || 0), 0),
    [editing, draft, project, activeOpt]
  );

  const handleSave = () => { setProject(draft); onSave(draft); setEditing(false); };
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
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-medium text-white/70 hover:text-white">
              <ArrowLeft size={16} /> Volver
            </button>
            <div className="flex items-center gap-2">
              {!editing ? (
                <>
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

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">

        {/* Metadata */}
        <div className="rounded-xl p-5 grid grid-cols-2 sm:grid-cols-3 gap-4"
          style={{ background: C.card, border: `1px solid ${C.border}` }}>
          {[
            ["Cliente",   "client",    <User size={13} />],
            ["País",      "country",   <MapPin size={13} />],
            ["Ciudad",    "city",      <MapPin size={13} />],
            ["Superficie","sqm",       <Ruler size={13} />, " m²"],
            ["Duración",  "duration",  <Clock size={13} />, " sem."],
          ].map(([label, key, icon, suffix]) => (
            <div key={key}>
              <div className="flex items-center gap-1 text-xs mb-1" style={{ color: C.textLight }}>{icon} {label}</div>
              {editing
                ? <input value={draft[key] || ""} onChange={e => setD(key, e.target.value)} className={inputCl} style={inputSt} />
                : <div className="text-sm font-semibold" style={{ color: C.textDark }}>{project[key]}{suffix || ""}</div>}
            </div>
          ))}

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
        </div>

        {/* Locations */}
        <LocationsSection
          locations={p.locations || []}
          editing={editing}
          onChange={(locs) => setDraft(d => ({ ...d, locations: locs }))}
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
                    {fmt(project.options[opt].total)}</div>
                  <div className="text-xs mt-0.5" style={{ color: C.textLight }}>Sub: {fmt(project.options[opt].subtotal)}</div>
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
              <button type="button" onClick={addRow}
                className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg"
                style={{ background: C.navy + "12", color: C.navy }}>
                <Plus size={12} /> Añadir fila
              </button>
            )}
          </div>

          {showExpenses && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ minWidth: editing ? 960 : 680 }}>
                <thead>
                  <tr>
                    {editing && <th className="w-7" />}
                    <th className="w-7" />
                    {["Descripción","Enlace","Fecha","Horario","Proveedor/Aerolínea","Tarifa"].map(h => (
                      <th key={h} className="text-left pb-2 font-medium text-xs pr-3" style={{ color: C.textLight }}>{h}</th>
                    ))}
                    {optKeys.map(o => (
                      <th key={o} className="text-right pb-2 font-medium text-xs px-1"
                        style={{ color: o === activeOpt ? OPTION_COLORS[o].badge : C.textLight }}>
                        Op. {o}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {p.expenses.map(row => (
                    <ExpenseRow key={row.id} row={row} optKeys={optKeys} activeOpt={activeOpt}
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
                    <td colSpan={optKeys.length} className="pt-2.5 text-right font-bold" style={{ color: C.textDark }}>
                      {fmt(computedSubtotal)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={editing ? 8 : 7} className="pt-1 font-bold text-sm" style={{ color: C.green }}>
                      Total (+20% gastos finales)
                    </td>
                    <td colSpan={optKeys.length} className="pt-1 text-right font-bold text-base" style={{ color: C.green }}>
                      {fmt(computedSubtotal * 1.2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── NEW PROJECT FORM ─────────────────────────────────────────────────────────
function NewProjectView({ onBack, onCreate }) {
  const [form, setForm] = useState({
    ref: "", brand: "", city: "", country: "España", client: "",
    sqm: "", status: "Pendiente", chosenOption: null,
    year: new Date().getFullYear(), startDate: "", duration: "",
    locations: [],
    options: { A: { subtotal: 0, total: 0 } },
    expenses: []
  });
  const [optCount, setOptCount] = useState(1);
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
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button onClick={onBack} className="text-white/70 hover:text-white"><ArrowLeft size={18} /></button>
          <h2 className="text-lg font-bold text-white">Nuevo proyecto</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 py-6 space-y-5">
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
              ["Superficie (m²)","sqm","350"],["Duración (sem.)","duration","5"]].map(([label, key, ph]) => (
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
          </div>
        </div>

        {/* Locations */}
        <LocationsSection
          locations={form.locations}
          editing={true}
          onChange={(locs) => setF("locations", locs)}
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
            <button type="button" onClick={addRow}
              className="text-xs font-medium flex items-center gap-1 px-2.5 py-1 rounded-lg"
              style={{ background: C.navy + "12", color: C.navy }}>
              <Plus size={12} /> Añadir gasto
            </button>
          </div>
          {form.expenses.length === 0
            ? <p className="text-xs text-center py-4" style={{ color: C.textLight }}>
                Pulsa "Añadir gasto" para registrar vuelos, hotel, dietas...
              </p>
            : <div className="overflow-x-auto">
                <table className="w-full text-sm" style={{ minWidth: 820 }}>
                  <thead>
                    <tr>
                      <th className="w-7" />
                      {["Descripción","Enlace","Fecha","Horario","Proveedor","Tarifa",...optKeys.map(o=>`Op. ${o}`)].map(h => (
                        <th key={h} className="text-left pb-2 font-medium text-xs pr-2" style={{ color: C.textLight }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {form.expenses.map(row => (
                      <ExpenseRow key={row.id} row={row} optKeys={optKeys} activeOpt={optKeys[0]}
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
  const [projects, setProjects] = useLocalStorage("presupuestos_v3", INITIAL_PROJECTS);
  const [view, setView]         = useState("list");
  const [selectedId, setSelectedId] = useState(null);

  const selected = projects.find(p => p.id === selectedId);

  const handleSelect = (p)  => { setSelectedId(p.id); setView("detail"); };
  const handleSave   = (u)  => setProjects(prev => prev.map(p => p.id === u.id ? u : p));
  const handleDelete = (id) => { setProjects(prev => prev.filter(p => p.id !== id)); setView("list"); };
  const handleCreate = (p)  => { setProjects(prev => [p, ...prev]); setView("list"); };

  if (view === "detail" && selected)
    return <DetailView project={selected} onBack={() => setView("list")} onSave={handleSave} onDelete={handleDelete} />;
  if (view === "new")
    return <NewProjectView onBack={() => setView("list")} onCreate={handleCreate} />;
  return <ResumeView projects={projects} onSelect={handleSelect} onNewProject={() => setView("new")} />;
}
