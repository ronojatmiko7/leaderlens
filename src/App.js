import { useState, useEffect } from "react";
import {
  Plus, Users, LayoutGrid, BookOpen, Trash2, Edit3, TrendingUp,
  Target, Award, X, PlusCircle, CheckCircle2, AlertTriangle,
  Wrench, ShieldAlert, MessageCircle, ChevronDown, Calendar,
  BarChart3, Lightbulb, ArrowRight, Clock, RefreshCw, Info, Lock, Key,
  Printer, FileText, CheckCircle, XCircle
} from "lucide-react";

// ── helpers ──────────────────────────────────────────────────────────────────

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

const DISC_META = {
  D: { 
    label: "Dominance", color: "#EF4444", bg: "bg-red-500", light: "bg-red-50 text-red-700", desc: "Fokus hasil & kontrol",
    strengths: "Eksekusi cepat, berani ambil risiko, mandiri, dan sangat berorientasi pada target akhir.",
    weaknesses: "Sering terburu-buru, kurang sabar, cenderung mengabaikan detail, dan bisa terkesan otoriter."
  },
  I: { 
    label: "Influence", color: "#F59E0B", bg: "bg-amber-400", light: "bg-amber-50 text-amber-700", desc: "Fokus antusiasme & orang",
    strengths: "Komunikator ulung, antusias, mudah bergaul, dan sangat jago memotivasi energi tim.",
    weaknesses: "Mudah terdistraksi, kurang teliti pada urusan detail/administrasi, dan kadang over-promising."
  },
  S: { 
    label: "Steadiness", color: "#10B981", bg: "bg-emerald-500", light: "bg-emerald-50 text-emerald-700", desc: "Fokus kerja sama & sabar",
    strengths: "Pemain tim yang loyal, pendengar yang baik, konsisten, dan selalu menciptakan harmoni.",
    weaknesses: "Menghindari konflik, lambat beradaptasi pada perubahan mendadak, dan sulit berkata 'tidak'."
  },
  C: { 
    label: "Compliance", color: "#3B82F6", bg: "bg-blue-500", light: "bg-blue-50 text-blue-700", desc: "Fokus akurasi & kualitas",
    strengths: "Sangat teliti, analitis, memiliki standar kualitas tinggi, dan patuh pada sistem/prosedur.",
    weaknesses: "Terlalu perfeksionis, lambat ambil keputusan jika data kurang (analysis paralysis), dan kaku."
  },
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
    open:    "Berbasis data: 'Ada beberapa angka yang ingin turnjukkan dan diskusikan.'",
    body:    "Bawa bukti konkret. Beri waktu mereka untuk berpikir sebelum minta respons.",
    avoid:   "Jangan beri feedback tanpa data pendukung — mereka akan menantang balik.",
  },
}[disc]);

const getActionPlan = (m) => {
  const q = getQuadrant(m.competency, m.commitment);
  const script = getDISCScript(m.disc || "S");
  const discData = DISC_META[m.disc || "S"];
  const plan = [];

  plan.push({
    type: "profile",
    title: `Analisis Karakter (${discData.label})`,
    color: discData.color,
    bg: "#F8FAFC",
    border: "#E2E8F0",
    icon: "info",
    items: [
      `KELEBIHAN UTAMA: ${discData.strengths}`,
      `POTENSI KEKURANGAN: ${discData.weaknesses}`
    ],
  });

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
      title: "Prosedur PIP (Perhatian Khusus)",
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
      title: "Strategi Re-engagement",
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
      title: "Fokus Retensi & Growth",
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
  return new Date(ts).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
};

// ── sub-components ─────────────────────────────────────────────────────────

const RatingSelector = ({ label, dim, value, onChange }) => (
  <div className="space-y-1.5 sm:space-y-2">
    <label className="block text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest">{label}</label>
    <div className="grid grid-cols-4 gap-2">
      {[1, 2, 3, 4].map(n => (
        <button key={n} type="button" onClick={() => onChange(n)}
          className={`py-3 sm:py-4 rounded-xl font-black text-base sm:text-lg transition-all border-2 ${value === n ? "bg-slate-900 text-white border-slate-900 shadow-md" : "bg-white text-slate-400 border-slate-100 hover:border-slate-300"}`}>
          {n}
        </button>
      ))}
    </div>
    {value && (
      <p className="text-[11px] sm:text-xs text-slate-500 italic pt-1 pl-1">{RATING_ANCHORS[dim][value]}</p>
    )}
  </div>
);

const DISCSelector = ({ value, onChange }) => (
  <div className="space-y-1.5 sm:space-y-2">
    <label className="block text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest">Profil DISC</label>
    <div className="grid grid-cols-4 gap-2">
      {Object.entries(DISC_META).map(([id, m]) => (
        <button key={id} type="button" onClick={() => onChange(id)}
          className={`flex flex-col items-center p-3 rounded-xl sm:rounded-2xl border-2 transition-all ${value === id ? "border-slate-900 bg-slate-50 shadow-md" : "border-slate-100 bg-white hover:border-slate-200"}`}>
          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full mb-1.5 sm:mb-2 ${m.bg} flex items-center justify-center text-white text-sm sm:text-lg font-black shadow`}>{id}</div>
          <span className="text-[10px] sm:text-xs font-black uppercase text-slate-500 leading-tight text-center">{m.label}</span>
          <span className="text-[9px] sm:text-[10px] text-slate-400 text-center leading-tight mt-1">{m.desc}</span>
        </button>
      ))}
    </div>
  </div>
);

const NoteInput = ({ label, type, notes, onAdd, onUpdate, onRemove, prompt }) => (
  <div className="space-y-1.5 sm:space-y-2">
    <div className="flex justify-between items-center">
      <label className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest">{label}</label>
      <button type="button" onClick={() => onAdd(type)} className="text-xs sm:text-sm font-bold text-indigo-600 flex items-center gap-1">
        <PlusCircle className="w-3 h-3 sm:w-4 sm:h-4" /> Tambah
      </button>
    </div>
    <p className="text-[11px] sm:text-xs text-slate-400 italic">{prompt}</p>
    <div className="space-y-2">
      {notes.map((n, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input 
            className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm sm:text-base text-slate-900 outline-none focus:ring-2 focus:ring-slate-900 placeholder:text-slate-300"
            placeholder="Tuliskan bukti perilaku..." 
            value={n}
            onChange={e => onUpdate(type, i, e.target.value)} 
          />
          {notes.length > 1 && (
            <button type="button" onClick={() => onRemove(type, i)} className="p-2 sm:p-3 text-slate-300 hover:text-red-400 transition-colors">
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
        </div>
      ))}
    </div>
  </div>
);

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


// ── KOMPONEN LOGIN GATE ───────────────────────────────────────────────────

const LoginGate = ({ onLoginSuccess }) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  // KODE AKSES YANG VALID
  const VALID_CODES = ["LEADER-PRO-2026", "SCALEV-VIP"];

  const handleLogin = (e) => {
    e.preventDefault();
    if (VALID_CODES.includes(code.trim().toUpperCase())) {
      setError(false);
      localStorage.setItem("ll_auth_status", "verified");
      onLoginSuccess();
    } else {
      setError(true);
      setCode(""); // Kosongkan input jika salah
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[32px] p-8 sm:p-10 shadow-2xl animate-in fade-in zoom-in duration-500">
        
        {/* Logo */}
        <div className="flex flex-col items-center justify-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-lg mb-5">
            <Users className="w-8 h-8 text-slate-900" />
          </div>
          <div className="text-2xl sm:text-3xl font-black tracking-tight leading-none uppercase text-white">LEADER<span className="text-slate-400">LENS</span></div>
          <div className="text-xs text-slate-500 font-mono mt-2 text-center">People Diagnostics Premium</div>
        </div>

        {/* Formulir */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest text-center">
              Masukkan Kode Akses
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Key className="h-5 w-5 text-slate-500" />
              </div>
              <input 
                type="text" 
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={`w-full pl-12 pr-4 py-4 bg-slate-950 border ${error ? 'border-red-500 focus:ring-red-500' : 'border-slate-800 focus:ring-indigo-500'} rounded-2xl text-base sm:text-lg font-bold text-white outline-none focus:ring-2 transition-all text-center uppercase tracking-wider placeholder:text-slate-700 placeholder:normal-case placeholder:tracking-normal`}
                placeholder="Misal: LEADER-PRO-2026" 
              />
            </div>
            {error && (
              <p className="text-xs font-bold text-red-500 text-center animate-in slide-in-from-top-2">Kode akses tidak valid. Silakan periksa email Anda.</p>
            )}
          </div>

          <button type="submit"
            className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black text-sm sm:text-base tracking-widest uppercase hover:bg-slate-200 active:scale-[0.98] transition-all shadow-xl flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" /> Buka Akses
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-800 pt-6">
          <p className="text-xs text-slate-500 leading-relaxed">
            Belum punya kode akses? <br />
            Silakan selesaikan pembelian di <span className="font-bold text-slate-300">halaman Scalev</span> untuk mendapatkan kode eksklusif Anda via email.
          </p>
        </div>
      </div>
    </div>
  );
};


// ── MAIN APP ──────────────────────────────────────────────────────────────

const EMPTY_FORM = { name: "", role: "", competency: 2, commitment: 2, competencyNotes: [""], commitmentNotes: [""], disc: "S" };

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [members, setMembers] = useState([]);
  const [isMounted, setIsMounted] = useState(false);
  const [tab, setTab] = useState("matrix");
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [expandedPlan, setExpandedPlan] = useState(null);

  useEffect(() => {
    setIsMounted(true);
    // Cek Status Autentikasi
    if (localStorage.getItem("ll_auth_status") === "verified") {
      setIsAuthenticated(true);
    }
    
    // Tarik Data
    try {
      const storedData = localStorage.getItem("ll_v8");
      if (storedData) setMembers(JSON.parse(storedData));
    } catch (e) {
      console.warn("Storage read error", e);
    }
  }, []);

  useEffect(() => {
    if (isMounted && isAuthenticated) {
      try {
        localStorage.setItem("ll_v8", JSON.stringify(members));
      } catch (e) {
        console.warn("Storage write error", e);
      }
    }
  }, [members, isMounted, isAuthenticated]);

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

  const handlePrint = () => {
    window.print();
  };

  if (!isMounted) return null;

  if (!isAuthenticated) {
    return <LoginGate onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;900&family=DM+Mono:wght@400;500&display=swap');
        * { -webkit-font-smoothing: antialiased; }
        .fade-in { animation: fadeIn 0.4s ease forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        /* Kustom scrollbar */
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        
        /* CSS KHUSUS UNTUK FITUR PRINT PDF - PENYEMPURNAAN */
        @media print {
          /* Me-reset background hitam bawaan root aplikasi menjadi putih */
          body, html, #root, .bg-slate-950, .min-h-screen { 
            background-color: white !important; 
            color: black !important; 
          }
          
          /* Menyembunyikan elemen UI yang tidak perlu di cetak */
          header, .hide-on-print { display: none !important; }
          
          /* Menghilangkan background pembungkus akordion yang berwarna gelap */
          .bg-slate-900 {
            background-color: transparent !important;
            border: none !important;
          }
          
          /* Memastikan Kertas Dokumen terisi penuh tanpa terpotong margin UI */
          .print-area {
            position: relative !important;
            background-color: white !important;
            color: black !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
          }
          
          /* Memaksa seluruh teks di dalam dokumen menjadi warna hitam (khusus saat print) */
          .print-area * {
            color: black !important;
          }
          
          /* Mengizinkan warna elemen grafis (seperti ikon dan border abu) tetap tercetak */
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          
          @page { margin: 1.5cm; }
        }
      `}</style>

      {/* Header */}
      <header className="border-b border-slate-800 px-4 sm:px-6 py-4 sticky top-0 z-40 bg-slate-950/95 backdrop-blur hide-on-print">
        <div className="max-w-4xl lg:max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white flex items-center justify-center">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-slate-900" />
            </div>
            <div>
              <div className="text-sm sm:text-base lg:text-xl font-black tracking-tight leading-none uppercase">LEADER<span className="text-slate-400">LENS</span></div>
              <div className="text-[9px] sm:text-[11px] lg:text-xs text-slate-500 font-mono mt-0.5">People Diagnostics Premium</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {health && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700">
                <div className="text-[10px] sm:text-xs text-slate-400 font-mono">Tim</div>
                <div className="text-sm sm:text-base font-black text-white">{health.score}<span className="text-slate-500 text-[10px]">/100</span></div>
              </div>
            )}
            <button onClick={() => setModal(true)}
              className="bg-white text-slate-900 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-black text-[10px] sm:text-xs lg:text-sm tracking-widest uppercase hover:bg-slate-100 transition-all active:scale-95 shadow-lg">
              + Tambah
            </button>
          </div>
        </div>
      </header>

      {/* Penutup hide-on-print dilepas dari tag main ini agar isi print bisa jalan */}
      <main className="max-w-4xl lg:max-w-5xl mx-auto px-4 py-6">
        {/* Team Health Banner */}
        {health && (
          <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3 fade-in hide-on-print">
            {Object.entries(health.dist).map(([qid, count]) => {
              const q = ["Q1","Q2","Q3","Q4"].map(id => {
                const dummy = { Q1:{comp:1,comm:1}, Q2:{comp:1,comm:3}, Q3:{comp:3,comm:1}, Q4:{comp:3,comm:3} }[id];
                return { id, ...getQuadrant(dummy.comp, dummy.comm) };
              }).find(q => q.id === qid);
              return (
                <div key={qid} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-wider mb-1">{q.label}</div>
                    <div className="text-2xl sm:text-3xl font-black" style={{ color: q.color }}>{count}</div>
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full opacity-20" style={{ background: q.color }}></div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-slate-900 rounded-2xl mb-8 border border-slate-800 overflow-x-auto scrollbar-hide hide-on-print">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 min-w-[80px] py-3 rounded-xl text-[10px] sm:text-xs lg:text-sm font-black uppercase tracking-widest transition-all ${tab === t.id ? "bg-white text-slate-900" : "text-slate-500 hover:text-slate-300"}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="fade-in" key={tab}>

          {/* MATRIX TAB */}
          {tab === "matrix" && (
            <div className="flex flex-col items-center gap-6">
              {members.length === 0 ? (
                <div className="text-center py-24 sm:py-32">
                  <div className="text-slate-600 font-black text-xs sm:text-sm uppercase tracking-widest mb-4">Belum ada data</div>
                  <button onClick={() => setModal(true)} className="text-white bg-slate-800 px-6 py-3 sm:px-8 sm:py-4 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-widest hover:bg-slate-700 transition-all">
                    + Tambah Anggota Pertama
                  </button>
                </div>
              ) : (
                <div className="w-full max-w-lg lg:max-w-2xl flex gap-2 sm:gap-4 mt-4">
                  {/* Y Axis Container */}
                  <div className="flex items-center">
                    <span 
                      className="text-[10px] sm:text-xs lg:text-sm font-black text-slate-400 uppercase tracking-widest whitespace-nowrap" 
                      style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                      ← Komitmen
                    </span>
                  </div>

                  {/* Matrix Box + X Axis Container */}
                  <div className="flex-1 flex flex-col gap-2 sm:gap-4">
                    {/* Matrix Square */}
                    <div className="w-full aspect-square relative bg-slate-900 rounded-3xl sm:rounded-[32px] border border-slate-800 overflow-hidden shadow-2xl">
                      
                      {/* Grid lines */}
                      <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-500/80 z-0"></div>
                      <div className="absolute top-0 left-1/2 w-[2px] h-full bg-slate-500/80 z-0"></div>
                      
                      {/* KETERANGAN KUADRAN BACKGROUND */}
                      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 text-center text-slate-700/50 z-0 pointer-events-none select-none flex flex-col items-center justify-center w-full">
                        <div className="text-2xl sm:text-4xl font-black mb-1">Q2</div>
                        <div className="text-[9px] sm:text-xs font-bold uppercase tracking-widest">Potential Talent</div>
                      </div>
                      
                      <div className="absolute top-1/4 left-3/4 -translate-x-1/2 -translate-y-1/2 text-center text-slate-700/50 z-0 pointer-events-none select-none flex flex-col items-center justify-center w-full">
                        <div className="text-2xl sm:text-4xl font-black mb-1">Q4</div>
                        <div className="text-[9px] sm:text-xs font-bold uppercase tracking-widest">Star Performer</div>
                      </div>

                      <div className="absolute top-3/4 left-1/4 -translate-x-1/2 -translate-y-1/2 text-center text-slate-700/50 z-0 pointer-events-none select-none flex flex-col items-center justify-center w-full">
                        <div className="text-[9px] sm:text-xs font-bold uppercase tracking-widest mb-1">Critical Area</div>
                        <div className="text-2xl sm:text-4xl font-black">Q1</div>
                      </div>

                      <div className="absolute top-3/4 left-3/4 -translate-x-1/2 -translate-y-1/2 text-center text-slate-700/50 z-0 pointer-events-none select-none flex flex-col items-center justify-center w-full">
                        <div className="text-[9px] sm:text-xs font-bold uppercase tracking-widest mb-1">Expert in Slump</div>
                        <div className="text-2xl sm:text-4xl font-black">Q3</div>
                      </div>
                      
                      {/* Member dots */}
                      {members.map(m => {
                        const q = getQuadrant(m.competency, m.commitment);
                        const left = ((m.competency - 1) / 3) * 80 + 10;
                        const bottom = ((m.commitment - 1) / 3) * 80 + 10;
                        return (
                          <button key={m.id} onClick={() => openEdit(m)}
                            className="absolute group transition-transform hover:scale-125 z-20"
                            style={{ left: `${left}%`, bottom: `${bottom}%`, transform: "translate(-50%, 50%)" }}
                            title={m.name}>
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-slate-950 shadow-xl flex items-center justify-center text-white text-xs sm:text-sm font-black relative"
                              style={{ background: q.color }}>
                              {m.name.charAt(0)}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    
                    {/* X Axis Label */}
                    <div className="text-center">
                      <span className="text-[10px] sm:text-xs lg:text-sm font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                        Kompetensi →
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* LIST TAB */}
          {tab === "list" && (
            <div className="space-y-4">
              {members.length === 0 ? (
                <div className="text-center py-24 text-slate-600 font-black text-xs sm:text-sm uppercase tracking-widest">Belum ada anggota</div>
              ) : members.map(m => {
                const q = getQuadrant(m.competency, m.commitment);
                return (
                  <div key={m.id} className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 group">
                    <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-white font-black text-lg sm:text-xl flex-shrink-0"
                        style={{ background: q.color }}>
                        {m.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="font-black text-white text-base sm:text-lg lg:text-xl leading-tight">{m.name}</div>
                        <div className="text-xs sm:text-sm text-slate-500 mt-1">{m.role || "—"}</div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-full" style={{ background: q.bg, color: q.text }}>{q.label}</span>
                          <span className="text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">DISC {m.disc}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 self-end sm:self-center">
                      <button onClick={() => openEdit(m)} className="p-3 text-slate-600 hover:text-white rounded-xl hover:bg-slate-800 transition-all"><Edit3 className="w-5 h-5 sm:w-6 sm:h-6" /></button>
                      <button onClick={() => setDeleteConfirm(m.id)} className="p-3 text-slate-600 hover:text-red-400 rounded-xl hover:bg-slate-800 transition-all"><Trash2 className="w-5 h-5 sm:w-6 sm:h-6" /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ACTION PLANS TAB / DOKUMEN */}
          {tab === "plans" && (
            <div className="space-y-4">
               {members.map(m => {
                  const q = getQuadrant(m.competency, m.commitment);
                  return (
                  <div key={m.id} className={`bg-slate-900 rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-800 shadow-sm transition-all ${expandedPlan !== m.id ? 'hide-on-print' : ''}`}>
                    {/* Header Akordion - Disembunyikan saat print */}
                    <button onClick={() => setExpandedPlan(expandedPlan === m.id ? null : m.id)}
                      className="w-full flex items-center justify-between p-5 sm:p-6 hover:bg-slate-800 transition-all text-white hide-on-print">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-white font-black sm:text-lg" style={{ background: q.color }}>
                          {m.name.charAt(0)}
                        </div>
                        <div className="text-left">
                          <div className="font-black sm:text-lg lg:text-xl">{m.name}</div>
                          <div className="text-[10px] sm:text-xs text-slate-400 mt-1 uppercase tracking-widest">{getDocumentTitle(q.id)}</div>
                        </div>
                      </div>
                      <ChevronDown className={`w-5 h-5 sm:w-6 sm:h-6 text-slate-500 transition-transform ${expandedPlan === m.id ? "rotate-180" : ""}`} />
                    </button>
                    
                    {/* Kertas A4 View (Area yang di Print) */}
                    {expandedPlan === m.id && (
                      <div className="p-4 sm:p-8 bg-slate-950 border-t border-slate-800">
                        
                        {/* Tombol Print (Sembunyi saat di-print) */}
                        <div className="flex justify-end mb-4 hide-on-print">
                          <button onClick={handlePrint} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors">
                            <Printer className="w-4 h-4" /> Simpan ke PDF
                          </button>
                        </div>

                        {/* MOCKUP KERTAS A4 FORMAL - INI AREA YANG AKAN MUNCUL SAAT PRINT */}
                        <div className={`bg-white text-slate-900 rounded-sm shadow-2xl mx-auto p-8 sm:p-12 max-w-3xl print-area`}>
                          
                          {/* Kop Dokumen */}
                          <div className="border-b-2 border-slate-900 pb-6 mb-8 text-center">
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-tight text-slate-900 mb-2">
                              {getDocumentTitle(q.id)}
                            </h1>
                            <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">
                              Dokumen Konfidensial HR & Manajemen
                            </p>
                          </div>

                          {/* Info Karyawan */}
                          <div className="grid grid-cols-2 gap-4 mb-8 text-sm sm:text-base">
                            <div>
                              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Nama Karyawan</p>
                              <p className="font-black text-slate-900">{m.name}</p>
                            </div>
                            <div>
                              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Tanggal Dokumen</p>
                              <p className="font-black text-slate-900">{formatDate(Date.now())}</p>
                            </div>
                            <div>
                              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Jabatan / Peran</p>
                              <p className="font-black text-slate-900">{m.role || "-"}</p>
                            </div>
                            <div>
                              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Status Kuadran</p>
                              <p className="font-black" style={{ color: q.color }}>{q.label} ({q.id})</p>
                            </div>
                          </div>

                          {/* Poin-Poin Action Plan dipetakan ke format Dokumen */}
                          <div className="space-y-8">
                            {getActionPlan(m).map((item, idx) => (
                              <div key={idx} className="break-inside-avoid">
                                <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2 border-b border-slate-200 pb-2">
                                  <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-xs">{idx + 1}</span>
                                  {item.title}
                                </h3>
                                <ul className="space-y-2.5 pl-8">
                                  {item.items.map((act, i) => (
                                    <li key={i} className="text-sm sm:text-base text-slate-700 leading-relaxed list-disc">
                                      {act}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>

                          {/* Fakta Kinerja (Dari Input User) */}
                          <div className="mt-8 break-inside-avoid border-t-2 border-dashed border-slate-200 pt-8">
                            <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-900 mb-4">Catatan Lampiran Observasi Manajer</h3>
                            <div className="grid sm:grid-cols-2 gap-6">
                              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Fakta Kompetensi (Skor: {m.competency}/4)</p>
                                <ul className="list-disc pl-4 text-sm text-slate-700 space-y-1">
                                  {m.competencyNotes.map((note, i) => <li key={i}>{note || "-"}</li>)}
                                </ul>
                              </div>
                              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Fakta Komitmen (Skor: {m.commitment}/4)</p>
                                <ul className="list-disc pl-4 text-sm text-slate-700 space-y-1">
                                  {m.commitmentNotes.map((note, i) => <li key={i}>{note || "-"}</li>)}
                                </ul>
                              </div>
                            </div>
                          </div>

                          {/* KOLOM KOSONG: ACTION PLAN DISEPAKATI BERSAMA */}
                          <div className="mt-8 break-inside-avoid border-t-2 border-slate-900 pt-8">
                            <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-900 mb-2">Rencana Tindakan Lanjutan (Disepakati Bersama)</h3>
                            <p className="text-xs text-slate-500 mb-8 italic">Bagian ini diisi secara manual setelah melakukan diskusi 1-on-1 dengan karyawan untuk menyepakati target dan langkah konkret.</p>
                            <div className="space-y-6">
                              <div className="border-b border-slate-400 h-6 flex items-end"><span className="text-sm font-bold text-slate-800 ml-2">1.</span></div>
                              <div className="border-b border-slate-400 h-6 flex items-end"><span className="text-sm font-bold text-slate-800 ml-2">2.</span></div>
                              <div className="border-b border-slate-400 h-6 flex items-end"><span className="text-sm font-bold text-slate-800 ml-2">3.</span></div>
                              <div className="border-b border-slate-400 h-6 flex items-end"><span className="text-sm font-bold text-slate-800 ml-2">4.</span></div>
                            </div>
                          </div>

                          {/* Tanda Tangan */}
                          <div className="mt-16 pt-8 grid grid-cols-2 gap-8 text-center break-inside-avoid">
                            <div>
                              <div className="border-b border-slate-400 h-16 mx-8"></div>
                              <p className="mt-2 text-sm font-black text-slate-900">Manajer / Atasan</p>
                              <p className="text-xs text-slate-500">Tanda tangan & Nama Jelas</p>
                            </div>
                            <div>
                              <div className="border-b border-slate-400 h-16 mx-8"></div>
                              <p className="mt-2 text-sm font-black text-slate-900">{m.name}</p>
                              <p className="text-xs text-slate-500">Tanda tangan & Nama Jelas</p>
                            </div>
                          </div>

                        </div>
                      </div>
                    )}
                  </div>
                  );
               })}
            </div>
          )}
          
          {/* GUIDE TAB (URUTAN DIUBAH) */}
          {tab === "guide" && (
            <div className="space-y-10 sm:space-y-12 pb-8">
              
              {/* Intro Banner */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
                  <span className="text-sm sm:text-lg font-black text-white uppercase tracking-widest">Panduan LeaderLens</span>
                </div>
                <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                  LeaderLens dirancang berdasarkan metodologi manajemen SDM modern. Ia menggabungkan pemahaman gaya komunikasi dari <strong>Profil Perilaku DISC</strong> dengan diagnosis kinerja berbasis <strong>Matriks Skill vs Will (Kompetensi vs Komitmen)</strong>. Gunakan panduan ini untuk memahami cara mengelola setiap tipe anggota tim Anda.
                </p>
              </div>

              {/* SECTION 1: PANDUAN PENGISIAN FORM */}
              <section>
                <h3 className="text-lg sm:text-2xl font-black text-white mb-6 flex items-center gap-3">
                  <Edit3 className="w-6 h-6 text-slate-400" /> 1. Cara Mengisi Form Penilaian
                </h3>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-8">
                  
                  {/* Panduan Kompetensi & Komitmen */}
                  <div className="grid sm:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-black text-indigo-400 uppercase tracking-widest text-sm mb-3">Penilaian Kompetensi (Skill)</h4>
                      <p className="text-sm text-slate-400 leading-relaxed mb-4">
                        Nilai kemampuan teknis karyawan dalam menjalankan <strong>tugas utama</strong> mereka saat ini. Jangan nilai potensi masa depan, nilailah apa yang bisa mereka lakukan hari ini.
                      </p>
                      <ul className="text-sm text-slate-300 space-y-2">
                        <li><strong>1:</strong> Sering salah, sangat bergantung pada bantuan orang lain.</li>
                        <li><strong>2:</strong> Bisa melakukan tugas dasar, tapi tugas kompleks harus dibimbing.</li>
                        <li><strong>3:</strong> Mandiri, jarang membuat kesalahan fatal.</li>
                        <li><strong>4:</strong> Ahli, bisa bekerja lebih cepat dari target dan bisa mengajari junior.</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-black text-amber-400 uppercase tracking-widest text-sm mb-3">Penilaian Komitmen (Will)</h4>
                      <p className="text-sm text-slate-400 leading-relaxed mb-4">
                        Nilai motivasi, rasa tanggung jawab, dan inisiatif karyawan. Apakah mereka peduli dengan hasil kerja mereka?
                      </p>
                      <ul className="text-sm text-slate-300 space-y-2">
                        <li><strong>1:</strong> Sering menunda, banyak alasan, terlihat tidak peduli.</li>
                        <li><strong>2:</strong> Bekerja seadanya (bare minimum), tidak mau mengambil tugas ekstra.</li>
                        <li><strong>3:</strong> Rajin, menyelesaikan tugas tepat waktu tanpa perlu ditagih.</li>
                        <li><strong>4:</strong> Proaktif mencari solusi, antusias, menularkan semangat positif.</li>
                      </ul>
                    </div>
                  </div>

                  <div className="border-t border-slate-800 pt-8"></div>

                  {/* Panduan Menulis Bukti Perilaku */}
                  <div>
                    <h4 className="font-black text-white uppercase tracking-widest text-sm mb-3 flex items-center gap-2">
                      <Target className="w-5 h-5 text-emerald-400" /> Cara Menulis "Bukti Perilaku"
                    </h4>
                    <p className="text-sm text-slate-400 leading-relaxed mb-6">
                      Kolom Bukti Perilaku <strong>sangat krusial</strong> karena tulisan Anda akan dicetak ke dalam Dokumen Action Plan (PDF). <strong>Gunakan FAKTA, bukan OPINI.</strong> Fakta bisa diukur dan diamati, opini bisa diperdebatkan.
                    </p>

                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* Contoh Buruk */}
                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5">
                        <div className="flex items-center gap-2 text-red-400 font-bold mb-3">
                          <XCircle className="w-5 h-5" /> SALAH (Berbasis Opini)
                        </div>
                        <ul className="text-sm text-slate-300 space-y-3">
                          <li>"Dia itu orangnya pemalas banget."</li>
                          <li>"Kerjaannya nggak pernah bener."</li>
                          <li>"Kelihatannya dia nggak niat kerja."</li>
                        </ul>
                      </div>
                      
                      {/* Contoh Baik */}
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5">
                        <div className="flex items-center gap-2 text-emerald-400 font-bold mb-3">
                          <CheckCircle className="w-5 h-5" /> BENAR (Berbasis Fakta)
                        </div>
                        <ul className="text-sm text-slate-300 space-y-3">
                          <li>"Terlambat mengumpulkan laporan mingguan sebanyak 3 kali bulan ini."</li>
                          <li>"Terdapat 5 kesalahan input data pada laporan Q3."</li>
                          <li>"Menolak saat diminta membantu proyek X pada hari Selasa."</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                </div>
              </section>

              {/* SECTION 2: 4 Kuadran */}
              <section>
                <h3 className="text-lg sm:text-2xl font-black text-white mb-6 flex items-center gap-3">
                  <LayoutGrid className="w-6 h-6 text-slate-400" /> 2. Matriks Skill vs Will (4 Kuadran)
                </h3>
                <div className="space-y-4 sm:space-y-6">
                   {QUADRANT_GUIDE.map(g => (
                    <div key={g.q} className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 overflow-hidden shadow-sm text-slate-800">
                      <div className="p-5 sm:p-6 flex items-center gap-4 font-black sm:text-xl lg:text-2xl" style={{ background: g.bg }}>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-white" style={{ background: g.color }}>{g.q}</div>
                        {g.label}
                      </div>
                      <div className="p-5 sm:p-6 space-y-4 text-sm sm:text-base">
                        <p><strong>Diagnosis:</strong> {g.diagnosis}</p>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <p className="text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100"><strong>Akar Masalah (Root Cause):</strong><br/>{g.rootCause}</p>
                          <p className="text-red-700 bg-red-50 p-4 rounded-xl border border-red-100"><strong>Kesalahan Manajer:</strong><br/>{g.mistake}</p>
                        </div>
                        <p className="text-indigo-800 bg-indigo-50 p-4 rounded-xl border border-indigo-100 font-medium"><strong>Prioritas Tindakan:</strong> {g.urgency}</p>
                      </div>
                    </div>
                   ))}
                </div>
              </section>

              {/* SECTION 3: Profil DISC */}
              <section>
                <h3 className="text-lg sm:text-2xl font-black text-white mb-6 flex items-center gap-3">
                  <Users className="w-6 h-6 text-slate-400" /> 3. Memahami Profil DISC
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* D - Dominance */}
                  <div className="bg-white rounded-2xl p-6 border-l-8 border-red-500 text-slate-800 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-full bg-red-500 text-white font-black text-xl flex items-center justify-center">D</div>
                      <div>
                        <h4 className="font-black text-lg uppercase tracking-tight text-slate-900">Dominance</h4>
                        <p className="text-xs font-bold text-red-600 uppercase tracking-wider">Fokus: Hasil & Kontrol</p>
                      </div>
                    </div>
                    <ul className="text-sm text-slate-600 space-y-2 list-disc pl-4">
                      <li>Sangat termotivasi oleh tantangan, pencapaian, dan otoritas.</li>
                      <li>Mengambil keputusan dengan cepat dan berani mengambil risiko.</li>
                      <li><strong>Cara Komunikasi:</strong> Bicaralah langsung ke inti masalah (to the point). Jangan bertele-tele atau menjelaskan detail yang tidak perlu.</li>
                    </ul>
                  </div>

                  {/* I - Influence */}
                  <div className="bg-white rounded-2xl p-6 border-l-8 border-amber-400 text-slate-800 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-full bg-amber-400 text-white font-black text-xl flex items-center justify-center">I</div>
                      <div>
                        <h4 className="font-black text-lg uppercase tracking-tight text-slate-900">Influence</h4>
                        <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Fokus: Orang & Antusiasme</p>
                      </div>
                    </div>
                    <ul className="text-sm text-slate-600 space-y-2 list-disc pl-4">
                      <li>Termotivasi oleh pengakuan sosial, kerja tim, dan popularitas.</li>
                      <li>Sangat persuasif, optimis, dan pandai mencairkan suasana.</li>
                      <li><strong>Cara Komunikasi:</strong> Libatkan mereka secara emosional. Berikan apresiasi publik. Jangan langsung fokus pada angka tanpa basa-basi yang hangat.</li>
                    </ul>
                  </div>

                  {/* S - Steadiness */}
                  <div className="bg-white rounded-2xl p-6 border-l-8 border-emerald-500 text-slate-800 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-500 text-white font-black text-xl flex items-center justify-center">S</div>
                      <div>
                        <h4 className="font-black text-lg uppercase tracking-tight text-slate-900">Steadiness</h4>
                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Fokus: Kerja Sama & Konsistensi</p>
                      </div>
                    </div>
                    <ul className="text-sm text-slate-600 space-y-2 list-disc pl-4">
                      <li>Termotivasi oleh keamanan, harmoni, dan lingkungan yang stabil.</li>
                      <li>Pendengar yang sangat baik, sabar, namun tidak menyukai perubahan mendadak.</li>
                      <li><strong>Cara Komunikasi:</strong> Pendekatan harus santai dan ramah. Jika ada perubahan sistem/aturan, jelaskan alasannya secara bertahap dan logis.</li>
                    </ul>
                  </div>

                  {/* C - Compliance */}
                  <div className="bg-white rounded-2xl p-6 border-l-8 border-blue-500 text-slate-800 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-full bg-blue-500 text-white font-black text-xl flex items-center justify-center">C</div>
                      <div>
                        <h4 className="font-black text-lg uppercase tracking-tight text-slate-900">Compliance</h4>
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Fokus: Akurasi & Kualitas</p>
                      </div>
                    </div>
                    <ul className="text-sm text-slate-600 space-y-2 list-disc pl-4">
                      <li>Termotivasi oleh keahlian, standar tinggi, dan logika.</li>
                      <li>Sangat analitis, detail-oriented, namun terkadang terlalu perfeksionis.</li>
                      <li><strong>Cara Komunikasi:</strong> Gunakan data, fakta, dan angka. Jangan berikan feedback kritis tanpa bukti tertulis atau metrik yang jelas.</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* SECTION 4: Panduan PIP (BARU) */}
              <section>
                <h3 className="text-lg sm:text-2xl font-black text-white mb-6 flex items-center gap-3">
                  <FileText className="w-6 h-6 text-slate-400" /> 4. Mengisi Dokumen Tindak Lanjut (PIP)
                </h3>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-4 text-sm sm:text-base text-slate-400 leading-relaxed">
                  <p>
                    Pada tab <strong>Action Plan</strong>, Anda dapat mengekspor atau mencetak dokumen tindak lanjut formal. Di bagian bawah dokumen tersebut, terdapat kolom kosong <strong>"Rencana Tindakan Lanjutan (Disepakati Bersama)"</strong>.
                  </p>
                  <p>
                    <strong>Mengapa kolom durasi tidak disediakan untuk diketik di aplikasi?</strong><br/>
                    Durasi dan tenggat waktu (<em>deadline</em>) adalah bagian dari komitmen psikologis yang harus disepakati secara langsung saat sesi tatap muka (1-on-1) dengan anggota tim Anda. Menuliskan kesepakatan target beserta durasinya secara bersama-sama di atas kertas cetak akan memicu tingkat pertanggungjawaban yang jauh lebih kuat bagi karyawan, ketimbang tenggat waktu yang sekadar "ditetapkan secara sepihak" oleh manajer di dalam aplikasi.
                  </p>
                  <p>
                    <strong>Cara menggunakannya:</strong><br/>
                    Setelah Anda menekan tombol "Simpan ke PDF" dan mencetaknya, duduklah bersama anggota tim Anda. Buka percakapan dengan panduan DISC yang tersedia, sepakati 3-4 langkah perbaikan nyata, lalu <strong>tuliskan secara manual target perbaikan beserta durasinya</strong> di atas garis yang disediakan. Terakhir, bubuhkan tanda tangan bersama sebagai bukti komitmen legal.
                  </p>
                </div>
              </section>

            </div>
          )}

        </div>
      </main>

      {/* Modal Input Form */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full h-full sm:h-auto sm:max-h-[90vh] max-w-2xl rounded-none sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            <div className="px-6 py-5 sm:px-8 border-b border-slate-100 flex justify-between items-center bg-white z-10 flex-shrink-0 shadow-sm">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">{editId ? "Edit Mapping" : "Mapping Baru"}</h2>
              <button onClick={closeModal} className="p-2 sm:p-2.5 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input required className="w-full px-4 py-3 sm:py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm sm:text-base font-bold outline-none text-slate-900 focus:ring-2 focus:ring-slate-900 placeholder:text-slate-400"
                    placeholder="Nama Anggota" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                  <input className="w-full px-4 py-3 sm:py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm sm:text-base font-bold outline-none text-slate-900 focus:ring-2 focus:ring-slate-900 placeholder:text-slate-400"
                    placeholder="Jabatan" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} />
                </div>
                <DISCSelector value={form.disc} onChange={v => setForm({ ...form, disc: v })} />
                <div className="space-y-8 sm:space-y-10 border-t border-slate-100 pt-8 sm:pt-10">
                  <div className="space-y-5">
                    <RatingSelector label="Kompetensi" dim="competency" value={form.competency} onChange={v => setForm({ ...form, competency: v })} />
                    <NoteInput label="Bukti Kompetensi" type="competencyNotes" notes={form.competencyNotes} onAdd={addNote} onUpdate={updateNote} onRemove={removeNote} prompt="Bukti perilaku spesifik?" />
                  </div>
                  <div className="space-y-5 border-t border-slate-100 pt-8 sm:pt-10">
                    <RatingSelector label="Komitmen" dim="commitment" value={form.commitment} onChange={v => setForm({ ...form, commitment: v })} />
                    <NoteInput label="Bukti Komitmen" type="commitmentNotes" notes={form.commitmentNotes} onAdd={addNote} onUpdate={updateNote} onRemove={removeNote} prompt="Bukti motivasi spesifik?" />
                  </div>
                </div>
                <div className="pt-4">
                  <button type="submit"
                    className="w-full bg-slate-900 text-white py-4 sm:py-5 rounded-2xl font-black text-sm sm:text-base tracking-widest uppercase hover:bg-slate-800 active:scale-[0.98] transition-all shadow-xl">
                    Simpan Analisis
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
