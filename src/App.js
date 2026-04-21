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
  if (qId === "Q1") return "PERFORMANCE IMPROVEMENT PLAN (PIP)";
  if (qId === "Q2") return "ACCELERATED DEVELOPMENT PLAN (ADP)";
  if (qId === "Q3") return "RE-ENGAGEMENT & ALIGNMENT PLAN";
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
    open: "Langsung dan tegas: 'Saya ingin bicara langsung soal hasil kerja kamu di [area spesifik]. Saya punya data yang perlu kita bahas bersama.'",
    body: "Fokus 100% pada dampak bisnis — angka, target, dan konsekuensi nyata. Hindari bahasa emosional. Beri mereka ruang untuk menawarkan solusi sendiri: 'Menurut kamu, apa langkah terbaik untuk memperbaiki ini?' Tipe D tidak mau diatur cara kerjanya — mereka mau dipegang pada hasilnya. Sepakati target yang terukur dan beri mereka otonomi penuh untuk mencapainya.",
    avoid: "Jangan pernah micro-manage atau mempertanyakan metode kerja mereka di depan orang lain — ini penghinaan bagi tipe D. Hindari percakapan yang berputar-putar atau terlalu banyak basa-basi. Jangan beri ultimatum emosional ('Saya kecewa dengan kamu') — ganti dengan konsekuensi faktual ('Jika target ini tidak tercapai minggu depan, kita perlu eskalasi ke level berikutnya').",
  },
  I: {
    open: "Mulai dengan koneksi personal: 'Sebelum kita mulai, saya ingin kamu tahu bahwa saya bicara ini justru karena saya percaya pada potensi kamu. Boleh kita ngobrol santai dulu?'",
    body: "Libatkan mereka secara emosional sejak awal sebelum masuk ke fakta performa. Gunakan cerita dan analogi, bukan tabel angka semata. Puji progres sekecil apapun secara spesifik dan tulus — tipe I sangat sensitif terhadap ketulusan. Ajak mereka brainstorm solusi bersama: 'Kalau kamu yang jadi manajerku, apa yang akan kamu lakukan?' Mereka akan lebih berkomitmen pada solusi yang mereka ikut ciptakan. Tutup dengan visi positif tentang masa depan mereka di tim.",
    avoid: "Jangan langsung buka dengan data dan angka tanpa konteks emosional — mereka akan defensif dan menutup diri. Hindari kritik di depan orang banyak; ini bisa merusak motivasi mereka secara permanen. Jangan biarkan percakapan terlalu panjang tanpa kesimpulan yang jelas — tipe I mudah terdistraksi dan keluar dari topik. Waspadai janji-janji manis dari mereka; pastikan semua komitmen ditulis dan ada deadline konkret.",
  },
  S: {
    open: "Ciptakan rasa aman terlebih dahulu: 'Saya ingin kita ngobrol berdua, dan saya ingin kamu tahu ini bukan sesi evaluasi formal. Saya hanya ingin memahami situasi kamu lebih baik, karena saya peduli dengan perkembangan kamu.'",
    body: "Beri waktu yang cukup — jangan terburu-buru. Mulai dengan pertanyaan terbuka yang genuinely ingin kamu ketahui jawabannya: 'Apa yang paling membuat kamu kesulitan belakangan ini?' Dengarkan benar-benar sebelum berbicara. Tipe S sering menyimpan masalah jauh lebih dalam dari yang terlihat di permukaan. Jika ada perubahan yang perlu dilakukan, jelaskan secara bertahap dengan alasan yang logis dan manusiawi. Sepakati langkah kecil yang realistis, bukan lompatan besar yang mengintimidasi.",
    avoid: "Jangan datang dengan agenda yang sudah kamu putuskan sendiri dan minta mereka 'setuju' — mereka akan setuju di permukaan tapi tidak berubah di dalam. Hindari perubahan mendadak tanpa penjelasan yang memadai. Jangan salahkan mereka di hadapan rekan kerja — ini luka yang lama sembuh bagi tipe S. Dan jangan terjebak oleh ketenangan mereka; 'baik-baik saja' dari mulut tipe S tidak selalu berarti baik-baik saja.",
  },
  C: {
    open: "Buka dengan data dan konteks yang jelas: 'Saya ingin mendiskusikan beberapa temuan yang saya dokumentasikan selama [periode waktu]. Saya sudah siapkan datanya, dan saya ingin mendengar perspektif analitis kamu tentang ini.'",
    body: "Bawa bukti konkret, tertulis, dan spesifik — tanpa data, percakapan ini tidak akan produktif bagi tipe C. Berikan mereka ruang untuk merespons secara analitis: 'Apa yang menurut kamu menjadi akar masalah dari pola ini?' Mereka sering sudah mengetahui masalahnya lebih dalam dari yang kamu kira. Hargai standar tinggi mereka sambil bantu mereka melihat kapan 'cukup baik' adalah pilihan strategis yang tepat. Beri waktu untuk berpikir — jangan paksa keputusan di tempat.",
    avoid: "Jangan pernah memberikan feedback tanpa data pendukung yang solid — mereka akan menantang setiap klaim yang tidak berdasar dan percakapan akan berubah menjadi debat. Hindari generalisasi seperti 'kamu selalu...' atau 'kamu tidak pernah...' — tipe C akan langsung mencari kontra-contoh. Jangan tunjukkan ketidakpastian atau inkonsistensi dalam standar yang kamu terapkan — mereka sangat sensitif terhadap ketidakadilan sistemik. Dan jangan terburu-buru meminta komitmen; beri mereka waktu 24 jam untuk memproses jika keputusannya besar.",
  },
}[disc]);

const getActionPlan = (m) => {
  m = { 
    ...m, 
    competencyNotes: Array.isArray(m.competencyNotes) ? m.competencyNotes : (m.competencyNotes ? [m.competencyNotes] : [""]),
    commitmentNotes: Array.isArray(m.commitmentNotes) ? m.commitmentNotes : (m.commitmentNotes ? [m.commitmentNotes] : [""]),
  };

  const q = getQuadrant(m.competency, m.commitment);
  const script = getDISCScript(m.disc || "S");
  const discData = DISC_META[m.disc || "S"];
  const plan = [];

  plan.push({
    type: "profile",
    title: `Analisis Karakter: Tipe ${m.disc || "S"} — ${discData.label}`,
    color: discData.color,
    bg: "#F8FAFC",
    border: "#E2E8F0",
    icon: "info",
    items: [
      `KEKUATAN UTAMA YANG PERLU DIMANFAATKAN: ${discData.strengths}`,
      `AREA BLIND SPOT YANG PERLU DIWASPADAI: ${discData.weaknesses}`,
      `IMPLIKASI MANAJERIAL: Semua intervensi dalam dokumen ini — baik skill maupun motivasi — harus disesuaikan dengan gaya komunikasi tipe ${m.disc || "S"}. Menggunakan pendekatan yang salah bisa memperburuk situasi meskipun niatnya benar.`
    ],
  });

  if (m.competency < 3) {
    plan.push({
      type: "skill",
      title: "Intervensi Kompetensi (Skill Gap)",
      color: "#6366F1",
      bg: "#EEF2FF",
      border: "#C7D2FE",
      icon: "wrench",
      items: [
        `DIAGNOSIS SPESIFIK: Berdasarkan observasi, gap kompetensi terpusat pada: "${m.competencyNotes?.[0] || "area tugas utama"}". Langkah pertama adalah memisahkan mana yang gap pengetahuan (tidak tahu caranya), gap keterampilan (tahu tapi belum terampil), dan gap sumber daya (tahu dan mau, tapi tidak punya tools/akses yang dibutuhkan).`,
        m.disc === "C"
          ? "PENDEKATAN UNTUK TIPE C: Buat panduan kerja tertulis yang sangat detail dengan standar output yang jelas — contoh pekerjaan yang 'benar' vs 'salah' secara visual. Tipe C belajar paling efektif dari sistem dan referensi yang bisa mereka pelajari secara mandiri. Hindari OJT yang terlalu informal."
          : m.disc === "D"
          ? "PENDEKATAN UNTUK TIPE D: Berikan proyek kecil dengan authority penuh dan biarkan mereka menemukan caranya sendiri. Tetapkan standar output yang jelas di awal, tapi jangan atur prosesnya. Debrief hasil dengan pertanyaan: 'Apa yang akan kamu lakukan berbeda?' — mereka belajar paling cepat dari refleksi atas pengalaman nyata."
          : m.disc === "I"
          ? "PENDEKATAN UNTUK TIPE I: Gunakan metode pembelajaran yang sosial dan experiential — roleplay, diskusi kelompok, atau shadowing dengan rekan yang mereka kagumi. Gamifikasi progres mereka dan berikan pengakuan publik atas setiap milestone yang tercapai. Hindari modul belajar mandiri yang terlalu kering."
          : "PENDEKATAN UNTUK TIPE S: Dampingi secara langsung (OJT) dengan mentor yang sabar dan tidak intimidatif. Buat milestone yang kecil dan realistis — kesuksesan bertahap membangun kepercayaan diri mereka. Pastikan mereka tahu bahwa membuat kesalahan dalam proses belajar adalah sesuatu yang aman.",
        "STRUKTUR MONITORING: Lakukan check-in mingguan yang singkat (15 menit) untuk membahas progres dan hambatan. Dokumentasikan setiap perkembangan — baik positif maupun negatif — sebagai baseline objektif untuk evaluasi bulan berikutnya.",
        "TARGET 30-60-90 HARI: Bulan 1 — kuasai kompetensi dasar level minimal. Bulan 2 — bisa menjalankan tugas secara mandiri tanpa supervisi aktif. Bulan 3 — performa konsisten dan bisa menjelaskan proses kerjanya kepada rekan lain.",
      ],
    });
  }

  if (m.commitment < 3) {
    plan.push({
      type: "will",
      title: "Intervensi Motivasi (Will Gap)",
      color: "#F59E0B",
      bg: "#FFFBEB",
      border: "#FDE68A",
      icon: "message",
      items: [
        `DIAGNOSIS PENTING — TANYA SEBELUM ASUMSI: Komitmen rendah bisa berasal dari banyak sumber yang berbeda: merasa tidak dihargai, konflik interpersonal yang tidak terselesaikan, ketidakcocokan antara nilai pribadi dan budaya tim, masalah di luar pekerjaan, atau sekadar boredom karena merasa under-challenged. Jangan langsung intervensi sebelum tahu akar masalahnya. Fakta yang tercatat: "${m.commitmentNotes?.[0] || "pola komitmen rendah"}".`,
        `PEMBUKA PERCAKAPAN YANG TEPAT (Sesuai DISC ${m.disc || "S"}): ${script.open}`,
        `ISI PERCAKAPAN: ${script.body}`,
        `YANG HARUS DIHINDARI: ${script.avoid}`,
        "PERTANYAAN DIAGNOSTIK KUNCI untuk digali dalam sesi 1-on-1: (1) 'Apa bagian dari pekerjaan ini yang paling membuat kamu bersemangat — dan apa yang paling menguras energi kamu?' (2) 'Kalau ada satu hal yang bisa saya ubah sebagai manajermu untuk membuat kamu bisa bekerja lebih baik, apa itu?' (3) 'Di mana kamu melihat dirimu dalam 2 tahun ke depan — dan apakah posisi ini membantu kamu ke sana?'",
      ],
    });
  }

  if (q.id === "Q1") {
    plan.push({
      type: "pip",
      title: "Protokol PIP — Intervensi Ganda (Skill + Will)",
      color: "#EF4444",
      bg: "#FEF2F2",
      border: "#FECACA",
      icon: "shield",
      items: [
        "PERINGATAN MANAJERIAL: Q1 adalah situasi paling kompleks karena membutuhkan intervensi pada dua dimensi secara bersamaan. Kesalahan paling fatal adalah hanya fokus pada satu dimensi — memberi training kepada orang yang sebenarnya sudah tidak termotivasi, atau terus memberi penyemangat kepada orang yang memang tidak punya kapabilitas dasar.",
        "MINGGU 1–2 (Klarifikasi): Lakukan percakapan diagnostik mendalam untuk memahami akar masalah dari KEDUA dimensi. Jangan langsung masuk ke mode 'perbaikan' — pemahaman yang salah akan menghasilkan intervensi yang salah. Dokumentasikan temuan secara tertulis.",
        "BULAN 1–3 (Intervensi Aktif): Jalankan program skill-building yang terstruktur (lihat bagian Intervensi Kompetensi) BERSAMAAN dengan sesi coaching motivasional mingguan. Tetapkan target mingguan yang SMART dan lakukan review setiap Jumat. Semua target dan progres harus didokumentasikan secara tertulis dan ditandatangani bersama.",
        "BULAN 3–6 (Evaluasi & Keputusan): Jika ada progres yang konsisten di kedua dimensi — lanjutkan dengan target yang ditingkatkan. Jika hanya progress di satu dimensi — identifikasi mana yang stagnan dan eskalasi intervensi di area tersebut. Jika tidak ada progres di kedua dimensi setelah intervensi yang sungguh-sungguh — pertimbangkan mutasi peran atau eskalasi ke proses formal HR.",
        "CATATAN LEGAL & HR: Seluruh proses PIP harus didokumentasikan dengan baik — termasuk intervensi yang sudah diberikan, respons karyawan, dan keputusan yang diambil. Ini melindungi perusahaan dan memastikan proses yang adil bagi karyawan.",
      ],
    });
  }

  if (q.id === "Q2") {
    plan.push({
      type: "development",
      title: "Protokol Pengembangan Dipercepat — Golden Window 90 Hari",
      color: "#F59E0B",
      bg: "#FFFBEB",
      border: "#FDE68A",
      icon: "target",
      items: [
        "PERINGATAN KRITIS — JANGAN SIA-SIAKAN MOMENTUM: Antusiasme anggota Q2 adalah aset paling berharga yang bisa kamu miliki sebagai manajer. Penelitian menunjukkan bahwa jika skill tidak datang dalam 90 hari pertama, motivasi akan turun ke level Q1. Ini adalah window of opportunity yang tidak boleh terlewat.",
        "STRATEGI UTAMA — STRUCTURED ACCELERATION: Jangan biarkan mereka 'belajar sendiri' hanya karena mereka terlihat bersemangat. Semangat tanpa struktur akan berujung frustrasi. Buat learning path yang jelas dengan milestone yang terukur setiap 2 minggu.",
        "PASANGKAN DENGAN MENTOR YANG TEPAT: Pilih mentor dari anggota Q4 yang punya kesabaran mengajar (biasanya tipe S atau C). Hindari menugaskan tipe D sebagai mentor untuk anggota baru — ritme mereka bisa mengintimidasi dan merusak kepercayaan diri.",
        "QUICK WINS STRATEGY: Di 30 hari pertama, berikan tugas-tugas yang dirancang untuk bisa diselesaikan dengan sukses. Quick wins membangun kepercayaan diri dan membuktikan kepada mereka bahwa investasi semangat mereka tidak sia-sia.",
        "DANGER SIGN YANG HARUS DIWASPADAI: Jika di bulan ke-2 antusiasme mulai menurun tanpa alasan yang jelas, lakukan percakapan proaktif sebelum mereka menyeberang ke Q1. Lebih mudah menjaga motivasi daripada memulihkannya.",
      ],
    });
  }

  if (q.id === "Q3") {
    plan.push({
      type: "reengagement",
      title: "Protokol Re-engagement — Membangkitkan Kembali Api yang Padam",
      color: "#3B82F6",
      bg: "#EFF6FF",
      border: "#BFDBFE",
      icon: "refresh",
      items: [
        "PERINGATAN DIAGNOSIS: Ini adalah kuadran yang paling sering SALAH ditangani oleh manajer. Anggota Q3 BUKAN malas dan BUKAN tidak kompeten. Mereka adalah orang yang pernah sangat berdedikasi — dan sesuatu yang spesifik telah memadamkan api itu. Memperlakukan mereka seperti Q1 (training, monitoring ketat, PIP) adalah kesalahan yang bisa merusak hubungan kerja secara permanen dan mempercepat turnover.",
        "LANGKAH PERTAMA — DENGARKAN, BUKAN EVALUASI: Jangan masuk dengan agenda perbaikan performa. Masuk dengan rasa ingin tahu yang tulus. Pertanyaan pembuka yang tepat: 'Saya perhatikan ada sesuatu yang berbeda dari kamu belakangan ini, dan sebagai manajermu saya ingin memahami, bukan menghakimi. Apakah ada sesuatu yang sedang kamu hadapi yang mungkin memengaruhi semangat kerjamu?' Kemudian — diam dan dengarkan.",
        "AKAR MASALAH YANG PALING UMUM PADA Q3: (1) Merasa kontribusinya tidak dilihat atau dihargai oleh atasan. (2) Konflik dengan rekan kerja atau atasan yang tidak pernah diselesaikan secara tuntas. (3) Merasa stuck — tidak ada jalur karir yang jelas atau tantangan baru yang bermakna. (4) Masalah personal di luar pekerjaan yang meluber ke performa. (5) Nilai pribadi yang bergesekan dengan budaya atau keputusan organisasi.",
        m.disc === "D" 
          ? "INTERVENSI UNTUK TIPE D — Q3: Tipe D yang kehilangan motivasi hampir selalu karena merasa otonomi dan authority-nya dikebiri. Solusi: berikan proyek strategis baru dengan ruang gerak penuh. Biarkan mereka memimpin sesuatu yang bermakna. Jangan berikan ini sebagai 'reward' tapi sebagai 'investasi' — framing-nya penting untuk tipe D."
          : m.disc === "I"
          ? "INTERVENSI UNTUK TIPE I — Q3: Tipe I yang kehilangan motivasi hampir selalu karena merasa tidak dilihat, tidak diapresiasi, atau terisolasi secara sosial. Solusi: kembalikan mereka ke peran yang melibatkan banyak interaksi dan visibilitas. Berikan pengakuan yang tulus dan spesifik atas kontribusi masa lalu mereka. Libatkan mereka dalam proyek yang memiliki dampak sosial yang terlihat."
          : m.disc === "S"
          ? "INTERVENSI UNTUK TIPE S — Q3: Tipe S yang kehilangan motivasi hampir selalu karena ada konflik atau ketidakharmonisan dalam tim yang tidak pernah diselesaikan, atau karena merasa beban kerjanya tidak adil namun tidak bisa mengungkapkannya. Solusi: ciptakan ruang yang benar-benar aman untuk bicara, selesaikan sumber konflik yang ada, dan tunjukkan bahwa kontribusi diam-diam mereka selama ini dilihat dan dihargai."
          : "INTERVENSI UNTUK TIPE C — Q3: Tipe C yang kehilangan motivasi hampir selalu karena melihat inkonsistensi, ketidakadilan, atau keputusan yang mereka anggap tidak logis dalam organisasi. Solusi: berikan penjelasan yang rasional dan transparan atas keputusan-keputusan yang selama ini membingungkan mereka. Libatkan mereka dalam penyusunan sistem atau standar baru — ini memberikan makna bagi tipe C.",
        "TIMELINE RE-ENGAGEMENT: Jika setelah 4-6 minggu percakapan coaching yang konsisten dan intervensi yang tepat tidak ada perubahan, pertimbangkan apakah ini memang pilihan sadar mereka untuk tidak re-engage — dan diskusikan langkah selanjutnya secara terbuka dan hormat.",
      ],
    });
  }

  if (q.id === "Q4") {
    plan.push({
      type: "growth",
      title: "Protokol Retensi & Growth — Menjaga Aset Terbaik Tim",
      color: "#10B981",
      bg: "#ECFDF5",
      border: "#A7F3D0",
      icon: "award",
      items: [
        "PERINGATAN RETENSI: Anggota Q4 adalah yang paling rentan untuk direkrut oleh kompetitor — justru karena mereka yang paling dicari. Penelitian menunjukkan bahwa manajer adalah alasan nomor satu seseorang bertahan atau meninggalkan perusahaan. Investasikan waktu dan perhatian yang proporsional kepada mereka.",
        m.disc === "D" 
          ? "STRATEGI UNTUK TIPE D — Q4: Berikan proyek-proyek dengan tingkat kesulitan dan authority yang terus meningkat. Tipe D Q4 membutuhkan tantangan nyata — bukan sekedar tugas rutin yang lebih banyak. Diskusikan jalur menuju posisi kepemimpinan senior secara eksplisit dan konkret."
          : m.disc === "I"
          ? "STRATEGI UNTUK TIPE I — Q4: Berikan platform dan visibilitas — presentasi di depan manajemen senior, keterlibatan dalam proyek lintas divisi, atau peran sebagai brand ambassador tim. Tipe I Q4 membutuhkan panggung yang semakin besar untuk tetap engaged."
          : m.disc === "S"
          ? "STRATEGI UNTUK TIPE S — Q4: Jadikan mereka mentor resmi dan pilar budaya tim. Tipe S Q4 mendapat makna dari peran yang memungkinkan mereka mendukung orang lain berkembang. Pastikan beban kerja mereka adil — mereka jarang mengeluh meski sudah kelebihan beban, dan ini bisa menjadi bom waktu."
          : "STRATEGI UNTUK TIPE C — Q4: Libatkan mereka dalam penyusunan sistem, standar, dan proses — ini adalah pekerjaan yang paling bermakna bagi tipe C. Berikan akses ke pembelajaran teknis yang mendalam dan kesempatan untuk menjadi subject matter expert yang diakui organisasi.",
        "PERCAKAPAN KARIR YANG WAJIB DILAKUKAN (Minimal Kuartalan): (1) 'Di mana kamu ingin berada dalam 2-3 tahun ke depan, dan bagaimana saya bisa membantu kamu mencapainya?' (2) 'Apa yang paling membuat kamu engaged di pekerjaan ini saat ini?' (3) 'Adakah sesuatu yang membuatmu frustrasi yang belum pernah kamu sampaikan?' Pertanyaan ketiga adalah yang paling penting — dan paling jarang ditanyakan manajer.",
        "DANGER SIGN TURNOVER YANG HARUS DIWASPADAI: Anggota Q4 yang mulai mengurangi kontribusi sukarela, menarik diri dari diskusi tim, atau tiba-tiba sangat tepat waktu pulang adalah sinyal awal bahwa mereka sedang mempertimbangkan opsi lain. Jangan tunggu sampai surat resign datang.",
        "INVESTASI YANG TIDAK BOLEH DITUNDA: Pastikan kompensasi, benefit, dan pengakuan mereka setara dengan kontribusi nyata yang mereka berikan. Ketidakadilan kompensasi adalah pemicu turnover yang paling umum dan paling bisa dihindari.",
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
          {!isLogin && (
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
          <button onClick={() => { setIsLogin(!isLogin); setError(""); setSuccessMsg(""); }} className="text-xs text-slate-400 hover:text-white transition-colors">
            {isLogin ? "Belum punya akun? Daftar di sini" : "Sudah punya akun? Masuk di sini"}
          </button>
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