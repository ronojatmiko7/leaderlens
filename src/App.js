import { useState, useEffect, useRef } from "react";
import {
  Plus, Users, LayoutGrid, BookOpen, Trash2, Edit3, TrendingUp,
  Target, Award, X, PlusCircle, CheckCircle2, AlertTriangle,
  Wrench, ShieldAlert, MessageCircle, ChevronDown, Calendar,
  BarChart3, Lightbulb, ArrowRight, Clock, RefreshCw, Info
} from "lucide-react";

// ── helpers ──────────────────────────────────────────────────────────────────

const getQuadrant = (comp, comm) => {
  const hi = v => v >= 3;
  if (!hi(comp) && !hi(comm)) return { id: "Q1", label: "Critical Area",    color: "#EF4444", bg: "#FEF2F2", border: "#FECACA", text: "#991B1B", dot: "bg-red-500"    };
  if (!hi(comp) &&  hi(comm)) return { id: "Q2", label: "Potential Talent", color: "#F59E0B", bg: "#FFFBEB", border: "#FDE68A", text: "#92400E", dot: "bg-amber-500"  };
  if ( hi(comp) && !hi(comm)) return { id: "Q3", label: "Expert in Slump",  color: "#3B82F6", bg: "#EFF6FF", border: "#BFDBFE", text: "#1E40AF", dot: "bg-blue-500"   };
  return                                { id: "Q4", label: "Star Performer",   color: "#10B981", bg: "#ECFDF5", border: "#A7F3D0", text: "#065F46", dot: "bg-emerald-500" };
};

const DISC_META = {
  D: { label: "Dominance",   color: "#EF4444", bg: "bg-red-500",    light: "bg-red-50 text-red-700",   desc: "Fokus hasil & kontrol"        },
  I: { label: "Influence",   color: "#F59E0B", bg: "bg-amber-400",   light: "bg-amber-50 text-amber-700", desc: "Fokus antusiasme & orang"   },
  S: { label: "Steadiness",  color: "#10B981", bg: "bg-emerald-500",light: "bg-emerald-50 text-emerald-700", desc: "Fokus kerja sama & sabar" },
  C: { label: "Compliance",  color: "#3B82F6", bg: "bg-blue-500",    light: "bg-blue-50 text-blue-700", desc: "Fokus akurasi & kualitas"      },
};

const RATING_ANCHORS = {
  competency: {
    1: "Tidak bisa sama sekali",
    2: "Perlu bimbingan intensif",
    3: "Bisa mandiri sebagian",
    4: "Mahir & bisa mengajar",
  },
  commitment: {
    1: "Pasif, perlu dorongan terus",
    2: "Kadang termotivasi",
    3: "Umumnya antusias",
    4: "Proaktif & mendorong tim",
  },
};

const getDISCScript = (disc) => ({
  D: {
    open:    "Langsung: 'Saya ingin bicara soal hasil kerja kamu secara spesifik.'",
    body:    "Fokus pada dampak bisnis, bukan perasaan. Beri mereka kontrol atas solusi.",
    avoid:   "Jangan micro-manage atau jelaskan terlalu panjang — mereka akan defensif.",
  },
  I: {
    open:    "Hangat dulu: 'Kamu punya potensi besar, dan saya ingin bantu kamu shine.'",
    body:    "Libatkan mereka dalam solusi. Puji progres sekecil apapun secara publik.",
    avoid:   "Jangan langsung ke angka/data tanpa konteks emosional terlebih dahulu.",
  },
  S: {
    open:    "Tenang: 'Saya ingin kita ngobrol santai, tidak ada yang perlu dikhawatirkan.'",
    body:    "Jelaskan perubahan bertahap. Tanya hambatan mereka sebelum memberi solusi.",
    avoid:   "Jangan berikan keputusan mendadak atau deadline mepet tanpa penjelasan.",
  },
  C: {
    open:    "Berbasis data: 'Ada beberapa angka yang ingin saya tunjukkan dan diskusikan.'",
    body:    "Bawa bukti konkret. Beri waktu mereka untuk berpikir sebelum minta respons.",
    avoid:   "Jangan beri feedback tanpa data pendukung — mereka akan menantang balik.",
  },
}[disc]);

const getActionPlan = (m) => {
  const q = getQuadrant(m.competency, m.commitment);
  const script = getDISCScript(m.disc || "S");
  const plan = [];

  if (m.competency < 3) {
    plan.push({
      type: "skill",
      title: "Intervensi Skill (The Hand)",
      color: "#6366F1",
      bg: "#EEF2FF",
      border: "#C7D2FE",
      icon: "wrench",
      items: [
        `Identifikasi gap spesifik: "${m.competencyNotes?.[0] || "tugas utama"}" — buat checklist kemampuan minimum yang harus dikuasai.`,
        m.disc === "C"
          ? "Buat panduan tertulis sangat detail dengan contoh output yang benar vs. salah."
          : m.disc === "D"
          ? "Berikan satu tugas kecil dengan authority penuh — biarkan mereka cari cara sendiri, evaluasi hasilnya."
          : "Dampingi langsung (OJT) selama 2 minggu pertama. Buat milestone harian yang terukur.",
        "Lakukan Quality Check setiap akhir minggu. Dokumentasikan progres secara tertulis.",
      ],
    });
  }

  if (m.commitment < 3) {
    plan.push({
      type: "will",
      title: "Percakapan Coaching (The Heart)",
      color: "#F59E0B",
      bg: "#FFFBEB",
      border: "#FDE68A",
      icon: "message",
      items: [
        `Kalimat pembuka: "${script.open}"`,
        `Isi percakapan: ${script.body}`,
        `Yang harus dihindari: ${script.avoid}`,
        `Gali hambatan dari perilaku ini: "${m.commitmentNotes?.[0] || "komitmen rendah"}" — tanya 'Apa yang membuat ini sulit bagimu?'`,
      ],
    });
  }

  if (q.id === "Q1") {
    plan.push({
      type: "pip",
      title: "Performance Improvement Plan",
      color: "#EF4444",
      bg: "#FEF2F2",
      border: "#FECACA",
      icon: "shield",
      items: [
        "Minggu 1–2: Evaluasi harian. Dokumentasikan setiap gap dan tindakan korektif.",
        "Bulan 1–3: Review bulanan formal dengan target tertulis yang disepakati bersama.",
        "Bulan 3–6: Jika tidak ada progres, pertimbangkan mutasi ke peran yang lebih sesuai.",
        "Bulan 6–12: Terminasi dengan proses yang benar jika tidak ada perubahan signifikan.",
      ],
    });
  }

  if (q.id === "Q3") {
    plan.push({
      type: "reengagement",
      title: "Re-engagement Strategy",
      color: "#3B82F6",
      bg: "#EFF6FF",
      border: "#BFDBFE",
      icon: "refresh",
      items: [
        "Jangan salah baca — ini bukan masalah kemampuan. Ada sesuatu yang mati dalam motivasi mereka.",
        "Tanya langsung: 'Apakah ada sesuatu yang membuat kamu tidak bisa memberikan yang terbaik saat ini?'",
        m.disc === "D" ? "Beri proyek otonom baru dengan authority penuh." : "Diskusikan aspirasi karir — mungkin mereka merasa stuck atau tidak dihargai.",
        "Pertimbangkan apakah lingkungan kerja (bukan orangnya) yang perlu diubah.",
      ],
    });
  }

  if (q.id === "Q4") {
    plan.push({
      type: "growth",
      title: "Growth & Retention",
      color: "#10B981",
      bg: "#ECFDF5",
      border: "#A7F3D0",
      icon: "award",
      items: [
        m.disc === "D" ? "Delegasikan proyek strategis dengan authority penuh — mereka butuh tantangan nyata." : "Jadikan mentor resmi untuk anggota Q1/Q2 — ini investasi untuk mereka dan tim.",
        "Diskusikan roadmap karir 1–2 tahun ke depan secara eksplisit.",
        "Pastikan kompensasi dan pengakuan setara dengan kontribusi mereka — risiko turnover tinggi jika tidak.",
        "Libatkan dalam pengambilan keputusan tim — mereka butuh merasa penting, bukan sekadar eksekutor.",
      ],
    });
  }

  return plan;
};

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

const formatDate = (ts) => {
  if (!ts) return null;
  return new Date(ts).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
};

// ── sub-components (Tailwind Responsiveness applied here) ─────────────────

const RatingSelector = ({ label, dim, value, onChange }) => (
  <div className="space-y-2 lg:space-y-4">
    <label className="block text-[11px] sm:text-sm lg:text-xl font-black text-slate-400 uppercase tracking-widest">{label}</label>
    <div className="grid grid-cols-4 gap-1.5 lg:gap-4">
      {[1, 2, 3, 4].map(n => (
        <button key={n} type="button" onClick={() => onChange(n)}
          className={`py-3 lg:py-5 rounded-xl lg:rounded-2xl font-black text-sm lg:text-2xl transition-all border-2 ${value === n ? "bg-slate-900 text-white border-slate-900 shadow-md" : "bg-white text-slate-400 border-slate-100 hover:border-slate-300"}`}>
          {n}
        </button>
      ))}
    </div>
    {value && (
      <p className="text-[10px] sm:text-xs lg:text-base text-slate-500 italic pt-1 lg:pt-2 pl-1">{RATING_ANCHORS[dim][value]}</p>
    )}
  </div>
);

const DISCSelector = ({ value, onChange }) => (
  <div className="space-y-2 lg:space-y-4">
    <label className="block text-[11px] sm:text-sm lg:text-xl font-black text-slate-400 uppercase tracking-widest">Profil DISC</label>
    <div className="grid grid-cols-4 gap-2 lg:gap-5">
      {Object.entries(DISC_META).map(([id, m]) => (
        <button key={id} type="button" onClick={() => onChange(id)}
          className={`flex flex-col items-center p-3 lg:p-6 rounded-2xl border-2 transition-all ${value === id ? "border-slate-900 bg-slate-50 shadow-md" : "border-slate-100 bg-white hover:border-slate-200"}`}>
          <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-16 lg:h-16 rounded-full mb-1.5 lg:mb-4 ${m.bg} flex items-center justify-center text-white text-xs sm:text-lg lg:text-3xl font-black shadow-sm`}>{id}</div>
          <span className="text-[9px] sm:text-[12px] lg:text-lg font-black uppercase text-slate-500 leading-tight text-center">{m.label}</span>
          <span className="text-[8px] sm:text-[10px] lg:text-sm text-slate-400 text-center leading-tight mt-0.5 lg:mt-2">{m.desc}</span>
        </button>
      ))}
    </div>
  </div>
);

const NoteInput = ({ label, type, notes, onAdd, onUpdate, onRemove, prompt }) => (
  <div className="space-y-2 lg:space-y-4">
    <div className="flex justify-between items-center">
      <label className="text-[11px] sm:text-sm lg:text-xl font-black text-slate-400 uppercase tracking-widest">{label}</label>
      <button type="button" onClick={() => onAdd(type)} className="text-[10px] sm:text-sm lg:text-lg font-bold text-indigo-600 flex items-center gap-1">
        <PlusCircle className="w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6" /> Tambah
      </button>
    </div>
    <p className="text-[10px] sm:text-xs lg:text-base text-slate-400 italic mb-2 lg:mb-4">{prompt}</p>
    {notes.map((n, i) => (
      <div key={i} className="flex gap-2 lg:gap-4 items-center">
        <input className="flex-1 px-4 py-3 lg:px-6 lg:py-5 bg-white border border-slate-200 rounded-xl lg:rounded-2xl text-xs sm:text-base lg:text-xl outline-none focus:ring-2 focus:ring-slate-900"
          placeholder="Tuliskan bukti perilaku..." value={n}
          onChange={e => onUpdate(type, i, e.target.value)} />
        {notes.length > 1 && (
          <button type="button" onClick={() => onRemove(type, i)} className="p-2 lg:p-4 text-slate-300 hover:text-red-400">
            <X className="w-4 h-4 sm:w-5 sm:h-5 lg:w-8 lg:h-8" />
          </button>
        )}
      </div>
    ))}
  </div>
);

const PlanCard = ({ item }) => {
  const iconMap = {
    wrench: <Wrench className="w-4 h-4 lg:w-6 lg:h-6" />,
    message: <MessageCircle className="w-4 h-4 lg:w-6 lg:h-6" />,
    shield: <ShieldAlert className="w-4 h-4 lg:w-6 lg:h-6" />,
    refresh: <RefreshCw className="w-4 h-4 lg:w-6 lg:h-6" />,
    award: <Award className="w-4 h-4 lg:w-6 lg:h-6" />,
  };
  return (
    <div className="rounded-2xl lg:rounded-3xl p-5 lg:p-8 border" style={{ background: item.bg, borderColor: item.border }}>
      <div className="flex items-center gap-2 lg:gap-3 mb-3 lg:mb-5" style={{ color: item.color }}>
        {iconMap[item.icon]}
        <span className="text-[10px] sm:text-sm lg:text-lg font-black uppercase tracking-widest">{item.title}</span>
      </div>
      <ul className="space-y-2.5 lg:space-y-4">
        {item.items.map((act, i) => (
          <li key={i} className="flex gap-2.5 lg:gap-4 text-[11px] sm:text-base lg:text-xl leading-relaxed font-medium text-slate-700">
            <ArrowRight className="w-3 h-3 sm:w-5 sm:h-5 lg:w-6 lg:h-6 flex-shrink-0 mt-0.5 lg:mt-1" style={{ color: item.color }} />
            {act}
          </li>
        ))}
      </ul>
    </div>
  );
};

// ── main app ──────────────────────────────────────────────────────────────

const EMPTY_FORM = { name: "", role: "", competency: 2, commitment: 2, competencyNotes: [""], commitmentNotes: [""], disc: "S" };

export default function App() {
  const [members, setMembers] = useState([]);
  const [isMounted, setIsMounted] = useState(false);
  const [tab, setTab] = useState("matrix");
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [expandedPlan, setExpandedPlan] = useState(null);

  // FIX: Safe localStorage fetching untuk mencegah error SSR di Vercel
  useEffect(() => {
    setIsMounted(true);
    try {
      const storedData = localStorage.getItem("ll_v8");
      if (storedData) setMembers(JSON.parse(storedData));
    } catch (e) {
      console.warn("Storage read error", e);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem("ll_v8", JSON.stringify(members));
      } catch (e) {
        console.warn("Storage write error", e);
      }
    }
  }, [members, isMounted]);

  const closeModal = () => { setModal(false); setEditId(null); setForm(EMPTY_FORM); };

  const openEdit = (m) => {
    setForm({ ...m, competencyNotes: m.competencyNotes?.length ? m.competencyNotes : [""], commitmentNotes: m.commitmentNotes?.length ? m.commitmentNotes : [""] });
    setEditId(m.id); setModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const clean = { ...form, competencyNotes: form.competencyNotes.filter(n => n.trim()), commitmentNotes: form.commitmentNotes.filter(n => n.trim()) };
    if (editId) {
      setMembers(ms => ms.map(m => m.id === editId ? { ...clean, id: editId, createdAt: m.createdAt, updatedAt: Date.now() } : m));
    } else {
      setMembers(ms => [...ms, { ...clean, id: Date.now().toString(), createdAt: Date.now(), updatedAt: Date.now() }]);
    }
    closeModal();
  };

  const confirmDelete = (id) => { setMembers(ms => ms.filter(m => m.id !== id)); setDeleteConfirm(null); };

  const addNote = (type) => setForm(p => ({ ...p, [type]: [...p[type], ""] }));
  const updateNote = (type, i, v) => setForm(p => { const n = [...p[type]]; n[i] = v; return { ...p, [type]: n }; });
  const removeNote = (type, i) => setForm(p => ({ ...p, [type]: p[type].filter((_, idx) => idx !== i) }));

  const health = teamHealthScore(members);
  const tabs = [
    { id: "matrix", label: "Matriks" },
    { id: "list", label: "Tim" },
    { id: "plans", label: "Action Plan" },
    { id: "guide", label: "Panduan" },
  ];

  if (!isMounted) return null; // Mencegah hydration mismatch

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;900&family=DM+Mono:wght@400;500&display=swap');
        * { -webkit-font-smoothing: antialiased; }
        .fade-in { animation: fadeIn 0.4s ease forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-4 lg:py-6 sticky top-0 z-40 bg-slate-950/95 backdrop-blur">
        <div className="max-w-4xl lg:max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 lg:gap-5">
            <div className="w-9 h-9 sm:w-11 sm:h-11 lg:w-14 lg:h-14 rounded-xl bg-white flex items-center justify-center">
              <Users className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-slate-900" />
            </div>
            <div>
              <div className="text-sm sm:text-lg lg:text-2xl font-black tracking-tight leading-none uppercase">LEADER<span className="text-slate-400">LENS</span></div>
              <div className="text-[9px] sm:text-xs lg:text-sm text-slate-500 font-mono mt-0.5 lg:mt-1">People Diagnostics v8.0</div>
            </div>
          </div>
          <div className="flex items-center gap-3 lg:gap-6">
            {health && (
              <div className="hidden sm:flex items-center gap-2 lg:gap-3 px-3 py-1.5 lg:px-5 lg:py-3 rounded-xl bg-slate-800 border border-slate-700">
                <div className="text-[10px] lg:text-sm text-slate-400 font-mono">Tim</div>
                <div className="text-sm lg:text-xl font-black text-white">{health.score}<span className="text-slate-500 text-[10px] lg:text-sm">/100</span></div>
              </div>
            )}
            <button onClick={() => setModal(true)}
              className="bg-white text-slate-900 px-4 py-2 sm:px-6 sm:py-3 lg:px-8 lg:py-4 rounded-xl lg:rounded-2xl font-black text-[10px] sm:text-sm lg:text-base tracking-widest uppercase hover:bg-slate-100 transition-all active:scale-95 shadow-lg">
              + Tambah
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl lg:max-w-6xl mx-auto px-4 py-6 lg:py-10">
        {/* Tabs */}
        <div className="flex gap-1 p-1 lg:p-2 bg-slate-900 rounded-2xl lg:rounded-3xl mb-8 lg:mb-12 border border-slate-800 overflow-x-auto scrollbar-hide">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 min-w-[80px] py-2.5 lg:py-4 rounded-xl lg:rounded-2xl text-[10px] sm:text-sm lg:text-lg font-black uppercase tracking-widest transition-all ${tab === t.id ? "bg-white text-slate-900" : "text-slate-500 hover:text-slate-300"}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="fade-in" key={tab}>

          {/* MATRIX TAB */}
          {tab === "matrix" && (
            <div className="flex flex-col items-center gap-6 lg:gap-10">
              {members.length === 0 ? (
                <div className="text-center py-24 lg:py-40">
                  <div className="text-slate-600 font-black text-xs lg:text-lg uppercase tracking-widest mb-3 lg:mb-5">Belum ada data</div>
                  <button onClick={() => setModal(true)} className="text-white bg-slate-800 px-6 py-3 lg:px-10 lg:py-5 rounded-2xl lg:rounded-3xl text-xs lg:text-xl font-black uppercase tracking-widest hover:bg-slate-700 transition-all">
                    + Tambah Anggota Pertama
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-full max-w-lg lg:max-w-3xl aspect-square relative bg-slate-900 rounded-3xl lg:rounded-[40px] border border-slate-800 overflow-hidden shadow-2xl">
                    {/* Axis labels */}
                    <div className="absolute bottom-2 lg:bottom-6 left-1/2 -translate-x-1/2 text-[9px] lg:text-sm font-black text-slate-600 uppercase tracking-widest">Kompetensi →</div>
                    <div className="absolute top-1/2 left-2 lg:left-6 -translate-y-1/2 text-[9px] lg:text-sm font-black text-slate-600 uppercase tracking-widest" style={{ writingMode: "vertical-rl", transform: "translateY(-50%) rotate(180deg)" }}>← Komitmen</div>
                    {/* Grid lines */}
                    <div className="absolute top-1/2 left-0 w-full h-px bg-slate-800"></div>
                    <div className="absolute top-0 left-1/2 w-px h-full bg-slate-800"></div>
                    {/* Member dots */}
                    {members.map(m => {
                      const q = getQuadrant(m.competency, m.commitment);
                      const left = ((m.competency - 1) / 3) * 80 + 10;
                      const bottom = ((m.commitment - 1) / 3) * 80 + 10;
                      return (
                        <button key={m.id} onClick={() => openEdit(m)}
                          className="absolute group transition-transform hover:scale-125 z-10"
                          style={{ left: `${left}%`, bottom: `${bottom}%`, transform: "translate(-50%, 50%)" }}
                          title={m.name}>
                          <div className="w-10 h-10 sm:w-14 sm:h-14 lg:w-20 lg:h-20 rounded-full border-2 border-slate-950 shadow-xl flex items-center justify-center text-white text-xs sm:text-base lg:text-2xl font-black relative"
                            style={{ background: q.color }}>
                            {m.name.charAt(0)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {/* LIST TAB */}
          {tab === "list" && (
            <div className="space-y-3 lg:space-y-6">
              {members.length === 0 ? (
                <div className="text-center py-24 lg:py-40 text-slate-600 font-black text-xs lg:text-lg uppercase tracking-widest">Belum ada anggota</div>
              ) : members.map(m => {
                const q = getQuadrant(m.competency, m.commitment);
                return (
                  <div key={m.id} className="bg-slate-900 border border-slate-800 rounded-2xl lg:rounded-3xl p-5 lg:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 lg:gap-8 group">
                    <div className="flex items-center gap-4 lg:gap-8 w-full sm:w-auto">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-2xl lg:rounded-3xl flex items-center justify-center text-white font-black text-lg sm:text-2xl lg:text-3xl flex-shrink-0"
                        style={{ background: q.color }}>
                        {m.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="font-black text-white text-base sm:text-xl lg:text-3xl leading-tight">{m.name}</div>
                        <div className="text-[10px] sm:text-sm lg:text-xl text-slate-500 mt-0.5 lg:mt-2">{m.role || "—"}</div>
                        <div className="flex flex-wrap gap-2 lg:gap-3 mt-2 lg:mt-4">
                          <span className="text-[9px] sm:text-xs lg:text-sm font-black px-2 py-0.5 lg:px-4 lg:py-1.5 rounded-full" style={{ background: q.bg, color: q.text }}>{q.label}</span>
                          <span className="text-[9px] sm:text-xs lg:text-sm font-black px-2 py-0.5 lg:px-4 lg:py-1.5 rounded-full bg-slate-800 text-slate-300">DISC {m.disc}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 lg:gap-3 self-end sm:self-center">
                      <button onClick={() => openEdit(m)} className="p-2.5 lg:p-4 text-slate-600 hover:text-white rounded-xl hover:bg-slate-800 transition-all"><Edit3 className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></button>
                      <button onClick={() => setDeleteConfirm(m.id)} className="p-2.5 lg:p-4 text-slate-600 hover:text-red-400 rounded-xl hover:bg-slate-800 transition-all"><Trash2 className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* PLANS & GUIDE TABS */}
          {tab === "plans" && (
            <div className="space-y-4 lg:space-y-6">
               {members.map(m => (
                  <div key={m.id} className="bg-white rounded-2xl lg:rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
                    <button onClick={() => setExpandedPlan(expandedPlan === m.id ? null : m.id)}
                      className="w-full flex items-center justify-between p-5 lg:p-8 hover:bg-slate-50 transition-all text-slate-900">
                      <div className="flex items-center gap-4 lg:gap-6">
                        <div className="w-10 h-10 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl flex items-center justify-center text-white font-black lg:text-xl" style={{ background: getQuadrant(m.competency, m.commitment).color }}>
                          {m.name.charAt(0)}
                        </div>
                        <div className="text-left font-black sm:text-xl lg:text-3xl">{m.name}</div>
                      </div>
                      <ChevronDown className={`w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 transition-transform ${expandedPlan === m.id ? "rotate-180" : ""}`} />
                    </button>
                    {expandedPlan === m.id && (
                      <div className="px-5 pb-5 lg:px-8 lg:pb-8 space-y-4 lg:space-y-6 border-t border-slate-100 pt-5 lg:pt-8">
                        {getActionPlan(m).map((item, i) => <PlanCard key={i} item={item} />)}
                      </div>
                    )}
                  </div>
               ))}
            </div>
          )}
          
          {tab === "guide" && (
            <div className="space-y-4 lg:space-y-6">
               {QUADRANT_GUIDE.map(g => (
                <div key={g.q} className="bg-white rounded-2xl lg:rounded-3xl border border-slate-100 overflow-hidden shadow-sm text-slate-800">
                  <div className="p-5 lg:p-8 flex items-center gap-3 lg:gap-6 font-black sm:text-2xl lg:text-3xl" style={{ background: g.bg }}>
                    <div className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl flex items-center justify-center text-white" style={{ background: g.color }}>{g.q}</div>
                    {g.label}
                  </div>
                  <div className="p-5 lg:p-8 space-y-4 lg:space-y-6 text-xs sm:text-lg lg:text-xl">
                    <p><strong>Diagnosis:</strong> {g.diagnosis}</p>
                    <p className="text-red-600 bg-red-50 p-3 lg:p-6 rounded-lg lg:rounded-2xl"><strong>Kesalahan:</strong> {g.mistake}</p>
                  </div>
                </div>
               ))}
            </div>
          )}

        </div>
      </main>

      {/* Modal / Form Input Data */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 lg:p-8 bg-black/80 backdrop-blur-md">
          <div className="bg-white w-full h-full sm:h-auto max-w-xl lg:max-w-4xl rounded-none sm:rounded-[40px] lg:rounded-[48px] shadow-2xl overflow-hidden flex flex-col">
            <div className="px-8 pt-8 pb-4 lg:px-12 lg:pt-12 lg:pb-6 flex justify-between items-center border-b border-slate-100 sticky top-0 bg-white z-10">
              <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-slate-900">{editId ? "Edit Mapping" : "Mapping Baru"}</h2>
              <button onClick={closeModal} className="p-2 sm:p-4 bg-slate-100 rounded-full hover:bg-slate-200 transition-all"><X className="w-5 h-5 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-slate-500" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 lg:p-12 space-y-7 sm:space-y-10 lg:space-y-12 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                <input required className="px-5 py-4 lg:px-6 lg:py-5 bg-slate-50 border border-slate-200 rounded-2xl lg:rounded-3xl text-base sm:text-xl lg:text-2xl font-bold outline-none text-slate-900 focus:ring-2 focus:ring-slate-900"
                  placeholder="Nama Anggota" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                <input className="px-5 py-4 lg:px-6 lg:py-5 bg-slate-50 border border-slate-200 rounded-2xl lg:rounded-3xl text-base sm:text-xl lg:text-2xl font-bold outline-none text-slate-900 focus:ring-2 focus:ring-slate-900"
                  placeholder="Jabatan" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} />
              </div>

              <DISCSelector value={form.disc} onChange={v => setForm({ ...form, disc: v })} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                <div className="space-y-6 lg:space-y-8">
                  <RatingSelector label="Kompetensi" dim="competency" value={form.competency} onChange={v => setForm({ ...form, competency: v })} />
                  <NoteInput label="Bukti Kompetensi" type="competencyNotes" notes={form.competencyNotes} onAdd={addNote} onUpdate={updateNote} onRemove={removeNote} prompt="Bukti perilaku spesifik?" />
                </div>
                <div className="space-y-6 lg:space-y-8">
                  <RatingSelector label="Komitmen" dim="commitment" value={form.commitment} onChange={v => setForm({ ...form, commitment: v })} />
                  <NoteInput label="Bukti Komitmen" type="commitmentNotes" notes={form.commitmentNotes} onAdd={addNote} onUpdate={updateNote} onRemove={removeNote} prompt="Bukti motivasi spesifik?" />
                </div>
              </div>

              <button type="submit"
                className="w-full bg-slate-900 text-white py-5 sm:py-7 lg:py-8 rounded-[24px] lg:rounded-[32px] font-black text-xs sm:text-xl lg:text-2xl tracking-widest uppercase hover:bg-slate-800 active:scale-95 transition-all shadow-xl mt-4 lg:mt-8">
                Simpan Analisis
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
