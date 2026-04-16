import React, { useState, useEffect, useRef } from "react";
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
  return                              { id: "Q4", label: "Star Performer",   color: "#10B981", bg: "#ECFDF5", border: "#A7F3D0", text: "#065F46", dot: "bg-emerald-500" };
};

const DISC_META = {
  D: { label: "Dominance",   color: "#EF4444", bg: "bg-red-500",    light: "bg-red-50 text-red-700",   desc: "Fokus hasil & kontrol"        },
  I: { label: "Influence",   color: "#F59E0B", bg: "bg-amber-400",  light: "bg-amber-50 text-amber-700", desc: "Fokus antusiasme & orang"   },
  S: { label: "Steadiness",  color: "#10B981", bg: "bg-emerald-500",light: "bg-emerald-50 text-emerald-700", desc: "Fokus kerja sama & sabar" },
  C: { label: "Compliance",  color: "#3B82F6", bg: "bg-blue-500",   light: "bg-blue-50 text-blue-700", desc: "Fokus akurasi & kualitas"      },
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

// ── sub-components ─────────────────────────────────────────────────────────

const RatingSelector = ({ label, dim, value, onChange }) => (
  <div className="space-y-2">
    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
    <div className="grid grid-cols-4 gap-1.5">
      {[1, 2, 3, 4].map(n => (
        <button key={n} type="button" onClick={() => onChange(n)}
          className={`py-3 rounded-xl font-black text-sm transition-all border-2 ${value === n ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-400 border-slate-100 hover:border-slate-300"}`}>
          {n}
        </button>
      ))}
    </div>
    {value && (
      <p className="text-[10px] text-slate-500 italic pt-1 pl-1">{RATING_ANCHORS[dim][value]}</p>
    )}
  </div>
);

const DISCSelector = ({ value, onChange }) => (
  <div className="space-y-2">
    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Profil DISC</label>
    <div className="grid grid-cols-4 gap-2">
      {Object.entries(DISC_META).map(([id, m]) => (
        <button key={id} type="button" onClick={() => onChange(id)}
          className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${value === id ? "border-slate-900 bg-slate-50" : "border-slate-100 bg-white hover:border-slate-200"}`}>
          <div className={`w-7 h-7 rounded-full mb-1.5 ${m.bg} flex items-center justify-center text-white text-xs font-black shadow`}>{id}</div>
          <span className="text-[8px] font-black uppercase text-slate-500 leading-tight text-center">{m.label}</span>
          <span className="text-[7px] text-slate-400 text-center leading-tight mt-0.5">{m.desc}</span>
        </button>
      ))}
    </div>
  </div>
);

const NoteInput = ({ label, type, notes, onAdd, onUpdate, onRemove, prompt }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
      <button type="button" onClick={() => onAdd(type)} className="text-[10px] font-bold text-indigo-600 flex items-center gap-1">
        <PlusCircle className="w-3 h-3" /> Tambah
      </button>
    </div>
    <p className="text-[10px] text-slate-400 italic">{prompt}</p>
    {notes.map((n, i) => (
      <div key={i} className="flex gap-2">
        <input className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-slate-900"
          placeholder="Tuliskan bukti perilaku..." value={n}
          onChange={e => onUpdate(type, i, e.target.value)} />
        {notes.length > 1 && (
          <button type="button" onClick={() => onRemove(type, i)} className="p-2 text-slate-300 hover:text-red-400">
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    ))}
  </div>
);

const PlanCard = ({ item }) => {
  const iconMap = {
    wrench: <Wrench className="w-4 h-4" />,
    message: <MessageCircle className="w-4 h-4" />,
    shield: <ShieldAlert className="w-4 h-4" />,
    refresh: <RefreshCw className="w-4 h-4" />,
    award: <Award className="w-4 h-4" />,
  };
  return (
    <div className="rounded-2xl p-5 border" style={{ background: item.bg, borderColor: item.border }}>
      <div className="flex items-center gap-2 mb-3" style={{ color: item.color }}>
        {iconMap[item.icon]}
        <span className="text-[10px] font-black uppercase tracking-widest">{item.title}</span>
      </div>
      <ul className="space-y-2.5">
        {item.items.map((act, i) => (
          <li key={i} className="flex gap-2.5 text-[11px] leading-relaxed font-medium text-slate-700">
            <ArrowRight className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: item.color }} />
            {act}
          </li>
        ))}
      </ul>
    </div>
  );
};

const QUADRANT_GUIDE = [
  {
    q: "Q1", label: "Critical Area", color: "#EF4444", bg: "#FEF2F2",
    diagnosis: "Anggota tim tidak memiliki kemampuan DAN motivasi yang cukup. Ini situasi paling berat.",
    rootCause: "Bisa karena salah rekrut, burnout ekstrem, atau sudah terlalu lama di posisi yang salah.",
    mistake: "Kesalahan umum: terus memberi training padahal masalah utamanya adalah motivasi — atau sebaliknya, terus memberi semangat padahal skill-nya memang tidak ada.",
    urgency: "Butuh intervensi ganda: skill DAN will secara bersamaan. Jika tidak ada progres dalam 90 hari, eskalasi ke PIP.",
  },
  {
    q: "Q2", label: "Potential Talent", color: "#F59E0B", bg: "#FFFBEB",
    diagnosis: "Semangat tinggi tapi kemampuan belum cukup. Sering terjadi pada karyawan baru atau yang baru dipromosikan.",
    rootCause: "Bukan masalah karakter — mereka belum punya tools yang tepat. Energinya ada, tinggal diarahkan.",
    mistake: "Kesalahan umum: membiarkan mereka 'belajar sendiri' karena terlihat bersemangat. Tanpa struktur, antusiasme ini akan habis dalam 3–6 bulan.",
    urgency: "Prioritas: berikan skill secepat mungkin sebelum motivasi turun. Golden window: 90 hari pertama.",
  },
  {
    q: "Q3", label: "Expert in Slump", color: "#3B82F6", bg: "#EFF6FF",
    diagnosis: "Kemampuan tinggi tapi motivasi turun drastis. Ini yang paling sering salah didiagnosis.",
    rootCause: "Bukan malas. Ada sesuatu yang patah: tidak dihargai, bored, konflik dengan atasan/rekan, atau masalah pribadi.",
    mistake: "Kesalahan terbesar: memperlakukan mereka seperti Q1 — memberi training atau monitoring ketat. Ini akan memperburuk keadaan karena terasa seperti penghinaan.",
    urgency: "Prioritas: percakapan coaching yang dalam, bukan evaluasi performa. Gali dulu sebelum intervensi.",
  },
  {
    q: "Q4", label: "Star Performer", color: "#10B981", bg: "#ECFDF5",
    diagnosis: "Kemampuan dan motivasi sama-sama tinggi. Aset terbesar tim Anda.",
    rootCause: "Risiko tersembunyi: mereka sering diabaikan karena 'tidak masalah'. Padahal mereka yang paling rentan keluar.",
    mistake: "Kesalahan terbesar: tidak berinvestasi pada mereka karena sudah berjalan sendiri. Turnover satu Q4 bisa merusak tim selama berbulan-bulan.",
    urgency: "Prioritas: retensi dan growth. Pastikan mereka punya tantangan baru, pengakuan, dan jalur karir yang jelas.",
  },
];

// ── main app ──────────────────────────────────────────────────────────────

const EMPTY_FORM = { name: "", role: "", competency: 2, commitment: 2, competencyNotes: [""], commitmentNotes: [""], disc: "S" };

export default function App() {
  const [members, setMembers] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ll_v8") || "[]"); } catch { return []; }
  });
  const [tab, setTab] = useState("matrix");
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [expandedPlan, setExpandedPlan] = useState(null);

  useEffect(() => {
    try { localStorage.setItem("ll_v8", JSON.stringify(members)); } catch {}
  }, [members]);

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

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;900&family=DM+Mono:wght@400;500&display=swap');
        * { -webkit-font-smoothing: antialiased; }
        .fade-in { animation: fadeIn 0.4s ease forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-4 sticky top-0 z-40 bg-slate-950/95 backdrop-blur">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center">
              <Users className="w-4 h-4 text-slate-900" />
            </div>
            <div>
              <div className="text-sm font-black tracking-tight leading-none">LEADER<span className="text-slate-400">LENS</span></div>
              <div className="text-[9px] text-slate-500 font-mono mt-0.5">People Diagnostics v8.0</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {health && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700">
                <div className="text-[10px] text-slate-400 font-mono">Tim</div>
                <div className="text-sm font-black text-white">{health.score}<span className="text-slate-500 text-[10px]">/100</span></div>
              </div>
            )}
            <button onClick={() => setModal(true)}
              className="bg-white text-slate-900 px-4 py-2 rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-slate-100 transition-all active:scale-95">
              + Tambah
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Team Health Banner */}
        {health && (
          <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3 fade-in">
            {Object.entries(health.dist).map(([qid, count]) => {
              const q = ["Q1","Q2","Q3","Q4"].map(id => {
                const dummy = { Q1:{comp:1,comm:1}, Q2:{comp:1,comm:3}, Q3:{comp:3,comm:1}, Q4:{comp:3,comm:3} }[id];
                return { id, ...getQuadrant(dummy.comp, dummy.comm) };
              }).find(q => q.id === qid);
              return (
                <div key={qid} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1">{q.label}</div>
                    <div className="text-2xl font-black" style={{ color: q.color }}>{count}</div>
                  </div>
                  <div className="w-8 h-8 rounded-full opacity-20" style={{ background: q.color }}></div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-slate-900 rounded-2xl mb-8 border border-slate-800">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === t.id ? "bg-white text-slate-900" : "text-slate-500 hover:text-slate-300"}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="fade-in" key={tab}>

          {/* MATRIX TAB */}
          {tab === "matrix" && (
            <div className="flex flex-col items-center gap-6">
              {members.length === 0 ? (
                <div className="text-center py-24">
                  <div className="text-slate-600 font-black text-xs uppercase tracking-widest mb-3">Belum ada data</div>
                  <button onClick={() => setModal(true)} className="text-white bg-slate-800 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-700 transition-all">
                    + Tambah Anggota Pertama
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-full max-w-lg aspect-square relative bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
                    {/* Axis labels */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-black text-slate-600 uppercase tracking-widest">Kompetensi →</div>
                    <div className="absolute top-1/2 left-2 -translate-y-1/2 text-[9px] font-black text-slate-600 uppercase tracking-widest" style={{ writingMode: "vertical-rl", transform: "translateY(-50%) rotate(180deg)" }}>← Komitmen</div>
                    {/* Grid lines */}
                    <div className="absolute top-1/2 left-0 w-full h-px bg-slate-800"></div>
                    <div className="absolute top-0 left-1/2 w-px h-full bg-slate-800"></div>
                    {/* Quadrant labels */}
                    {[
                      { label: "Critical Area",    pos: "top-[75%] left-[25%]", color: "#EF4444" },
                      { label: "Potential Talent", pos: "top-[25%] left-[25%]", color: "#F59E0B" },
                      { label: "Expert in Slump",  pos: "top-[75%] left-[75%]", color: "#3B82F6" },
                      { label: "Star Performer",   pos: "top-[25%] left-[75%]", color: "#10B981" },
                    ].map(({ label, pos, color }) => (
                      <div key={label} className={`absolute ${pos} -translate-x-1/2 -translate-y-1/2 text-[8px] font-black uppercase tracking-wider opacity-30`} style={{ color }}>{label}</div>
                    ))}
                    {/* Member dots */}
                    {members.map(m => {
                      const q = getQuadrant(m.competency, m.commitment);
                      const disc = DISC_META[m.disc || "S"];
                      const left = ((m.competency - 1) / 3) * 80 + 10;
                      const bottom = ((m.commitment - 1) / 3) * 80 + 10;
                      return (
                        <button key={m.id} onClick={() => openEdit(m)}
                          className="absolute group transition-transform hover:scale-125 z-10"
                          style={{ left: `${left}%`, bottom: `${bottom}%`, transform: "translate(-50%, 50%)" }}
                          title={m.name}>
                          <div className="w-10 h-10 rounded-full border-2 border-slate-950 shadow-xl flex items-center justify-center text-white text-xs font-black relative"
                            style={{ background: q.color }}>
                            {m.name.charAt(0)}
                            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-950"
                              style={{ background: disc.color }}></div>
                          </div>
                          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-bold px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-slate-700">
                            {m.name}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {/* Legend */}
                  <div className="flex flex-wrap gap-4 justify-center">
                    {Object.entries(DISC_META).map(([id, m]) => (
                      <div key={id} className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full" style={{ background: m.color }}></div>
                        <span className="text-[10px] font-bold text-slate-500">{id} — {m.label}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* LIST TAB */}
          {tab === "list" && (
            <div className="space-y-3">
              {members.length === 0 ? (
                <div className="text-center py-24 text-slate-600 font-black text-xs uppercase tracking-widest">Belum ada anggota</div>
              ) : members.map(m => {
                const q = getQuadrant(m.competency, m.commitment);
                const disc = DISC_META[m.disc || "S"];
                return (
                  <div key={m.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between hover:border-slate-600 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg flex-shrink-0"
                        style={{ background: q.color }}>
                        {m.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-black text-white text-base leading-tight">{m.name}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{m.role || "—"}</div>
                        <div className="flex gap-2 mt-2">
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background: q.bg, color: q.text }}>{q.label}</span>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${disc.light}`}>DISC {m.disc}</span>
                          <span className="text-[9px] font-mono text-slate-600">K:{m.competency} M:{m.commitment}</span>
                        </div>
                        {m.updatedAt && <div className="text-[9px] text-slate-600 mt-1 flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {formatDate(m.updatedAt)}</div>}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(m)} className="p-2.5 text-slate-600 hover:text-white rounded-xl hover:bg-slate-800 transition-all"><Edit3 className="w-4 h-4" /></button>
                      {deleteConfirm === m.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => confirmDelete(m.id)} className="px-3 py-1.5 bg-red-500 text-white text-[9px] font-black rounded-lg">Hapus</button>
                          <button onClick={() => setDeleteConfirm(null)} className="px-3 py-1.5 bg-slate-800 text-slate-400 text-[9px] font-black rounded-lg">Batal</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirm(m.id)} className="p-2.5 text-slate-600 hover:text-red-400 rounded-xl hover:bg-slate-800 transition-all"><Trash2 className="w-4 h-4" /></button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* PLANS TAB */}
          {tab === "plans" && (
            <div className="space-y-4">
              {members.length === 0 ? (
                <div className="text-center py-24 text-slate-600 font-black text-xs uppercase tracking-widest">Belum ada anggota</div>
              ) : members.map(m => {
                const q = getQuadrant(m.competency, m.commitment);
                const plan = getActionPlan(m);
                const disc = DISC_META[m.disc || "S"];
                const isOpen = expandedPlan === m.id;
                return (
                  <div key={m.id} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                    <button onClick={() => setExpandedPlan(isOpen ? null : m.id)}
                      className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black" style={{ background: q.color }}>
                          {m.name.charAt(0)}
                        </div>
                        <div className="text-left">
                          <div className="font-black text-slate-900">{m.name}</div>
                          <div className="flex gap-2 mt-1">
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background: q.bg, color: q.text }}>{q.label}</span>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${disc.light}`}>DISC {m.disc}</span>
                          </div>
                        </div>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 space-y-3 border-t border-slate-100 pt-5">
                        {plan.map((item, i) => <PlanCard key={i} item={item} />)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* GUIDE TAB */}
          {tab === "guide" && (
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-black text-white uppercase tracking-widest">Prinsip Dasar</span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Masalah performa selalu berakar pada dua hal: <strong className="text-white">kemampuan (bisa/tidak bisa)</strong> atau <strong className="text-white">motivasi (mau/tidak mau)</strong>. Intervensi yang salah bukan hanya tidak efektif — tapi bisa memperburuk keadaan. Diagnosis dulu, baru bertindak.
                </p>
              </div>
              {QUADRANT_GUIDE.map(g => (
                <div key={g.q} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                  <div className="p-5 border-b border-slate-100 flex items-center gap-3" style={{ background: g.bg }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-sm" style={{ background: g.color }}>{g.q}</div>
                    <div>
                      <div className="font-black text-slate-900">{g.label}</div>
                    </div>
                  </div>
                  <div className="p-5 space-y-4">
                    {[
                      { label: "Diagnosis", icon: <Target className="w-3 h-3" />, text: g.diagnosis },
                      { label: "Root Cause", icon: <Info className="w-3 h-3" />, text: g.rootCause },
                      { label: "Kesalahan Umum Manajer", icon: <AlertTriangle className="w-3 h-3" />, text: g.mistake, warn: true },
                      { label: "Prioritas Tindakan", icon: <ArrowRight className="w-3 h-3" />, text: g.urgency },
                    ].map(({ label, icon, text, warn }) => (
                      <div key={label}>
                        <div className={`flex items-center gap-1.5 mb-1 text-[9px] font-black uppercase tracking-widest ${warn ? "text-red-500" : "text-slate-400"}`}>
                          {icon} {label}
                        </div>
                        <p className={`text-xs leading-relaxed ${warn ? "text-red-700 bg-red-50 px-3 py-2 rounded-xl" : "text-slate-600"}`}>{text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="px-8 pt-8 pb-4 flex justify-between items-center border-b border-slate-100 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-black text-slate-900">{editId ? "Edit Mapping" : "Mapping Baru"}</h2>
              <button onClick={closeModal} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-all"><X className="w-4 h-4 text-slate-500" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-7 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <input required className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="Nama Anggota" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                <input className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="Jabatan" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} />
              </div>

              <DISCSelector value={form.disc} onChange={v => setForm({ ...form, disc: v })} />

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-5">
                  <RatingSelector label="Kompetensi" dim="competency" value={form.competency} onChange={v => setForm({ ...form, competency: v })} />
                  <NoteInput label="Bukti Kompetensi" type="competencyNotes" notes={form.competencyNotes} onAdd={addNote} onUpdate={updateNote} onRemove={removeNote} prompt="Contoh perilaku spesifik yang mendukung rating ini?" />
                </div>
                <div className="space-y-5">
                  <RatingSelector label="Komitmen" dim="commitment" value={form.commitment} onChange={v => setForm({ ...form, commitment: v })} />
                  <NoteInput label="Bukti Komitmen" type="commitmentNotes" notes={form.commitmentNotes} onAdd={addNote} onUpdate={updateNote} onRemove={removeNote} prompt="Contoh perilaku spesifik yang mendukung rating ini?" />
                </div>
              </div>

              <button type="submit"
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-slate-800 active:scale-98 transition-all shadow-lg">
                Simpan Analisis
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}