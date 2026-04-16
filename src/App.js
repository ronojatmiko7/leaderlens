import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, doc, setDoc, onSnapshot, query, deleteDoc 
} from 'firebase/firestore';
import { 
  getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged 
} from 'firebase/auth';
import { 
  Plus, Users, LayoutGrid, BookOpen, Trash2, Edit3, TrendingUp,
  Target, Award, X, PlusCircle, CheckCircle2, AlertTriangle,
  Wrench, ShieldAlert, MessageCircle, BarChart3, 
  ArrowRight, Clock, RefreshCw, HeartHandshake
} from 'lucide-react';

// --- Firebase Configuration & Initialization ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'leaderlens-app';

// --- Constants & Helpers ---
const DISC_META = {
  D: { label: "Dominance",   color: "#EF4444", bg: "bg-red-500",    desc: "Hasil & Kontrol"        },
  I: { label: "Influence",   color: "#F59E0B", bg: "bg-amber-400",  desc: "Antusiasme & Orang"   },
  S: { label: "Steadiness",  color: "#10B981", bg: "bg-emerald-500", desc: "Kerja Sama & Sabar" },
  C: { label: "Compliance",  color: "#3B82F6", bg: "bg-blue-500",   desc: "Akurasi & Kualitas"      },
};

const RATING_ANCHORS = {
  competency: {
    1: "Sangat Rendah: Perlu pengawasan penuh",
    2: "Rendah: Masih banyak error teknis",
    3: "Tinggi: Mandiri & hasil konsisten",
    4: "Sangat Tinggi: Mahir & bisa mengajar",
  },
  commitment: {
    1: "Sangat Rendah: Pasif / Terlihat demotivasi",
    2: "Rendah: Kurang inisiatif",
    3: "Tinggi: Antusias & konsisten",
    4: "Sangat Tinggi: Proaktif & menginspirasi",
  },
};

const getQuadrant = (comp, comm) => {
  const isHi = v => v > 2;
  if (!isHi(comp) && !isHi(comm)) return { id: "Q1", label: "Critical Area", color: "#EF4444", bg: "bg-red-500", text: "text-red-500" };
  if (!isHi(comp) && isHi(comm)) return { id: "Q2", label: "Potential Talent", color: "#F59E0B", bg: "bg-amber-500", text: "text-amber-500" };
  if (isHi(comp) && !isHi(comm)) return { id: "Q3", label: "Expert in Slump", color: "#3B82F6", bg: "bg-blue-500", text: "text-blue-500" };
  return { id: "Q4", label: "Star Performer", color: "#10B981", bg: "bg-emerald-500", text: "text-emerald-500" };
};

const getDISCScript = (disc) => ({
  D: { open: "Langsung ke hasil: 'Saya ingin bicara soal dampak kerja kamu.'", body: "Beri tantangan dan otonomi. Hindari micro-manage.", avoid: "Jangan bertele-tele atau terlalu emosional." },
  I: { open: "Hangat: 'Potensi kamu besar, mari buat kamu makin bersinar.'", body: "Gunakan pendekatan sosial. Beri pengakuan publik.", avoid: "Jangan abaikan sisi sosial atau terlalu kaku pada data." },
  S: { open: "Tenang: 'Mari kita diskusikan bagaimana meningkatkan kenyamanan kerja.'", body: "Jelaskan perubahan secara bertahap. Beri dukungan emosional.", avoid: "Jangan beri deadline mendadak atau nada bicara tinggi." },
  C: { open: "Logis: 'Berdasarkan data performa, ada beberapa hal teknis untuk diskusi.'", body: "Bawa bukti konkret. Beri waktu untuk memproses informasi.", avoid: "Jangan beri feedback tanpa dasar fakta yang kuat." },
}[disc || 'S']);

// --- Sub-Components (Extracted to prevent re-renders) ---

const RatingSelector = ({ label, dim, value, onChange }) => (
  <div className="space-y-4">
    <label className="block text-sm font-black text-slate-400 uppercase tracking-widest">{label}</label>
    <div className="grid grid-cols-4 gap-3">
      {[1, 2, 3, 4].map(n => (
        <button key={n} type="button" onClick={() => onChange(n)}
          className={`py-5 rounded-2xl font-black text-2xl transition-all border-2 ${value === n ? "bg-slate-900 text-white border-slate-900 shadow-xl scale-105" : "bg-white text-slate-400 border-slate-100 hover:border-slate-300"}`}>
          {n}
        </button>
      ))}
    </div>
    <p className="text-sm text-slate-500 font-bold pl-1 min-h-[1.5rem]">{value ? RATING_ANCHORS[dim][value] : ""}</p>
  </div>
);

const DISCSelector = ({ value, onChange }) => (
  <div className="space-y-4">
    <label className="block text-sm font-black text-slate-400 uppercase tracking-widest">Profil Komunikasi DISC</label>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Object.entries(DISC_META).map(([id, meta]) => (
        <button key={id} type="button" onClick={() => onChange(id)}
          className={`flex flex-col items-center p-5 rounded-3xl border-2 transition-all ${value === id ? "border-slate-900 bg-slate-50 ring-8 ring-slate-100/50" : "border-slate-100 bg-white hover:border-slate-200"}`}>
          <div className={`w-12 h-12 rounded-full mb-3 ${meta.bg} flex items-center justify-center text-white text-base font-black shadow-lg`}>{id}</div>
          <span className="text-sm font-black uppercase text-slate-800 tracking-wider">{meta.label}</span>
          <span className="text-xs text-slate-500 text-center leading-tight mt-2 px-1 font-medium">{meta.desc}</span>
        </button>
      ))}
    </div>
  </div>
);

const NoteInput = ({ label, type, notes, onAdd, onUpdate, onRemove, prompt }) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <label className="text-sm font-black text-slate-400 uppercase tracking-widest">{label}</label>
      <button type="button" onClick={() => onAdd(type)} className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-2">
        <PlusCircle className="w-5 h-5" /> Tambah Bukti
      </button>
    </div>
    <p className="text-sm text-slate-400 italic mb-2 leading-relaxed font-medium">{prompt}</p>
    {notes.map((n, i) => (
      <div key={i} className="flex gap-3">
        <input className="flex-1 px-5 py-4 bg-white border border-slate-200 rounded-2xl text-base font-medium outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
          placeholder="Tuliskan bukti perilaku spesifik di sini..." value={n}
          onChange={e => onUpdate(type, i, e.target.value)} />
        {notes.length > 1 && (
          <button type="button" onClick={() => onRemove(type, i)} className="p-3 text-slate-300 hover:text-red-500 bg-slate-50 rounded-2xl transition-colors">
            <Trash2 className="w-6 h-6" />
          </button>
        )}
      </div>
    ))}
  </div>
);

// --- Main Application ---

const App = () => {
  const [user, setUser] = useState(null);
  const [members, setMembers] = useState([]);
  const [tab, setTab] = useState('matrix');
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [form, setForm] = useState({
    name: '', role: '', competency: 2, commitment: 2, competencyNotes: [''], commitmentNotes: [''], disc: 'S'
  });

  // (1) Initialize Auth & Firestore
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth error:", err);
      }
    };
    initAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, setUser);
    return () => unsubscribeAuth();
  }, []);

  // (2) Listen to Firestore Data
  useEffect(() => {
    if (!user) return;
    const colRef = collection(db, 'artifacts', appId, 'public', 'data', 'members');
    const unsubscribe = onSnapshot(colRef, 
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        setMembers(data);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore error:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [user]);

  const closeModal = () => { 
    setModal(false); 
    setEditId(null); 
    setForm({ name: '', role: '', competency: 2, commitment: 2, competencyNotes: [''], commitmentNotes: [''], disc: 'S' }); 
  };

  const openEdit = (m) => {
    setForm({ 
      ...m, 
      competencyNotes: m.competencyNotes?.length ? m.competencyNotes : [''], 
      commitmentNotes: m.commitmentNotes?.length ? m.commitmentNotes : [''] 
    });
    setEditId(m.id); 
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    const clean = { 
      ...form, 
      competencyNotes: form.competencyNotes.filter(n => n.trim()), 
      commitmentNotes: form.commitmentNotes.filter(n => n.trim()),
      updatedAt: Date.now()
    };

    try {
      const docId = editId || Date.now().toString();
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'members', docId), clean);
      closeModal();
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const deleteMember = async (id) => { 
    if (!user) return;
    if(confirm("Hapus data anggota ini secara permanen?")) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'members', id));
      } catch (err) {
        console.error("Delete error:", err);
      }
    }
  };

  const getFullPlan = (m) => {
    const q = getQuadrant(m.competency, m.commitment);
    const script = getDISCScript(m.disc);
    const plans = [];

    if (m.competency <= 2) {
      plans.push({
        type: 'skill', title: 'Intervensi Teknis (The Hand)', color: 'text-indigo-600', bg: 'bg-indigo-50', icon: <Wrench className="w-6 h-6" />,
        items: [
          `Fokus perbaikan pada: "${m.competencyNotes[0] || 'area teknis'}" via SOP & Instruksi detail.`,
          `Lakukan Daily Check-in selama 10 menit untuk monitoring kualitas output.`,
          m.disc === 'C' ? 'Sediakan manual tertulis sangat akurat.' : 'Berikan demo praktis/shadowing.'
        ]
      });
    }

    if (m.commitment <= 2) {
      plans.push({
        type: 'will', title: 'Intervensi Motivasi (The Heart)', color: 'text-amber-600', bg: 'bg-amber-50', icon: <HeartHandshake className="w-6 h-6" />,
        items: [
          `Gunakan Active Listening untuk kendala perilaku: "${m.commitmentNotes[0] || 'penurunan semangat'}".`,
          `Pendekatan Komunikasi: ${script.open}`,
          `Gaya Coaching: ${script.body}`
        ]
      });
    }

    if (q.id === 'Q1') {
      plans.push({
        type: 'pip', title: 'PIP PATH (Urgent)', color: 'text-red-600', bg: 'bg-red-50', icon: <ShieldAlert className="w-6 h-6" />,
        items: [
          'Berikan deadline 3-12 bulan untuk pindah kuadran.',
          'Evaluasi progres mingguan secara formal.',
          'Jika gagal: Pertimbangkan Mutasi atau Terminasi.'
        ]
      });
    }

    if (q.id === 'Q4') {
      plans.push({
        type: 'growth', title: 'Growth Strategy', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: <Award className="w-6 h-6" />,
        items: [
          'Berikan otonomi penuh pada proyek strategis.',
          'Jadikan mentor bagi rekan di kuadran Q2.',
          'Diskusikan jalur suksesi kepemimpinan.'
        ]
      });
    }

    return plans;
  };

  if (loading && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <RefreshCw className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20 font-sans tracking-tight">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-8 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-slate-900 rounded-[28px] flex items-center justify-center shadow-2xl transform rotate-2">
              <BarChart3 className="text-white w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter leading-none mb-1">LEADER<span className="text-indigo-600">LENS</span></h1>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.3em]">v8.1 Digital Auditor</p>
            </div>
          </div>
          <button onClick={() => setModal(true)} className="bg-indigo-600 text-white px-10 py-4 rounded-3xl font-black text-base shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-3 uppercase tracking-widest">
            <Plus className="w-6 h-6" /> Tambah Profil
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-12">
        
        {/* Navigation Tabs */}
        <div className="flex bg-white p-2.5 rounded-[40px] mb-16 border border-slate-200 shadow-md">
          {['matrix', 'list', 'plans', 'guide'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-5 rounded-[32px] font-black text-sm uppercase tracking-widest transition-all ${tab === t ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-indigo-600'}`}>
              {t === 'matrix' ? 'Matriks' : t === 'list' ? 'Tim' : t === 'plans' ? 'Rencana' : 'Panduan'}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
          
          {tab === 'matrix' && (
            <div className="flex flex-col items-center">
              <div className="relative w-full max-w-4xl aspect-square bg-white border-2 border-slate-100 rounded-[80px] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden ring-1 ring-slate-200/50">
                <div className="absolute top-1/2 left-0 w-full h-px bg-slate-100"></div>
                <div className="absolute top-0 left-1/2 w-px h-full bg-slate-100"></div>
                
                <div className="absolute top-12 left-12 text-sm font-black text-amber-500/50 uppercase tracking-[0.4em]">Q2 Coaching</div>
                <div className="absolute top-12 right-12 text-sm font-black text-emerald-500/50 uppercase tracking-[0.4em] text-right">Q4 Delegating</div>
                <div className="absolute bottom-12 left-12 text-sm font-black text-red-500/50 uppercase tracking-[0.4em]">Q1 Directing</div>
                <div className="absolute bottom-12 right-12 text-sm font-black text-blue-500/50 uppercase tracking-[0.4em] text-right">Q3 Supporting</div>

                {members.map(m => {
                  const q = getQuadrant(m.competency, m.commitment);
                  const mapPos = (val) => (val - 0.5) * 25;
                  return (
                    <div key={m.id} className="absolute group z-10" style={{ bottom: `${mapPos(m.commitment)}%`, left: `${mapPos(m.competency)}%`, transform: 'translate(-50%, 50%)' }}>
                      <div className={`w-14 h-14 rounded-full border-4 border-white shadow-2xl ${q.bg} group-hover:scale-125 transition-all cursor-pointer ring-2 ring-slate-100 flex items-center justify-center text-white`} onClick={() => openEdit(m)}>
                        <span className="text-lg font-black">{m.name.charAt(0)}</span>
                        <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full border-2 border-white shadow-lg ${DISC_META[m.disc]?.bg || 'bg-slate-400'}`}></div>
                      </div>
                      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-sm font-bold px-5 py-2.5 rounded-[20px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none shadow-2xl scale-90 group-hover:scale-100">
                        {m.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'list' && (
            <div className="grid gap-8">
              {members.length === 0 ? <div className="text-center py-32 text-slate-300 font-black uppercase tracking-widest text-lg border-4 border-dashed border-slate-100 rounded-[64px]">Database Tim Kosong</div> : members.map(m => {
                const q = getQuadrant(m.competency, m.commitment);
                return (
                  <div key={m.id} className="bg-white p-10 rounded-[48px] border border-slate-100 flex items-center justify-between shadow-sm hover:shadow-2xl hover:scale-[1.02] transition-all group">
                    <div className="flex items-center gap-10">
                      <div className={`w-24 h-24 rounded-[36px] flex items-center justify-center text-white font-black text-4xl shadow-xl transform rotate-3 group-hover:rotate-0 transition-transform ${q.bg}`}>{m.name.charAt(0)}</div>
                      <div>
                        <h4 className="font-black text-slate-800 text-2xl tracking-tight leading-none mb-4">{m.name}</h4>
                        <div className="flex flex-wrap gap-4">
                           <span className="text-xs font-black bg-slate-100 text-slate-500 px-4 py-2 rounded-2xl uppercase tracking-widest">{m.role || 'Member'}</span>
                           <span className={`text-xs font-black px-4 py-2 rounded-2xl uppercase tracking-widest text-white ${q.bg}`}>{q.label}</span>
                           <span className={`text-xs font-black px-4 py-2 rounded-2xl uppercase tracking-widest text-white ${DISC_META[m.disc]?.bg}`}>DISC: {m.disc}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 pr-4">
                      <button onClick={() => openEdit(m)} className="p-5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-3xl transition-all"><Edit3 className="w-7 h-7" /></button>
                      <button onClick={() => deleteMember(m.id)} className="p-5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-3xl transition-all"><Trash2 className="w-7 h-7" /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'plans' && (
            <div className="space-y-12">
              {members.length === 0 ? <div className="text-center py-24 text-slate-300 font-bold text-xl">Belum ada analisis yang dibuat.</div> : members.map(m => {
                const q = getQuadrant(m.competency, m.commitment);
                const plans = getFullPlan(m);
                return (
                  <div key={m.id} className="bg-white rounded-[64px] p-16 shadow-sm border border-slate-100 relative overflow-hidden group">
                    <div className={`absolute top-0 right-0 px-12 py-5 text-sm font-black text-white uppercase rounded-bl-[48px] ${q.bg} tracking-[0.3em]`}>{q.label}</div>
                    
                    <div className="mb-14">
                      <h3 className="text-5xl font-black text-slate-800 tracking-tighter leading-none mb-6">{m.name}</h3>
                      <div className="flex items-center gap-6">
                         <div className={`px-6 py-2.5 rounded-2xl text-sm font-black uppercase tracking-widest text-white ${DISC_META[m.disc]?.bg}`}>Profil DISC: {m.disc}</div>
                         <p className="text-base font-bold text-slate-400 uppercase tracking-widest">{m.role || 'No Role Specified'}</p>
                      </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-10">
                      {plans.map((p, idx) => (
                        <div key={idx} className={`${p.bg} p-12 rounded-[56px] border border-white shadow-sm flex flex-col h-full`}>
                          <div className={`flex items-center gap-5 mb-8 ${p.color}`}>
                            {p.icon}
                            <h4 className="text-xl font-black uppercase tracking-widest">{p.title}</h4>
                          </div>
                          <ul className="space-y-6 flex-1">
                            {p.items.map((item, i) => (
                              <li key={i} className="flex gap-5 text-base text-slate-700 leading-relaxed font-bold">
                                <div className="w-3 h-3 rounded-full bg-current mt-2 flex-shrink-0 opacity-40"></div>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'guide' && (
            <div className="grid gap-10">
              {[
                { q: "Q1", label: "Critical Area", color: "bg-red-500", desc: "Kompetensi Rendah, Komitmen Rendah. Butuh arahan teknis ketat & diagnosa motivasi mendalam. Jika tidak ada progres dalam 3-12 bulan, siapkan jalur mutasi/terminasi." },
                { q: "Q2", label: "Potential Talent", color: "bg-amber-500", desc: "Kompetensi Rendah, Komitmen Tinggi. Aset masa depan. Fokus pada pelatihan teknis (SOP/Training) secepat mungkin agar semangatnya tidak padam." },
                { q: "Q3", label: "Expert in Slump", color: "bg-blue-500", desc: "Kompetensi Tinggi, Komitmen Rendah. Masalah ada di hati/pikiran. Gunakan Active Listening. Cari tahu hambatan motivasinya. Beri tantangan baru agar tidak bosan." },
                { q: "Q4", label: "Star Performer", color: "bg-emerald-500", desc: "Kompetensi Tinggi, Komitmen Tinggi. Fokus pada delegasi penuh, tantangan strategis, dan persiapkan sebagai calon suksesor kepemimpinan." }
              ].map(g => (
                <div key={g.q} className="bg-white p-14 rounded-[64px] border border-slate-100 shadow-sm flex gap-12 items-start hover:shadow-2xl transition-all">
                   <div className={`w-32 h-32 rounded-[40px] flex items-center justify-center text-white font-black text-5xl flex-shrink-0 ${g.color} shadow-2xl shadow-current/20`}>{g.q}</div>
                   <div>
                     <h4 className="text-3xl font-black text-slate-800 mb-4">{g.label}</h4>
                     <p className="text-lg text-slate-500 leading-relaxed font-medium">{g.desc}</p>
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal / Overlay Form */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="bg-white w-full max-w-4xl rounded-[72px] shadow-2xl overflow-hidden max-h-[95vh] flex flex-col border border-white">
            <div className="px-16 py-12 pb-6 flex justify-between items-center bg-white sticky top-0 z-10">
              <div>
                <h2 className="text-4xl font-black text-slate-800 tracking-tighter">{editId ? 'Update' : 'Baru'} Mapping</h2>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">Diagnosis Performa & Motivasi Tim</p>
              </div>
              <button onClick={closeModal} className="p-5 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 transition-all"><X className="w-8 h-8" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="px-16 py-12 pt-6 space-y-14 overflow-y-auto">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-sm font-black text-slate-400 uppercase tracking-widest px-1">Nama Anggota</label>
                  <input required className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-lg font-bold outline-none focus:ring-4 focus:ring-indigo-100 transition-all" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Nama Lengkap" />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-black text-slate-400 uppercase tracking-widest px-1">Jabatan</label>
                  <input className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-lg font-bold outline-none focus:ring-4 focus:ring-indigo-100 transition-all" value={form.role} onChange={e => setForm({...form, role: e.target.value})} placeholder="Contoh: Operation Manager" />
                </div>
              </div>

              <div className="p-12 bg-slate-50/50 rounded-[64px] border border-slate-100 space-y-16">
                <DISCSelector value={form.disc} onChange={v => setForm({...form, disc: v})} />
                
                <div className="grid sm:grid-cols-2 gap-16">
                  <div className="space-y-12">
                    <RatingSelector label="Rating Kompetensi" dim="competency" value={form.competency} onChange={v => setForm({...form, competency: v})} />
                    <NoteInput label="Bukti Kompetensi" type="competencyNotes" notes={form.competencyNotes} onAdd={() => setForm({...form, competencyNotes: [...form.competencyNotes, '']})} onUpdate={(t, i, v) => { const n = [...form.competencyNotes]; n[i] = v; setForm({...form, competencyNotes: n}); }} onRemove={(t, i) => setForm({...form, competencyNotes: form.competencyNotes.filter((_, idx) => idx !== i)})} prompt="Apa alasan Anda memberikan angka kompetensi tersebut?" />
                  </div>
                  <div className="space-y-12">
                    <RatingSelector label="Rating Komitmen" dim="commitment" value={form.commitment} onChange={v => setForm({...form, commitment: v})} />
                    <NoteInput label="Bukti Komitmen" type="commitmentNotes" notes={form.commitmentNotes} onAdd={() => setForm({...form, commitmentNotes: [...form.commitmentNotes, '']})} onUpdate={(t, i, v) => { const n = [...form.commitmentNotes]; n[i] = v; setForm({...form, commitmentNotes: n}); }} onRemove={(t, i) => setForm({...form, commitmentNotes: form.commitmentNotes.filter((_, idx) => idx !== i)})} prompt="Apa alasan Anda memberikan angka komitmen tersebut?" />
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full bg-slate-900 text-white py-8 rounded-[40px] font-black text-base tracking-[0.25em] shadow-2xl hover:bg-indigo-600 transition-all uppercase mb-10">Simpan Analisis</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
