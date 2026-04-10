import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import {
  Building2, Search, Plus, ChevronRight, ArrowLeft, MapPin, User,
  Calendar, Ruler, TrendingUp, CheckCircle2, Clock, XCircle, FileText,
  BarChart2, Home, Settings, Euro, Edit3, Trash2, Save, X
} from "lucide-react";

// ─── THEME ───────────────────────────────────────────────────────────────────
const C = {
  navy:       "#1a2a4a",
  navyDark:   "#0f1e38",
  navyLight:  "#243460",
  green:      "#1B5E20",
  greenMid:   "#2e7d32",
  greenLight: "#43a047",
  gold:       "#F1C232",
  goldLight:  "#FFD966",
  amber:      "#e65100",
  bg:         "#f4f6fb",
  card:       "#ffffff",
  border:     "#e2e8f0",
  textDark:   "#1a2a4a",
  textMid:    "#475569",
  textLight:  "#94a3b8",
};

// ─── SAMPLE DATA ─────────────────────────────────────────────────────────────
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
    startDate: "2024-03",
    duration: 6,
    options: {
      A: { subtotal: 1025, total: 1230 },
    },
    expenses: [
      { category: "Dirección creativa", desc: "Concepto y dirección", optA: 320, optB: null, optC: null, optD: null },
      { category: "Diseño gráfico", desc: "Maquetación y artes finales", optA: 280, optB: null, optC: null, optD: null },
      { category: "Producción", desc: "Impresión y materiales", optA: 425, optB: null, optC: null, optD: null },
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
    startDate: "2024-01",
    duration: 4,
    options: {
      A: { subtotal: 354, total: 424.8 },
      B: { subtotal: 390, total: 468 },
    },
    expenses: [
      { category: "Dirección creativa", desc: "Concepto y dirección", optA: 110, optB: 130, optC: null, optD: null },
      { category: "Diseño gráfico", desc: "Maquetación", optA: 95, optB: 105, optC: null, optD: null },
      { category: "Producción", desc: "Impresión y montaje", optA: 149, optB: 155, optC: null, optD: null },
    ]
  },
  {
    id: 3,
    ref: "CK Palmanova",
    brand: "CK",
    city: "Palmanova",
    country: "Italia",
    client: "Calvin Klein",
    sqm: 420,
    status: "Facturado",
    chosenOption: "A",
    year: 2024,
    startDate: "2024-02",
    duration: 5,
    options: {
      A: { subtotal: 711, total: 853.2 },
      B: { subtotal: 676, total: 811.2 },
    },
    expenses: [
      { category: "Dirección creativa", desc: "Concepto visual", optA: 220, optB: 200, optC: null, optD: null },
      { category: "Diseño gráfico", desc: "Artes finales", optA: 191, optB: 176, optC: null, optD: null },
      { category: "Producción", desc: "Materiales premium", optA: 300, optB: 300, optC: null, optD: null },
    ]
  },
  {
    id: 4,
    ref: "TH Palmanova",
    brand: "TH",
    city: "Palmanova",
    country: "Italia",
    client: "Tommy Hilfiger",
    sqm: 390,
    status: "Confirmado",
    chosenOption: "A",
    year: 2024,
    startDate: "2024-03",
    duration: 5,
    options: {
      A: { subtotal: 798, total: 957.6 },
      B: { subtotal: 755, total: 906 },
    },
    expenses: [
      { category: "Dirección creativa", desc: "Concepto y brandbook", optA: 250, optB: 225, optC: null, optD: null },
      { category: "Diseño gráfico", desc: "Maquetación completa", optA: 248, optB: 230, optC: null, optD: null },
      { category: "Producción", desc: "Impresión gran formato", optA: 300, optB: 300, optC: null, optD: null },
    ]
  },
  {
    id: 5,
    ref: "TH Molfetta",
    brand: "TH",
    city: "Molfetta",
    country: "Italia",
    client: "Tommy Hilfiger",
    sqm: 460,
    status: "Pendiente",
    chosenOption: "A",
    year: 2024,
    startDate: "2024-05",
    duration: 6,
    options: {
      A: { subtotal: 844, total: 1012.8 },
      B: { subtotal: 909, total: 1090.8 },
      C: { subtotal: 772, total: 926.4 },
    },
    expenses: [
      { category: "Dirección creativa", desc: "Estrategia de campaña", optA: 260, optB: 290, optC: 230, optD: null },
      { category: "Diseño gráfico", desc: "Artes finales completas", optA: 234, optB: 269, optC: 202, optD: null },
      { category: "Producción", desc: "Materiales y montaje", optA: 350, optB: 350, optC: 340, optD: null },
    ]
  },
  {
    id: 6,
    ref: "Loewe Cernobbio",
    brand: "Loewe",
    city: "Cernobbio",
    country: "Italia",
    client: "LVMH – Loewe",
    sqm: 310,
    status: "Facturado",
    chosenOption: "B",
    year: 2024,
    startDate: "2024-04",
    duration: 4,
    options: {
      A: { subtotal: 689, total: 826.8 },
      B: { subtotal: 790, total: 948 },
      C: { subtotal: 768, total: 921.6 },
    },
    expenses: [
      { category: "Dirección creativa", desc: "Concepto Loewe", optA: 200, optB: 240, optC: 230, optD: null },
      { category: "Diseño gráfico", desc: "Identidad visual", optA: 189, optB: 210, optC: 198, optD: null },
      { category: "Producción", desc: "Acabados premium", optA: 300, optB: 340, optC: 340, optD: null },
    ]
  },
  {
    id: 7,
    ref: "TH Kalverstraat",
    brand: "TH",
    city: "Kalverstraat",
    country: "Países Bajos",
    client: "Tommy Hilfiger",
    sqm: 520,
    status: "Confirmado",
    chosenOption: "A",
    year: 2024,
    startDate: "2024-06",
    duration: 7,
    options: {
      A: { subtotal: 986, total: 1183.2 },
      B: { subtotal: 1023, total: 1227.6 },
    },
    expenses: [
      { category: "Dirección creativa", desc: "Flagship concept", optA: 310, optB: 330, optC: null, optD: null },
      { category: "Diseño gráfico", desc: "Sistema visual completo", optA: 276, optB: 293, optC: null, optD: null },
      { category: "Producción", desc: "Gran formato + montaje", optA: 400, optB: 400, optC: null, optD: null },
    ]
  },
  {
    id: 8,
    ref: "CK Paris",
    brand: "CK",
    city: "París",
    country: "Francia",
    client: "Calvin Klein",
    sqm: 480,
    status: "Facturado",
    chosenOption: "C",
    year: 2024,
    startDate: "2024-02",
    duration: 5,
    options: {
      A: { subtotal: 741, total: 889.2 },
      B: { subtotal: 1021, total: 1225.2 },
      C: { subtotal: 993, total: 1191.6 },
    },
    expenses: [
      { category: "Dirección creativa", desc: "Fashion week concept", optA: 220, optB: 320, optC: 300, optD: null },
      { category: "Diseño gráfico", desc: "Colateral completo", optA: 201, optB: 281, optC: 263, optD: null },
      { category: "Producción", desc: "Materiales haute couture", optA: 320, optB: 420, optC: 430, optD: null },
    ]
  },
  {
    id: 9,
    ref: "SS San Sebastián de los Reyes",
    brand: "SS",
    city: "San Sebastián de los Reyes",
    country: "España",
    client: "Sandro / Smcp",
    sqm: 230,
    status: "Cancelado",
    chosenOption: null,
    year: 2024,
    startDate: "2024-07",
    duration: 3,
    options: {
      A: { subtotal: 410, total: 492 },
      B: { subtotal: 445, total: 534 },
    },
    expenses: [
      { category: "Dirección creativa", desc: "Concepto básico", optA: 130, optB: 150, optC: null, optD: null },
      { category: "Diseño gráfico", desc: "Artes finales", optA: 110, optB: 115, optC: null, optD: null },
      { category: "Producción", desc: "Impresión estándar", optA: 170, optB: 180, optC: null, optD: null },
    ]
  },
  {
    id: 10,
    ref: "Loewe Fidenza",
    brand: "Loewe",
    city: "Fidenza",
    country: "Italia",
    client: "LVMH – Loewe",
    sqm: 295,
    status: "Pendiente",
    chosenOption: null,
    year: 2025,
    startDate: "2025-01",
    duration: 5,
    options: {
      A: { subtotal: 720, total: 864 },
      B: { subtotal: 850, total: 1020 },
    },
    expenses: [
      { category: "Dirección creativa", desc: "Nuevo concepto", optA: 220, optB: 270, optC: null, optD: null },
      { category: "Diseño gráfico", desc: "Sistema completo", optA: 200, optB: 230, optC: null, optD: null },
      { category: "Producción", desc: "Materiales premium", optA: 300, optB: 350, optC: null, optD: null },
    ]
  },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  Pendiente:   { color: "#b45309", bg: "#fef3c7", icon: Clock },
  Confirmado:  { color: "#0369a1", bg: "#e0f2fe", icon: CheckCircle2 },
  Facturado:   { color: "#166534", bg: "#dcfce7", icon: CheckCircle2 },
  Cancelado:   { color: "#991b1b", bg: "#fee2e2", icon: XCircle },
};

const OPTION_COLORS = {
  A: { bg: "#fff7e6", border: "#F1C232", text: "#92400e", badge: "#F1C232" },
  B: { bg: "#f0fdf4", border: "#43a047", text: "#14532d", badge: "#43a047" },
  C: { bg: "#eff6ff", border: "#3b82f6", text: "#1e3a8a", badge: "#3b82f6" },
  D: { bg: "#fdf4ff", border: "#a855f7", text: "#581c87", badge: "#a855f7" },
};

const fmt = (n) => n != null ? `€${Number(n).toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : "—";
const fmtDec = (n) => n != null ? `€${Number(n).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—";

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
      <Icon size={11} />
      {status}
    </span>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
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

// ─── RESUMEN VIEW ─────────────────────────────────────────────────────────────
function ResumeView({ projects, onSelect, onNewProject }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [filterYear, setFilterYear] = useState("Todos");

  const years = useMemo(() => [...new Set(projects.map(p => p.year))].sort(), [projects]);

  const filtered = useMemo(() => {
    return projects.filter(p => {
      const q = search.toLowerCase();
      const matchQ = !q || p.ref.toLowerCase().includes(q) || p.city.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) || p.client.toLowerCase().includes(q);
      const matchS = filterStatus === "Todos" || p.status === filterStatus;
      const matchY = filterYear === "Todos" || p.year === Number(filterYear);
      return matchQ && matchS && matchY;
    });
  }, [projects, search, filterStatus, filterYear]);

  // Stats
  const active = projects.filter(p => p.status !== "Cancelado");
  const totalBilled = projects
    .filter(p => p.status === "Facturado" && p.chosenOption)
    .reduce((s, p) => s + (p.options[p.chosenOption]?.total || 0), 0);
  const totalConfirmed = projects
    .filter(p => p.status === "Confirmado" && p.chosenOption)
    .reduce((s, p) => s + (p.options[p.chosenOption]?.total || 0), 0);

  // Chart data by year
  const chartData = useMemo(() => {
    const byYear = {};
    projects.forEach(p => {
      if (!byYear[p.year]) byYear[p.year] = { year: String(p.year), Facturado: 0, Confirmado: 0, Pendiente: 0 };
      const val = p.chosenOption ? (p.options[p.chosenOption]?.total || 0) : 0;
      if (p.status === "Facturado") byYear[p.year].Facturado += val;
      else if (p.status === "Confirmado") byYear[p.year].Confirmado += val;
      else if (p.status === "Pendiente") byYear[p.year].Pendiente += val;
    });
    return Object.values(byYear).sort((a, b) => a.year - b.year);
  }, [projects]);

  return (
    <div className="min-h-screen" style={{ background: C.bg }}>
      {/* Header */}
      <div style={{ background: C.navy }} className="px-6 pt-8 pb-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">📊 Presupuestos</h1>
              <p className="text-sm mt-0.5" style={{ color: "#94a3b8" }}>{projects.length} proyectos · {years.join(", ")}</p>
            </div>
            <button onClick={onNewProject}
              className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-opacity hover:opacity-90"
              style={{ background: C.gold, color: C.navy }}>
              <Plus size={16} /> Nuevo proyecto
            </button>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Proyectos activos" value={active.length} icon={Building2} accent={C.gold} />
            <StatCard label="Facturado" value={fmt(totalBilled)} sub="proyectos cerrados" icon={Euro} accent={C.greenLight} />
            <StatCard label="Confirmado" value={fmt(totalConfirmed)} sub="en ejecución" icon={CheckCircle2} accent="#3b82f6" />
            <StatCard label="Pendiente" value={projects.filter(p=>p.status==="Pendiente").length} sub="por confirmar" icon={Clock} accent="#f59e0b" />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
        {/* Chart */}
        {chartData.length > 0 && (
          <div className="rounded-xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <h2 className="text-sm font-semibold mb-4" style={{ color: C.textDark }}>Volumen por año</h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} barSize={28} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{ fontSize: 12, fill: C.textMid }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: C.textLight }} axisLine={false} tickLine={false}
                  tickFormatter={v => `€${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v, n) => [fmt(v), n]} contentStyle={{ borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 12 }} />
                <Bar dataKey="Facturado" stackId="a" fill={C.greenLight} radius={[0,0,0,0]} />
                <Bar dataKey="Confirmado" stackId="a" fill="#3b82f6" radius={[0,0,0,0]} />
                <Bar dataKey="Pendiente" stackId="a" fill={C.gold} radius={[4,4,0,0]} />
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

        {/* Filters */}
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

        {/* Project list */}
        <div className="space-y-2">
          {filtered.length === 0 && (
            <div className="text-center py-12 text-sm" style={{ color: C.textLight }}>
              No hay proyectos que coincidan con los filtros.
            </div>
          )}
          {filtered.map(p => {
            const chosen = p.chosenOption ? p.options[p.chosenOption] : null;
            const optionColors = p.chosenOption ? OPTION_COLORS[p.chosenOption] : null;
            const costPerSqm = chosen && p.sqm ? chosen.total / p.sqm : null;
            return (
              <button key={p.id} onClick={() => onSelect(p)}
                className="w-full text-left rounded-xl px-5 py-4 flex items-center gap-4 transition-shadow hover:shadow-md"
                style={{ background: C.card, border: `1px solid ${C.border}` }}>
                {/* Brand badge */}
                <div className="hidden sm:flex w-12 h-12 rounded-lg items-center justify-center font-bold text-sm flex-shrink-0"
                  style={{ background: C.navy + "12", color: C.navy }}>
                  {p.brand}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm" style={{ color: C.textDark }}>{p.ref}</span>
                    <StatusBadge status={p.status} />
                    {p.chosenOption && (
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded"
                        style={{ background: optionColors.badge, color: "#fff" }}>
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
                    <span className="text-xs" style={{ color: C.textMid }}>{p.startDate} · {p.duration} sem.</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  {chosen ? (
                    <>
                      <div className="font-bold text-base" style={{ color: C.green }}>{fmt(chosen.total)}</div>
                      {costPerSqm && <div className="text-xs" style={{ color: C.textLight }}>{fmtDec(costPerSqm)}/m²</div>}
                    </>
                  ) : (
                    <div className="text-sm" style={{ color: C.textLight }}>Sin opción</div>
                  )}
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

// ─── PROJECT DETAIL VIEW ──────────────────────────────────────────────────────
function DetailView({ project: initialProject, onBack, onSave, onDelete }) {
  const [project, setProject] = useState(initialProject);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initialProject);
  const [activeOpt, setActiveOpt] = useState(project.chosenOption || Object.keys(project.options)[0]);

  const optKeys = Object.keys(project.options);
  const chosenData = project.options[activeOpt];
  const costPerSqm = chosenData && project.sqm ? chosenData.total / project.sqm : null;

  const handleSave = () => {
    setProject(draft);
    onSave(draft);
    setEditing(false);
  };

  const p = editing ? draft : project;
  const setD = (k, v) => setDraft(d => ({ ...d, [k]: v }));

  return (
    <div className="min-h-screen" style={{ background: C.bg }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${C.navyDark} 0%, ${C.navyLight} 100%)` }}
        className="px-6 pt-6 pb-8">
        <div className="max-w-3xl mx-auto">
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
                  <button onClick={() => { if(window.confirm("¿Eliminar este proyecto?")) onDelete(project.id); }}
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg"
                    style={{ background: "rgba(239,68,68,0.25)", color: "#fca5a5" }}>
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
              style={{ background: C.gold, color: C.navy }}>
              {project.brand}
            </div>
            <div className="flex-1">
              {editing ? (
                <input value={draft.ref} onChange={e => setD("ref", e.target.value)}
                  className="text-xl font-bold text-white bg-transparent border-b border-white/30 outline-none w-full mb-1" />
              ) : (
                <h2 className="text-xl font-bold text-white">{project.ref}</h2>
              )}
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

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {/* Metadata */}
        <div className="rounded-xl p-5 grid grid-cols-2 sm:grid-cols-3 gap-4"
          style={{ background: C.card, border: `1px solid ${C.border}` }}>
          {[
            ["Cliente", "client", <User size={13} />],
            ["Inicio", "startDate", <Calendar size={13} />],
            ["Duración", "duration", <Clock size={13} />, " semanas"],
            ["Superficie", "sqm", <Ruler size={13} />, " m²"],
            ["País", "country", <MapPin size={13} />],
          ].map(([label, key, icon, suffix]) => (
            <div key={key}>
              <div className="flex items-center gap-1.5 text-xs mb-1" style={{ color: C.textLight }}>
                {icon} {label}
              </div>
              {editing ? (
                <input value={draft[key] || ""} onChange={e => setD(key, e.target.value)}
                  className="text-sm font-semibold w-full rounded px-2 py-1 outline-none"
                  style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.textDark }} />
              ) : (
                <div className="text-sm font-semibold" style={{ color: C.textDark }}>
                  {project[key]}{suffix || ""}
                </div>
              )}
            </div>
          ))}
          <div>
            <div className="flex items-center gap-1.5 text-xs mb-1" style={{ color: C.textLight }}>
              <CheckCircle2 size={13} /> Estado
            </div>
            {editing ? (
              <select value={draft.status} onChange={e => setD("status", e.target.value)}
                className="text-sm font-semibold w-full rounded px-2 py-1 outline-none"
                style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.textDark }}>
                {Object.keys(STATUS_CONFIG).map(s => <option key={s}>{s}</option>)}
              </select>
            ) : (
              <StatusBadge status={project.status} />
            )}
          </div>
        </div>

        {/* Option selector */}
        <div className="rounded-xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: C.textDark }}>Opciones de presupuesto</h3>
          <div className="flex gap-2 flex-wrap mb-4">
            {optKeys.map(opt => {
              const oc = OPTION_COLORS[opt];
              const isChosen = project.chosenOption === opt;
              const isActive = activeOpt === opt;
              return (
                <button key={opt} onClick={() => setActiveOpt(opt)}
                  className="flex-1 min-w-24 rounded-xl p-3 text-center transition-all"
                  style={{
                    background: isActive ? oc.bg : "#f8fafc",
                    border: `2px solid ${isActive ? oc.border : C.border}`,
                    color: isActive ? oc.text : C.textMid,
                  }}>
                  <div className="font-bold text-sm">Opción {opt}</div>
                  <div className="font-bold text-lg mt-0.5" style={{ color: isActive ? oc.text : C.textDark }}>
                    {fmt(project.options[opt].total)}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: C.textLight }}>
                    Subtotal: {fmt(project.options[opt].subtotal)}
                  </div>
                  {isChosen && (
                    <div className="text-xs font-bold mt-1 rounded px-1 py-0.5 inline-block"
                      style={{ background: oc.badge, color: "#fff" }}>
                      ✓ Elegida
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Chosen option selector */}
          <div className="flex items-center gap-3">
            <span className="text-xs" style={{ color: C.textMid }}>Opción elegida:</span>
            <div className="flex gap-1.5">
              {[null, ...optKeys].map(opt => (
                <button key={opt || "none"} onClick={() => {
                    const updated = { ...project, chosenOption: opt };
                    setProject(updated); setDraft(updated); onSave(updated);
                  }}
                  className="text-xs font-bold px-2.5 py-1 rounded-full transition-all"
                  style={{
                    background: project.chosenOption === opt ? (opt ? OPTION_COLORS[opt].badge : "#64748b") : "#f1f5f9",
                    color: project.chosenOption === opt ? "#fff" : C.textMid,
                  }}>
                  {opt || "—"}
                </button>
              ))}
            </div>
            {costPerSqm && (
              <span className="text-xs ml-auto" style={{ color: C.textMid }}>
                <TrendingUp size={11} className="inline mr-1" />
                {fmtDec(costPerSqm)}/m²
              </span>
            )}
          </div>
        </div>

        {/* Expense breakdown */}
        <div className="rounded-xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: C.textDark }}>
            Desglose de gastos — Opción {activeOpt}
          </h3>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left pb-2 font-medium" style={{ color: C.textLight }}>Categoría</th>
                <th className="text-left pb-2 font-medium" style={{ color: C.textLight }}>Descripción</th>
                <th className="text-right pb-2 font-medium" style={{ color: C.textLight }}>Importe</th>
              </tr>
            </thead>
            <tbody>
              {project.expenses.map((e, i) => {
                const val = e[`opt${activeOpt}`];
                return (
                  <tr key={i} style={{ borderTop: `1px solid ${C.border}` }}>
                    <td className="py-2.5 font-medium" style={{ color: C.textDark }}>{e.category}</td>
                    <td className="py-2.5 text-xs" style={{ color: C.textMid }}>{e.desc}</td>
                    <td className="py-2.5 text-right font-semibold" style={{ color: val ? C.textDark : C.textLight }}>
                      {val != null ? fmt(val) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: `2px solid ${C.border}` }}>
                <td colSpan={2} className="pt-2.5 font-semibold" style={{ color: C.textDark }}>Subtotal</td>
                <td className="pt-2.5 text-right font-semibold" style={{ color: C.textDark }}>
                  {fmt(chosenData?.subtotal)}
                </td>
              </tr>
              <tr>
                <td colSpan={2} className="pt-1 font-bold" style={{ color: C.green }}>
                  Total (+20% gastos finales)
                </td>
                <td className="pt-1 text-right font-bold text-base" style={{ color: C.green }}>
                  {fmt(chosenData?.total)}
                </td>
              </tr>
            </tfoot>
          </table>
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
    year: 2024, startDate: "", duration: "",
    options: { A: { subtotal: 0, total: 0 } },
    expenses: [
      { category: "Dirección creativa", desc: "", optA: null, optB: null, optC: null, optD: null },
      { category: "Diseño gráfico", desc: "", optA: null, optB: null, optC: null, optD: null },
      { category: "Producción", desc: "", optA: null, optB: null, optC: null, optD: null },
    ]
  });
  const [optCount, setOptCount] = useState(1);

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const updateOption = (opt, key, val) => {
    const n = parseFloat(val) || 0;
    setForm(f => {
      const updated = { ...f.options };
      updated[opt] = { ...updated[opt], [key]: n };
      if (key === "subtotal") updated[opt].total = +(n * 1.2).toFixed(2);
      return { ...f, options: updated };
    });
  };

  const handleAddOption = () => {
    const keys = ["A", "B", "C", "D"];
    const next = keys[optCount];
    if (next) {
      setForm(f => ({ ...f, options: { ...f.options, [next]: { subtotal: 0, total: 0 } } }));
      setOptCount(c => c + 1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.ref.trim()) return;
    onCreate({
      ...form,
      id: Date.now(),
      sqm: form.sqm ? Number(form.sqm) : null,
      year: Number(form.year),
      duration: form.duration ? Number(form.duration) : null,
    });
  };

  const labelClass = "text-xs font-medium block mb-1";
  const inputClass = "w-full rounded-lg px-3 py-2 text-sm outline-none";
  const inputStyle = { background: C.bg, border: `1px solid ${C.border}`, color: C.textDark };

  return (
    <div className="min-h-screen" style={{ background: C.bg }}>
      <div style={{ background: C.navy }} className="px-6 py-5">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={onBack} className="text-white/70 hover:text-white">
            <ArrowLeft size={18} />
          </button>
          <h2 className="text-lg font-bold text-white">Nuevo proyecto</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Basic info */}
        <div className="rounded-xl p-5 space-y-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <h3 className="text-sm font-semibold" style={{ color: C.textDark }}>Información general</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className={labelClass} style={{ color: C.textMid }}>Nombre del proyecto *</label>
              <input required value={form.ref} onChange={e => setF("ref", e.target.value)}
                placeholder="CKO Roppenheim" style={inputStyle} className={inputClass} />
            </div>
            <div>
              <label className={labelClass} style={{ color: C.textMid }}>Marca</label>
              <input value={form.brand} onChange={e => setF("brand", e.target.value)}
                placeholder="CKO, TH, CK..." style={inputStyle} className={inputClass} />
            </div>
            <div>
              <label className={labelClass} style={{ color: C.textMid }}>Cliente</label>
              <input value={form.client} onChange={e => setF("client", e.target.value)}
                placeholder="Tommy Hilfiger..." style={inputStyle} className={inputClass} />
            </div>
            <div>
              <label className={labelClass} style={{ color: C.textMid }}>Ciudad</label>
              <input value={form.city} onChange={e => setF("city", e.target.value)}
                placeholder="París" style={inputStyle} className={inputClass} />
            </div>
            <div>
              <label className={labelClass} style={{ color: C.textMid }}>País</label>
              <input value={form.country} onChange={e => setF("country", e.target.value)}
                placeholder="Francia" style={inputStyle} className={inputClass} />
            </div>
            <div>
              <label className={labelClass} style={{ color: C.textMid }}>Superficie (m²)</label>
              <input type="number" value={form.sqm} onChange={e => setF("sqm", e.target.value)}
                placeholder="350" style={inputStyle} className={inputClass} />
            </div>
            <div>
              <label className={labelClass} style={{ color: C.textMid }}>Año</label>
              <input type="number" value={form.year} onChange={e => setF("year", e.target.value)}
                style={inputStyle} className={inputClass} />
            </div>
            <div>
              <label className={labelClass} style={{ color: C.textMid }}>Fecha inicio</label>
              <input value={form.startDate} onChange={e => setF("startDate", e.target.value)}
                placeholder="2024-06" style={inputStyle} className={inputClass} />
            </div>
            <div>
              <label className={labelClass} style={{ color: C.textMid }}>Duración (semanas)</label>
              <input type="number" value={form.duration} onChange={e => setF("duration", e.target.value)}
                placeholder="5" style={inputStyle} className={inputClass} />
            </div>
            <div>
              <label className={labelClass} style={{ color: C.textMid }}>Estado</label>
              <select value={form.status} onChange={e => setF("status", e.target.value)}
                style={inputStyle} className={inputClass}>
                {Object.keys(STATUS_CONFIG).map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="rounded-xl p-5 space-y-3" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold" style={{ color: C.textDark }}>Opciones de presupuesto</h3>
            {optCount < 4 && (
              <button type="button" onClick={handleAddOption}
                className="text-xs font-medium flex items-center gap-1 px-2.5 py-1 rounded-lg"
                style={{ background: C.navy + "12", color: C.navy }}>
                <Plus size={12} /> Añadir opción
              </button>
            )}
          </div>
          {Object.keys(form.options).map(opt => {
            const oc = OPTION_COLORS[opt];
            return (
              <div key={opt} className="rounded-lg p-3 flex items-center gap-3"
                style={{ background: oc.bg, border: `1px solid ${oc.border}30` }}>
                <span className="font-bold text-sm w-6 text-center" style={{ color: oc.text }}>
                  {opt}
                </span>
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <div>
                    <label className={labelClass} style={{ color: oc.text }}>Subtotal (€)</label>
                    <input type="number" value={form.options[opt].subtotal || ""}
                      onChange={e => updateOption(opt, "subtotal", e.target.value)}
                      style={{ ...inputStyle, background: "#fff" }} className={inputClass} placeholder="0" />
                  </div>
                  <div>
                    <label className={labelClass} style={{ color: oc.text }}>Total +20% (€)</label>
                    <input type="number" value={form.options[opt].total || ""}
                      onChange={e => updateOption(opt, "total", e.target.value)}
                      style={{ ...inputStyle, background: "#fff" }} className={inputClass} placeholder="0" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit */}
        <button type="submit"
          className="w-full py-3 rounded-xl font-bold text-sm transition-opacity hover:opacity-90"
          style={{ background: C.navy, color: "#fff" }}>
          Crear proyecto
        </button>
      </form>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [projects, setProjects] = useLocalStorage("presupuestos_v1", INITIAL_PROJECTS);
  const [view, setView] = useState("list"); // "list" | "detail" | "new"
  const [selectedId, setSelectedId] = useState(null);

  const selectedProject = projects.find(p => p.id === selectedId);

  const handleSelect = (p) => { setSelectedId(p.id); setView("detail"); };
  const handleBack = () => setView("list");
  const handleNew = () => setView("new");

  const handleCreate = (p) => {
    setProjects(prev => [p, ...prev]);
    setView("list");
  };

  const handleSave = (updated) => {
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleDelete = (id) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    setView("list");
  };

  if (view === "detail" && selectedProject) {
    return <DetailView project={selectedProject} onBack={handleBack}
      onSave={handleSave} onDelete={handleDelete} />;
  }
  if (view === "new") {
    return <NewProjectView onBack={handleBack} onCreate={handleCreate} />;
  }
  return <ResumeView projects={projects} onSelect={handleSelect} onNewProject={handleNew} />;
}
