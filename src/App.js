import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, collection, doc, setDoc, onSnapshot, deleteDoc 
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

/** * --- KONFIGURASI DAN HELPER ---
 * Komponen didefinisikan di luar App untuk mencegah re-render & kehilangan fokus saat mengetik.
 */

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

// --- SUB-KOMPONEN UI (FONT OPTIMIZED) ---

const RatingSelector = ({ label, dim, value, onChange }) => (
  <div className="space-y-4">
    <label className="block text-sm font-black text-slate-400 uppercase tracking-widest">{label}</label>
    <div className="grid grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(n => (
        <button key={n} type="button" onClick={() => onChange(n)}
          className={`py-6 rounded-3xl font-black text-3xl transition-all border-2 ${value === n ? "bg-slate-900 text-white border-slate-900 shadow-xl scale-105" : "bg-white text-slate-400 border-slate-100 hover:border-slate-400"}`}>
          {n}
        </button>
      ))}
    </div>
    <p className="text-sm text-slate-500 font-bold pl-1 min-h-[1.5rem] italic">{value ? RATING_ANCHORS[dim][value] : ""}</p>
  </div>
);

const DISCSelector = ({ value, onChange }) => (
  <div className="space-y-4">
    <label className="block text-sm font-black text-slate-400 uppercase tracking-widest">Profil Komunikasi DISC</label>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Object.entries(DISC_META).map(([id, meta]) => (
        <button key={id} type="button" onClick={() => onChange(id)}
          className={`flex flex-col items-center p-6 rounded-[32px] border-2 transition-all ${value === id ? "border-slate-900 bg-slate-50 ring-8 ring-slate-100/50" : "border-slate-100 bg-white hover:border-slate-300"}`}>
          <div className={`w-14 h-14 rounded-full mb-3 ${meta.bg} flex items-center justify-center text-white text-lg font-black shadow-lg`}>{id}</div>
          <span className="text-base font-black uppercase text-slate-800 tracking-wider">{meta.label}</span>
          <span className="text-xs text-slate-500 text-center leading-tight mt-2 px-1 font-bold">{meta.desc}</span>
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
    <p className="text-sm text-slate-400 italic mb-2 leading-relaxed font-bold">{prompt}</p>
    {notes.map((n, i) => (
      <div key={i} className="flex gap-3">
        <input className="flex-1 px-6 py-4 bg-white border border-slate-200 rounded-2xl text-base font-bold outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
          placeholder="Tuliskan bukti perilaku nyata di sini..." value={n}
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

// --- KOMPONEN UTAMA ---

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

  // Safe Configuration Access
  const getFirebaseConfig = () => {
    try {
      return typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
    } catch (e) { return null; }
  };
  const config = getFirebaseConfig();
  const safeAppId = typeof __app_id !== 'undefined' ? __app_id : 'leaderlens-local';

  // --- INTEGRASI STORAGE (FIREBASE DENGAN FALLBACK LOCALSTORAGE) ---
  useEffect(() => {
    if (!config) {
      // Fallback ke LocalStorage jika di lingkungan luar (seperti GitHub)
      const saved = localStorage.getItem('leaderlens_offline_data');
      if (saved) setMembers(JSON.parse(saved));
      setLoading(false);
      return;
    }

    const firebaseApp = getApps().length === 0 ? initializeApp(config) : getApps()[0];
    const auth = getAuth(firebaseApp);
    const db = getFirestore(firebaseApp);

    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) { console.error("Auth error", err); }
    };
    initAuth();

    const unsubscribeAuth = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
      if (usr) {
        const colRef = collection(db, 'artifacts', safeAppId, 'public', 'data', 'members');
        const unsubData = onSnapshot(colRef, (snap) => {
          setMembers(snap.docs.map(d => ({ ...d.data(), id: d.id })));
          setLoading(false);
        }, () => setLoading(false));
        return unsubData;
      }
    });
    return () => unsubscribeAuth();
  }, [config, safeAppId]);

  // Sync to LocalStorage as secondary backup or primary for offline
  useEffect(() => {
    if (!config) {
      localStorage.setItem('leaderlens_offline_data', JSON.stringify(members));
    }
  }, [members, config]);

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
    const clean = { 
      ...form, 
      competencyNotes: form.competencyNotes.filter(n => n.trim()), 
      commitmentNotes: form.commitmentNotes.filter(n => n.trim()),
      updatedAt: Date.now()
    };

    if (config && user) {
      const db = getFirestore();
      const docId = editId || Date.now().toString();
      await setDoc(doc(db, 'artifacts', safeAppId, 'public', 'data', 'members', docId), clean);
    } else {
      // Offline mode
      if (editId) {
        setMembers(members.map(m => m.id === editId ? { ...clean, id: editId } : m));
      } else {
        setMembers([...members, { ...clean, id: Date.now().toString() }]);
      }
    }
    closeModal();
  };

  const deleteMember = async (id) => { 
    if(confirm("Hapus data anggota ini secara permanen?")) {
      if (config && user) {
        const db = getFirestore();
        await deleteDoc(doc(db, 'artifacts', safeAppId, 'public', 'data', 'members', id));
      } else {
        setMembers(members.filter(m => m.id !== id));
      }
    }
  };

  const getFullPlan = (m) => {
    const q = getQuadrant(m.competency, m.commitment);
    const script = getDISCScript(m.disc);
    const plans = [];

    if (m.competency <= 2) {
      plans.push({
        type: 'skill', title: 'Intervensi Teknis (The Hand)', color: 'text-indigo-600', bg: 'bg-indigo-50', icon: <Wrench className="w-8 h-8" />,
        items: [
          `Fokus perbaikan pada: "${m.competencyNotes[0] || 'area teknis'}" via SOP & Instruksi detail.`,
          `Lakukan Daily Check-in selama 10 menit untuk monitoring kualitas output.`,
          m.disc === 'C' ? 'Sediakan manual tertulis sangat akurat.' : 'Berikan demo praktis/shadowing.'
        ]
      });
    }

    if (m.commitment <= 2) {
      plans.push({
        type: 'will', title: 'Intervensi Motivasi (The Heart)', color: 'text-amber-600', bg: 'bg-amber-50', icon: <HeartHandshake className="w-8 h-8" />,
        items: [
          `Gunakan Active Listening untuk kendala perilaku: "${m.commitmentNotes[0] || 'penurunan semangat'}".`,
          `Pendekatan Komunikasi: ${script.open}`,
          `Gaya Coaching: ${script.body}`
        ]
      });
    }

    if (q.id === 'Q1') {
      plans.push({
        type: 'pip', title: 'PIP PATH (Urgent)', color: 'text-red-600', bg: 'bg-red-50', icon: <ShieldAlert className="w-8 h-8" />,
        items: [
          'Berikan deadline 3-12 bulan untuk pindah kuadran.',
          'Evaluasi progres mingguan secara formal.',
          'Jika gagal: Pertimbangkan Mutasi atau Terminasi.'
        ]
      });
    }

    if (q.id === 'Q4') {
      plans.push({
        type: 'growth', title: 'Growth Strategy', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: <Award className="w-8 h-8" />,
        items: [
          'Berikan otonomi penuh pada proyek strategis.',
          'Jadikan mentor bagi rekan di kuadran Q2.',
          'Diskusikan jalur suksesi kepemimpinan.'
        ]
      });
    }
    return plans;
  };

  if (loading && config) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><RefreshCw className="w-12 h-12 text-indigo-600 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20 font-sans tracking-tight">
      <header className="bg-white border-b border-slate-200 px-8 py-10 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 bg-slate-900 rounded-[32px] flex items-center justify-center shadow-2xl transform rotate-2">
              <BarChart3 className="text-white w-10 h-10" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter leading-none mb-2">LEADER<span className="text-indigo-600">LENS</span></h1>
              <p className="text-sm font-black text-slate-400 uppercase tracking-[0.4em]">Strategic People Auditor v8.1</p>
            </div>
          </div>
          <button onClick={() => setModal(true)} className="bg-indigo-600 text-white px-12 py-5 rounded-[32px] font-black text-lg shadow-2xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-4 uppercase tracking-[0.2em]">
            <Plus className="w-8 h-8" /> Tambah Profil
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-16">
        <div className="flex bg-white p-3 rounded-[48px] mb-20 border border-slate-200 shadow-xl">
          {['matrix', 'list', 'plans', 'guide'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-6 rounded-[40px] font-black text-sm uppercase tracking-widest transition-all ${tab === t ? 'bg-slate-900 text-white shadow-2xl' : 'text-slate-400 hover:text-indigo-600'}`}>
              {t === 'matrix' ? 'Matriks' : t === 'list' ? 'Tim' : t === 'plans' ? 'Rencana' : 'Panduan'}
            </button>
          ))}
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000">
          {tab === 'matrix' && (
            <div className="flex flex-col items-center">
              <div className="relative w-full max-w-5xl aspect-square bg-white border-2 border-slate-100 rounded-[100px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden ring-1 ring-slate-200/50">
                <div className="absolute top-1/2 left-0 w-full h-px bg-slate-100"></div>
                <div className="absolute top-0 left-1/2 w-px h-full bg-slate-100"></div>
                
                <div className="absolute top-16 left-16 text-sm font-black text-amber-500/50 uppercase tracking-[0.5em]">Q2 Coaching</div>
                <div className="absolute top-16 right-16 text-sm font-black text-emerald-500/50 uppercase tracking-[0.5em] text-right">Q4 Delegating</div>
                <div className="absolute bottom-16 left-16 text-sm font-black text-red-500/50 uppercase tracking-[0.5em]">Q1 Directing</div>
                <div className="absolute bottom-16 right-16 text-sm font-black text-blue-500/50 uppercase tracking-[0.5em] text-right">Q3 Supporting</div>

                {members.map(m => {
                  const q = getQuadrant(m.competency, m.commitment);
                  const mapPos = (val) => (val - 0.5) * 25;
                  return (
                    <div key={m.id} className="absolute group z-10" style={{ bottom: `${mapPos(m.commitment)}%`, left: `${mapPos(m.competency)}%`, transform: 'translate(-50%, 50%)' }}>
                      <div className={`w-16 h-16 rounded-full border-4 border-white shadow-2xl ${q.bg} group-hover:scale-125 transition-all cursor-pointer ring-4 ring-slate-100 flex items-center justify-center text-white`} onClick={() => openEdit(m)}>
                        <span className="text-xl font-black">{m.name.charAt(0)}</span>
                        <div className={`absolute -top-1 -right-1 w-7 h-7 rounded-full border-4 border-white shadow-xl ${DISC_META[m.disc]?.bg || 'bg-slate-400'}`}></div>
                      </div>
                      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-sm font-bold px-6 py-3 rounded-[24px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none shadow-2xl scale-90 group-hover:scale-100">
                        {m.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'list' && (
            <div className="grid gap-10">
              {members.length === 0 ? <div className="text-center py-40 text-slate-300 font-black uppercase tracking-widest text-2xl border-8 border-dashed border-slate-100 rounded-[100px]">Daftar Tim Kosong</div> : members.map(m => {
                const q = getQuadrant(m.competency, m.commitment);
                return (
                  <div key={m.id} className="bg-white p-12 rounded-[64px] border border-slate-100 flex items-center justify-between shadow-sm hover:shadow-2xl hover:scale-[1.02] transition-all group">
                    <div className="flex items-center gap-12">
                      <div className={`w-28 h-28 rounded-[40px] flex items-center justify-center text-white font-black text-5xl shadow-2xl transform rotate-3 group-hover:rotate-0 transition-transform ${q.bg}`}>{m.name.charAt(0)}</div>
                      <div>
                        <h4 className="font-black text-slate-800 text-3xl tracking-tighter leading-none mb-5">{m.name}</h4>
                        <div className="flex flex-wrap gap-5">
                           <span className="text-xs font-black bg-slate-100 text-slate-500 px-5 py-2.5 rounded-[20px] uppercase tracking-widest">{m.role || 'Member'}</span>
                           <span className={`text-xs font-black px-5 py-2.5 rounded-[20px] uppercase tracking-widest text-white ${q.bg}`}>{q.label}</span>
                           <span className={`text-xs font-black px-5 py-2.5 rounded-[20px] uppercase tracking-widest text-white ${DISC_META[m.disc]?.bg}`}>DISC: {m.disc}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 pr-6">
                      <button onClick={() => openEdit(m)} className="p-6 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-[32px] transition-all"><Edit3 className="w-8 h-8" /></button>
                      <button onClick={() => deleteMember(m.id)} className="p-6 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-[32px] transition-all"><Trash2 className="w-8 h-8" /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'plans' && (
            <div className="space-y-16">
              {members.map(m => {
                const q = getQuadrant(m.competency, m.commitment);
                const plans = getFullPlan(m);
                return (
                  <div key={m.id} className="bg-white rounded-[80px] p-20 shadow-sm border border-slate-100 relative overflow-hidden group">
                    <div className={`absolute top-0 right-0 px-16 py-6 text-sm font-black text-white uppercase rounded-bl-[60px] ${q.bg} tracking-[0.4em]`}>{q.label}</div>
                    <div className="mb-16">
                      <h3 className="text-6xl font-black text-slate-800 tracking-tighter leading-none mb-8">{m.name}</h3>
                      <div className="flex items-center gap-6">
                         <div className={`px-8 py-3 rounded-[24px] text-sm font-black uppercase tracking-widest text-white ${DISC_META[m.disc]?.bg}`}>Profil DISC: {m.disc}</div>
                         <p className="text-lg font-bold text-slate-400 uppercase tracking-widest">{m.role || 'Jabatan Belum Diisi'}</p>
                      </div>
                    </div>
                    <div className="grid lg:grid-cols-2 gap-12">
                      {plans.map((p, idx) => (
                        <div key={idx} className={`${p.bg} p-14 rounded-[64px] border border-white shadow-xl flex flex-col h-full hover:scale-[1.03] transition-transform`}>
                          <div className={`flex items-center gap-6 mb-10 ${p.color}`}>
                            {p.icon}
                            <h4 className="text-2xl font-black uppercase tracking-widest">{p.title}</h4>
                          </div>
                          <ul className="space-y-8 flex-1">
                            {p.items.map((item, i) => (
                              <li key={i} className="flex gap-6 text-lg text-slate-700 leading-relaxed font-bold">
                                <div className="w-4 h-4 rounded-full bg-current mt-2.5 flex-shrink-0 opacity-40"></div>
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
            <div className="grid gap-12">
              {[
                { q: "Q1", label: "Critical Area", color: "bg-red-500", desc: "Kompetensi Rendah, Komitmen Rendah. Butuh arahan teknis ketat & diagnosa motivasi mendalam. Jika tidak ada progres dalam 3-12 bulan, siapkan jalur mutasi/terminasi." },
                { q: "Q2", label: "Potential Talent", color: "bg-amber-500", desc: "Kompetensi Rendah, Komitmen Tinggi. Aset masa depan. Fokus pada pelatihan teknis (SOP/Training) secepat mungkin agar semangatnya tidak padam." },
                { q: "Q3", label: "Expert in Slump", color: "bg-blue-500", desc: "Kompetensi Tinggi, Komitmen Rendah. Masalah ada di hati/pikiran. Gunakan Active Listening. Cari tahu hambatan motivasinya. Beri tantangan baru agar tidak bosan." },
                { q: "Q4", label: "Star Performer", color: "bg-emerald-500", desc: "Kompetensi Tinggi, Komitmen Tinggi. Fokus pada delegasi penuh, tantangan strategis, dan persiapkan sebagai calon suksesor kepemimpinan." }
              ].map(g => (
                <div key={g.q} className="bg-white p-16 rounded-[80px] border border-slate-100 shadow-sm flex gap-16 items-start hover:shadow-2xl transition-all">
                   <div className={`w-40 h-40 rounded-[48px] flex items-center justify-center text-white font-black text-6xl flex-shrink-0 ${g.color} shadow-2xl shadow-current/30`}>{g.q}</div>
                   <div className="pt-4">
                     <h4 className="text-4xl font-black text-slate-800 mb-6">{g.label}</h4>
                     <p className="text-xl text-slate-500 leading-relaxed font-bold">{g.desc}</p>
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* MODAL FORM (LARGE FONT OPTIMIZED) */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-slate-900/80 backdrop-blur-3xl animate-in fade-in duration-500">
          <div className="bg-white w-full max-w-5xl rounded-[80px] shadow-2xl overflow-hidden max-h-[95vh] flex flex-col border border-white">
            <div className="px-20 py-16 pb-8 flex justify-between items-center bg-white sticky top-0 z-10">
              <div>
                <h2 className="text-5xl font-black text-slate-800 tracking-tighter">{editId ? 'Update' : 'Baru'} Mapping</h2>
                <p className="text-base font-bold text-slate-400 uppercase tracking-widest mt-4">Audit Diagnosis Performa & Motivasi Tim</p>
              </div>
              <button onClick={closeModal} className="p-6 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 transition-all"><X className="w-10 h-10" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="px-20 py-16 pt-8 space-y-20 overflow-y-auto">
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-sm font-black text-slate-400 uppercase tracking-widest px-1">Nama Anggota</label>
                  <input required className="w-full px-10 py-6 bg-slate-50 border border-slate-100 rounded-[32px] text-xl font-bold outline-none focus:ring-8 focus:ring-indigo-100 transition-all" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Contoh: Budi Sudarsono" />
                </div>
                <div className="space-y-4">
                  <label className="text-sm font-black text-slate-400 uppercase tracking-widest px-1">Jabatan</label>
                  <input className="w-full px-10 py-6 bg-slate-50 border border-slate-100 rounded-[32px] text-xl font-bold outline-none focus:ring-8 focus:ring-indigo-100 transition-all" value={form.role} onChange={e => setForm({...form, role: e.target.value})} placeholder="Contoh: Operation Manager" />
                </div>
              </div>

              <div className="p-16 bg-slate-50/50 rounded-[80px] border border-slate-100 space-y-20">
                <DISCSelector value={form.disc} onChange={v => setForm({...form, disc: v})} />
                
                <div className="grid sm:grid-cols-2 gap-20">
                  <div className="space-y-16">
                    <RatingSelector label="Rating Kompetensi" dim="competency" value={form.competency} onChange={v => setForm({...form, competency: v})} />
                    <NoteInput label="Bukti Kompetensi" type="competencyNotes" notes={form.competencyNotes} onAdd={() => setForm({...form, competencyNotes: [...form.competencyNotes, '']})} onUpdate={(t, i, v) => { const n = [...form.competencyNotes]; n[i] = v; setForm({...form, competencyNotes: n}); }} onRemove={(t, i) => setForm({...form, competencyNotes: form.competencyNotes.filter((_, idx) => idx !== i)})} prompt="Apa alasan Anda memberikan angka kompetensi tersebut?" />
                  </div>
                  <div className="space-y-16">
                    <RatingSelector label="Rating Komitmen" dim="commitment" value={form.commitment} onChange={v => setForm({...form, commitment: v})} />
                    <NoteInput label="Bukti Komitmen" type="commitmentNotes" notes={form.commitmentNotes} onAdd={() => setForm({...form, commitmentNotes: [...form.commitmentNotes, '']})} onUpdate={(t, i, v) => { const n = [...form.commitmentNotes]; n[i] = v; setForm({...form, commitmentNotes: n}); }} onRemove={(t, i) => setForm({...form, commitmentNotes: form.commitmentNotes.filter((_, idx) => idx !== i)})} prompt="Apa alasan Anda memberikan angka komitmen tersebut?" />
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full bg-slate-900 text-white py-10 rounded-[48px] font-black text-xl tracking-[0.3em] shadow-2xl hover:bg-indigo-600 transition-all uppercase mb-12">Simpan Hasil Analisis</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
