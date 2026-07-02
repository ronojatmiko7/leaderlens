import React, { useState, useEffect, useCallback, useRef } from "react";
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

// ── WhatsApp Support ─────────────────────────────────────────────────────────
const WA_NUMBER = '6287770781950';
const WA_URL = `https://wa.me/${WA_NUMBER}?text=Halo%2C%20saya%20butuh%20bantuan%20dengan%20LeaderLens.`;

// ── helpers ──────────────────────────────────────────────────────────────────
const getQuadrant = (comp, comm) => {
  const hi = v => v >= 3;
  if (!hi(comp) && !hi(comm)) return { id: "Q1", label: "Arahkan & Dampingi",      color: "#EF4444", bg: "#FEF2F2", border: "#FECACA", text: "#991B1B", dot: "bg-red-500"    };
  if (!hi(comp) &&  hi(comm)) return { id: "Q2", label: "Latih & Bimbing",         color: "#F59E0B", bg: "#FFFBEB", border: "#FDE68A", text: "#92400E", dot: "bg-amber-500"  };
  if ( hi(comp) && !hi(comm)) return { id: "Q3", label: "Motivasi & Libatkan",     color: "#3B82F6", bg: "#EFF6FF", border: "#BFDBFE", text: "#1E40AF", dot: "bg-blue-500"   };
  return                                { id: "Q4", label: "Delegasikan & Kembangkan", color: "#10B981", bg: "#ECFDF5", border: "#A7F3D0", text: "#065F46", dot: "bg-emerald-500" };
};

const getDocumentTitle = (qId) => {
  if (qId === "Q1") return "Rencana Pendampingan & Penyelarasan";
  if (qId === "Q2") return "Rencana Percepatan Belajar";
  if (qId === "Q3") return "Rencana Membangun Kembali Motivasi";
  return "Rencana Delegasi & Pengembangan";
};

const DISC_META = {
  D: { 
    label: "Dominance / Dominan", sub: "D · Dominance", color: "#EF4444", bg: "bg-red-500", light: "bg-red-50 text-red-700", desc: "Fokus hasil & kontrol",
    strengths: "Eksekusi cepat tanpa banyak basa-basi, berani ambil keputusan sulit di saat orang lain ragu, sangat efektif dalam situasi krisis atau tenggat ketat, dan punya dorongan kuat untuk melampaui target.",
    weaknesses: "Sebagai pemimpin, perhatikan: mereka bisa terlalu fokus pada hasil sampai mengabaikan proses dan perasaan rekan, kadang terkesan tegas berlebihan tanpa menyadarinya, dan butuh diingatkan agar tidak membuat anggota tim yang lebih lambat merasa terkejar-kejar."
  },
  I: { 
    label: "Influence / Interaktif", sub: "I · Influence", color: "#F59E0B", bg: "bg-amber-400", light: "bg-amber-50 text-amber-700", desc: "Fokus antusiasme & orang",
    strengths: "Kemampuan membangun relasi dan kepercayaan dengan sangat cepat, jago mengubah suasana tim yang lesu jadi bersemangat, sangat efektif sebagai jembatan antar divisi atau kepentingan yang berbeda, dan punya intuisi sosial yang kuat.",
    weaknesses: "Sebagai pemimpin, perhatikan: semangat mereka bisa naik-turun mengikuti suasana hati, kadang menyanggupi terlalu banyak karena tak enak menolak, dan butuh dukungan ekstra untuk merampungkan tugas administratif yang berulang. Bantu mereka dengan struktur dan pengingat yang ramah."
  },
  S: { 
    label: "Steadiness / Stabil", sub: "S · Steadiness", color: "#10B981", bg: "bg-emerald-500", light: "bg-emerald-50 text-emerald-700", desc: "Fokus kerja sama & sabar",
    strengths: "Tulang punggung tim yang sesungguhnya — konsisten, dapat diandalkan, dan jarang membuat drama. Pendengar yang membuat rekan merasa aman untuk bicara, sangat efektif dalam peran yang butuh kesabaran dan ketelitian jangka panjang.",
    weaknesses: "Sebagai pemimpin, perhatikan: mereka cenderung menghindari konflik sampai masalah kecil menumpuk diam-diam, butuh waktu untuk menyesuaikan diri dengan perubahan mendadak, dan sering sungkan berkata 'tidak' meski sudah kelebihan beban. Ciptakan ruang aman agar mereka mau jujur."
  },
  C: { 
    label: "Conscientiousness / Cermat", sub: "C · Conscientiousness", color: "#3B82F6", bg: "bg-blue-500", light: "bg-blue-50 text-blue-700", desc: "Fokus akurasi & kualitas",
    strengths: "Standar kualitas tertinggi di tim — mereka yang pertama menangkap kesalahan sebelum jadi masalah besar. Sangat sistematis, mampu berpikir beberapa langkah ke depan, dan jadi aset berharga dalam pekerjaan yang butuh presisi tinggi atau analisis mendalam.",
    weaknesses: "Sebagai pemimpin, perhatikan: mereka bisa terlalu lama menimbang keputusan saat data dirasa belum lengkap, kadang kritis terhadap ide orang lain tanpa menawarkan alternatif, dan bisa terkesan dingin padahal sebenarnya sangat fokus. Beri mereka waktu, data, dan kejelasan."
  },
};

const RATING_ANCHORS = {
  competency: {
    1: "Belum bisa, butuh banyak bimbingan",
    2: "Perlu bimbingan cukup intensif",
    3: "Sudah bisa mandiri sebagian",
    4: "Mahir & bisa mengajari orang lain",
  },
  commitment: {
    1: "Masih butuh banyak dorongan",
    2: "Kadang termotivasi",
    3: "Umumnya antusias",
    4: "Proaktif & menyemangati tim",
  },
};

const DISC_QUIZ_QUESTIONS = [
  {
    text: "Saat rapat tim, dia biasanya...",
    options: [
      { letter: "D", text: "Langsung ke inti masalah, kadang motong pembicaraan orang lain" },
      { letter: "I", text: "Aktif ngomong, suka cerita, bikin suasana hidup" },
      { letter: "S", text: "Lebih banyak dengerin, baru ngomong kalau ditanya" },
      { letter: "C", text: "Nyiapin data/poin dulu sebelum bicara, to the point" },
    ],
  },
  {
    text: "Waktu dikasih tugas baru yang belum jelas SOP-nya, dia...",
    options: [
      { letter: "D", text: "Langsung jalan, cari cara sendiri sambil eksekusi" },
      { letter: "I", text: "Nanya-nanya ke banyak orang, exploratory, semangat coba hal baru" },
      { letter: "S", text: "Agak ragu mulai duluan, nunggu arahan atau contoh dulu" },
      { letter: "C", text: "Minta detail/dokumentasi lengkap dulu sebelum mulai" },
    ],
  },
  {
    text: "Kalau ada masalah atau kesalahan di kerjaannya, reaksinya...",
    options: [
      { letter: "D", text: "Defensif atau langsung mau buktiin dia benar" },
      { letter: "I", text: "Agak baper tapi cepat pulih, tetap positif" },
      { letter: "S", text: "Diam, kadang nyimpen kekecewaan sendiri" },
      { letter: "C", text: "Overthinking, ngulik detail buat cari apa yang salah" },
    ],
  },
  {
    text: "Gaya kerja sehari-harinya lebih...",
    options: [
      { letter: "D", text: "Cepat, banyak hal sekaligus, kadang kurang rapi di detail" },
      { letter: "I", text: "Spontan, fleksibel, kurang suka rutinitas kaku" },
      { letter: "S", text: "Stabil, konsisten, tidak suka perubahan mendadak" },
      { letter: "C", text: "Terstruktur, teliti, perfeksionis di detail kecil" },
    ],
  },
];

const scoreDiscQuiz = (answers) => {
  const letters = ["D", "I", "S", "C"];
  const tally = { D: 0, I: 0, S: 0, C: 0 };
  answers.forEach(a => { if (a) tally[a] += 1; });
  const maxCount = Math.max(...letters.map(l => tally[l]));
  const tied = letters.filter(l => tally[l] === maxCount);
  return tied.includes(answers[0]) ? answers[0] : tied[0];
};

const getDISCScript = (disc) => ({
  D: {
    open: "Ajak ngobrol dengan fokus ke solusi: 'Yuk kita bahas progres di [area spesifik]. Saya pengen dengar pandanganmu, biar kita bisa sama-sama capai target ini.'",
    body: "Bahas dampaknya secara objektif, apa adanya. Kasih dia ruang buat usul cara perbaikan sendiri: 'Menurutmu, langkah terbaik buat ngejar ini apa?' Sepakati target bareng, terus kasih dia keleluasaan buat eksekusi.",
    avoid: "Hindari menegur di depan orang lain atau pakai bahasa yang kelewat emosional. Tetap arahkan obrolan ke depan — ke solusi, bukan ke siapa yang salah.",
  },
  I: {
    open: "Buka dengan apresiasi dulu: 'Saya lihat potensimu gede banget. Boleh kita ngobrol santai soal gimana caranya kita maksimalkan itu?'",
    body: "Libatkan dia secara personal, ajak brainstorm bareng: 'Kira-kira dukungan apa yang kamu butuh biar kerjamu makin lancar dan tetap enjoy?'",
    avoid: "Jangan langsung lempar kritik tajam tanpa basa-basi apresiasi dulu. Pastikan di akhir obrolan ada kesepakatan sederhana yang tertulis, biar nggak cuma jadi obrolan angin lalu.",
  },
  S: {
    open: "Ciptakan suasana yang bikin dia nyaman: 'Saya pengen kita ngobrol berdua, lihat gimana saya bisa lebih support kerjaanmu.'",
    body: "Pakai pendekatan yang sabar dan penuh empati. Lebih banyak dengerin dulu. 'Apa sih kendala yang paling sering kamu rasain?' Jelaskan rencana perbaikannya pelan-pelan, bertahap.",
    avoid: "Hindari desakan buat berubah drastis atau konfrontasi langsung. Pastikan dia beneran merasa nyaman buat cerita.",
  },
  C: {
    open: "Buka dengan sikap objektif: 'Saya menghargai ketelitianmu, dan pengen dengar analisismu soal data dari proyek terakhir.'",
    body: "Sampaikan fakta yang konkret dengan tenang. Kasih dia waktu buat mencerna dan merespons. Fokusnya ke perbaikan sistem dan kualitas kerja.",
    avoid: "Hindari feedback yang cuma berdasarkan perasaan. Jangan buru-buru minta keputusan saat itu juga — kasih dia ruang mikir.",
  },
  "?": {
    open: "Pendekatan kolaboratif: 'Saya pengen kita diskusi santai soal apa yang udah berjalan baik dan apa yang bisa kita tingkatkan bareng-bareng.'",
    body: "Terapkan prinsip coaching dasar: dengerin 80%, ngomong 20%. Tanyakan kendalanya secara terbuka. Fokus ke bikin dia merasa aman (psychological safety) biar nyaman cerita jujur.",
    avoid: "Jangan kasih instruksi sepihak atau langsung berasumsi soal kendalanya sebelum bener-bener dengerin sudut pandangnya secara utuh.",
  }
}[disc]);

const DIALOGUE_EXAMPLES = {
  D_Q1: [
    { speaker: "manager", text: "Saya mau ngobrol serius soal performa kamu belakangan ini — kamu langsung aja, apa yang menurut kamu sendiri paling berat sekarang?" },
    { speaker: "karyawan", text: "Jujur, saya juga ngerasa banyak yang meleset. Beberapa target nggak kekejar, dan saya sendiri bingung harus mulai benerin dari mana." },
    { speaker: "manager", text: "Saya hargai kamu jujur soal itu. Coba kita breakdown — dari sisi kemampuan, bagian mana yang paling bikin kamu stuck?" },
    { speaker: "karyawan", text: "Ada beberapa proses yang sebenarnya belum benar-benar saya kuasai, cuma selama ini saya coba jalan sendiri aja." },
    { speaker: "manager", text: "Noted. Nah, dari sisi semangat gimana? Soalnya saya lihat belakangan ini kamu juga kayak agak menjauh dari tim." },
    { speaker: "karyawan", text: "Saya ngerasa kayak ketinggalan terus, jadi lama-lama males buat ngejar." },
    { speaker: "manager", text: "Masuk akal. Gini aja — saya pasangin kamu sama satu rekan senior buat pegang satu proses spesifik dulu, bukan semuanya sekaligus." },
    { speaker: "karyawan", text: "Oke, itu ngebantu banget sih, daripada saya coba semuanya sendirian." },
    { speaker: "manager", text: "Kita set target kecil tiap minggu, dan saya cek langsung progressnya bareng kamu — bukan buat nyalahin, tapi biar cepat ketahuan kalau ada yang nyangkut." },
    { speaker: "karyawan", text: "Siap, saya coba fokus ke situ dulu." },
    { speaker: "manager", text: "Kalau kamu udah mulai nemu ritmenya, saya kembalikan otonominya pelan-pelan. Kamu tetap punya kesempatan buat balik jadi andalan kok." },
    { speaker: "karyawan", text: "Makasih, saya coba buktiin minggu ini." },
  ],
  D_Q2: [
    { speaker: "manager", text: "Saya lihat kamu semangat banget belakangan ini — bagus banget. Sekarang kita percepat biar skill kamu ngejar semangatnya." },
    { speaker: "karyawan", text: "Siap, saya emang masih perlu banyak belajar di beberapa bagian, tapi saya nggak sabar buat langsung eksekusi." },
    { speaker: "manager", text: "Saya suka energinya. Menurut kamu sendiri, area mana yang paling perlu kamu kuasai duluan?" },
    { speaker: "karyawan", text: "Saya rasa bagian teknis intinya dulu, biar saya bisa pegang tugas lebih besar secepatnya." },
    { speaker: "manager", text: "Sip, kita fokus ke situ dulu minggu ini. Saya pasangkan kamu sama rekan senior, tapi kamu yang pegang kendali eksekusinya." },
    { speaker: "karyawan", text: "Oke, saya lebih suka belajar sambil langsung praktik daripada cuma teori." },
    { speaker: "manager", text: "Pas, kita emang akan langsung jalan. Saya kasih kamu satu target konkret buat dicapai minggu ini." },
    { speaker: "karyawan", text: "Siap, saya usahakan cepat nangkep dan langsung eksekusi." },
    { speaker: "manager", text: "Saya cek progressnya tiap hari, tapi bukan buat ngatur-ngatur kamu, lebih ke mastiin kamu nggak nyasar arah." },
    { speaker: "karyawan", text: "Oke, saya emang lebih suka ada checkpoint yang jelas." },
    { speaker: "manager", text: "Saya percaya kamu bisa cepat naik level. Begitu kamu udah solid, saya kasih kamu tanggung jawab yang lebih besar lagi." },
    { speaker: "karyawan", text: "Siap, saya akan buktiin secepatnya." },
  ],
  D_Q3: [
    { speaker: "manager", text: "Saya lihat hasil kerja kamu tetap bagus, tapi kayaknya ada yang beda dari cara kamu belakangan ini." },
    { speaker: "karyawan", text: "Iya, jujur saya lagi agak jenuh, meskipun hasilnya masih sesuai target." },
    { speaker: "manager", text: "Saya hargai kamu tetap jaga kualitas meski lagi jenuh. Boleh cerita, jenuhnya kenapa?" },
    { speaker: "karyawan", text: "Kerjaannya berasa itu-itu aja, nggak ada tantangan baru yang bikin saya harus mikir keras lagi." },
    { speaker: "manager", text: "Masuk akal, kamu emang tipe yang butuh tantangan buat tetap ngegas. Kira-kira arah apa yang paling menarik buat kamu sekarang?" },
    { speaker: "karyawan", text: "Saya pengen pegang sesuatu yang lebih besar, yang hasilnya langsung kelihatan dampaknya." },
    { speaker: "manager", text: "Oke, saya mau kasih kamu satu inisiatif baru yang lebih menantang, dan kamu yang pegang kendali penuh." },
    { speaker: "karyawan", text: "Itu yang saya cari, saya siap ambil tanggung jawabnya." },
    { speaker: "manager", text: "Saya nggak akan micromanage, saya cuma mau tahu progress besarnya tiap minggu." },
    { speaker: "karyawan", text: "Setuju, saya emang lebih produktif kalau dikasih ruang buat gerak sendiri." },
    { speaker: "manager", text: "Bagus. Kalau ini jalan lancar, ini bisa jadi portofolio kuat buat langkah kamu berikutnya." },
    { speaker: "karyawan", text: "Siap, saya akan buktiin hasilnya." },
  ],
  D_Q4: [
    { speaker: "manager", text: "Kamu salah satu andalan saya di tim ini. Saya mau kasih kamu tanggung jawab yang lebih besar." },
    { speaker: "karyawan", text: "Wah, siap, saya emang udah nunggu tantangan yang lebih gede." },
    { speaker: "manager", text: "Bagus. Saya mau kamu pegang satu inisiatif baru mulai sekarang, dengan kendali penuh atas eksekusinya." },
    { speaker: "karyawan", text: "Oke, saya coba maksimalkan — boleh saya tahu target akhirnya seperti apa?" },
    { speaker: "manager", text: "Tentu, kita sepakati targetnya sekarang, tapi caranya sepenuhnya kamu yang tentuin." },
    { speaker: "karyawan", text: "Saya suka itu, saya emang lebih efektif kalau dikasih otonomi penuh." },
    { speaker: "manager", text: "Selain itu, saya juga mau kamu mulai membimbing satu rekan yang lebih junior." },
    { speaker: "karyawan", text: "Siap, saya coba, meskipun saya lebih terbiasa eksekusi sendiri." },
    { speaker: "manager", text: "Nggak apa-apa, kamu bisa fokus ke hasil, bukan gaya ngajarnya. Saya cuma mau dia belajar dari cara kerja kamu." },
    { speaker: "karyawan", text: "Oke, saya siap coba pendekatan itu." },
    { speaker: "manager", text: "Bagus. Saya juga mau pastikan kontribusi kamu diakui — kita bahas jalur karier kamu bulan depan." },
    { speaker: "karyawan", text: "Saya tunggu itu, saya emang pengen tahu langkah berikutnya." },
  ],
  I_Q1: [
    { speaker: "manager", text: "Sebelum masuk kerjaan, saya pengen tahu dulu — gimana kabar kamu belakangan ini, beneran?" },
    { speaker: "karyawan", text: "Jujur agak berantakan sih, banyak yang bikin saya bingung dan kurang semangat juga." },
    { speaker: "manager", text: "Makasih udah cerita. Saya di sini bukan buat nge-judge, saya cuma pengen bantu kamu keluar dari fase ini bareng-bareng." },
    { speaker: "karyawan", text: "Saya ngerasa ketinggalan terus, jadi makin lama makin nggak pede buat nanya." },
    { speaker: "manager", text: "Nggak apa-apa, semua orang pernah di titik itu kok. Kira-kira bagian mana yang paling bikin kamu bingung?" },
    { speaker: "karyawan", text: "Beberapa proses saya masih suka salah, dan saya juga jarang ngobrol sama tim belakangan ini." },
    { speaker: "manager", text: "Oke, gimana kalau kita mulai dari ngumpul bareng tim lagi, sekalian saya pasangin kamu sama rekan yang asik buat belajar bareng?" },
    { speaker: "karyawan", text: "Wah, itu bakal bantu banget, saya emang lebih semangat kalau belajarnya rame-rame." },
    { speaker: "manager", text: "Sip, kita bikin target kecil dulu minggu ini, dan saya rutin cek-in santai sama kamu, bukan yang formal-formal amat." },
    { speaker: "karyawan", text: "Oke, saya coba pelan-pelan bangun ritmenya lagi." },
    { speaker: "manager", text: "Saya percaya kamu bisa balik semangat kayak dulu, kok. Kita jalanin bareng ya." },
    { speaker: "karyawan", text: "Makasih banyak, saya jadi lebih lega ngomongin ini." },
  ],
  I_Q2: [
    { speaker: "manager", text: "Saya seneng banget lihat semangat kamu belakangan ini! Yuk kita obrolin gimana biar skill kamu makin ngejar." },
    { speaker: "karyawan", text: "Iya, saya emang masih belajar banyak hal, tapi saya excited banget buat coba-coba." },
    { speaker: "manager", text: "Bagus, saya suka energi kamu. Kira-kira bagian mana yang bikin kamu paling penasaran buat dipelajari?" },
    { speaker: "karyawan", text: "Saya pengen lebih jago di beberapa proses yang sering saya lihat rekan-rekan lain kerjain." },
    { speaker: "manager", text: "Sip, gimana kalau saya pasangin kamu sama rekan senior yang seru diajak belajar bareng, biar makin semangat juga?" },
    { speaker: "karyawan", text: "Wah, mau banget, saya emang lebih cepat nangkep kalau belajarnya interaktif." },
    { speaker: "manager", text: "Oke, kita bikin sesi belajar bareng tiap minggu, sambil ngobrol santai juga biar nggak kaku." },
    { speaker: "karyawan", text: "Setuju banget, itu bikin saya makin nyaman buat nanya-nanya." },
    { speaker: "manager", text: "Kita cek progressnya bareng, dan saya juga bakal rayain tiap kemajuan kecil kamu di depan tim." },
    { speaker: "karyawan", text: "Wah itu bikin saya makin termotivasi buat ngebuktiin." },
    { speaker: "manager", text: "Saya yakin kamu bakal cepat berkembang. Kalau udah solid, saya kasih kamu proyek yang lebih seru lagi." },
    { speaker: "karyawan", text: "Siap, saya nggak sabar buat mulai!" },
  ],
  I_Q3: [
    { speaker: "manager", text: "Saya kangen lihat kamu se-semangat dulu. Ada yang lagi mengganggu, kah?" },
    { speaker: "karyawan", text: "Ada sih, saya ngerasa kontribusi saya kurang kelihatan belakangan ini, jadi rada males semangat." },
    { speaker: "manager", text: "Makasih udah jujur, itu penting banget buat saya tahu. Kira-kira momen mana yang bikin kamu ngerasa gitu?" },
    { speaker: "karyawan", text: "Beberapa ide saya kayak lewat gitu aja tanpa ada yang notice, jadi saya jadi kurang pengen ngomong lagi." },
    { speaker: "manager", text: "Saya minta maaf soal itu, dan saya pengen benerin. Saya pengen tahu, kamu pengen kontribusi kamu dilihat gimana?" },
    { speaker: "karyawan", text: "Saya cuma pengen ngerasa didengar dan diapresiasi aja, nggak perlu yang besar-besar." },
    { speaker: "manager", text: "Noted banget. Mulai sekarang saya pastikan ide kamu kelihatan di depan tim, dan saya kasih kamu ruang buat presentasiin langsung." },
    { speaker: "karyawan", text: "Wah, itu bakal bikin saya semangat lagi." },
    { speaker: "manager", text: "Kita juga cari proyek baru yang lebih seru buat kamu pegang, biar energi kamu balik lagi." },
    { speaker: "karyawan", text: "Saya suka itu, saya emang lebih hidup kalau kerjaannya interaktif." },
    { speaker: "manager", text: "Sip, saya akan sering cek-in santai sama kamu ke depannya, biar hal kayak gini nggak kejadian lagi." },
    { speaker: "karyawan", text: "Makasih banyak, saya jadi lebih lega ngomongin ini." },
  ],
  I_Q4: [
    { speaker: "manager", text: "Kamu salah satu orang yang bikin tim ini hidup. Saya mau ngobrol soal masa depan kamu di sini." },
    { speaker: "karyawan", text: "Wah, saya seneng banget denger itu, saya emang betah banget kerja bareng tim ini." },
    { speaker: "manager", text: "Saya mau kamu mulai pegang peran yang lebih besar, sekalian jadi orang yang menyemangati tim lain juga." },
    { speaker: "karyawan", text: "Siap, saya suka banget kerja bareng orang-orang, itu bikin saya makin semangat." },
    { speaker: "manager", text: "Pas banget, karena kamu emang jago bikin suasana tetap positif meski lagi sibuk." },
    { speaker: "karyawan", text: "Makasih, saya emang berusaha bikin semua orang tetap nyaman kerja bareng." },
    { speaker: "manager", text: "Saya juga mau kamu lebih sering tampil di depan, presentasi atau jadi wajah tim di beberapa proyek." },
    { speaker: "karyawan", text: "Wah, saya suka itu, saya emang lebih hidup kalau ketemu banyak orang." },
    { speaker: "manager", text: "Kita rencanain bareng ya, biar kontribusi kamu makin kelihatan ke atasan juga." },
    { speaker: "karyawan", text: "Setuju, saya nggak sabar buat mulai." },
    { speaker: "manager", text: "Saya juga mau pastikan kerja keras kamu diakui secara resmi, bukan cuma di obrolan santai aja." },
    { speaker: "karyawan", text: "Makasih banyak, itu artinya besar buat saya." },
  ],
  S_Q1: [
    { speaker: "manager", text: "Saya pengen ngobrol pelan-pelan aja soal kerjaan kamu belakangan ini. Ini ruang aman, saya cuma mau dengerin dulu." },
    { speaker: "karyawan", text: "Terima kasih. Jujur saya ngerasa agak keteteran, tapi saya nggak enak mau cerita." },
    { speaker: "manager", text: "Nggak apa-apa, ambil waktu yang kamu butuh. Kira-kira bagian mana yang paling berat buat kamu sekarang?" },
    { speaker: "karyawan", text: "Saya rasa saya butuh bimbingan lebih di beberapa proses, tapi saya juga takut ngerepotin orang lain." },
    { speaker: "manager", text: "Kamu nggak ngerepotin sama sekali, justru saya seneng kamu ngomong dari awal. Semangat kamu belakangan ini gimana?" },
    { speaker: "karyawan", text: "Agak turun sih, karena saya ngerasa nggak yakin sama kerjaan saya sendiri." },
    { speaker: "manager", text: "Oke, kita nggak perlu buru-buru. Saya dampingi kamu pelan-pelan, mulai dari satu proses kecil dulu minggu ini." },
    { speaker: "karyawan", text: "Itu bikin saya lebih tenang, soalnya saya emang butuh waktu buat nyerna hal baru." },
    { speaker: "manager", text: "Kita cek bareng tiap minggu ya, santai aja, nggak perlu terburu-buru sama sekali." },
    { speaker: "karyawan", text: "Baik, saya coba jalanin pelan-pelan." },
    { speaker: "manager", text: "Saya yakin kamu bisa, kamu cuma butuh ruang dan waktu aja. Saya akan selalu ada buat dampingi." },
    { speaker: "karyawan", text: "Terima kasih banyak, saya jadi lebih lega." },
  ],
  S_Q2: [
    { speaker: "manager", text: "Saya lihat kamu udah cukup nyaman belakangan ini, dan saya mau bantu skill kamu makin berkembang pelan-pelan." },
    { speaker: "karyawan", text: "Saya emang masih agak ragu di beberapa bagian, tapi saya mau belajar." },
    { speaker: "manager", text: "Bagus, nggak perlu buru-buru kok. Menurut kamu, bagian mana yang bikin kamu paling nggak yakin?" },
    { speaker: "karyawan", text: "Saya rasa saya butuh lihat contoh dulu sebelum coba sendiri, biar nggak salah arah." },
    { speaker: "manager", text: "Oke, wajar banget. Saya pasangkan kamu sama rekan yang sabar juga, biar kamu nyaman belajar bareng." },
    { speaker: "karyawan", text: "Itu bikin saya lebih tenang, soalnya saya emang butuh waktu buat adaptasi." },
    { speaker: "manager", text: "Kita mulai dari satu tugas kecil dulu minggu ini, nggak perlu langsung banyak." },
    { speaker: "karyawan", text: "Baik, saya coba ikuti pelan-pelan, semoga bisa cepat terbiasa." },
    { speaker: "manager", text: "Nggak perlu terburu-buru, saya cek progressnya bareng kamu tiap minggu, santai aja." },
    { speaker: "karyawan", text: "Terima kasih, saya jadi lebih nyaman buat coba hal baru." },
    { speaker: "manager", text: "Saya yakin kamu bisa berkembang dengan ritme kamu sendiri. Saya akan terus dampingi." },
    { speaker: "karyawan", text: "Makasih banyak, saya akan usahakan yang terbaik." },
  ],
  S_Q3: [
    { speaker: "manager", text: "Saya lihat ada yang beda dari kamu belakangan ini. Boleh cerita, nggak perlu buru-buru." },
    { speaker: "karyawan", text: "Sebenernya saya ngerasa agak capek belakangan ini, meskipun kerjaan tetap saya selesein." },
    { speaker: "manager", text: "Makasih udah cerita. Saya di sini buat dengerin dulu. Capeknya lebih ke beban kerja, atau ada hal lain?" },
    { speaker: "karyawan", text: "Lebih ke saya ngerasa ritmenya berubah terus belakangan ini, jadi saya agak susah adaptasi." },
    { speaker: "manager", text: "Saya paham, perubahan mendadak emang berat buat kamu. Kira-kira apa yang bisa bikin kamu lebih nyaman?" },
    { speaker: "karyawan", text: "Saya cuma butuh sedikit waktu buat napas, dan ritme yang lebih stabil aja." },
    { speaker: "manager", text: "Oke, kita atur ritmenya bareng ya, saya nggak akan buru-buru kamu." },
    { speaker: "karyawan", text: "Terima kasih, itu ngebantu banget buat saya." },
    { speaker: "manager", text: "Saya juga mau pastikan kontribusi kamu selama ini tetap kelihatan, meskipun kamu nggak yang paling vokal di tim." },
    { speaker: "karyawan", text: "Saya seneng dengernya, soalnya saya emang jarang ngomong soal itu." },
    { speaker: "manager", text: "Kita cek-in pelan-pelan tiap minggu, dan kamu bebas cerita kapan aja kalau ada yang berat." },
    { speaker: "karyawan", text: "Makasih banyak, saya jadi lebih tenang." },
  ],
  S_Q4: [
    { speaker: "manager", text: "Saya mau bilang, kamu salah satu orang yang paling bisa saya andalkan di tim ini." },
    { speaker: "karyawan", text: "Terima kasih banyak, saya seneng dengernya, meskipun saya jarang bilang-bilang." },
    { speaker: "manager", text: "Saya mau kasih kamu tanggung jawab lebih, tapi tetap dengan ritme yang nyaman buat kamu." },
    { speaker: "karyawan", text: "Saya siap, asal pelan-pelan ya, biar saya bisa adaptasi dengan baik." },
    { speaker: "manager", text: "Pasti, kita jalanin bareng, nggak akan saya buru-buru kamu." },
    { speaker: "karyawan", text: "Makasih, saya emang lebih nyaman kalau perubahannya bertahap." },
    { speaker: "manager", text: "Saya juga mau kamu mulai dampingi rekan baru, karena cara kamu kerja itu contoh yang bagus buat mereka." },
    { speaker: "karyawan", text: "Oke, saya coba, saya emang seneng bantu orang lain juga." },
    { speaker: "manager", text: "Kamu nggak perlu ubah gaya kamu, saya cuma mau kamu bagikan cara kerja kamu yang konsisten itu." },
    { speaker: "karyawan", text: "Baik, saya akan coba pelan-pelan." },
    { speaker: "manager", text: "Saya pastikan kontribusi kamu tetap diakui, meskipun kamu nggak yang paling vokal soal itu." },
    { speaker: "karyawan", text: "Terima kasih banyak, saya jadi makin semangat kerja di sini." },
  ],
  C_Q1: [
    { speaker: "manager", text: "Saya mau bahas data kerja kamu belakangan ini secara objektif, biar kita bisa cari solusinya bareng-bareng." },
    { speaker: "karyawan", text: "Baik, saya juga udah lihat sendiri ada beberapa yang meleset dari target." },
    { speaker: "manager", text: "Menurut kamu, dari sisi proses, bagian mana yang paling sering bikin hasilnya nggak sesuai?" },
    { speaker: "karyawan", text: "Saya rasa saya kurang paham detail di beberapa langkah, jadi saya sering ragu pas eksekusi." },
    { speaker: "manager", text: "Oke, itu jelas. Dari sisi motivasi gimana? Soalnya saya lihat progress kamu juga agak melambat." },
    { speaker: "karyawan", text: "Jujur saya agak nggak nyaman kerja tanpa panduan yang jelas, jadi lama-lama saya jadi ragu terus." },
    { speaker: "manager", text: "Masuk akal. Saya siapkan dokumentasi dan SOP yang lebih detail buat kamu, biar nggak perlu nebak-nebak lagi." },
    { speaker: "karyawan", text: "Itu bakal sangat membantu, saya emang lebih nyaman kalau ada acuan yang jelas." },
    { speaker: "manager", text: "Kita cek progressnya tiap minggu berdasarkan data konkret, bukan asumsi, biar kamu juga bisa lihat sendiri perkembangannya." },
    { speaker: "karyawan", text: "Baik, saya siap ikuti prosesnya." },
    { speaker: "manager", text: "Pelan-pelan aja, yang penting akurat. Saya yakin kamu bisa balik solid kalau prosesnya udah jelas." },
    { speaker: "karyawan", text: "Terima kasih, saya coba maksimalkan dari sekarang." },
  ],
  C_Q2: [
    { speaker: "manager", text: "Saya lihat progress kamu di area ini cukup baik. Yuk kita bahas gimana mempercepat penguasaan skill kamu." },
    { speaker: "karyawan", text: "Saya masih butuh referensi yang lebih lengkap di beberapa bagian sebelum saya yakin buat eksekusi." },
    { speaker: "manager", text: "Masuk akal. Menurut kamu, dokumentasi atau contoh kasus mana yang paling kamu butuhkan sekarang?" },
    { speaker: "karyawan", text: "Saya rasa saya perlu panduan step-by-step yang lebih detail, biar nggak salah interpretasi." },
    { speaker: "manager", text: "Noted, saya siapkan dokumentasi dan contoh kasusnya minggu ini." },
    { speaker: "karyawan", text: "Terima kasih, itu bakal sangat membantu saya buat lebih percaya diri eksekusi." },
    { speaker: "manager", text: "Kita review progressnya tiap minggu dengan data yang jelas, biar kamu juga bisa lihat perkembangannya secara konkret." },
    { speaker: "karyawan", text: "Saya suka pendekatan itu, jadi nggak nebak-nebak lagi." },
    { speaker: "manager", text: "Kalau ada yang masih ambigu, kamu bisa tanya saya kapan aja, saya lebih suka kamu klarifikasi dulu daripada salah jalan." },
    { speaker: "karyawan", text: "Baik, saya akan lebih proaktif nanya kalau ada yang kurang jelas." },
    { speaker: "manager", text: "Bagus. Begitu kamu udah solid di area ini, saya kasih kamu scope yang lebih luas lagi." },
    { speaker: "karyawan", text: "Siap, saya akan pastikan kualitasnya tetap terjaga." },
  ],
  C_Q3: [
    { speaker: "manager", text: "Hasil kerja kamu tetap konsisten bagus, tapi saya perhatikan ada pola yang berubah belakangan ini. Boleh saya tahu kenapa?" },
    { speaker: "karyawan", text: "Sejujurnya saya merasa prosesnya kurang efisien belakangan ini, itu bikin saya agak frustrasi." },
    { speaker: "manager", text: "Terima kasih sudah menjelaskan secara spesifik. Bisa kasih contoh bagian mana yang paling mengganggu?" },
    { speaker: "karyawan", text: "Terutama di satu proses tertentu, itu banyak makan waktu tanpa hasil yang jelas." },
    { speaker: "manager", text: "Baik, saya catat detailnya. Menurut kamu sendiri, gimana proses itu seharusnya berjalan?" },
    { speaker: "karyawan", text: "Saya rasa kalau datanya lebih terstruktur dari awal, prosesnya bisa jauh lebih cepat dan akurat." },
    { speaker: "manager", text: "Masuk akal, saya akan tinjau ulang prosesnya berdasarkan masukan kamu, dan saya libatkan kamu di revisinya." },
    { speaker: "karyawan", text: "Saya seneng bisa ikut benerin langsung, biar sesuai standar yang saya rasa perlu." },
    { speaker: "manager", text: "Kita jadwalkan review bareng minggu depan, dengan data konkret biar semua jelas dan terukur." },
    { speaker: "karyawan", text: "Baik, saya siapkan analisisnya dari sekarang." },
    { speaker: "manager", text: "Saya hargai ketelitian kamu, ini bakal ngebantu banget buat tim ke depannya." },
    { speaker: "karyawan", text: "Terima kasih, saya akan pastikan detailnya rapi." },
  ],
  C_Q4: [
    { speaker: "manager", text: "Berdasarkan data performa kamu selama ini, kamu konsisten jadi salah satu kontributor terbaik di tim." },
    { speaker: "karyawan", text: "Terima kasih, saya berusaha menjaga kualitas kerja saya di setiap proses." },
    { speaker: "manager", text: "Saya mau kasih kamu tanggung jawab analisis yang lebih strategis mulai sekarang." },
    { speaker: "karyawan", text: "Baik, saya siap — boleh saya lihat detail scope dan datanya dulu?" },
    { speaker: "manager", text: "Tentu, saya siapkan dokumennya, dan kita bahas bareng minggu ini secara detail." },
    { speaker: "karyawan", text: "Terima kasih, saya lebih nyaman kalau semuanya jelas dari awal." },
    { speaker: "manager", text: "Saya juga mau kamu mulai terlibat di keputusan berbasis data untuk tim, bukan cuma eksekusi aja." },
    { speaker: "karyawan", text: "Saya tertarik, saya emang suka kalau kerjaan saya berdampak ke keputusan yang lebih besar." },
    { speaker: "manager", text: "Kita review progressnya tiap bulan dengan metrik yang jelas, biar kontribusi kamu juga bisa terukur." },
    { speaker: "karyawan", text: "Baik, saya siapkan laporannya secara berkala." },
    { speaker: "manager", text: "Saya hargai ketelitian kamu selama ini, dan saya pastikan itu diakui secara resmi." },
    { speaker: "karyawan", text: "Terima kasih banyak, saya akan terus jaga standarnya." },
  ],
};

const getDialogueExample = (disc, quadrantId) => DIALOGUE_EXAMPLES[`${disc}_${quadrantId}`] || null;

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
  const guide = QUADRANT_GUIDE.find(g => g.q === q.id);
  const plan = [];

  // ── CARD 1: Posisi Kuadran — apa artinya & langkah yang perlu diambil ──────
  const quadrantItems = [`APA ARTINYA: ${guide.diagnosis}`];
  if (q.id === "Q1") {
    quadrantItems.push(
      "Ini momen yang butuh kehadiran kamu langsung. Dampingi dengan semangat 'yuk kita perbaiki ini bareng-bareng', bukan dengan nada menghakimi.",
      "LANGKAH 1 (Dengerin & pahami dulu): Mulai dari obrolan terbuka buat cari tahu akar masalahnya. Catatan kemampuan: " + (m.competencyNotes[0] || "[Belum ada catatan]") + ". Catatan motivasi: " + (m.commitmentNotes[0] || "[Belum ada catatan]") + ". Jangan buru-buru berasumsi.",
      "LANGKAH 2 (Susun bareng): Bikin rencana belajar bersama — pasangkan dia dengan rekan senior buat mendampingi (shadowing), mulai dari tugas kecil dulu, dan sepakati target harian/mingguan yang masuk akal.",
      "LANGKAH 3 (Cek rutin & kasih kepercayaan): Tinjau tiap minggu dengan suportif, rayakan tiap kemajuan sekecil apa pun, dan kembalikan otonominya pelan-pelan di area yang udah mulai dia kuasai."
    );
  } else {
    if (m.competency < 3) {
      quadrantItems.push(
        "SKILL — Tentukan dulu area keterampilan spesifik yang perlu diperkuat, dari catatan ini: " + (m.competencyNotes[0] || "[Belum ada catatan]"),
        "Pasangkan dia dengan rekan yang lebih senior buat mendampingi (shadowing) selama 1–2 minggu. Mulai dari tugas kecil dulu, terus cek bareng tiap hari (bukan mingguan) — biar kalau ada yang keliru, bisa cepat dibantu."
      );
    }
    if (m.commitment < 3) {
      quadrantItems.push(
        "WILL — Coba pahami dulu akar penurunan motivasinya, dari catatan ini: " + (m.commitmentNotes[0] || "[Belum ada catatan]"),
        "Ajak ngobrol terbuka dari hati ke hati. Tanyakan: 'Apa sih yang sekarang paling ngehambat kerjaanmu?' Lalu bangun lagi kepercayaannya dengan kasih dia otonomi di area yang udah dia kuasai."
      );
    }
    if (q.id === "Q2") {
      quadrantItems.push(
        "FOKUS UTAMA: Bangun rasa percaya dirinya lewat keterampilan teknis yang makin solid.",
        "Kasih ruang mandiri sedikit demi sedikit: biarkan dia pegang tugas kecil sendiri, dengan dukungan yang jelas kalau dibutuhkan.",
        "Dorong dia buat ikut pelatihan lanjutan atau sertifikasi di bidangnya."
      );
    } else if (q.id === "Q3") {
      quadrantItems.push(
        "Dia sebenarnya punya skill, cuma lagi kehilangan semangat. Kalau diawasi terlalu ketat, bisa-bisa malah tambah parah.",
        "LANGKAH UTAMA — DENGERIN DULU: Buka obrolan dengan rasa ingin tahu, bukan curiga. Tanyakan apa yang bikin dia capek belakangan ini, tanpa menghakimi.",
        "Kasih tantangan baru atau variasi kerjaan kalau ternyata kejenuhan yang jadi akar masalahnya."
      );
    } else if (q.id === "Q4") {
      quadrantItems.push(
        "FOKUS UTAMA: Kasih tantangan yang lebih strategis, bukan cuma nambahin beban kerja.",
        "Libatkan dia dalam keputusan tingkat tim, atau jadikan dia mentor buat rekan yang lagi belajar.",
        "Pastikan pengakuan dan apresiasinya sepadan dengan kontribusi besar yang udah dia kasih."
      );
    }
  }

  plan.push({
    type: "quadrant",
    title: `Posisi Kuadran: ${q.label}`,
    color: q.color,
    bg: q.bg,
    border: q.border,
    icon: "compass",
    items: quadrantItems,
  });

  // ── CARD 2: Profil DISC — apa artinya & pendekatan yang pas ────────────────
  plan.push({
    type: "profile",
    title: `Panduan Obrolan 1-on-1: Pendekatan ${discData.label}`,
    color: discData.color,
    bg: "#F8FAFC",
    border: "#E2E8F0",
    icon: "info",
    items: [
      `APA ARTINYA: ${discData.desc}. ${discData.strengths}`,
      `MULAI OBROLANNYA (luangkan sekitar 30 menit, dan fokus buat banyak dengerin). Coba buka dengan: "${script.open}"`,
      `GAYA NGOBROL YANG PAS: ${script.body}`,
      `YANG SEBAIKNYA DIHINDARI: ${script.avoid}`
    ],
  });

  // ── CARD 3: Rekomendasi penempatan peran sesuai DISC ────────────────────────
  const ROLE_FIT_COPY = {
    D: "Karena dia tipe D, coba kasih dia peran yang menantang dan butuh mimpin di depan: pegang proyek, tanggung jawab penuh atas satu hasil, atau koordinasi orang lain. Dia biasanya makin bersemangat kalau ada sesuatu yang perlu digerakkan, bukan cuma dijalani.",
    I: "Karena dia tipe I, coba arahkan ke peran yang banyak ketemu orang: jadi contact person ke klien atau stakeholder, presentasi, atau yang bikin suasana tim tetap hidup. Dia juga oke banget dijadiin jembatan antar divisi yang kepentingannya beda-beda.",
    S: "Karena dia tipe S, cocokkan dengan peran yang butuh kestabilan dan kesabaran: pegang proses yang jalan jangka panjang, tugas yang konsisten, atau mendampingi dan onboarding rekan baru. Dia bakal berkembang di tempat yang nggak berubah-ubah drastis.",
    C: "Karena dia tipe C, arahkan ke peran yang butuh presisi: analisis, quality control, dokumentasi, atau perencanaan — apa pun yang butuh ketelitian tinggi. Dia bakal lebih nyaman, dan hasilnya lebih maksimal, di ranah yang detailnya jelas.",
    "?": "Belum ada data DISC yang cukup buat kasih rekomendasi spesifik. Coba amati dulu kecenderungan alami karyawan ini sebelum menetapkan peran tetap buat dia.",
  };

  plan.push({
    type: "rolefit",
    title: "Rekomendasi Penempatan Peran",
    color: "#6366F1",
    bg: "#EEF2FF",
    border: "#C7D2FE",
    icon: "target",
    items: [
      "Peran yang dijalankan sangat memengaruhi kualitas kinerja. Kadang, kinerja yang rendah bukan karena orangnya kurang mampu — tapi karena ia mengerjakan hal yang kurang cocok dengan tipenya. Berikut rekomendasi penempatan dan peran yang cenderung sesuai dengan profil DISC-nya.",
      ROLE_FIT_COPY[selectedDisc] || ROLE_FIT_COPY["?"],
    ],
  });

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
    <label className="block text-xs sm:text-sm font-mono font-black text-muted uppercase tracking-widest">{label}</label>
    <div className="grid grid-cols-4 gap-2">
      {[1, 2, 3, 4].map(n => (
        <button key={n} type="button" onClick={() => onChange(n)}
          className={`py-3 sm:py-4 rounded-xl font-black text-base sm:text-lg transition-all border-2 ${value === n ? "bg-gold text-ink border-gold shadow-md" : "bg-cream text-mutedsoft border-line-cream hover:border-gold/40"}`}>
          {n}
        </button>
      ))}
    </div>
    {value && (
      <p className="text-[11px] sm:text-xs text-muted italic pt-1 pl-1">{RATING_ANCHORS[dim][value]}</p>
    )}
  </div>
);

const DISCSelector = ({ value, onChange }) => (
  <div className="space-y-1.5 sm:space-y-2">
    <label className="block text-xs sm:text-sm font-mono font-black text-muted uppercase tracking-widest">Profil Komunikasi (Opsional)</label>
    <div className="grid grid-cols-5 gap-1 sm:gap-2">
      {Object.entries(DISC_META).map(([id, m]) => (
        <button key={id} type="button" onClick={() => onChange(id)}
          className={`flex flex-col items-center p-1 sm:p-3 rounded-xl sm:rounded-2xl border-2 transition-all ${value === id ? "border-gold bg-cream2 shadow-md scale-105" : "border-line-cream bg-cream hover:border-gold/30"}`}>
          <div className={`w-6 h-6 sm:w-10 sm:h-10 rounded-full mb-1 sm:mb-2 ${m.bg} flex items-center justify-center text-white text-xs sm:text-lg font-black font-serif shadow`}>{id}</div>
          <span className="text-[8px] sm:text-[11px] font-black uppercase text-muted leading-tight text-center">{m.label}</span>
          <span className="text-[7px] sm:text-[9px] font-mono font-bold text-mutedsoft leading-tight text-center">{id}</span>
        </button>
      ))}
    </div>
  </div>
);

const DISCQuiz = ({ initialAnswers, onComplete, onSkip }) => {
  const [answers, setAnswers] = useState(initialAnswers);

  const handleSelect = (qIdx, letter) => {
    const next = [...answers];
    next[qIdx] = letter;
    setAnswers(next);
    if (next.every(a => a)) onComplete(next);
  };

  const allAnswered = answers.every(a => a);

  return (
    <div className="space-y-5 sm:space-y-6 bg-cream2 border border-line-cream rounded-2xl sm:rounded-3xl p-5 sm:p-6">
      <div className="flex justify-between items-center gap-3">
        <label className="block text-xs sm:text-sm font-mono font-black text-muted uppercase tracking-widest">Kuis Penentu DISC</label>
        <button type="button" onClick={onSkip} className="text-[11px] sm:text-xs font-bold text-indigo-600 hover:text-indigo-700 whitespace-nowrap">
          Lewati, saya sudah tahu
        </button>
      </div>
      {DISC_QUIZ_QUESTIONS.map((q, qi) => (
        <div key={qi} className="space-y-2">
          <p className="text-xs sm:text-sm font-bold text-ink">{qi + 1}. {q.text}</p>
          <div className="space-y-2">
            {q.options.map(opt => (
              <button
                key={opt.letter}
                type="button"
                onClick={() => handleSelect(qi, opt.letter)}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 text-xs sm:text-sm transition-all ${
                  answers[qi] === opt.letter
                    ? "border-gold bg-cream text-ink shadow-md"
                    : "border-line-cream bg-cream text-mutedsoft hover:border-gold/40"
                }`}
              >
                {opt.text}
              </button>
            ))}
          </div>
        </div>
      ))}
      {!allAnswered && (
        <p className="text-[11px] sm:text-xs text-mutedsoft italic">Jawab semua pertanyaan untuk melihat hasilnya.</p>
      )}
    </div>
  );
};

const NoteInput = ({ label, type, notes, onAdd, onUpdate, onRemove, prompt }) => (
  <div className="space-y-1.5 sm:space-y-2">
    <div className="flex justify-between items-center">
      <label className="text-xs sm:text-sm font-mono font-black text-muted uppercase tracking-widest">{label}</label>
      <button type="button" onClick={() => onAdd(type)} className="text-xs sm:text-sm font-bold text-indigo-600 flex items-center gap-1">
        <PlusCircle className="w-3 h-3 sm:w-4 sm:h-4" /> Tambah
      </button>
    </div>
    <p className="text-[11px] sm:text-xs text-mutedsoft italic">{prompt}</p>
    <div className="space-y-2">
      {notes.map((n, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input 
            className="flex-1 px-4 py-3 bg-cream border border-line-cream rounded-xl text-sm sm:text-base text-ink outline-none focus:ring-2 focus:ring-gold placeholder:text-mutedsoft"
            placeholder="Tuliskan bukti perilaku..." 
            value={n}
            onChange={e => onUpdate(type, i, e.target.value)} 
          />
          {notes.length > 1 && (
            <button type="button" onClick={() => onRemove(type, i)} className="p-2 sm:p-3 text-mutedsoft hover:text-red-400 transition-colors">
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
    q: "Q1", label: "Arahkan & Dampingi", color: "#EF4444", bg: "#FEF2F2",
    diagnosis: "Anggota tim ini belum punya kemampuan DAN motivasi yang memadai sekaligus. Ini situasi yang paling menantang buat seorang pemimpin — dan sayangnya juga yang paling sering ditangani dengan cara keliru.",
    rootCause: "Situasi ini jarang muncul tiba-tiba. Biasanya berasal dari salah satu dari tiga hal: (1) Penempatan yang kurang pas — orang baik di posisi yang salah. (2) Kelelahan berat yang dibiarkan terlalu lama sampai menggerus kemampuannya. (3) Sudah lama berada di peran yang tidak cocok tanpa pernah didampingi.",
    mistake: "Kesalahan paling umum: pemimpin yang cuma fokus pada satu sisi. Yang 'percaya potensi' terus melatih orang yang sebenarnya sudah kehilangan kemauan. Yang 'fokus hasil' terus menambah target tanpa sadar kemampuan dasarnya memang belum ada. Keduanya keliru — situasi ini butuh pendampingan dua sisi yang terstruktur dan sabar.",
    urgency: "Jangan dibiarkan berlarut. Bukan untuk buru-buru mengambil keputusan keras, tapi karena membiarkannya terlalu lama bisa menurunkan semangat seluruh tim yang menyaksikan. Mulai dari obrolan yang jujur — pahami akarnya dulu sebelum melangkah.",
  },
  {
    q: "Q2", label: "Latih & Bimbing", color: "#F59E0B", bg: "#FFFBEB",
    diagnosis: "Kemauan tinggi, kemampuan belum memadai. Paling sering terjadi pada anggota baru, yang baru naik jabatan, atau baru pindah divisi. Ini sebenarnya situasi yang paling mudah ditangani — asal pemimpin bergerak cepat.",
    rootCause: "Ini bukan soal karakter atau sikap. Mereka cuma belum punya alat, pengetahuan, atau pengalaman yang dibutuhkan untuk bekerja di level yang diharapkan. Energi dan kemauannya ada — tinggal diarahkan dengan struktur yang tepat.",
    mistake: "Kesalahan yang paling mahal: membiarkan mereka berjuang sendirian karena pemimpin terlalu sibuk, atau terlalu yakin semangat mereka akan menutup kekurangan keterampilannya. Tanpa rencana belajar yang jelas, semangat itu bisa habis dalam 2–3 bulan dan mereka tergelincir ke situasi yang lebih sulit — kali ini dengan rasa kecewa.",
    urgency: "Masa paling menentukan ada di 90 hari pertama. Buat rencana belajar yang konkret di minggu pertama, pasangkan dengan pendamping yang tepat, dan jadwalkan obrolan rutin. Investasi waktu di fase ini akan menumbuhkan mereka jadi andalan dalam 6–12 bulan.",
  },
  {
    q: "Q3", label: "Motivasi & Libatkan", color: "#3B82F6", bg: "#EFF6FF",
    diagnosis: "Kemampuan tinggi, tapi motivasinya menurun. Ini kuadran yang paling sering salah dibaca dan paling sering ditangani dengan cara yang justru memperburuk. Mereka bukan orang bermasalah — mereka andalan yang sedang dalam krisis diam-diam.",
    rootCause: "Selalu ada sesuatu yang spesifik yang memadamkan semangat mereka. Yang paling umum: merasa kontribusinya tidak terlihat atau dihargai. Konflik yang tak pernah benar-benar selesai. Merasa mentok — tak ada jalur berkembang atau tantangan baru yang berarti. Persoalan pribadi di luar kerja yang ikut terbawa. Atau nilai pribadi yang bergesekan dengan keputusan organisasi yang dirasa kurang adil.",
    mistake: "Kesalahan yang paling merusak: memperlakukan mereka seperti orang yang belum bisa. Memberi pelatihan tambahan pada orang yang sudah ahli terasa seperti meremehkan. Mengawasi ketat orang yang selama ini dipercaya akan menghancurkan sisa kepercayaan yang ada. Dua-duanya hampir pasti mempercepat niat mereka untuk pergi.",
    urgency: "Sempatkan obrolan dari hati ke hati segera setelah Anda melihat polanya. Bukan evaluasi kinerja — obrolan manusia ke manusia. Tiap minggu yang terlewat tanpa perhatian adalah satu langkah lebih dekat ke surat pengunduran diri.",
  },
  {
    q: "Q4", label: "Delegasikan & Kembangkan", color: "#10B981", bg: "#ECFDF5",
    diagnosis: "Kemampuan dan kemauan sama-sama tinggi. Mereka adalah sebagian kecil anggota tim yang menghasilkan sebagian besar hasil terbaik. Kehilangan satu orang seperti ini — dari sisi produktivitas, pengetahuan, dan semangat tim — bisa setara kehilangan beberapa orang sekaligus.",
    rootCause: "Risiko utama di sini bukan kinerja, tapi mempertahankan mereka. Mereka sering luput diperhatikan justru karena dianggap 'tidak perlu dikhawatirkan'. Padahal kebutuhan mereka untuk berkembang, diakui, dan ditantang terus bertumbuh. Ketika tak terpenuhi, mereka tidak mengeluh — mereka diam-diam mencari peluang lain.",
    mistake: "Dua kesalahan yang fatal: Pertama, terus menambah beban karena 'mereka pasti sanggup' — tanpa pengakuan yang setara. Kedua, tak pernah membahas perkembangan karier mereka karena mengira mereka pasti puas. Kalau keduanya terjadi bersamaan, hampir pasti berujung kehilangan mereka dalam 12–18 bulan.",
    urgency: "Sempatkan obrolan tentang karier mereka setidaknya tiap kuartal. Ini bukan kemewahan — ini langkah penting. Pemimpin yang tak punya waktu untuk andalannya akan segera punya banyak waktu kosong, karena mereka keburu pergi.",
  },
];

// ── KOMPONEN AUTH GATE (Login + Forgot Password) ────────────────────────────
const SupabaseAuthGate = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else onLoginSuccess(data.session);
    setLoading(false);
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) setError(error.message);
    else setForgotSent(true);
    setLoading(false);
  };

  if (forgotSent) return (
    <div className="min-h-screen bg-navy text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-soft border border-line-soft rounded-[32px] p-8 sm:p-10 shadow-2xl text-center">
        <div className="text-2xl sm:text-3xl font-semibold text-white mb-6">LEADER<span className="text-gold">LENS</span></div>
        <div className="w-14 h-14 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-7 h-7 text-gold" />
        </div>
        <p className="text-white font-bold mb-2">Email terkirim!</p>
        <p className="text-slate-400 text-sm mb-6">Cek inbox Anda dan klik link untuk membuat password baru.</p>
        <button onClick={() => { setForgotMode(false); setForgotSent(false); }}
          className="text-xs text-slate-500 hover:text-white transition-colors">
          Kembali ke login
        </button>
      </div>
    </div>
  );

  if (forgotMode) return (
    <div className="min-h-screen bg-navy text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-soft border border-line-soft rounded-[32px] p-8 sm:p-10 shadow-2xl">
        <div className="text-center mb-8">
          <div className="text-2xl sm:text-3xl font-semibold text-white">LEADER<span className="text-gold">LENS</span></div>
          <div className="text-xs text-slate-500 font-mono mt-2">Reset Password</div>
          <p className="text-xs text-slate-400 mt-3">Masukkan email Anda — kami kirim link untuk buat password baru.</p>
        </div>
        <form onSubmit={handleForgot} className="space-y-4">
          <input required type="email" placeholder="Alamat Email" value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-navy border border-line-soft rounded-xl text-white outline-none focus:border-indigo-500" />
          {error && <p className="text-xs text-red-500 font-bold text-center">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-gold text-ink py-3.5 rounded-xl font-black uppercase tracking-widest hover:bg-gold-deep transition-all disabled:opacity-50">
            {loading ? "Mengirim..." : "Kirim Link Reset"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <button onClick={() => setForgotMode(false)} className="text-xs text-slate-500 hover:text-white transition-colors">
            Kembali ke login
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-navy text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-soft border border-line-soft rounded-[32px] p-8 sm:p-10 shadow-2xl">
        <div className="text-center mb-8">
          <div className="text-2xl sm:text-3xl font-semibold text-white">LEADER<span className="text-gold">LENS</span></div>
          <div className="text-xs text-slate-500 font-mono mt-2">Silakan Masuk</div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required type="email" placeholder="Alamat Email" value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-navy border border-line-soft rounded-xl text-white outline-none focus:border-indigo-500" />
          <input required type="password" placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-navy border border-line-soft rounded-xl text-white outline-none focus:border-indigo-500" />
          {error && <p className="text-xs text-red-500 font-bold text-center">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-gold text-ink py-3.5 rounded-xl font-black uppercase tracking-widest hover:bg-gold-deep transition-all disabled:opacity-50">
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>
        <div className="mt-6 text-center space-y-2">
          <button onClick={() => setForgotMode(true)} className="block w-full text-xs text-slate-400 hover:text-white transition-colors">
            Lupa password? / Pertama kali login? Klik di sini
          </button>
          <p className="text-xs text-slate-600">
            Akses diberikan setelah pembelian. Hubungi kami jika ada kendala.
          </p>
        </div>
      </div>
    </div>
  );
};

// ── KOMPONEN SET PASSWORD (setelah reset link diklik) ────────────────────────
const SetPasswordScreen = ({ onSuccess }) => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError("Password tidak sama."); return; }
    if (password.length < 6) { setError("Password minimal 6 karakter."); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setError(error.message); setLoading(false); }
    else onSuccess();
  };

  return (
    <div className="min-h-screen bg-navy text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-soft border border-line-soft rounded-[32px] p-8 sm:p-10 shadow-2xl">
        <div className="text-center mb-8">
          <div className="text-2xl sm:text-3xl font-semibold text-white">LEADER<span className="text-gold">LENS</span></div>
          <div className="text-xs text-slate-500 font-mono mt-2">Buat Password Baru</div>
          <p className="text-xs text-slate-400 mt-3">Buat password untuk login berikutnya.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required type="password" placeholder="Password baru (min. 6 karakter)" value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-navy border border-line-soft rounded-xl text-white outline-none focus:border-indigo-500" />
          <input required type="password" placeholder="Konfirmasi password" value={confirm}
            onChange={e => setConfirm(e.target.value)}
            className="w-full px-4 py-3 bg-navy border border-line-soft rounded-xl text-white outline-none focus:border-indigo-500" />
          {error && <p className="text-xs text-red-500 font-bold text-center">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-gold text-ink py-3.5 rounded-xl font-black uppercase tracking-widest hover:bg-gold-deep transition-all disabled:opacity-50">
            {loading ? "Menyimpan..." : "Simpan Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

// ── KOMPONEN ONBOARDING PROFIL ────────────────────────────────────────────────
const OnboardingScreen = ({ session, onSuccess }) => {
  const [fullName, setFullName] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("profiles").upsert([{
      id: session.user.id,
      full_name: fullName.trim(),
      title: title.trim(),
      company: company.trim(),
    }]);
    if (error) { setError(error.message); setLoading(false); }
    else onSuccess({ full_name: fullName.trim(), title: title.trim(), company: company.trim() });
  };

  return (
    <div className="min-h-screen bg-navy text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-soft border border-line-soft rounded-[32px] p-8 sm:p-10 shadow-2xl">
        <div className="text-center mb-8">
          <div className="text-2xl sm:text-3xl font-semibold text-white">LEADER<span className="text-gold">LENS</span></div>
          <div className="text-xs text-slate-500 font-mono mt-2">Lengkapi Profil Anda</div>
          <p className="text-xs text-slate-400 mt-3">Data ini akan muncul di action plan yang Anda buat.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required type="text" placeholder="Nama Lengkap" value={fullName}
            onChange={e => setFullName(e.target.value)}
            className="w-full px-4 py-3 bg-navy border border-line-soft rounded-xl text-white outline-none focus:border-indigo-500" />
          <input required type="text" placeholder="Jabatan (contoh: Sales Manager)" value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-navy border border-line-soft rounded-xl text-white outline-none focus:border-indigo-500" />
          <input required type="text" placeholder="Nama Perusahaan" value={company}
            onChange={e => setCompany(e.target.value)}
            className="w-full px-4 py-3 bg-navy border border-line-soft rounded-xl text-white outline-none focus:border-indigo-500" />
          {error && <p className="text-xs text-red-500 font-bold text-center">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-gold text-ink py-3.5 rounded-xl font-black uppercase tracking-widest hover:bg-gold-deep transition-all disabled:opacity-50">
            {loading ? "Menyimpan..." : "Mulai Gunakan LeaderLens →"}
          </button>
        </form>
      </div>
    </div>
  );
};

// ── MAIN APP ──────────────────────────────────────────────────────────────
const EMPTY_FORM = { name: "", role: "", competency: 3, commitment: 3, competencyNotes: [""], commitmentNotes: [""], disc: "S", discQuizAnswers: null };

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
  const [quizExpanded, setQuizExpanded] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [expandedPlan, setExpandedPlan] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appFlow, setAppFlow] = useState("loading");
  // Ref to track flow — onAuthStateChange reads this to avoid overriding manual transitions
  const appFlowRef = useRef("loading");

  const updateFlow = (flow) => {
    appFlowRef.current = flow;
    setAppFlow(flow);
  };

  const fetchManagerProfile = async (userId) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (!error && data && data.full_name) {
      setManagerProfile(data);
      return true;
    }
    return false;
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

    // Handle token dari URL hash (invite link redirect)
    const hash = window.location.hash;
    console.log("URL HASH:", hash);
    if (hash && hash.includes('access_token')) {
      const params = new URLSearchParams(hash.substring(1));
      const type = params.get('type');
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      console.log("TOKEN TYPE:", type, "ACCESS:", accessToken?.substring(0,20));
      if (accessToken && refreshToken) {
        supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
          .then(({ data, error }) => {
            console.log("SET SESSION:", error ? error.message : "OK", data?.session?.user?.email);
            if (!error && data.session) {
              setSession(data.session);
              if (type === 'invite' || type === 'recovery') {
                updateFlow("setPassword");
              } else {
                fetchManagerProfile(data.session.user.id).then(hasProfile => {
                  updateFlow(hasProfile ? "app" : "onboarding");
                  fetchMembersForUser(data.session.user.id);
                });
              }
              // Bersihkan hash dari URL
              window.history.replaceState(null, '', window.location.pathname);
            }
          });
        return;
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchManagerProfile(session.user.id).then(hasProfile => {
          updateFlow(hasProfile ? "app" : "onboarding");
          fetchMembersForUser(session.user.id);
        });
      } else {
        updateFlow("login");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("AUTH EVENT:", event, session?.user?.email);
      setSession(session);

      // PASSWORD_RECOVERY = user klik link reset password
      if (event === "PASSWORD_RECOVERY") {
        updateFlow("setPassword");
        return;
      }

      // Jangan override flow yang sudah di-set manual
      // Hanya proses SIGNED_IN dan SIGNED_OUT
      if (event === "USER_UPDATED") return;
      if (event === "SIGNED_IN" && ["onboarding", "app", "setPassword"].includes(appFlowRef.current)) return;

      if (session) {
        fetchManagerProfile(session.user.id).then(hasProfile => {
          updateFlow(hasProfile ? "app" : "onboarding");
          fetchMembersForUser(session.user.id);
        });
      } else {
        setManagerProfile(null);
        setMembers([]);
        updateFlow("login");
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchMembersForUser]);

  const handleLogout = async () => { await supabase.auth.signOut(); };

  const closeModal = () => { setModal(false); setEditId(null); setForm(EMPTY_FORM); };

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setQuizExpanded(true);
    setModal(true);
  };

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
    setQuizExpanded(false);
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
        discQuizAnswers: clean.discQuizAnswers || null,
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
        discQuizAnswers: clean.discQuizAnswers || null,
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

  if (!isMounted || appFlow === "loading") return null;
  if (appFlow === "login" || !session) return <SupabaseAuthGate onLoginSuccess={(sess) => { setSession(sess); }} />;
  if (appFlow === "setPassword") return <SetPasswordScreen onSuccess={() => updateFlow("onboarding")} />;
  if (appFlow === "onboarding") return (
    <OnboardingScreen
      session={session}
      onSuccess={async (profile) => {
        setManagerProfile(profile);
        await fetchMembersForUser(session.user.id);
        updateFlow("app");
      }}
    />
  );

  return (
    <div className="min-h-screen bg-navy text-white pb-24 font-sans">
      <style>{`
        * { -webkit-font-smoothing: antialiased; }
        .fade-in { animation: fadeIn 0.4s ease forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        @media print {
          body, html, #root, .bg-navy, .min-h-screen { background-color: white !important; color: black !important; }
          .app-header, .hide-on-print { display: none !important; }
          .bg-soft { background-color: transparent !important; border: none !important; }
          .print-area { position: relative !important; background-color: white !important; color: black !important; box-shadow: none !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }
          .print-area * { color: black !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          @page { margin: 1.5cm; }
        }
      `}</style>

      {/* Header */}
      <div className="app-header border-b border-line-soft px-4 sm:px-6 py-4 sticky top-0 z-40 bg-navy/95 backdrop-blur hide-on-print">
        <div className="max-w-4xl lg:max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-7 h-7 sm:w-9 sm:h-9 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="9" stroke="#F2B441" strokeWidth="1.6"/>
              <circle cx="12" cy="12" r="3.4" fill="#F2B441"/>
            </svg>
            <div>
              <div className="text-sm sm:text-base lg:text-xl font-semibold tracking-tight leading-none uppercase">LEADER<span className="text-gold">LENS</span></div>
              {managerProfile?.full_name ? (
                <div className="text-[9px] sm:text-[11px] lg:text-xs text-slate-400 mt-0.5">
                  Halo, <span className="text-gold font-bold">{managerProfile.full_name.split(' ')[0]}</span>! 👋
                </div>
              ) : (
                <div className="text-[9px] sm:text-[11px] lg:text-xs text-slate-500 font-mono mt-0.5">Kelola tim, bukan tebak-tebakan</div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {health && !isLoadingData && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-soft border border-line-soft">
                <div className="text-[10px] sm:text-xs text-slate-400 font-mono">Tim</div>
                <div className="text-sm sm:text-base font-semibold font-serif text-white">{health.score}<span className="text-slate-500 text-[10px]">/100</span></div>
              </div>
            )}
            <button onClick={openAdd}
              className="bg-gold text-ink px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-black text-[10px] sm:text-xs lg:text-sm tracking-widest uppercase hover:bg-gold-deep transition-all active:scale-95 shadow-lg">
              + Tambah
            </button>
            <button onClick={handleLogout} title="Keluar"
              className="p-2 sm:p-2.5 bg-soft border border-line-soft rounded-xl text-slate-400 hover:text-red-400 hover:border-red-400/50 transition-all">
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
                <div key={qid} className="bg-soft border border-line-soft rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] sm:text-xs font-mono font-black text-slate-500 uppercase tracking-wider mb-1">{q.label}</div>
                    <div className="text-2xl sm:text-3xl font-black font-serif" style={{ color: q.color }}>{count}</div>
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full opacity-20" style={{ background: q.color }}></div>
                </div>
              );
            })}
          </div>
        )}
        {/* Priority cue — Q1 (Arahkan) & Q3 (Motivasi) are time-sensitive */}
{health && !isLoadingData && (() => {
  const priority = members.filter(m => ["Q1", "Q3"].includes(getQuadrant(m.competency, m.commitment).id));
  if (!priority.length) return null;
  return (
    <div className="mb-8 bg-gold/10 border border-gold/20 rounded-2xl px-5 py-4 flex items-start gap-3 fade-in hide-on-print">
      <Lightbulb className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
      <div>
        <div className="text-[10px] sm:text-xs font-mono font-black text-gold-deep uppercase tracking-widest mb-1">Prioritas Minggu Ini</div>
        <p className="text-sm text-slate-300 leading-relaxed">
          Mulai dari{" "}
          {priority.map((m, i) => {
            const q = getQuadrant(m.competency, m.commitment);
            return (
              <span key={m.id}>
                <strong className="text-white">{m.name}</strong>
                <span className="text-slate-500"> ({q.label})</span>
                {i < priority.length - 1 ? ", " : ""}
              </span>
            );
          })}
          . Situasi ini paling cepat memburuk kalau didiamkan.
        </p>
      </div>
    </div>
  );
})()}

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-soft rounded-2xl mb-8 border border-line-soft overflow-x-auto scrollbar-hide hide-on-print">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 min-w-[80px] py-3 rounded-xl text-[10px] sm:text-xs lg:text-sm font-mono font-black uppercase tracking-widest transition-all ${tab === t.id ? "bg-gold text-ink" : "text-slate-500 hover:text-slate-300"}`}>
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
                  <div className="text-slate-500 font-mono font-bold text-xs sm:text-sm uppercase tracking-widest">Memuat data dari database...</div>
                </div>
              ) : members.length === 0 ? (
                <div className="text-center py-24 sm:py-32">
                  <div className="text-slate-600 font-mono font-black text-xs sm:text-sm uppercase tracking-widest mb-4">Belum ada data</div>
                  <button onClick={() => setModal(true)} className="text-ink bg-gold px-6 py-3 sm:px-8 sm:py-4 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-widest hover:bg-gold-deep transition-all">
                    + Tambah Anggota Pertama
                  </button>
                </div>
              ) : (
                <div className="w-full max-w-lg lg:max-w-2xl flex flex-col gap-2 sm:gap-4 mt-4">
                    {/* Outer shell with padding to hold axis labels OUTSIDE the box */}
                    <div className="relative px-7 sm:px-9 py-7 sm:py-9">

                      {/* Axis endpoint labels — now in the outer padding */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 text-center text-slate-400 z-10 pointer-events-none select-none">
                        <span className="text-[8px] sm:text-[10px] font-mono font-black uppercase tracking-widest">Will Tinggi</span>
                      </div>
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center text-slate-400 z-10 pointer-events-none select-none">
                        <span className="text-[8px] sm:text-[10px] font-mono font-black uppercase tracking-widest">Will Rendah</span>
                      </div>
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400 z-10 pointer-events-none select-none" style={{ writingMode: 'vertical-rl', transform: 'translateY(-50%) rotate(180deg)' }}>
                        <span className="text-[8px] sm:text-[10px] font-mono font-black uppercase tracking-widest">Skill Rendah</span>
                      </div>
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 z-10 pointer-events-none select-none" style={{ writingMode: 'vertical-rl' }}>
                        <span className="text-[8px] sm:text-[10px] font-mono font-black uppercase tracking-widest">Skill Tinggi</span>
                      </div>

                    {/* The actual matrix box */}
                    <div className="w-full aspect-square relative bg-soft rounded-3xl sm:rounded-[32px] border border-line-dark overflow-hidden shadow-2xl">
                      <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-500/80 z-0"></div>
                      <div className="absolute top-0 left-1/2 w-[2px] h-full bg-slate-500/80 z-0"></div>

                      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 text-center text-slate-700/50 z-0 pointer-events-none select-none flex flex-col items-center justify-center w-full">
                        <div className="text-2xl sm:text-4xl font-black font-serif mb-1">Q2</div>
                        <div className="text-[9px] sm:text-xs font-mono font-bold uppercase tracking-widest">Latih & Bimbing</div>
                      </div>
                      <div className="absolute top-1/4 left-3/4 -translate-x-1/2 -translate-y-1/2 text-center text-slate-700/50 z-0 pointer-events-none select-none flex flex-col items-center justify-center w-full">
                        <div className="text-2xl sm:text-4xl font-black font-serif mb-1">Q4</div>
                        <div className="text-[9px] sm:text-xs font-mono font-bold uppercase tracking-widest">Delegasikan & Kembangkan</div>
                      </div>
                      <div className="absolute top-3/4 left-1/4 -translate-x-1/2 -translate-y-1/2 text-center text-slate-700/50 z-0 pointer-events-none select-none flex flex-col items-center justify-center w-full">
                        <div className="text-[9px] sm:text-xs font-mono font-bold uppercase tracking-widest mb-1">Arahkan & Dampingi</div>
                        <div className="text-2xl sm:text-4xl font-black font-serif">Q1</div>
                      </div>
                      <div className="absolute top-3/4 left-3/4 -translate-x-1/2 -translate-y-1/2 text-center text-slate-700/50 z-0 pointer-events-none select-none flex flex-col items-center justify-center w-full">
                        <div className="text-[9px] sm:text-xs font-mono font-bold uppercase tracking-widest mb-1">Motivasi & Libatkan</div>
                        <div className="text-2xl sm:text-4xl font-black font-serif">Q3</div>
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
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-navy shadow-xl flex items-center justify-center text-white text-xs sm:text-sm font-black font-serif relative"
                              style={{ background: q.color }}>
                              {m.name.charAt(0)}
                            </div>
                          </button>
                        );
                      })}
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
                <div className="text-center py-24 text-slate-500 font-mono font-bold text-xs sm:text-sm uppercase tracking-widest">Memuat data...</div>
              ) : members.length === 0 ? (
                <div className="text-center py-24 text-slate-600 font-mono font-black text-xs sm:text-sm uppercase tracking-widest">Belum ada anggota</div>
              ) : members.map(m => {
                const q = getQuadrant(m.competency, m.commitment);
                return (
                  <div key={m.id} className="bg-soft border border-line-soft rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 group">
                    <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-white font-black font-serif text-lg sm:text-xl flex-shrink-0" style={{ background: q.color }}>
                        {m.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="font-black text-white text-base sm:text-lg lg:text-xl leading-tight">{m.name}</div>
                        <div className="text-xs sm:text-sm text-slate-500 mt-1">{m.role || "—"}</div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-full" style={{ background: q.bg, color: q.text }}>{q.label}</span>
                          <span className="text-[10px] sm:text-xs font-mono font-black px-2.5 py-1 rounded-full bg-white/5 text-slate-300">{DISC_META[m.disc]?.label || "—"} ({m.disc})</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 self-end sm:self-center">
                      <button onClick={() => openEdit(m)} className="p-3 text-slate-600 hover:text-white rounded-xl hover:bg-white/5 transition-all"><Edit3 className="w-5 h-5 sm:w-6 sm:h-6" /></button>
                      <button onClick={() => setDeleteConfirm(m.id)} className="p-3 text-slate-600 hover:text-red-400 rounded-xl hover:bg-white/5 transition-all"><Trash2 className="w-5 h-5 sm:w-6 sm:h-6" /></button>
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
                const plan = getActionPlan(m);
                const dialogue = m.disc && m.disc !== "?" ? getDialogueExample(m.disc, q.id) : null;
                return (
                  <div key={m.id} className={`bg-soft rounded-2xl sm:rounded-3xl overflow-hidden border border-line-soft shadow-sm transition-all ${expandedPlan !== m.id ? 'hide-on-print' : ''}`}>
                    <button onClick={() => setExpandedPlan(expandedPlan === m.id ? null : m.id)}
                      className="w-full flex items-center justify-between p-5 sm:p-6 hover:bg-white/5 transition-all text-white hide-on-print">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-white font-black font-serif sm:text-lg" style={{ background: q.color }}>
                          {m.name.charAt(0)}
                        </div>
                        <div className="text-left">
                          <div className="font-black sm:text-lg lg:text-xl">{m.name}</div>
                          <div className="text-[10px] sm:text-xs text-slate-400 mt-1 uppercase tracking-widest font-mono">{getDocumentTitle(q.id)}</div>
                        </div>
                      </div>
                      <ChevronDown className={`w-5 h-5 sm:w-6 sm:h-6 text-slate-500 transition-transform ${expandedPlan === m.id ? "rotate-180" : ""}`} />
                    </button>
                    {expandedPlan === m.id && (
                      <div className="p-4 sm:p-8 bg-navy border-t border-line-soft">
                        <div className="flex justify-end mb-4 hide-on-print">
                          <button onClick={handlePrint} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors">
                            <Printer className="w-4 h-4" /> Simpan ke PDF
                          </button>
                        </div>
<div className="bg-cream text-ink rounded-sm shadow-2xl mx-auto max-w-3xl print-area">
                          
                          {/* ========================================================= */}
                          {/* HALAMAN 1: KHUSUS MANAJER (Tetap Lega seperti asli)       */}
                          {/* ========================================================= */}
                          <div className="p-8 sm:p-12">
                            <div className="border-b-2 border-ink pb-4 mb-6 text-center">
                              <h1 className="text-lg sm:text-xl font-black font-serif uppercase tracking-tight text-ink mb-1">1-on-1 Alignment Guide</h1>
                              <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em]">{managerProfile?.company || "Dokumen Pengembangan Tim"}</p>
                              <p className="text-xs font-bold text-gold-deep uppercase tracking-widest mt-2">Kolaboratif — Diskusikan Bersama Karyawan</p>
                            </div>
                            <div className="bg-cream2 border border-line-cream rounded-xl p-4 mb-8 flex justify-between items-center">
                              <div>
                                <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Target Diskusi</p>
                                <p className="font-black text-ink text-lg">{m.name}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Profil & Kuadran</p>
                                <p className="font-black" style={{ color: q.color }}>{DISC_META[m.disc]?.label || m.disc} | {q.label}</p>
                              </div>
                            </div>
                            <div className="space-y-6">
                              {plan.map((item, idx) => (
                                <div key={idx} className="break-inside-avoid bg-cream border border-line-cream rounded-xl p-5 shadow-sm">
                                  <h3 className="text-sm font-black font-serif uppercase tracking-wider mb-3 flex items-center gap-2 border-b border-line-cream pb-2" style={{ color: item.color }}>
                                    <span className="w-6 h-6 rounded flex items-center justify-center text-xs font-serif text-white" style={{ background: item.color }}>{idx + 1}</span>
                                    {item.title}
                                  </h3>
                                  <ul className="space-y-2 pl-6">
                                    {item.items.map((act, i) => (
                                      <li key={i} className="text-xs sm:text-sm text-muted leading-relaxed list-disc">{act}</li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* ========================================================= */}
                          {/* HALAMAN 2: CONTOH PERCAKAPAN (KHUSUS MANAJER)               */}
                          {/* ========================================================= */}
                          <div className="p-8 sm:p-12 border-t-8 border-ink" style={{ pageBreakBefore: 'always' }}>
                            <div className="border-b-2 border-ink pb-4 mb-6 text-center">
                              <h1 className="text-lg sm:text-xl font-black font-serif uppercase tracking-tight text-ink mb-1">Contoh Percakapan</h1>
                              <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em]">{managerProfile?.company || "Dokumen Pengembangan Tim"}</p>
                              <p className="text-xs font-bold text-gold-deep uppercase tracking-widest mt-2">Simulasi Obrolan 1-on-1 Sesuai Profil DISC & Kuadran</p>
                            </div>
                            <div className="break-inside-avoid bg-cream border border-line-cream rounded-xl p-5 sm:p-6 shadow-sm">
                              {dialogue ? (
                                <div className="space-y-3 pl-1">
                                  {dialogue.map((line, i) => (
                                    <p key={i} className="text-xs sm:text-sm text-muted leading-relaxed">
                                      <span className="font-black text-ink">{line.speaker === "manager" ? "Manager" : "Karyawan"}:</span> {line.text}
                                    </p>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs sm:text-sm text-muted italic">Contoh percakapan akan lebih personal setelah profil DISC ditentukan.</p>
                              )}
                            </div>
                          </div>

                          {/* ========================================================= */}
                          {/* HALAMAN 3: UNTUK ANGGOTA TIM (1-Kolom, Padat & Rapi)        */}
                          {/* ========================================================= */}
                          <div className="p-6 sm:p-10 border-t-8 border-ink" style={{ pageBreakBefore: 'always' }}>
                            
                            {/* Header - Diperkecil Marginnya */}
                            <div className="border-b-2 border-ink pb-3 mb-5 text-center">
                              <h1 className="text-xl sm:text-2xl font-black font-serif uppercase tracking-tight text-ink mb-1">{getDocumentTitle(q.id)}</h1>
                              <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Kolaboratif — Diskusikan & Sepakati Bersama</p>
                            </div>
                            
                            {/* Info Grid - Lebih Rapat */}
                            <div className="grid grid-cols-2 gap-3 mb-5 text-xs sm:text-sm bg-cream2 p-4 rounded-xl border border-line-cream">
                              <div>
                                <p className="text-muted text-[10px] font-bold uppercase tracking-wider mb-0.5">Nama Karyawan</p>
                                <p className="font-black text-ink">{m.name} <span className="font-medium text-mutedsoft">{m.role ? `— ${m.role}` : ""}</span></p>
                              </div>
                              <div>
                                <p className="text-muted text-[10px] font-bold uppercase tracking-wider mb-0.5">Tanggal</p>
                                <p className="font-black text-ink">{formatDate(Date.now())}</p>
                              </div>
                              <div className="mt-1">
                                <p className="text-muted text-[10px] font-bold uppercase tracking-wider mb-0.5">Disiapkan Oleh</p>
                                <p className="font-black text-ink">{managerProfile?.full_name}</p>
                              </div>
                              <div className="mt-1">
                                <p className="text-muted text-[10px] font-bold uppercase tracking-wider mb-0.5">Gaya Komunikasi</p>
                                <p className="font-black" style={{ color: DISC_META[m.disc]?.color || "#1F2937" }}>{DISC_META[m.disc]?.label || m.disc}</p>
                              </div>
                            </div>

                            {/* Section I - Digabung dalam 1 kotak agar hemat tempat */}
                            <div className="mb-5 break-inside-avoid">
                              <h3 className="text-xs sm:text-sm font-black font-serif uppercase tracking-wider text-ink mb-2">I. Observasi Kinerja Terkini</h3>
                              <div className="bg-cream p-4 rounded-xl border border-line-cream shadow-sm">
                                <div className="mb-4">
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1.5">Fakta Kompetensi Teknis</p>
                                  <ul className="list-disc pl-4 text-xs sm:text-sm text-muted space-y-1">
                                    {m.competencyNotes.map((note, i) => <li key={i}>{note || "-"}</li>)}
                                  </ul>
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1.5">Fakta Komitmen & Sikap</p>
                                  <ul className="list-disc pl-4 text-xs sm:text-sm text-muted space-y-1">
                                    {m.commitmentNotes.map((note, i) => <li key={i}>{note || "-"}</li>)}
                                  </ul>
                                </div>
                              </div>
                            </div>

                            {/* Section II - Jarak antar garis dirapatkan */}
                            <div className="break-inside-avoid">
                              <h3 className="text-xs sm:text-sm font-black font-serif uppercase tracking-wider text-ink mb-1">II. Rencana Tindakan (Disepakati Bersama)</h3>
                              <p className="text-[10px] sm:text-xs text-muted mb-4 italic">Tindakan spesifik, target terukur, dan tenggat waktu.</p>
                              <div className="space-y-6">
                                <div className="border-b border-line-cream h-5 flex items-end"><span className="text-xs font-bold text-ink ml-2">1.</span></div>
                                <div className="border-b border-line-cream h-5 flex items-end"><span className="text-xs font-bold text-ink ml-2">2.</span></div>
                                <div className="border-b border-line-cream h-5 flex items-end"><span className="text-xs font-bold text-ink ml-2">3.</span></div>
                              </div>
                            </div>

                            {/* Area Tanda Tangan - Dikurangi margin atasnya */}
                            <div className="mt-10 pt-4 grid grid-cols-2 gap-8 text-center break-inside-avoid">
                              <div>
                                <div className="border-b border-line-cream h-10 mx-6"></div>
                                <p className="mt-1.5 text-xs font-black text-ink">{managerProfile?.full_name || "Manajer"}</p>
                                {managerProfile?.title && <p className="text-[9px] text-mutedsoft font-medium">{managerProfile.title}</p>}
                              </div>
                              <div>
                                <div className="border-b border-line-cream h-10 mx-6"></div>
                                <p className="mt-1.5 text-xs font-black text-ink">{m.name}</p>
                                <p className="text-[9px] text-mutedsoft font-medium">{m.role || "—"}</p>
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
    <div className="bg-soft border border-line-soft rounded-3xl p-8 sm:p-10 text-center">
      <div className="flex items-center justify-center gap-3 mb-6">
        <BookOpen className="w-8 h-8 text-gold" />
        <span className="text-2xl sm:text-3xl font-black font-serif text-white">Selamat Datang di LeaderLens</span>
      </div>
      <p className="max-w-2xl mx-auto text-slate-300 text-lg leading-relaxed">
        LeaderLens membantu Anda memahami tim dengan cepat dan membangun rencana pengembangan yang <strong>kolaboratif</strong>, bukan sekadar evaluasi.
      </p>
      <p className="text-gold font-medium mt-4">Tujuannya: Setiap anggota tim merasa didukung, bukan dinilai.</p>
    </div>

    {/* 1. Alur Kerja - unchanged */}
    <section>
      <h3 className="text-xl sm:text-2xl font-black font-serif text-white mb-6 flex items-center gap-3">
        <Lightbulb className="w-7 h-7 text-amber-400" /> 
        1. Alur Kerja yang Direkomendasikan
      </h3>
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="bg-soft border border-line-soft rounded-3xl p-7 space-y-6">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-2xl bg-gold/10 flex items-center justify-center text-gold font-black flex-shrink-0">1</div>
            <div>
              <div className="font-semibold text-white">Update Penilaian</div>
              <p className="text-sm text-slate-400 mt-1">Lakukan rating Skill & Will setiap 4–6 minggu. Tulis bukti faktual (bukan opini).</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-2xl bg-gold/10 flex items-center justify-center text-gold font-black flex-shrink-0">2</div>
            <div>
              <div className="font-semibold text-white">Buka Action Plan</div>
              <p className="text-sm text-slate-400 mt-1">Pilih mode “Kolaboratif” lalu cetak halaman kedua untuk didiskusikan bersama karyawan.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-2xl bg-gold/10 flex items-center justify-center text-gold font-black flex-shrink-0">3</div>
            <div>
              <div className="font-semibold text-white">Diskusi 1-on-1</div>
              <p className="text-sm text-slate-400 mt-1">Gunakan skrip pembuka yang disediakan. Dengarkan lebih banyak daripada bicara, dan biarkan obrolan mengalir natural.</p>
            </div>
          </div>
        </div>

        <div className="bg-soft border border-line-soft rounded-3xl p-7">
          <h4 className="font-bold text-gold mb-4">Tips Cepat untuk Manajer Sibuk</h4>
          <ul className="space-y-4 text-sm text-slate-300">
            <li className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
              Mulai dengan 1–2 orang dulu, jangan langsung seluruh tim.
            </li>
            <li className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
              Catatan bukti boleh singkat — yang penting faktual.
            </li>
            <li className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
              Rayakan kemajuan kecil. Ini membangun kepercayaan.
            </li>
            <li className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
              Jadwalkan review bulanan singkat (15 menit per orang).
            </li>
          </ul>
        </div>
      </div>
    </section>

    {/* 2. Matriks - unchanged from previous */}
    <section>
      <h3 className="text-xl sm:text-2xl font-black font-serif text-white mb-6 flex items-center gap-3">
        <LayoutGrid className="w-7 h-7 text-slate-400" /> 
        2. Memahami 4 Kuadran Tim Anda
      </h3>

      {/* Rating scale reference */}
      <div className="bg-soft border border-line-soft rounded-2xl p-6 mb-6">
        <p className="text-sm text-slate-400 mb-4">Skor 1–4 yang Anda isi untuk setiap anggota tim artinya:</p>
        <div className="grid sm:grid-cols-2 gap-6 text-sm">
          <div>
            <div className="font-bold text-white mb-2">Skill (Kemampuan)</div>
            <ul className="space-y-1.5 text-slate-300">
              {[1, 2, 3, 4].map(n => (
                <li key={n} className="flex gap-2"><span className="text-slate-500 font-mono shrink-0">{n}</span><span>{RATING_ANCHORS.competency[n]}</span></li>
              ))}
            </ul>
          </div>
          <div>
            <div className="font-bold text-white mb-2">Will (Kemauan)</div>
            <ul className="space-y-1.5 text-slate-300">
              {[1, 2, 3, 4].map(n => (
                <li key={n} className="flex gap-2"><span className="text-slate-500 font-mono shrink-0">{n}</span><span>{RATING_ANCHORS.commitment[n]}</span></li>
              ))}
            </ul>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-4">Skor 3–4 dianggap "tinggi" — kombinasinya menentukan posisi kuadran di bawah ini.</p>
      </div>

      <div className="grid gap-6 sm:gap-8">
        {QUADRANT_GUIDE.map(g => (
          <div key={g.q} className="bg-cream rounded-3xl border border-line-cream overflow-hidden shadow-sm text-ink">
            <div className="p-6 flex items-center gap-5 font-bold text-lg" style={{ background: g.bg }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-2xl font-serif" style={{ background: g.color }}>
                {g.q}
              </div>
              <div>{g.label}</div>
            </div>
            <div className="p-6 space-y-5 text-sm">
              <p className="font-medium">{g.diagnosis}</p>
              <div className="grid sm:grid-cols-2 gap-5 text-xs sm:text-sm">
                <div className="bg-cream2 p-5 rounded-2xl border border-line-cream">
                  <strong className="block text-muted mb-2">Mengapa terjadi?</strong>
                  {g.rootCause}
                </div>
                <div className="bg-rose-50 p-5 rounded-2xl border border-rose-100">
                  <strong className="block text-rose-600 mb-2">Kesalahan yang sering dilakukan</strong>
                  {g.mistake}
                </div>
              </div>
              <div className="bg-gold/10 p-5 rounded-2xl border border-gold/20">
                <strong className="text-gold-deep">Langkah pertama yang paling penting:</strong> {g.urgency}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* 3. ENHANCED DISC SECTION - This is the only part we expanded */}
    <section>
      <h3 className="text-xl sm:text-2xl font-black font-serif text-white mb-6 flex items-center gap-3">
        <Users className="w-7 h-7 text-slate-400" /> 
        3. Memahami Profil Komunikasi DISC
      </h3>
      <p className="text-slate-400 mb-8 max-w-3xl">
        DISC membantu Anda menyesuaikan gaya komunikasi agar pesan lebih mudah diterima. 
        Pilih tipe yang paling mendekati perilaku karyawan. Gunakan ini sebagai panduan fleksibel, bukan label tetap.
      </p>

      <div className="grid grid-cols-1 gap-8">
        {Object.entries(DISC_META).map(([id, data]) => (
          <div key={id} className="bg-cream rounded-3xl p-8 border-l-8 shadow-sm" style={{ borderColor: data.color }}>
            <div className="flex items-start gap-6 mb-8">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl font-black font-serif text-white flex-shrink-0`} 
                   style={{ backgroundColor: data.color }}>
                {id}
              </div>
              <div className="pt-1">
                <h4 className="font-black text-2xl font-serif text-ink">{data.label}</h4>
                <p className="text-xs font-bold text-mutedsoft uppercase tracking-widest mt-0.5">{data.sub}</p>
                <p className="text-muted mt-1">{data.desc}</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-8">
              {/* Strengths */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-6 h-6 text-gold" />
                  <span className="font-bold uppercase tracking-widest text-gold-deep text-sm">Kekuatan Utama</span>
                </div>
                <p className="text-muted leading-relaxed">{data.strengths}</p>
              </div>

              {/* Weaknesses */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-6 h-6 text-amber-500" />
                  <span className="font-bold uppercase tracking-widest text-amber-600 text-sm">Area yang Perlu Diwaspadai</span>
                </div>
                <p className="text-muted leading-relaxed">{data.weaknesses}</p>
              </div>
            </div>

            {/* Practical Tips */}
            <div className="mt-10 pt-8 border-t border-line-cream">
              <div className="flex items-center gap-2 mb-5">
                <MessageCircle className="w-6 h-6 text-indigo-500" />
                <span className="font-bold uppercase tracking-widest text-indigo-600 text-sm">Cara Berkomunikasi Efektif</span>
              </div>
              <ul className="space-y-4 text-sm text-muted">
                <li className="flex gap-4">
                  <span className="text-gold font-black mt-1">→</span>
                  <span><strong>Buka percakapan dengan:</strong> "{getDISCScript(id).open}"</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-gold font-black mt-1">→</span>
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
      <h3 className="text-xl sm:text-2xl font-black font-serif text-white mb-6 flex items-center gap-3">
        <FileText className="w-7 h-7 text-slate-400" /> 
        4. Cara Mengisi & Melakukan Diskusi
      </h3>
      <div className="bg-soft border border-line-soft rounded-3xl p-8 space-y-8 text-slate-300">
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
            <div className="bg-gold/10 border border-gold/20 rounded-2xl p-6">
              <div className="text-gold font-bold mb-3">Gunakan</div>
              <ul className="space-y-2 text-sm">
                <li>• "Terlambat laporan 3 kali bulan ini"</li>
                <li>• "Proaktif membantu rekan saat deadline ketat"</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-line-soft">
          <h4 className="font-semibold text-white mb-4">Saat Diskusi dengan Anggota Tim</h4>
          <ul className="space-y-4 text-sm">
            <li className="flex gap-4">
              <div className="text-gold mt-1">✓</div>
              <div>Mulai dengan apresiasi atau rasa ingin tahu, bukan kritik.</div>
            </li>
            <li className="flex gap-4">
              <div className="text-gold mt-1">✓</div>
              <div>Dengarkan 70–80% waktu. Tanyakan pendapat mereka terlebih dahulu.</div>
            </li>
            <li className="flex gap-4">
              <div className="text-gold mt-1">✓</div>
              <div>Gunakan halaman kedua dokumen (yang lebih ringkas) sebagai panduan bersama.</div>
            </li>
            <li className="flex gap-4">
              <div className="text-gold mt-1">✓</div>
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
          <div className="bg-soft border border-line-soft rounded-3xl p-8 max-w-sm w-full shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
              <Trash2 className="w-7 h-7 text-red-400" />
            </div>
            <h3 className="text-lg font-black font-serif text-white text-center mb-2">Hapus Anggota?</h3>
            <p className="text-sm text-slate-400 text-center mb-8">Data ini akan dihapus permanen dan tidak bisa dikembalikan.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 rounded-xl font-black text-sm uppercase tracking-widest bg-white/5 text-slate-300 hover:bg-white/10 transition-all">
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
          <div className="bg-cream w-full h-full sm:h-auto sm:max-h-[90vh] max-w-2xl rounded-none sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            <div className="px-6 py-5 sm:px-8 border-b border-line-cream flex justify-between items-center bg-cream z-10 flex-shrink-0 shadow-sm">
              <h2 className="text-xl sm:text-2xl font-black font-serif text-ink">{editId ? "Edit Anggota Tim" : "Tambah Anggota Tim"}</h2>
              <button onClick={closeModal} className="p-2 sm:p-2.5 bg-cream2 rounded-full hover:bg-line-cream transition-colors">
                <X className="w-5 h-5 text-muted" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input required
                    className="w-full px-4 py-3 sm:py-4 bg-cream2 border border-line-cream rounded-2xl text-sm sm:text-base font-bold outline-none text-ink focus:ring-2 focus:ring-gold placeholder:text-mutedsoft"
                    placeholder="Nama Anggota" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                  <input
                    className="w-full px-4 py-3 sm:py-4 bg-cream2 border border-line-cream rounded-2xl text-sm sm:text-base font-bold outline-none text-ink focus:ring-2 focus:ring-gold placeholder:text-mutedsoft"
                    placeholder="Jabatan" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} />
                </div>
                <div className="space-y-3">
                  {quizExpanded ? (
                    <DISCQuiz
                      initialAnswers={form.discQuizAnswers || [null, null, null, null]}
                      onComplete={(answers) => setForm(f => ({ ...f, discQuizAnswers: answers, disc: scoreDiscQuiz(answers) }))}
                      onSkip={() => setQuizExpanded(false)}
                    />
                  ) : (
                    <button type="button" onClick={() => setQuizExpanded(true)}
                      className="text-[11px] sm:text-xs font-bold text-indigo-600 hover:text-indigo-700">
                      {form.discQuizAnswers ? "Jalankan ulang kuis" : "Belum yakin? Coba kuis penentu DISC"}
                    </button>
                  )}
                  <DISCSelector value={form.disc} onChange={v => setForm({ ...form, disc: v })} />
                </div>
                <div className="space-y-8 sm:space-y-10 border-t border-line-cream pt-8 sm:pt-10">
                  <div className="space-y-5">
                    <RatingSelector label="Skill (Kemampuan)" dim="competency" value={form.competency} onChange={v => setForm({ ...form, competency: v })} />
                    <NoteInput label="Bukti Kemampuan" type="competencyNotes" notes={form.competencyNotes} onAdd={addNote} onUpdate={updateNote} onRemove={removeNote} prompt="Bukti perilaku spesifik?" />
                  </div>
                  <div className="space-y-5 border-t border-line-cream pt-8 sm:pt-10">
                    <RatingSelector label="Will (Kemauan)" dim="commitment" value={form.commitment} onChange={v => setForm({ ...form, commitment: v })} />
                    <NoteInput label="Bukti Kemauan" type="commitmentNotes" notes={form.commitmentNotes} onAdd={addNote} onUpdate={updateNote} onRemove={removeNote} prompt="Bukti motivasi spesifik?" />
                  </div>
                </div>
                <div className="pt-4">
                  <button type="submit" disabled={isSubmitting}
                    className="w-full bg-gold text-ink py-4 sm:py-5 rounded-2xl font-black text-sm sm:text-base tracking-widest uppercase hover:bg-gold-deep active:scale-[0.98] transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSubmitting ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* WhatsApp Floating Button */}
      <a
        href={WA_URL}
        target="_blank"
        rel="noopener noreferrer"
        title="Hubungi Support via WhatsApp"
        className="hide-on-print fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
        style={{ background: "#25D366" }}
      >
        <svg viewBox="0 0 24 24" width="28" height="28" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </div>
  );
}