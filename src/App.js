import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Plus, Users, LayoutGrid, BookOpen, Trash2, Edit3, TrendingUp,
  Target, Award, X, PlusCircle, CheckCircle2, AlertTriangle,
  Wrench, ShieldAlert, MessageCircle, ChevronDown, Calendar,
  BarChart3, Lightbulb, ArrowRight, Clock, RefreshCw, Info, Lock, Key,
  Printer, FileText, CheckCircle, XCircle, LogOut
} from "lucide-react";

// ── Inisialisasi Supabase (TIDAK ADA YANG DIUBAH) ────────────────────────────
const supabaseUrl = 'https://bervlosjswfmqhxisikn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlcnZsb3Nqc3dmbXFoeGlzaWtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyODkyMjEsImV4cCI6MjA5MTg2NTIyMX0.IHTyFaCz7ExiHs7KSGaOnK3jdXXU7c47tcGHxOlKtME';
const supabase = createClient(supabaseUrl, supabaseKey);

// ── Konstanta & Helper Logika ────────────────────────────────────────────────
const getQuadrant = (comp, comm) => {
  const hi = v => v >= 3;
  if (!hi(comp) && !hi(comm)) return { id: "Q1", label: "DEADWOOD", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" };
  if (hi(comp) && !hi(comm)) return { id: "Q3", label: "COASTERS", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" };
  if (!hi(comp) && hi(comm)) return { id: "Q2", label: "LEARNERS", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" };
  return { id: "Q4", label: "STARS", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" };
};

const getDocumentTitle = (qId) => {
  if (qId === "Q1") return "PERFORMANCE ALIGNMENT PLAN"; // Mengganti nama PIP yang berisiko legal
  if (qId === "Q2") return "ACCELERATED DEVELOPMENT PLAN";
  if (qId === "Q3") return "RE-ENGAGEMENT & SUPPORT PLAN";
  return "TALENT RETENTION & GROWTH PLAN";
};

// DISC Meta sekarang memiliki opsi "?" untuk mencegah bias manajer
const DISC_META = {
  D: { 
    label: "Dominance", color: "#EF4444", bg: "bg-red-500", light: "bg-red-50 text-red-700", desc: "Fokus hasil & target",
    strengths: "Eksekusi cepat, berani ambil keputusan di situasi krisis, dan punya dorongan kuat untuk mencapai target.",
    weaknesses: "Terkadang terlalu fokus pada hasil sehingga mengabaikan proses atau perasaan rekan kerja."
  },
  I: { 
    label: "Influence", color: "#F59E0B", bg: "bg-amber-400", light: "bg-amber-50 text-amber-700", desc: "Fokus antusiasme & relasi",
    strengths: "Sangat baik dalam membangun relasi, mencairkan suasana, dan berkolaborasi antar divisi.",
    weaknesses: "Bisa kehilangan fokus pada detail administratif dan terkadang over-promise."
  },
  S: { 
    label: "Steadiness", color: "#10B981", bg: "bg-emerald-500", light: "bg-emerald-50 text-emerald-700", desc: "Fokus harmoni & konsisten",
    strengths: "Sangat bisa diandalkan, pendengar yang baik, menjaga stabilitas tim, dan konsisten.",
    weaknesses: "Menghindari konflik hingga memendam masalah, butuh waktu adaptasi pada perubahan."
  },
  C: { 
    label: "Compliance", color: "#3B82F6", bg: "bg-blue-500", light: "bg-blue-50 text-blue-700", desc: "Fokus akurasi & data",
    strengths: "Standar kualitas tinggi, sangat analitis, dan mampu melihat potensi masalah.",
    weaknesses: "Rentan terjebak dalam analisis terlalu lama (analysis paralysis) dan terkesan kaku."
  },
  "?": { 
    label: "Belum Yakin", color: "#64748B", bg: "bg-slate-400", light: "bg-slate-50 text-slate-700", desc: "Pendekatan netral",
    strengths: "Fleksibel dan terbuka untuk berkolaborasi mencari ritme kerja bersama tim.",
    weaknesses: "Membutuhkan observasi lebih lanjut untuk menemukan cara komunikasi yang efektif."
  }
};

const getDISCScript = (disc) => ({
  D: {
    open: "Fokus pada solusi: 'Mari kita diskusikan progres di [area spesifik]. Saya ingin mendengar pandanganmu agar kita bisa capai target bersama.'",
    body: "Fokus pada dampak bisnis secara objektif. Beri ruang bagi mereka untuk mengusulkan cara perbaikan: 'Menurutmu, apa langkah terbaik untuk mengejar ini?' Sepakati target dan berikan mereka otonomi eksekusi.",
    avoid: "Hindari menegur di depan umum atau bahasa yang emosional. Gunakan pendekatan berorientasi ke depan (solusi).",
  },
  I: {
    open: "Mulai dengan apresiasi: 'Saya melihat potensi besar. Boleh kita ngobrol santai tentang bagaimana kita bisa memaksimalkan itu?'",
    body: "Libatkan mereka secara personal. Ajak brainstorm solusi: 'Kira-kira dukungan apa yang kamu butuhkan agar kerjamu lebih lancar dan menyenangkan?'",
    avoid: "Jangan langsung memberikan kritik tajam tanpa konteks apresiasi. Pastikan diskusi menghasilkan kesepakatan tertulis yang sederhana.",
  },
  S: {
    open: "Ciptakan rasa aman: 'Saya ingin kita ngobrol berdua untuk melihat bagaimana saya bisa lebih men-support pekerjaanmu.'",
    body: "Gunakan pendekatan yang sabar dan penuh empati. Dengarkan lebih banyak. 'Apa kendala yang paling sering kamu rasakan?' Jelaskan rencana perbaikan secara bertahap.",
    avoid: "Hindari desakan untuk berubah drastis atau konfrontasi langsung. Pastikan mereka benar-benar nyaman untuk berbicara.",
  },
  C: {
    open: "Buka dengan objektivitas: 'Saya menghargai ketelitianmu, dan ingin mendengar analisismu tentang data dari project terakhir.'",
    body: "Berikan fakta konkret secara tenang. Beri waktu mereka untuk mencerna dan merespons. Fokus pada perbaikan sistem dan kualitas.",
    avoid: "Hindari feedback yang hanya berdasarkan perasaan. Jangan terburu-buru meminta keputusan saat itu juga.",
  },
  "?": {
    open: "Pendekatan Kolaboratif: 'Saya ingin kita diskusi santai tentang apa yang sudah berjalan baik dan apa yang bisa kita tingkatkan bersama.'",
    body: "Terapkan prinsip coaching dasar: dengarkan 80%, bicara 20%. Tanyakan kendala mereka secara terbuka. Fokus pada membangun rasa aman (psychological safety) agar mereka nyaman bercerita jujur.",
    avoid: "Jangan memberikan instruksi sepihak atau langsung berasumsi mengenai kendala mereka sebelum mendengarkan perspektif mereka secara utuh.",
  }
}[disc]);

// Fungsi ini diperbarui untuk memberikan TL;DR dan menghilangkan bahasa "HR/Legal Warning"
const getActionPlan = (m) => {
  // Parsing aman untuk notes
  m = { 
    ...m, 
    competencyNotes: Array.isArray(m.competencyNotes) ? m.competencyNotes : (m.competencyNotes ? [m.competencyNotes] : [""]),
    commitmentNotes: Array.isArray(m.commitmentNotes) ? m.commitmentNotes : (m.commitmentNotes ? [m.commitmentNotes] : [""]),
  };

  const q = getQuadrant(m.competency, m.commitment);
  const selectedDisc = m.disc || "?"; // Default ke pendekatan netral/coaching
  const script = getDISCScript(selectedDisc);
  const discData = DISC_META[selectedDisc];
  const plan = [];

  // TL;DR Section untuk menghemat waktu manajer
  plan.push({
    type: "profile",
    title: `Panduan Interaksi 1-on-1: Pendekatan ${discData.label}`,
    color: discData.color,
    bg: "#F8FAFC",
    border: "#E2E8F0",
    icon: "info",
    items: [
      `🎯 FOKUS MINGGU INI (TL;DR): Jadwalkan sesi 1-on-1 (30 menit). Fokus mendengarkan. Buka percakapan dengan: "${script.open}"`,
      `GAYA KOMUNIKASI YANG DIREKOMENDASIKAN: ${script.body}`,
      `YANG PERLU DIHINDARI: ${script.avoid}`
    ],
  });

  // Diagnostik Kompetensi
  if (m.competency < 3) {
    plan.push({
      type: "competency",
      title: "Intervensi Kompetensi (Skill Gap)",
      color: "#F59E0B",
      bg: "#FFFBEB",
      border: "#FDE68A",
      icon: "wrench",
      items: [
        "Identifikasi spesifik area keterampilan yang perlu ditingkatkan dari observasi: " + (m.competencyNotes[0] || "[Tidak ada catatan]"),
        "Jalankan metode Shadowing: Pasangkan dengan karyawan senior (Stars/Q4) selama 1-2 minggu.",
        "Berikan tugas dengan skala kecil terlebih dahulu dan review secara harian (bukan mingguan) agar kesalahan cepat terkoreksi."
      ],
    });
  }

  // Diagnostik Komitmen
  if (m.commitment < 3) {
    plan.push({
      type: "commitment",
      title: "Intervensi Komitmen (Will Gap)",
      color: "#8B5CF6",
      bg: "#F5F3FF",
      border: "#DDD6FE",
      icon: "alert",
      items: [
        "Pahami akar masalah penurunan motivasi dari indikator ini: " + (m.commitmentNotes[0] || "[Tidak ada catatan]"),
        "Lakukan percakapan terbuka dari hati ke hati. Tanyakan: 'Apa yang saat ini paling menghambat pekerjaanmu?'",
        "Berikan kembali otonomi pada area kerja yang mereka kuasai untuk membangun kembali rasa percaya diri."
      ],
    });
  }

  // Protokol Kuadran (Lebih Kolaboratif, Mengurangi "Warning Tone")
  if (q.id === "Q1") {
    plan.push({
      type: "pip",
      title: "Protokol Alignment — Dukungan Penuh (Skill & Will)",
      color: "#EF4444",
      bg: "#FEF2F2",
      border: "#FECACA",
      icon: "shield",
      items: [
        "PERHATIAN: Q1 membutuhkan dukungan kolaboratif. Berfokuslah pada 'Bagaimana kita bisa memperbaiki ini bersama?'",
        "LANGKAH 1 (Klarifikasi & Empati): Lakukan percakapan diagnostik untuk memahami akar masalah. Jangan berasumsi.",
        "LANGKAH 2 (Fokus Solusi): Susun rencana pengembangan bersama (OJT, Shadowing). Sepakati target harian/mingguan yang realistis.",
        "LANGKAH 3 (Review Rutin): Evaluasi secara objektif namun suportif setiap minggu. Rayakan setiap progres kecil."
      ],
    });
  } else if (q.id === "Q2") {
    plan.push({
      type: "dev",
      title: "Protokol Akselerasi — Learner to Star",
      color: "#F59E0B",
      bg: "#FFFBEB",
      border: "#FDE68A",
      icon: "target",
      items: [
        "FOKUS UTAMA: Membangun rasa percaya diri melalui kompetensi teknis yang solid.",
        "Berikan otonomi bersyarat: Biarkan mereka memimpin task kecil secara mandiri, namun dengan safety net yang jelas.",
        "Dorong mereka untuk mengikuti sertifikasi atau training lanjutan di bidangnya."
      ],
    });
  } else if (q.id === "Q3") {
    plan.push({
      type: "reengagement",
      title: "Protokol Re-engagement — Kolaborasi & Motivasi",
      color: "#3B82F6",
      bg: "#EFF6FF",
      border: "#BFDBFE",
      icon: "refresh",
      items: [
        "PERHATIAN: Karyawan Q3 memiliki skill, namun sedang kehilangan motivasi. Memperlakukan mereka dengan micromanagement hanya akan memperburuk keadaan.",
        "LANGKAH UTAMA — DENGARKAN: Buka percakapan dengan rasa ingin tahu. Tanyakan apa yang menguras energi mereka akhir-akhir ini tanpa menghakimi.",
        "Berikan tantangan baru atau rotasi pekerjaan ringan jika kejenuhan menjadi akar masalahnya."
      ],
    });
  } else if (q.id === "Q4") {
    plan.push({
      type: "retention",
      title: "Protokol Retensi — Menjaga Sang Bintang",
      color: "#10B981",
      bg: "#ECFDF5",
      border: "#A7F3D0",
      icon: "award",
      items: [
        "FOKUS UTAMA: Berikan tantangan strategis, bukan hanya menambah beban kerja operasional.",
        "Libatkan mereka dalam pengambilan keputusan tingkat departemen atau jadikan mentor bagi Q2.",
        "Pastikan kompensasi dan pengakuan sejalan dengan nilai tinggi yang mereka berikan ke perusahaan."
      ],
    });
  }

  return plan;
};

export default function App() {
  const [session, setSession] = useState(null);
  const [managerProfile, setManagerProfile] = useState(null);
  const [members, setMembers] = useState([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [tab, setTab] = useState("matrix");
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [expandedPlan, setExpandedPlan] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchManagerProfile = async (userId) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (!error && data) setManagerProfile(data);
  };

  const fetchMembersForUser = useCallback(async (userId) => {
    if (!userId) return;
    setIsLoadingData(true);
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('manager_id', userId);
    if (error) {
      console.error("Gagal menarik data:", error);
    } else {
      const fixed = (data || []).map(m => ({
        ...m,
        competencyNotes: Array.isArray(m.competencyNotes) ? m.competencyNotes : (m.competencyNotes ? [m.competencyNotes] : [""]),
        commitmentNotes: Array.isArray(m.commitmentNotes) ? m.commitmentNotes : (m.commitmentNotes ? [m.commitmentNotes] : [""]),
      }));
      setMembers(fixed);
    }
    setIsLoadingData(false);
  }, []);

  useEffect(() => {
    setIsMounted(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchManagerProfile(session.user.id);
        fetchMembersForUser(session.user.id);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchManagerProfile(session.user.id);
        fetchMembersForUser(session.user.id);
      } else {
        setManagerProfile(null);
        setMembers([]);
        setIsLoadingData(false);
      }
    });
    return () => subscription.unsubscribe();
  }, [fetchMembersForUser]);

  const handleLogout = async () => { await supabase.auth.signOut(); };

  const closeModal = () => { setModal(false); setEditId(null); setForm(EMPTY_FORM); };

  const openEdit = (m) => {
    const cleanNotes = (arr) => {
      const filtered = (Array.isArray(arr) ? arr : [arr || ""]).filter(n => n.trim());
      return filtered.length ? filtered : [""];
    };
    setForm({ 
      ...m, 
      competencyNotes: cleanNotes(m.competencyNotes),
      commitmentNotes: cleanNotes(m.commitmentNotes),
    });
    setEditId(m.id);
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const clean = { 
      ...form, 
      competencyNotes: form.competencyNotes.filter(n => n.trim()), 
      commitmentNotes: form.commitmentNotes.filter(n => n.trim()) 
    };

    if (editId) {
      // ── UPDATE existing member ──────────────────────────────────────────
      const payload = {
        name: clean.name,
        role: clean.role || "",
        disc: clean.disc,
        competency: Number(clean.competency),
        commitment: Number(clean.commitment),
        competencyNotes: clean.competencyNotes,
        commitmentNotes: clean.commitmentNotes,
        updatedAt: Date.now(),
      };
      const { error } = await supabase.from('members').update(payload).eq('id', editId);
      if (error) {
        console.error("Gagal update data:", error);
        alert("Gagal menyimpan perubahan.\n\n" + (error.message || JSON.stringify(error)));
      } else {
        setMembers(ms => ms.map(m => m.id === editId ? { ...m, ...payload } : m));
        closeModal();
      }
    } else {
      // ── INSERT new member ───────────────────────────────────────────────
      // KUNCI: buat id sebagai variabel terpisah SEBELUM payload object
      const newId = String(Date.now());
      const managerId = session.user.id;

      const payload = {
        id: newId,
        manager_id: managerId,
        name: String(clean.name),
        role: String(clean.role || ""),
        disc: String(clean.disc),
        competency: Number(clean.competency),
        commitment: Number(clean.commitment),
        competencyNotes: Array.isArray(clean.competencyNotes) ? clean.competencyNotes : [],
        commitmentNotes: Array.isArray(clean.commitmentNotes) ? clean.commitmentNotes : [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      console.log("INSERT payload:", JSON.stringify(payload)); // debug — hapus setelah berhasil

      const { data, error } = await supabase.from('members').insert([payload]).select();
      if (error) {
        console.error("Gagal simpan data baru:", error);
        alert("Gagal menambahkan data.\n\n" + (error.message || JSON.stringify(error)));
      } else if (data && data[0]) {
        setMembers(ms => [...ms, {
          ...data[0],
          competencyNotes: Array.isArray(data[0].competencyNotes) ? data[0].competencyNotes : [data[0].competencyNotes || ""],
          commitmentNotes: Array.isArray(data[0].commitmentNotes) ? data[0].commitmentNotes : [data[0].commitmentNotes || ""],
        }]);
        closeModal();
      }
    }
    setIsSubmitting(false);
  };

  const confirmDelete = async (id) => {
    const { error } = await supabase.from('members').delete().eq('id', id);
    if (error) {
      console.error("Gagal menghapus data:", error);
      alert("Gagal menghapus dari database.");
    } else {
      setMembers(ms => ms.filter(m => m.id !== id));
      setDeleteConfirm(null);
    }
  };

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

  const handlePrint = () => window.print();

  if (!isMounted) return null;
  if (!session) return <SupabaseAuthGate onLoginSuccess={(sess) => setSession(sess)} />;

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;900&family=DM+Mono:wght@400;500&display=swap');
        * { -webkit-font-smoothing: antialiased; }
        .fade-in { animation: fadeIn 0.4s ease forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        @media print {
          body, html, #root, .bg-slate-950, .min-h-screen { background-color: white !important; color: black !important; }
          .app-header, .hide-on-print { display: none !important; }
          .bg-slate-900 { background-color: transparent !important; border: none !important; }
          .print-area { position: relative !important; background-color: white !important; color: black !important; box-shadow: none !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }
          .print-area * { color: black !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          @page { margin: 1.5cm; }
        }
      `}</style>

      {/* Header */}
      <div className="app-header border-b border-slate-800 px-4 sm:px-6 py-4 sticky top-0 z-40 bg-slate-950/95 backdrop-blur hide-on-print">
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
            {health && !isLoadingData && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700">
                <div className="text-[10px] sm:text-xs text-slate-400 font-mono">Tim</div>
                <div className="text-sm sm:text-base font-black text-white">{health.score}<span className="text-slate-500 text-[10px]">/100</span></div>
              </div>
            )}
            <button onClick={() => setModal(true)}
              className="bg-white text-slate-900 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-black text-[10px] sm:text-xs lg:text-sm tracking-widest uppercase hover:bg-slate-100 transition-all active:scale-95 shadow-lg">
              + Tambah
            </button>
            <button onClick={handleLogout} title="Keluar"
              className="p-2 sm:p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-400 hover:text-red-400 hover:border-red-400/50 transition-all">
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-4xl lg:max-w-5xl mx-auto px-4 py-6">
        {/* Team Health Banner */}
        {health && !isLoadingData && (
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
              {isLoadingData ? (
                <div className="text-center py-24 sm:py-32">
                  <RefreshCw className="w-8 h-8 text-slate-500 animate-spin mx-auto mb-4" />
                  <div className="text-slate-500 font-bold text-xs sm:text-sm uppercase tracking-widest">Memuat data dari database...</div>
                </div>
              ) : members.length === 0 ? (
                <div className="text-center py-24 sm:py-32">
                  <div className="text-slate-600 font-black text-xs sm:text-sm uppercase tracking-widest mb-4">Belum ada data</div>
                  <button onClick={() => setModal(true)} className="text-white bg-slate-800 px-6 py-3 sm:px-8 sm:py-4 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-widest hover:bg-slate-700 transition-all">
                    + Tambah Anggota Pertama
                  </button>
                </div>
              ) : (
                <div className="w-full max-w-lg lg:max-w-2xl flex gap-2 sm:gap-4 mt-4">
                  <div className="flex items-center">
                    <span className="text-[10px] sm:text-xs lg:text-sm font-black text-slate-400 uppercase tracking-widest whitespace-nowrap" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                      ← Komitmen
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col gap-2 sm:gap-4">
                    <div className="w-full aspect-square relative bg-slate-900 rounded-3xl sm:rounded-[32px] border border-slate-800 overflow-hidden shadow-2xl">
                      <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-500/80 z-0"></div>
                      <div className="absolute top-0 left-1/2 w-[2px] h-full bg-slate-500/80 z-0"></div>
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
                    <div className="text-center">
                      <span className="text-[10px] sm:text-xs lg:text-sm font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Kompetensi →</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* LIST TAB */}
          {tab === "list" && (
            <div className="space-y-4">
              {isLoadingData ? (
                <div className="text-center py-24 text-slate-500 font-bold text-xs sm:text-sm uppercase tracking-widest">Memuat data...</div>
              ) : members.length === 0 ? (
                <div className="text-center py-24 text-slate-600 font-black text-xs sm:text-sm uppercase tracking-widest">Belum ada anggota</div>
              ) : members.map(m => {
                const q = getQuadrant(m.competency, m.commitment);
                return (
                  <div key={m.id} className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 group">
                    <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-white font-black text-lg sm:text-xl flex-shrink-0" style={{ background: q.color }}>
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

          {/* ACTION PLANS TAB */}
          {tab === "plans" && (
            <div className="space-y-4">
              {members.map(m => {
                const q = getQuadrant(m.competency, m.commitment);
                return (
                  <div key={m.id} className={`bg-slate-900 rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-800 shadow-sm transition-all ${expandedPlan !== m.id ? 'hide-on-print' : ''}`}>
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
                    {expandedPlan === m.id && (
                      <div className="p-4 sm:p-8 bg-slate-950 border-t border-slate-800">
                        <div className="flex justify-end mb-4 hide-on-print">
                          <button onClick={handlePrint} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors">
                            <Printer className="w-4 h-4" /> Simpan ke PDF
                          </button>
                        </div>
                        <div className="bg-white text-slate-900 rounded-sm shadow-2xl mx-auto max-w-3xl print-area">
                          <div className="p-8 sm:p-12">
                            <div className="border-b-2 border-slate-900 pb-4 mb-6 text-center">
                              <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight text-slate-900 mb-1">Leader's Pre-Flight Briefing</h1>
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{managerProfile?.company || "Internal Management Document"}</p>
                              <p className="text-xs font-bold text-red-600 uppercase tracking-widest mt-2">Strictly Confidential — Do Not Share With Employee</p>
                            </div>
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-8 flex justify-between items-center">
                              <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Target Diskusi</p>
                                <p className="font-black text-slate-900 text-lg">{m.name}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Profil & Kuadran</p>
                                <p className="font-black" style={{ color: q.color }}>DISC {m.disc} | {q.id}</p>
                              </div>
                            </div>
                            <div className="space-y-6">
                              {getActionPlan(m).map((item, idx) => (
                                <div key={idx} className="break-inside-avoid bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                                  <h3 className="text-sm font-black uppercase tracking-wider mb-3 flex items-center gap-2 border-b border-slate-100 pb-2" style={{ color: item.color }}>
                                    <span className="w-6 h-6 rounded flex items-center justify-center text-xs text-white" style={{ background: item.color }}>{idx + 1}</span>
                                    {item.title}
                                  </h3>
                                  <ul className="space-y-2 pl-6">
                                    {item.items.map((act, i) => (
                                      <li key={i} className="text-xs sm:text-sm text-slate-700 leading-relaxed list-disc">{act}</li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="p-8 sm:p-12 border-t-8 border-slate-900" style={{ pageBreakBefore: 'always' }}>
                            <div className="border-b-2 border-slate-900 pb-6 mb-8 text-center">
                              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-tight text-slate-900 mb-2">{getDocumentTitle(q.id)}</h1>
                              <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">Prepared by: {managerProfile?.full_name} | {managerProfile?.title}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-8 text-sm sm:text-base bg-slate-50 p-6 rounded-xl border border-slate-200">
                              <div>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Nama Karyawan</p>
                                <p className="font-black text-slate-900">{m.name}</p>
                              </div>
                              <div>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Tanggal Dokumen</p>
                                <p className="font-black text-slate-900">{formatDate(Date.now())}</p>
                              </div>
                              <div className="mt-4">
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Jabatan / Peran</p>
                                <p className="font-black text-slate-900">{m.role || "-"}</p>
                              </div>
                              <div className="mt-4">
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Fokus Pengembangan</p>
                                <p className="font-black" style={{ color: q.color }}>{q.label}</p>
                              </div>
                            </div>
                            <div className="mb-8 break-inside-avoid">
                              <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-900 mb-4">I. Observasi Kinerja Terkini</h3>
                              <div className="grid sm:grid-cols-2 gap-6">
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Fakta Kompetensi Teknis</p>
                                  <ul className="list-disc pl-4 text-sm text-slate-700 space-y-1">
                                    {m.competencyNotes.map((note, i) => <li key={i}>{note || "-"}</li>)}
                                  </ul>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Fakta Komitmen & Sikap</p>
                                  <ul className="list-disc pl-4 text-sm text-slate-700 space-y-1">
                                    {m.commitmentNotes.map((note, i) => <li key={i}>{note || "-"}</li>)}
                                  </ul>
                                </div>
                              </div>
                            </div>
                            <div className="break-inside-avoid">
                              <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-900 mb-2">II. Rencana Tindakan Lanjutan (Disepakati Bersama)</h3>
                              <p className="text-xs text-slate-500 mb-8 italic">Poin-poin di bawah ini diisi bersama antara Manajer dan Karyawan, mencakup tindakan spesifik, target terukur, dan tenggat waktu.</p>
                              <div className="space-y-8">
                                <div className="border-b border-slate-400 h-6 flex items-end"><span className="text-sm font-bold text-slate-800 ml-2">1.</span></div>
                                <div className="border-b border-slate-400 h-6 flex items-end"><span className="text-sm font-bold text-slate-800 ml-2">2.</span></div>
                                <div className="border-b border-slate-400 h-6 flex items-end"><span className="text-sm font-bold text-slate-800 ml-2">3.</span></div>
                                <div className="border-b border-slate-400 h-6 flex items-end"><span className="text-sm font-bold text-slate-800 ml-2">4.</span></div>
                              </div>
                            </div>
                            <div className="mt-16 pt-8 grid grid-cols-2 gap-8 text-center break-inside-avoid">
                              <div>
                                <div className="border-b border-slate-400 h-16 mx-8"></div>
                                <p className="mt-2 text-sm font-black text-slate-900">{managerProfile?.full_name || "Manajer / Atasan"}</p>
                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{managerProfile?.title || "Leadership Role"}</p>
                              </div>
                              <div>
                                <div className="border-b border-slate-400 h-16 mx-8"></div>
                                <p className="mt-2 text-sm font-black text-slate-900">{m.name}</p>
                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Karyawan / Anggota Tim</p>
                              </div>
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

          {/* GUIDE TAB */}
          {tab === "guide" && (
            <div className="space-y-10 sm:space-y-12 pb-8">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
                  <span className="text-sm sm:text-lg font-black text-white uppercase tracking-widest">Panduan LeaderLens</span>
                </div>
                <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                  LeaderLens dirancang berdasarkan metodologi manajemen SDM modern. Ia menggabungkan pemahaman gaya komunikasi dari <strong>Profil Perilaku DISC</strong> dengan diagnosis kinerja berbasis <strong>Matriks Skill vs Will (Kompetensi vs Komitmen)</strong>.
                </p>
              </div>
              <section>
                <h3 className="text-lg sm:text-2xl font-black text-white mb-6 flex items-center gap-3">
                  <Edit3 className="w-6 h-6 text-slate-400" /> 1. Cara Mengisi Form Penilaian
                </h3>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-8">
                  <div className="grid sm:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-black text-indigo-400 uppercase tracking-widest text-sm mb-3">Penilaian Kompetensi (Skill)</h4>
                      <ul className="text-sm text-slate-300 space-y-2">
                        <li><strong>1:</strong> Sering salah, sangat bergantung pada bantuan orang lain.</li>
                        <li><strong>2:</strong> Bisa melakukan tugas dasar, tapi tugas kompleks harus dibimbing.</li>
                        <li><strong>3:</strong> Mandiri, jarang membuat kesalahan fatal.</li>
                        <li><strong>4:</strong> Ahli, bisa bekerja lebih cepat dari target dan bisa mengajari junior.</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-black text-amber-400 uppercase tracking-widest text-sm mb-3">Penilaian Komitmen (Will)</h4>
                      <ul className="text-sm text-slate-300 space-y-2">
                        <li><strong>1:</strong> Sering menunda, banyak alasan, terlihat tidak peduli.</li>
                        <li><strong>2:</strong> Bekerja seadanya (bare minimum), tidak mau mengambil tugas ekstra.</li>
                        <li><strong>3:</strong> Rajin, menyelesaikan tugas tepat waktu tanpa perlu ditagih.</li>
                        <li><strong>4:</strong> Proaktif mencari solusi, antusias, menularkan semangat positif.</li>
                      </ul>
                    </div>
                  </div>
                  <div className="border-t border-slate-800 pt-8">
                    <h4 className="font-black text-white uppercase tracking-widest text-sm mb-3 flex items-center gap-2">
                      <Target className="w-5 h-5 text-emerald-400" /> Cara Menulis "Bukti Perilaku"
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5">
                        <div className="flex items-center gap-2 text-red-400 font-bold mb-3"><XCircle className="w-5 h-5" /> SALAH (Berbasis Opini)</div>
                        <ul className="text-sm text-slate-300 space-y-3">
                          <li>"Dia itu orangnya pemalas banget."</li>
                          <li>"Kerjaannya nggak pernah bener."</li>
                        </ul>
                      </div>
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5">
                        <div className="flex items-center gap-2 text-emerald-400 font-bold mb-3"><CheckCircle className="w-5 h-5" /> BENAR (Berbasis Fakta)</div>
                        <ul className="text-sm text-slate-300 space-y-3">
                          <li>"Terlambat laporan mingguan 3 kali bulan ini."</li>
                          <li>"5 kesalahan input data pada laporan Q3."</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
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
                          <p className="text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100"><strong>Akar Masalah:</strong><br/>{g.rootCause}</p>
                          <p className="text-red-700 bg-red-50 p-4 rounded-xl border border-red-100"><strong>Kesalahan Manajer:</strong><br/>{g.mistake}</p>
                        </div>
                        <p className="text-indigo-800 bg-indigo-50 p-4 rounded-xl border border-indigo-100 font-medium"><strong>Prioritas Tindakan:</strong> {g.urgency}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              <section>
                <h3 className="text-lg sm:text-2xl font-black text-white mb-6 flex items-center gap-3">
                  <Users className="w-6 h-6 text-slate-400" /> 3. Memahami Profil DISC
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {[
                    { id: "D", label: "Dominance", color: "border-red-500", dot: "bg-red-500", sub: "Fokus: Hasil & Kontrol", subColor: "text-red-600", tips: ["Termotivasi oleh tantangan, pencapaian, dan otoritas.", "Mengambil keputusan cepat dan berani mengambil risiko.", "Bicara langsung ke inti masalah. Hindari basa-basi."] },
                    { id: "I", label: "Influence", color: "border-amber-400", dot: "bg-amber-400", sub: "Fokus: Orang & Antusiasme", subColor: "text-amber-600", tips: ["Termotivasi oleh pengakuan sosial dan kerja tim.", "Sangat persuasif dan pandai mencairkan suasana.", "Libatkan secara emosional. Berikan apresiasi publik."] },
                    { id: "S", label: "Steadiness", color: "border-emerald-500", dot: "bg-emerald-500", sub: "Fokus: Kerja Sama & Konsistensi", subColor: "text-emerald-600", tips: ["Termotivasi oleh keamanan, harmoni, stabilitas.", "Pendengar baik, sabar, tidak suka perubahan mendadak.", "Pendekatan santai. Jelaskan perubahan secara bertahap."] },
                    { id: "C", label: "Compliance", color: "border-blue-500", dot: "bg-blue-500", sub: "Fokus: Akurasi & Kualitas", subColor: "text-blue-600", tips: ["Termotivasi oleh keahlian, standar tinggi, dan logika.", "Sangat analitis dan detail-oriented.", "Gunakan data dan fakta. Jangan feedback tanpa bukti."] },
                  ].map(d => (
                    <div key={d.id} className={`bg-white rounded-2xl p-6 border-l-8 ${d.color} text-slate-800 shadow-sm`}>
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-10 h-10 rounded-full ${d.dot} text-white font-black text-xl flex items-center justify-center`}>{d.id}</div>
                        <div>
                          <h4 className="font-black text-lg uppercase tracking-tight text-slate-900">{d.label}</h4>
                          <p className={`text-xs font-bold uppercase tracking-wider ${d.subColor}`}>{d.sub}</p>
                        </div>
                      </div>
                      <ul className="text-sm text-slate-600 space-y-2 list-disc pl-4">
                        {d.tips.map((t, i) => <li key={i}>{t}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
              <section>
                <h3 className="text-lg sm:text-2xl font-black text-white mb-6 flex items-center gap-3">
                  <FileText className="w-6 h-6 text-slate-400" /> 4. Mengisi Dokumen Tindak Lanjut
                </h3>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-4 text-sm sm:text-base text-slate-400 leading-relaxed">
                  <p>Pada tab <strong>Action Plan</strong>, Anda dapat mencetak dokumen tindak lanjut formal untuk setiap anggota tim.</p>
                  <p><strong>Cara menggunakannya:</strong> Cetak dokumen, duduk bersama anggota tim, sepakati 3-4 langkah perbaikan, tulis secara manual di garis yang tersedia, lalu tanda tangan bersama sebagai komitmen.</p>
                </div>
              </section>
            </div>
          )}

        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-sm w-full shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
              <Trash2 className="w-7 h-7 text-red-400" />
            </div>
            <h3 className="text-lg font-black text-white text-center mb-2">Hapus Anggota?</h3>
            <p className="text-sm text-slate-400 text-center mb-8">Data ini akan dihapus permanen dan tidak bisa dikembalikan.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 rounded-xl font-black text-sm uppercase tracking-widest bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all">
                Batal
              </button>
              <button onClick={() => confirmDelete(deleteConfirm)}
                className="flex-1 py-3 rounded-xl font-black text-sm uppercase tracking-widest bg-red-500 text-white hover:bg-red-600 transition-all">
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Input Form */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6 bg-black/80 backdrop-blur-sm">
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
                  <input required
                    className="w-full px-4 py-3 sm:py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm sm:text-base font-bold outline-none text-slate-900 focus:ring-2 focus:ring-slate-900 placeholder:text-slate-400"
                    placeholder="Nama Anggota" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                  <input
                    className="w-full px-4 py-3 sm:py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm sm:text-base font-bold outline-none text-slate-900 focus:ring-2 focus:ring-slate-900 placeholder:text-slate-400"
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
                  <button type="submit" disabled={isSubmitting}
                    className="w-full bg-slate-900 text-white py-4 sm:py-5 rounded-2xl font-black text-sm sm:text-base tracking-widest uppercase hover:bg-slate-800 active:scale-[0.98] transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSubmitting ? "Menyimpan..." : "Simpan Analisis"}
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
