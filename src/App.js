import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Plus, Users, LayoutGrid, BookOpen, Trash2, Edit3, TrendingUp,
  Target, Award, X, PlusCircle, CheckCircle2, AlertTriangle,
  Wrench, ShieldAlert, MessageCircle, ChevronDown, Calendar,
  BarChart3, Lightbulb, ArrowRight, Clock, RefreshCw, Info, Lock, Key,
  Printer, FileText, CheckCircle, XCircle, LogOut, Copy
} from "lucide-react";

// ── Inisialisasi Supabase (UNCHANGED) ───────────────────────────────────────
const supabaseUrl = 'https://bervlosjswfmqhxisikn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlcnZsb3Nqc3dmbXFoeGlzaWtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyODkyMjEsImV4cCI6MjA5MTg2NTIyMX0.IHTyFaCz7ExiHs7KSGaOnK3jdXXU7c47tcGHxOlKtME';
const supabase = createClient(supabaseUrl, supabaseKey);

// ── Helpers (Improved & Memoizable) ────────────────────────────────────────
const getQuadrant = (comp, comm) => {
  const hi = v => v >= 3;
  if (!hi(comp) && !hi(comm)) return { id: "Q1", label: "Critical Area",    color: "#EF4444", bg: "#FEF2F2", border: "#FECACA", text: "#991B1B", dot: "bg-red-500"    };
  if (!hi(comp) &&  hi(comm)) return { id: "Q2", label: "Potential Talent", color: "#F59E0B", bg: "#FFFBEB", border: "#FDE68A", text: "#92400E", dot: "bg-amber-500"  };
  if ( hi(comp) && !hi(comm)) return { id: "Q3", label: "Expert in Slump",  color: "#3B82F6", bg: "#EFF6FF", border: "#BFDBFE", text: "#1E40AF", dot: "bg-blue-500"   };
  return                                { id: "Q4", label: "Star Performer",   color: "#10B981", bg: "#ECFDF5", border: "#A7F3D0", text: "#065F46", dot: "bg-emerald-500" };
};

const getDocumentTitle = (qId) => {
  if (qId === "Q1") return "PERFORMANCE IMPROVEMENT PLAN (PIP)";
  if (qId === "Q2") return "ACCELERATED DEVELOPMENT PLAN (ADP)";
  if (qId === "Q3") return "RE-ENGAGEMENT & ALIGNMENT PLAN";
  return "TALENT RETENTION & GROWTH PLAN";
};

// DISC data and scripts remain the same (kept for fidelity)
const DISC_META = { /* ... your original DISC_META unchanged ... */ };
const RATING_ANCHORS = { /* ... your original unchanged ... */ };
const getDISCScript = (disc) => { /* ... your original getDISCScript unchanged ... */ };

// ── Improved getActionPlan with Shareable Mode ─────────────────────────────
const getActionPlan = (m, isShareable = false) => {
  const q = getQuadrant(m.competency, m.commitment);
  const script = getDISCScript(m.disc || "S");
  const discData = DISC_META[m.disc || "S"];

  const plan = [];

  // 1. Profile Section (always shown)
  plan.push({
    type: "profile",
    title: `Analisis Karakter: Tipe ${m.disc || "S"} — ${discData.label}`,
    color: discData.color,
    bg: "#F8FAFC",
    border: "#E2E8F0",
    icon: "info",
    items: isShareable 
      ? [`Kekuatan utama: ${discData.strengths.split('，')[0] || discData.strengths}`]
      : [
          `KEKUATAN UTAMA: ${discData.strengths}`,
          `BLIND SPOT: ${discData.weaknesses}`,
          `IMPLIKASI: Sesuaikan komunikasi dengan gaya ${m.disc || "S"}.`
        ]
  });

  // 2. Skill Gap (shortened when shareable)
  if (m.competency < 3) {
    plan.push({
      type: "skill",
      title: isShareable ? "Area Pengembangan Kompetensi" : "Intervensi Kompetensi (Skill Gap)",
      color: "#6366F1",
      bg: "#EEF2FF",
      border: "#C7D2FE",
      items: isShareable 
        ? [
            `Fokus utama: ${m.competencyNotes?.[0] || "tugas inti"}`,
            "Kita akan buat rencana belajar bersama yang realistis.",
            "Target: Bisa mandiri dalam 60-90 hari."
          ]
        : [
            `DIAGNOSIS: ${m.competencyNotes?.[0] || "area tugas utama"}`,
            `PENDEKATAN untuk tipe ${m.disc}: ${m.disc === "C" ? "Panduan tertulis detail" : m.disc === "D" ? "Berikan otonomi & proyek kecil" : m.disc === "I" ? "Roleplay & gamifikasi" : "OJT sabar & bertahap"}`,
            "Check-in mingguan singkat. Target 30-60-90 hari jelas."
          ]
    });
  }

  // 3. Will Gap
  if (m.commitment < 3) {
    plan.push({
      type: "will",
      title: isShareable ? "Meningkatkan Motivasi" : "Intervensi Motivasi (Will Gap)",
      color: "#F59E0B",
      bg: "#FFFBEB",
      border: "#FDE68A",
      items: isShareable 
        ? [
            `Mari kita bicara terbuka: Apa yang paling membuat kamu bersemangat saat ini?`,
            script.open,
            "Kita akan cari solusi bersama yang realistis."
          ]
        : [
            `BUKTI: ${m.commitmentNotes?.[0] || "pola komitmen rendah"}`,
            `PEMBUKA: ${script.open}`,
            `ISI DISKUSI: ${script.body}`,
            `YANG DIHINDARI: ${script.avoid}`
          ]
    });
  }

  // 4. Quadrant-specific protocol (softened for shareable)
  if (q.id === "Q1" || q.id === "Q3") {
    plan.push({
      type: q.id === "Q1" ? "pip" : "reengagement",
      title: isShareable ? "Rencana Perbaikan Bersama" : (q.id === "Q1" ? "Protokol PIP" : "Protokol Re-engagement"),
      color: q.id === "Q1" ? "#EF4444" : "#3B82F6",
      bg: q.id === "Q1" ? "#FEF2F2" : "#EFF6FF",
      items: isShareable 
        ? ["Kita akan kerjakan langkah-langkah kecil tapi konsisten.", "Saya akan dampingi kamu secara rutin.", "Mari kita review progres setiap 2 minggu."]
        : (q.id === "Q1" ? [/* your original detailed PIP items */] : [/* your original Q3 items */])
    });
  } else if (q.id === "Q4" && !isShareable) {
    plan.push({
      type: "growth",
      title: "Retensi & Pertumbuhan",
      color: "#10B981",
      bg: "#ECFDF5",
      items: [/* your original Q4 items, kept rich for manager */]
    });
  }

  // 5. Joint Commitment Section (only in shareable mode)
  if (isShareable) {
    plan.push({
      type: "joint",
      title: "Kesepakatan Bersama",
      color: "#10B981",
      bg: "#ECFDF5",
      items: [
        "Kita sepakat fokus pada 2-3 prioritas utama dalam 30-60 hari mendatang.",
        `Manajer akan mendukung dengan: waktu, resources, dan coaching rutin.`,
        `Anggota tim akan berkomitmen pada: tindakan spesifik yang kita sepakati.`,
        `Review bersama dijadwalkan pada: ________________ (tanggal)`
      ]
    });
  }

  return plan;
};

// teamHealthScore (memoized later)
const teamHealthScore = (members) => {
  if (!members.length) return null;
  const avg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
  const compAvg = avg(members.map(m => m.competency));
  const commAvg = avg(members.map(m => m.commitment));
  const score = Math.round(((compAvg + commAvg) / 8) * 100);
  const dist = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
  members.forEach(m => dist[getQuadrant(m.competency, m.commitment).id]++);
  return { score, compAvg: compAvg.toFixed(1), commAvg: commAvg.toFixed(1), dist };
};

// ── UI Components (Enhanced) ───────────────────────────────────────────────
const RatingSelector = ({ label, dim, value, onChange }) => ( /* unchanged */ );

const DISCSelector = ({ value, onChange }) => ( /* unchanged */ );

// New: Quick preset notes helper
const COMMON_NOTES = {
  competency: [
    "Terlambat menyelesaikan tugas inti 2x bulan ini",
    "Hasil kerja akurat tapi lambat",
    "Sangat mahir & sering membantu rekan",
    "Sering membuat kesalahan dasar"
  ],
  commitment: [
    "Proaktif mencari solusi & membantu tim",
    "Rajin tapi jarang ambil inisiatif",
    "Sering terlambat submit laporan",
    "Semangat tinggi saat ada tantangan baru"
  ]
};

const NoteInput = ({ label, type, notes, onAdd, onUpdate, onRemove, onQuickAdd }) => (
  <div className="space-y-1.5 sm:space-y-2">
    <div className="flex justify-between items-center">
      <label className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest">{label}</label>
      <div className="flex gap-2">
        <button type="button" onClick={() => onQuickAdd(type)} className="text-xs text-emerald-600 font-medium flex items-center gap-1">
          <PlusCircle className="w-3 h-3" /> Preset
        </button>
        <button type="button" onClick={() => onAdd(type)} className="text-xs sm:text-sm font-bold text-indigo-600 flex items-center gap-1">
          <PlusCircle className="w-3 h-3 sm:w-4 sm:h-4" /> Tambah Manual
        </button>
      </div>
    </div>
    <div className="space-y-2">
      {notes.map((n, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input 
            className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm sm:text-base text-slate-900 outline-none focus:ring-2 focus:ring-slate-900 placeholder:text-slate-300"
            placeholder="Bukti perilaku spesifik..." 
            value={n}
            onChange={e => onUpdate(type, i, e.target.value)} 
          />
          {notes.length > 1 && (
            <button type="button" onClick={() => onRemove(type, i)} className="p-2 text-slate-300 hover:text-red-400">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  </div>
);

// QUADRANT_GUIDE remains unchanged...

// ── Auth Gate (UNCHANGED) ───────────────────────────────────────────────────
const SupabaseAuthGate = ({ onLoginSuccess }) => { /* your original unchanged */ };

// ── Main App ────────────────────────────────────────────────────────────────
const EMPTY_FORM = { name: "", role: "", competency: 3, commitment: 3, competencyNotes: [""], commitmentNotes: [""], disc: "S" };

export default function App() {
  const [session, setSession] = useState(null);
  const [managerProfile, setManagerProfile] = useState(null);
  const [members, setMembers] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [tab, setTab] = useState("matrix");
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [expandedPlan, setExpandedPlan] = useState(null);
  const [isShareable, setIsShareable] = useState(false); // New: toggle for plans
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ... (fetchManagerProfile, fetchMembersForUser, useEffect, logout, etc. — ALL UNCHANGED)

  const fetchManagerProfile = async (userId) => { /* unchanged */ };
  const fetchMembersForUser = useCallback(async (userId) => { /* unchanged */ }, []);

  useEffect(() => { /* unchanged auth logic */ }, [fetchMembersForUser]);

  const handleLogout = async () => { await supabase.auth.signOut(); };

  const closeModal = () => {
    setModal(false);
    setEditId(null);
    setForm(EMPTY_FORM);
  };

  const openEdit = (m) => {
    const cleanNotes = (arr) => Array.isArray(arr) ? arr.filter(Boolean) : [arr || ""];
    setForm({ 
      ...m, 
      competencyNotes: cleanNotes(m.competencyNotes).length ? cleanNotes(m.competencyNotes) : [""],
      commitmentNotes: cleanNotes(m.commitmentNotes).length ? cleanNotes(m.commitmentNotes) : [""],
    });
    setEditId(m.id);
    setModal(true);
  };

  const handleSubmit = async (e) => { /* your original submit logic — UNCHANGED */ };

  const confirmDelete = async (id) => { /* unchanged */ };

  // Enhanced note handlers with presets
  const addNote = (type) => setForm(p => ({ ...p, [type]: [...p[type], ""] }));
  const updateNote = (type, i, v) => setForm(p => { const n = [...p[type]]; n[i] = v; return { ...p, [type]: n }; });
  const removeNote = (type, i) => setForm(p => ({ ...p, [type]: p[type].filter((_, idx) => idx !== i) }));

  const quickAddNote = (type) => {
    const presets = COMMON_NOTES[type];
    const randomPreset = presets[Math.floor(Math.random() * presets.length)];
    setForm(p => ({ ...p, [type]: [...p[type], randomPreset] }));
  };

  // Memoized values
  const health = useMemo(() => teamHealthScore(members), [members]);
  const actionPlans = useMemo(() => 
    members.map(m => ({ member: m, plan: getActionPlan(m, isShareable) })), 
    [members, isShareable]
  );

  const tabs = [
    { id: "matrix", label: "Matriks" },
    { id: "list", label: "Tim" },
    { id: "plans", label: "Action Plan" },
    { id: "guide", label: "Panduan" },
  ];

  const handlePrint = () => window.print();

  // ... (rest of your render logic)

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      {/* Header unchanged */}

      <main className="max-w-4xl lg:max-w-5xl mx-auto px-4 py-6">
        {/* Health banner unchanged */}

        {/* Tabs unchanged */}

        <div className="fade-in" key={tab}>

          {/* MATRIX & LIST tabs — mostly unchanged, small polish possible */}

          {/* ACTION PLANS TAB — IMPROVED */}
          {tab === "plans" && (
            <div className="space-y-6">
              {/* New Toggle */}
              <div className="flex justify-between items-center bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <div>
                  <div className="font-bold">Mode Tampilan Rencana</div>
                  <div className="text-xs text-slate-400">Pilih versi yang sesuai kebutuhan</div>
                </div>
                <button 
                  onClick={() => setIsShareable(!isShareable)}
                  className={`px-5 py-2 rounded-xl font-medium transition-all ${isShareable 
                    ? "bg-emerald-600 text-white" 
                    : "bg-slate-700 text-slate-300"}`}
                >
                  {isShareable ? "Versi Berbagi dengan Anggota Tim" : "Versi Analisis Manajer"}
                </button>
              </div>

              {members.map(m => {
                const q = getQuadrant(m.competency, m.commitment);
                const planData = actionPlans.find(p => p.member.id === m.id)?.plan || [];

                return (
                  <div key={m.id} className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800">
                    <button onClick={() => setExpandedPlan(expandedPlan === m.id ? null : m.id)}
                      className="w-full flex items-center justify-between p-6 hover:bg-slate-800">
                      {/* header same as before */}
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black" style={{ background: q.color }}>
                          {m.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-black text-lg">{m.name}</div>
                          <div className="text-sm text-slate-400">{getDocumentTitle(q.id)}</div>
                        </div>
                      </div>
                      <ChevronDown className={`transition-transform ${expandedPlan === m.id ? "rotate-180" : ""}`} />
                    </button>

                    {expandedPlan === m.id && (
                      <div className="p-8 bg-slate-950 border-t border-slate-800">
                        <div className="flex justify-between mb-6">
                          <button onClick={handlePrint} className="flex items-center gap-2 bg-white text-slate-900 px-5 py-2.5 rounded-2xl font-bold">
                            <Printer className="w-4 h-4" /> Cetak PDF
                          </button>
                          <button 
                            onClick={() => navigator.clipboard.writeText(planData.map(p => p.items.join('\n')).join('\n\n'))}
                            className="flex items-center gap-2 text-slate-400 hover:text-white">
                            <Copy className="w-4 h-4" /> Copy Script
                          </button>
                        </div>

                        <div className="bg-white text-slate-900 rounded-2xl shadow-2xl max-w-3xl mx-auto print-area overflow-hidden">
                          {/* Header with mode indicator */}
                          <div className="p-8 border-b border-slate-200">
                            <div className="uppercase text-xs tracking-widest font-bold text-slate-500 mb-1">
                              {isShareable ? "Versi Kolaboratif — Siap Dibahas Bersama" : "Analisis Manajer — Rahasia"}
                            </div>
                            <h1 className="text-2xl font-black">{getDocumentTitle(q.id)}</h1>
                            <p className="mt-2 font-medium">{m.name}</p>
                          </div>

                          <div className="p-8 space-y-8">
                            {planData.map((item, idx) => (
                              <div key={idx} className="border border-slate-100 rounded-2xl p-6">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-3" style={{ color: item.color }}>
                                  {item.title}
                                </h3>
                                <ul className="space-y-3 text-slate-700">
                                  {item.items.map((act, i) => (
                                    <li key={i} className="flex gap-3">
                                      <span className="text-emerald-500 mt-1">•</span>
                                      <span>{act}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* GUIDE tab unchanged */}

        </div>
      </main>

      {/* Modal — Enhanced with preset buttons */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden">
            {/* Modal header unchanged */}

            <div className="p-8 overflow-y-auto max-h-[85vh]">
              <form onSubmit={handleSubmit} className="space-y-10">
                {/* Name & Role unchanged */}

                <DISCSelector value={form.disc} onChange={v => setForm({ ...form, disc: v })} />

                <div className="space-y-10">
                  <div>
                    <RatingSelector label="Kompetensi" dim="competency" value={form.competency} onChange={v => setForm({ ...form, competency: v })} />
                    <NoteInput 
                      label="Bukti Kompetensi" 
                      type="competencyNotes" 
                      notes={form.competencyNotes} 
                      onAdd={addNote} 
                      onUpdate={updateNote} 
                      onRemove={removeNote}
                      onQuickAdd={quickAddNote}
                    />
                  </div>

                  <div>
                    <RatingSelector label="Komitmen" dim="commitment" value={form.commitment} onChange={v => setForm({ ...form, commitment: v })} />
                    <NoteInput 
                      label="Bukti Komitmen" 
                      type="commitmentNotes" 
                      notes={form.commitmentNotes} 
                      onAdd={addNote} 
                      onUpdate={updateNote} 
                      onRemove={removeNote}
                      onQuickAdd={quickAddNote}
                    />
                  </div>
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black tracking-widest hover:bg-slate-800">
                  {isSubmitting ? "Menyimpan..." : "Simpan Analisis"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation unchanged */}
    </div>
  );
}