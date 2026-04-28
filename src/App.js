import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Plus, Users, LayoutGrid, BookOpen, Trash2, Edit3, TrendingUp,
  Target, Award, X, PlusCircle, CheckCircle2, AlertTriangle,
  Wrench, ShieldAlert, MessageCircle, ChevronDown, Calendar,
  BarChart3, Lightbulb, ArrowRight, Clock, RefreshCw, Info, Lock, Key,
  Printer, FileText, CheckCircle, XCircle, LogOut
} from "lucide-react";

// ── Inisialisasi Supabase ────────────────────────────────────────────────────
const supabaseUrl = 'https://bervlosjswfmqhxisikn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlcnZsb3Nqc3dmbXFoeGlzaWtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyODkyMjEsImV4cCI6MjA5MTg2NTIyMX0.IHTyFaCz7ExiHs7KSGaOnK3jdXXU7c47tcGHxOlKtME';
const supabase = createClient(supabaseUrl, supabaseKey);

// ── helpers ──────────────────────────────────────────────────────────────────
const getQuadrant = (comp, comm) => {
  const hi = v => v >= 3;
  if (!hi(comp) && !hi(comm)) return { id: "Q1", label: "Critical Area",    color: "#EF4444", bg: "#FEF2F2", border: "#FECACA", text: "#991B1B", dot: "bg-red-500"    };
  if (!hi(comp) &&  hi(comm)) return { id: "Q2", label: "Potential Talent", color: "#F59E0B", bg: "#FFFBEB", border: "#FDE68A", text: "#92400E", dot: "bg-amber-500"  };
  if ( hi(comp) && !hi(comm)) return { id: "Q3", label: "Expert in Slump",  color: "#3B82F6", bg: "#EFF6FF", border: "#BFDBFE", text: "#1E40AF", dot: "bg-blue-500"   };
  return                                { id: "Q4", label: "Star Performer",   color: "#10B981", bg: "#ECFDF5", border: "#A7F3D0", text: "#065F46", dot: "bg-emerald-500" };
};

const getDocumentTitle = (qId) => {
  if (qId === "Q1") return "PERFORMANCE ALIGNMENT PLAN"; // Mengganti nama PIP yang berisiko legal
  if (qId === "Q2") return "ACCELERATED DEVELOPMENT PLAN";
  if (qId === "Q3") return "RE-ENGAGEMENT & SUPPORT PLAN";
  return "TALENT RETENTION & GROWTH PLAN";
};

const DISC_META = {
  D: { 
    label: "Dominance", color: "#EF4444", bg: "bg-red-500", light: "bg-red-50 text-red-700", desc: "Fokus hasil & kontrol",
    strengths: "Eksekusi cepat tanpa banyak basa-basi, berani ambil keputusan sulit di saat orang lain ragu, sangat efektif dalam situasi krisis atau tenggat ketat, dan punya drive internal yang kuat untuk melampaui target.",
    weaknesses: "Cenderung mengabaikan proses dan perasaan orang lain demi hasil, bisa terkesan otoriter atau intimidatif tanpa disadari, sulit menerima feedback yang terasa seperti serangan personal, dan berisiko burn out anggota tim yang lebih lambat."
  },
  I: { 
    label: "Influence", color: "#F59E0B", bg: "bg-amber-400", light: "bg-amber-50 text-amber-700", desc: "Fokus antusiasme & orang",
    strengths: "Kemampuan membangun relasi dan kepercayaan dengan sangat cepat, jago mengubah suasana tim yang lesu menjadi bersemangat, sangat efektif sebagai jembatan antara divisi atau kepentingan yang berbeda, dan punya intuisi sosial yang kuat.",
    weaknesses: "Rentan mengikuti mood — performanya bisa naik-turun drastis tergantung suasana hati, cenderung over-promise karena tidak ingin mengecewakan, lemah dalam follow-through pada tugas yang bersifat administratif atau repetitif, dan bisa mendominasi percakapan tanpa menyadarinya."
  },
  S: { 
    label: "Steadiness", color: "#10B981", bg: "bg-emerald-500", light: "bg-emerald-50 text-emerald-700", desc: "Fokus kerja sama & sabar",
    strengths: "Tulang punggung tim yang sesungguhnya — konsisten, dapat diandalkan, dan jarang membuat drama. Pendengar aktif yang membuat anggota tim lain merasa aman untuk berbicara, sangat efektif dalam peran yang membutuhkan kesabaran dan ketelitian jangka panjang.",
    weaknesses: "Sangat menghindari konflik hingga masalah kecil bisa menumpuk diam-diam, lambat beradaptasi pada perubahan mendadak dan butuh waktu untuk 'mencerna', sulit berkata tidak meskipun sudah kelebihan beban kerja, dan cenderung memendam ketidakpuasan daripada mengungkapkannya."
  },
  C: { 
    label: "Compliance", color: "#3B82F6", bg: "bg-blue-500", light: "bg-blue-50 text-blue-700", desc: "Fokus akurasi & kualitas",
    strengths: "Standar kualitas tertinggi di tim — mereka yang pertama menangkap kesalahan sebelum menjadi masalah besar. Sangat sistematis, mampu berpikir beberapa langkah ke depan, dan menjadi aset berharga dalam pekerjaan yang membutuhkan presisi tinggi atau analisis mendalam.",
    weaknesses: "Rentan analysis paralysis — sulit mengambil keputusan jika data dirasa belum cukup, cenderung kritis terhadap ide orang lain tanpa menawarkan solusi alternatif, bisa terkesan dingin atau tidak peduli padahal sebenarnya sangat fokus, dan perfeksionisme mereka bisa memperlambat ritme tim."
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

const getActionPlan = (m) => {
  m = { 
    ...m, 
    competencyNotes: Array.isArray(m.competencyNotes) ? m.competencyNotes : (m.competencyNotes ? [m.competencyNotes] : [""]),
    commitmentNotes: Array.isArray(m.commitmentNotes) ? m.commitmentNotes : (m.commitmentNotes ? [m.commitmentNotes] : [""]),
  };

  const q = getQuadrant(m.competency, m.commitment);
  const selectedDisc = m.disc || "?"; 
  const script = getDISCScript(selectedDisc);
  const discData = DISC_META[selectedDisc];
  const plan = [];

  plan.push({
    type: "profile",
    title: `Panduan Interaksi 1-on-1: Pendekatan ${discData.label}`,
    color: discData.color,
    bg: "#F8FAFC",
    border: "#E2E8F0",
    icon: "info",
    items: [
      `FOKUS MINGGU INI: Jadwalkan sesi 1-on-1 (30 menit). Fokus mendengarkan. Buka percakapan dengan: "${script.open}"`,
      `GAYA KOMUNIKASI YANG DIREKOMENDASIKAN: ${script.body}`,
      `YANG PERLU DIHINDARI: ${script.avoid}`
    ],
  });

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

// teamHealthScore: max compAvg + commAvg = 4 + 4 = 8
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
    <label className="block text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest">Profil Komunikasi (Opsional)</label>
    <div className="grid grid-cols-5 gap-1 sm:gap-2">
      {Object.entries(DISC_META).map(([id, m]) => (
        <button key={id} type="button" onClick={() => onChange(id)}
          className={`flex flex-col items-center p-1 sm:p-3 rounded-xl sm:rounded-2xl border-2 transition-all ${value === id ? "border-slate-900 bg-slate-50 shadow-md scale-105" : "border-slate-100 bg-white hover:border-slate-200"}`}>
          <div className={`w-6 h-6 sm:w-10 sm:h-10 rounded-full mb-1 sm:mb-2 ${m.bg} flex items-center justify-center text-white text-xs sm:text-lg font-black shadow`}>{id}</div>
          <span className="text-[8px] sm:text-[11px] font-black uppercase text-slate-500 leading-tight text-center">{m.label}</span>
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
    diagnosis: "Anggota tim tidak memiliki kemampuan DAN motivasi yang memadai secara bersamaan. Ini adalah situasi paling kompleks dan paling berisiko yang bisa dihadapi seorang manajer — dan sayangnya, juga yang paling sering ditangani dengan cara yang salah.",
    rootCause: "Q1 jarang terjadi begitu saja. Ini biasanya hasil dari salah satu dari tiga skenario: (1) Salah rekrut — orang yang tepat di posisi yang salah, atau orang yang salah di posisi apapun. (2) Burnout ekstrem yang tidak pernah ditangani hingga menggerus kompetensi sekalipun. (3) Seseorang yang sudah lama berada di posisi yang salah dan sudah terlalu lama dibiarkan tanpa intervensi.",
    mistake: "Kesalahan paling umum: manajer yang fokus pada satu dimensi saja. Mereka yang 'percaya pada potensi' terus memberi training kepada orang yang sebenarnya sudah tidak mau. Sementara manajer yang 'fokus pada hasil' terus memberi target tanpa menyadari bahwa kapabilitas dasarnya memang tidak ada. Keduanya salah. Q1 membutuhkan intervensi ganda yang terstruktur dan sabar.",
    urgency: "Intervensi harus dimulai dalam 7 hari. Bukan karena harus buru-buru memecat, tapi karena membiarkan Q1 terlalu lama tanpa penanganan akan merusak moral seluruh tim yang melihat situasi ini dibiarkan. Mulai dengan percakapan diagnostik yang jujur — pahami akarnya dulu sebelum intervensi.",
  },
  {
    q: "Q2", label: "Potential Talent", color: "#F59E0B", bg: "#FFFBEB",
    diagnosis: "Motivasi tinggi, kemampuan belum memadai. Paling sering terjadi pada karyawan baru, yang baru dipromosikan, atau yang baru pindah divisi. Ini sebenarnya situasi yang paling mudah ditangani — jika manajer bergerak cepat.",
    rootCause: "Bukan masalah karakter atau attitude. Mereka belum memiliki tools, pengetahuan, atau pengalaman yang dibutuhkan untuk perform di level yang diharapkan. Energi dan kemauan ada — tinggal arahkan dengan struktur yang tepat.",
    mistake: "Kesalahan paling mahal: membiarkan mereka 'sink or swim' karena manajer terlalu sibuk atau terlalu yakin bahwa antusiasme mereka akan menutupi gap skill-nya. Tanpa struktur pembelajaran yang jelas, antusiasme akan habis dalam 60-90 hari dan mereka akan menyeberang ke Q1 — kali ini dengan rasa kecewa yang sulit dipulihkan.",
    urgency: "Golden window adalah 90 hari pertama. Buat learning plan yang konkret dalam minggu pertama, pasangkan dengan mentor yang tepat, dan jadwalkan check-in reguler. Investasi waktu di fase ini akan menghasilkan anggota Q4 dalam 6-12 bulan.",
  },
  {
    q: "Q3", label: "Expert in Slump", color: "#3B82F6", bg: "#EFF6FF",
    diagnosis: "Kemampuan tinggi, motivasi turun drastis. Ini adalah kuadran yang paling sering salah didiagnosis dan paling sering ditangani dengan cara yang memperburuk keadaan. Anggota Q3 bukan orang bermasalah — mereka adalah aset yang sedang dalam krisis tersembunyi.",
    rootCause: "Selalu ada sesuatu yang spesifik yang memadamkan motivasi mereka. Penyebab paling umum: merasa kontribusinya tidak dilihat atau dihargai oleh atasan. Konflik yang tidak pernah diselesaikan secara tuntas. Merasa stuck — tidak ada jalur karir yang jelas atau tantangan baru yang bermakna. Masalah personal di luar pekerjaan yang meluber ke performa. Nilai pribadi yang bergesekan dengan budaya atau keputusan organisasi yang dirasa tidak etis atau tidak adil.",
    mistake: "Kesalahan yang paling merusak: memperlakukan Q3 seperti Q1. Memberikan training tambahan kepada orang yang sudah ahli terasa seperti penghinaan. Menerapkan monitoring ketat kepada orang yang sudah lama dipercaya akan menghancurkan sisa kepercayaan yang ada. Kedua pendekatan ini hampir pasti mempercepat keputusan mereka untuk resign.",
    urgency: "Lakukan percakapan coaching yang dalam dalam 48 jam setelah Anda mengidentifikasi pola ini. Bukan evaluasi performa — percakapan manusia ke manusia. Setiap minggu yang terlewat tanpa penanganan adalah satu minggu lebih dekat ke surat resign.",
  },
  {
    q: "Q4", label: "Star Performer", color: "#10B981", bg: "#ECFDF5",
    diagnosis: "Kemampuan dan motivasi sama-sama tinggi. Mereka adalah 20% anggota tim yang menghasilkan 80% hasil terbaik. Kehilangan satu anggota Q4 — dalam hal produktivitas, pengetahuan institusional, dan dampak pada moral tim — bisa setara dengan kehilangan tiga anggota biasa.",
    rootCause: "Risiko utama Q4 bukan performa — tapi retensi. Mereka sering diabaikan justru karena 'tidak perlu dikhawatirkan'. Padahal kebutuhan mereka untuk berkembang, diakui, dan ditantang terus bertumbuh. Ketika kebutuhan itu tidak terpenuhi, mereka tidak mengeluh — mereka langsung mencari peluang lain.",
    mistake: "Dua kesalahan fatal: Pertama, membebani mereka dengan pekerjaan ekstra karena 'mereka pasti bisa' — tanpa kompensasi atau pengakuan yang setara. Kedua, tidak pernah membicarakan karir mereka secara proaktif karena asumsi bahwa mereka pasti puas. Dua kesalahan ini, jika terjadi bersamaan, hampir pasti berujung pada turnover dalam 12-18 bulan.",
    urgency: "Jadwalkan percakapan karir formal minimal setiap kuartal. Ini bukan kemewahan — ini keharusan strategis. Manajer yang tidak punya waktu untuk anggota Q4-nya akan segera punya banyak waktu karena mereka sudah tidak ada.",
  },
];

// ── KOMPONEN SUPABASE AUTH GATE ───────────────────────────────────────────────────
// PRODUCTION MODE: signup ditutup — akun hanya dibuat via admin/webhook Scalev
// Untuk membuka signup kembali (saat onboarding manual), ubah ke: true
const SIGNUP_OPEN = false;

const SupabaseAuthGate = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    if (isLogin) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else onLoginSuccess(data.session);
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert([{
          id: data.user.id,
          full_name: fullName,
          title: title,
          company: company
        }]);
        if (profileError) {
          setError("Akun dibuat, tapi gagal menyimpan profil: " + profileError.message);
        } else if (data.session) {
          onLoginSuccess(data.session);
        } else {
          setSuccessMsg("Akun berhasil dibuat! Silakan cek email Anda untuk konfirmasi sebelum login.");
          setIsLogin(true);
        }
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[32px] p-8 sm:p-10 shadow-2xl">
        <div className="text-center mb-8">
          <div className="text-2xl sm:text-3xl font-black text-white">LEADER<span className="text-slate-400">LENS</span></div>
          <div className="text-xs text-slate-500 font-mono mt-2">{isLogin ? "Silakan Masuk" : "Buat Akun Manajer"}</div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && SIGNUP_OPEN && (
            <>
              <input required type="text" placeholder="Nama Lengkap" value={fullName} onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500" />
              <input required type="text" placeholder="Jabatan (Misal: Sales Manager)" value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500" />
              <input required type="text" placeholder="Nama Perusahaan" value={company} onChange={(e) => setCompany(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500" />
            </>
          )}
          <input required type="email" placeholder="Alamat Email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500" />
          <input required type="password" placeholder="Password (Min. 6 karakter)" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500" />
          {error && <p className="text-xs text-red-500 font-bold text-center">{error}</p>}
          {successMsg && <p className="text-xs text-emerald-400 font-bold text-center">{successMsg}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-white text-slate-900 py-3.5 rounded-xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all disabled:opacity-50">
            {loading ? "Memproses..." : (isLogin ? "Masuk" : "Daftar & Buat Profil")}
          </button>
        </form>
        <div className="mt-6 text-center">
          {SIGNUP_OPEN ? (
            <button onClick={() => { setIsLogin(!isLogin); setError(""); setSuccessMsg(""); }} className="text-xs text-slate-400 hover:text-white transition-colors">
              {isLogin ? "Belum punya akun? Daftar di sini" : "Sudah punya akun? Masuk di sini"}
            </button>
          ) : (
            <p className="text-xs text-slate-600">
              Akses diberikan setelah pembelian. Hubungi kami jika ada kendala.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// ── MAIN APP ──────────────────────────────────────────────────────────────
const EMPTY_FORM = { name: "", role: "", competency: 3, commitment: 3, competencyNotes: [""], commitmentNotes: [""], disc: "S" };

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
      const newId = crypto.randomUUID();
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
    const { error } = await supabase.from('members').delete().eq('id', id).eq('manager_id', session.user.id);
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
                          
                          {/* ========================================================= */}
                          {/* HALAMAN 1: KHUSUS MANAJER (Tetap Lega seperti asli)       */}
                          {/* ========================================================= */}
                          <div className="p-8 sm:p-12">
                            <div className="border-b-2 border-slate-900 pb-4 mb-6 text-center">
                              <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight text-slate-900 mb-1">1-on-1 Alignment Guide</h1>
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{managerProfile?.company || "Dokumen Pengembangan Tim"}</p>
                              <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mt-2">Kolaboratif — Diskusikan Bersama Karyawan</p>
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

                          {/* ========================================================= */}
                          {/* HALAMAN 2: UNTUK ANGGOTA TIM (1-Kolom, Padat & Rapi)        */}
                          {/* ========================================================= */}
                          <div className="p-6 sm:p-10 border-t-8 border-slate-900" style={{ pageBreakBefore: 'always' }}>
                            
                            {/* Header - Diperkecil Marginnya */}
                            <div className="border-b-2 border-slate-900 pb-3 mb-5 text-center">
                              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900 mb-1">{getDocumentTitle(q.id)}</h1>
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Kolaboratif — Diskusikan & Sepakati Bersama</p>
                            </div>
                            
                            {/* Info Grid - Lebih Rapat */}
                            <div className="grid grid-cols-2 gap-3 mb-5 text-xs sm:text-sm bg-slate-50 p-4 rounded-xl border border-slate-200">
                              <div>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-0.5">Nama Karyawan</p>
                                <p className="font-black text-slate-900">{m.name} <span className="font-medium text-slate-600">{m.role ? `— ${m.role}` : ""}</span></p>
                              </div>
                              <div>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-0.5">Tanggal</p>
                                <p className="font-black text-slate-900">{formatDate(Date.now())}</p>
                              </div>
                              <div className="mt-1">
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-0.5">Disiapkan Oleh</p>
                                <p className="font-black text-slate-900">{managerProfile?.full_name}</p>
                              </div>
                              <div className="mt-1">
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-0.5">Fokus Pengembangan</p>
                                <p className="font-black" style={{ color: q.color }}>{q.label}</p>
                              </div>
                            </div>

                            {/* Section I - Digabung dalam 1 kotak agar hemat tempat */}
                            <div className="mb-5 break-inside-avoid">
                              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 mb-2">I. Observasi Kinerja Terkini</h3>
                              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="mb-4">
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Fakta Kompetensi Teknis</p>
                                  <ul className="list-disc pl-4 text-xs sm:text-sm text-slate-700 space-y-1">
                                    {m.competencyNotes.map((note, i) => <li key={i}>{note || "-"}</li>)}
                                  </ul>
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Fakta Komitmen & Sikap</p>
                                  <ul className="list-disc pl-4 text-xs sm:text-sm text-slate-700 space-y-1">
                                    {m.commitmentNotes.map((note, i) => <li key={i}>{note || "-"}</li>)}
                                  </ul>
                                </div>
                              </div>
                            </div>

                            {/* Section II - Jarak antar garis dirapatkan */}
                            <div className="break-inside-avoid">
                              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 mb-1">II. Rencana Tindakan (Disepakati Bersama)</h3>
                              <p className="text-[10px] sm:text-xs text-slate-500 mb-4 italic">Tindakan spesifik, target terukur, dan tenggat waktu.</p>
                              <div className="space-y-6">
                                <div className="border-b border-slate-400 h-5 flex items-end"><span className="text-xs font-bold text-slate-800 ml-2">1.</span></div>
                                <div className="border-b border-slate-400 h-5 flex items-end"><span className="text-xs font-bold text-slate-800 ml-2">2.</span></div>
                                <div className="border-b border-slate-400 h-5 flex items-end"><span className="text-xs font-bold text-slate-800 ml-2">3.</span></div>
                              </div>
                            </div>

                            {/* Area Tanda Tangan - Dikurangi margin atasnya */}
                            <div className="mt-10 pt-4 grid grid-cols-2 gap-8 text-center break-inside-avoid">
                              <div>
                                <div className="border-b border-slate-400 h-10 mx-6"></div>
                                <p className="mt-1.5 text-xs font-black text-slate-900">{managerProfile?.full_name || "Manajer"}</p>
                                <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Atasan</p>
                              </div>
                              <div>
                                <div className="border-b border-slate-400 h-10 mx-6"></div>
                                <p className="mt-1.5 text-xs font-black text-slate-900">{m.name}</p>
                                <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Karyawan</p>
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

{/* GUIDE TAB - With Enhanced DISC Section */}
{tab === "guide" && (
  <div className="space-y-10 sm:space-y-12 pb-8">
    
    {/* Welcome / Big Picture - unchanged from previous suggestion */}
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 text-center">
      <div className="flex items-center justify-center gap-3 mb-6">
        <BookOpen className="w-8 h-8 text-emerald-400" />
        <span className="text-2xl sm:text-3xl font-black text-white">Selamat Datang di LeaderLens</span>
      </div>
      <p className="max-w-2xl mx-auto text-slate-300 text-lg leading-relaxed">
        LeaderLens membantu Anda memahami tim dengan cepat dan membangun rencana pengembangan yang <strong>kolaboratif</strong>, bukan sekadar evaluasi.
      </p>
      <p className="text-emerald-400 font-medium mt-4">Tujuannya: Setiap anggota tim merasa didukung, bukan dinilai.</p>
    </div>

    {/* 1. Alur Kerja - unchanged */}
    <section>
      <h3 className="text-xl sm:text-2xl font-black text-white mb-6 flex items-center gap-3">
        <Lightbulb className="w-7 h-7 text-amber-400" /> 
        1. Alur Kerja yang Direkomendasikan
      </h3>
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-7 space-y-6">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-black flex-shrink-0">1</div>
            <div>
              <div className="font-semibold text-white">Update Penilaian</div>
              <p className="text-sm text-slate-400 mt-1">Lakukan rating Kompetensi & Komitmen setiap 4–6 minggu. Tulis bukti fakta (bukan opini).</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-black flex-shrink-0">2</div>
            <div>
              <div className="font-semibold text-white">Buka Action Plan</div>
              <p className="text-sm text-slate-400 mt-1">Pilih mode “Kolaboratif” lalu cetak halaman kedua untuk didiskusikan bersama karyawan.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-black flex-shrink-0">3</div>
            <div>
              <div className="font-semibold text-white">Diskusi 1-on-1</div>
              <p className="text-sm text-slate-400 mt-1">Gunakan script pembuka yang disediakan. Dengarkan lebih banyak daripada bicara.</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-7">
          <h4 className="font-bold text-emerald-400 mb-4">Tips Cepat untuk Manajer Sibuk</h4>
          <ul className="space-y-4 text-sm text-slate-300">
            <li className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
              Mulai dengan 1–2 orang dulu, jangan langsung seluruh tim.
            </li>
            <li className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
              Catatan bukti boleh singkat — yang penting faktual.
            </li>
            <li className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
              Rayakan kemajuan kecil. Ini membangun kepercayaan.
            </li>
            <li className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
              Jadwalkan review bulanan singkat (15 menit per orang).
            </li>
          </ul>
        </div>
      </div>
    </section>

    {/* 2. Matriks - unchanged from previous */}
    <section>
      <h3 className="text-xl sm:text-2xl font-black text-white mb-6 flex items-center gap-3">
        <LayoutGrid className="w-7 h-7 text-slate-400" /> 
        2. Memahami 4 Kuadran Tim Anda
      </h3>
      <div className="grid gap-6 sm:gap-8">
        {QUADRANT_GUIDE.map(g => (
          <div key={g.q} className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm text-slate-800">
            <div className="p-6 flex items-center gap-5 font-bold text-lg" style={{ background: g.bg }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-2xl" style={{ background: g.color }}>
                {g.q}
              </div>
              <div>{g.label}</div>
            </div>
            <div className="p-6 space-y-5 text-sm">
              <p className="font-medium">{g.diagnosis}</p>
              <div className="grid sm:grid-cols-2 gap-5 text-xs sm:text-sm">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <strong className="block text-slate-500 mb-2">Mengapa terjadi?</strong>
                  {g.rootCause}
                </div>
                <div className="bg-rose-50 p-5 rounded-2xl border border-rose-100">
                  <strong className="block text-rose-600 mb-2">Kesalahan yang sering dilakukan</strong>
                  {g.mistake}
                </div>
              </div>
              <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                <strong className="text-emerald-700">Langkah pertama yang paling penting:</strong> {g.urgency}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* 3. ENHANCED DISC SECTION - This is the only part we expanded */}
    <section>
      <h3 className="text-xl sm:text-2xl font-black text-white mb-6 flex items-center gap-3">
        <Users className="w-7 h-7 text-slate-400" /> 
        3. Memahami Profil Komunikasi DISC
      </h3>
      <p className="text-slate-400 mb-8 max-w-3xl">
        DISC membantu Anda menyesuaikan gaya komunikasi agar pesan lebih mudah diterima. 
        Pilih tipe yang paling mendekati perilaku karyawan. Gunakan ini sebagai panduan fleksibel, bukan label tetap.
      </p>

      <div className="grid grid-cols-1 gap-8">
        {Object.entries(DISC_META).map(([id, data]) => (
          <div key={id} className="bg-white rounded-3xl p-8 border-l-8 shadow-sm" style={{ borderColor: data.color }}>
            <div className="flex items-start gap-6 mb-8">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl font-black text-white flex-shrink-0`} 
                   style={{ backgroundColor: data.color }}>
                {id}
              </div>
              <div className="pt-1">
                <h4 className="font-black text-2xl text-slate-900">{data.label}</h4>
                <p className="text-slate-500 mt-1">{data.desc}</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-8">
              {/* Strengths */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  <span className="font-bold uppercase tracking-widest text-emerald-600 text-sm">Kekuatan Utama</span>
                </div>
                <p className="text-slate-700 leading-relaxed">{data.strengths}</p>
              </div>

              {/* Weaknesses */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-6 h-6 text-amber-500" />
                  <span className="font-bold uppercase tracking-widest text-amber-600 text-sm">Area yang Perlu Diwaspadai</span>
                </div>
                <p className="text-slate-700 leading-relaxed">{data.weaknesses}</p>
              </div>
            </div>

            {/* Practical Tips */}
            <div className="mt-10 pt-8 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-5">
                <MessageCircle className="w-6 h-6 text-indigo-500" />
                <span className="font-bold uppercase tracking-widest text-indigo-600 text-sm">Cara Berkomunikasi Efektif</span>
              </div>
              <ul className="space-y-4 text-sm text-slate-700">
                <li className="flex gap-4">
                  <span className="text-emerald-500 font-black mt-1">→</span>
                  <span><strong>Buka percakapan dengan:</strong> "{getDISCScript(id).open}"</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-emerald-500 font-black mt-1">→</span>
                  <span><strong>Isi diskusi yang paling efektif:</strong> {getDISCScript(id).body}</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-rose-500 font-black mt-1">→</span>
                  <span><strong>Hindari:</strong> {getDISCScript(id).avoid}</span>
                </li>
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* 4. Cara Mengisi & Diskusi - unchanged */}
    <section>
      <h3 className="text-xl sm:text-2xl font-black text-white mb-6 flex items-center gap-3">
        <FileText className="w-7 h-7 text-slate-400" /> 
        4. Cara Mengisi & Melakukan Diskusi
      </h3>
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-8 text-slate-300">
        <div>
          <h4 className="font-semibold text-white mb-3">Tips Menulis Bukti Perilaku</h4>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
              <div className="text-red-400 font-bold mb-3">Hindari</div>
              <ul className="space-y-2 text-sm">
                <li>• "Dia pemalas"</li>
                <li>• "Kerjanya tidak pernah bagus"</li>
              </ul>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6">
              <div className="text-emerald-400 font-bold mb-3">Gunakan</div>
              <ul className="space-y-2 text-sm">
                <li>• "Terlambat laporan 3 kali bulan ini"</li>
                <li>• "Proaktif membantu rekan saat deadline ketat"</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-700">
          <h4 className="font-semibold text-white mb-4">Saat Diskusi dengan Anggota Tim</h4>
          <ul className="space-y-4 text-sm">
            <li className="flex gap-4">
              <div className="text-emerald-400 mt-1">✓</div>
              <div>Mulai dengan apresiasi atau rasa ingin tahu, bukan kritik.</div>
            </li>
            <li className="flex gap-4">
              <div className="text-emerald-400 mt-1">✓</div>
              <div>Dengarkan 70–80% waktu. Tanyakan pendapat mereka terlebih dahulu.</div>
            </li>
            <li className="flex gap-4">
              <div className="text-emerald-400 mt-1">✓</div>
              <div>Gunakan halaman kedua dokumen (yang lebih ringkas) sebagai panduan bersama.</div>
            </li>
            <li className="flex gap-4">
              <div className="text-emerald-400 mt-1">✓</div>
              <div>Akhiri dengan kesepakatan tertulis dan jadwal review berikutnya.</div>
            </li>
          </ul>
        </div>
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