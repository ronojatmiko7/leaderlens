import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithCustomToken, 
  signInAnonymously, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  query, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  Trophy, 
  Users, 
  BarChart3, 
  Settings, 
  Plus, 
  Target, 
  CheckCircle2, 
  AlertCircle,
  LayoutDashboard,
  Search
} from 'lucide-react';

// --- INITIALIZATION (OUTSIDE COMPONENT) ---
const firebaseConfig = JSON.parse(__firebase_config);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'leader-lens-v1';
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const App = () => {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  // (1) SECURE AUTH LOGIC (RULE 3)
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      // Mencegah re-auth jika sudah ada user
      if (auth.currentUser) {
        if (mounted) {
          setUser(auth.currentUser);
          setIsAuthLoading(false);
        }
        return;
      }

      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Auth error", error);
      } finally {
        if (mounted) setIsAuthLoading(false);
      }
    };

    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (mounted) setUser(u);
    });

    return () => { mounted = false; unsubscribe(); };
  }, []);

  // (2) FIRESTORE SYNC (RULE 1 & 2)
  useEffect(() => {
    if (!user) return;

    // Strict Path: /artifacts/{appId}/public/data/{collectionName}
    const teamCol = collection(db, 'artifacts', appId, 'public', 'data', 'team_members');
    const q = query(teamCol);

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        // Filter & Sort in Memory (RULE 2)
        setTeamMembers(data.sort((a, b) => (b.performance || 0) - (a.performance || 0)));
      },
      (error) => {
        console.error("Firestore error", error);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // DERIVED STATE
  const filteredMembers = useMemo(() => {
    return teamMembers.filter(m => 
      m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [teamMembers, searchTerm]);

  const stats = useMemo(() => {
    const total = teamMembers.length;
    const avgPerf = total ? (teamMembers.reduce((acc, curr) => acc + (curr.performance || 0), 0) / total).toFixed(1) : 0;
    const highPerformers = teamMembers.filter(m => m.performance > 85).length;
    return { total, avgPerf, highPerformers };
  }, [teamMembers]);

  // ACTIONS
  const addMember = async () => {
    if (!user) return;
    const name = prompt("Nama Anggota Baru:");
    if (!name) return;
    
    try {
      const teamCol = collection(db, 'artifacts', appId, 'public', 'data', 'team_members');
      await addDoc(teamCol, {
        name,
        role: "Team Member",
        performance: Math.floor(Math.random() * 40) + 60,
        status: 'active',
        lastUpdated: serverTimestamp(),
        createdBy: user.uid
      });
    } catch (e) {
      console.error("Error adding member", e);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-medium">LeaderLens sedang memuat...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <Trophy size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight">LeaderLens</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          <NavBtn active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<LayoutDashboard size={20}/>} label="Overview" />
          <NavBtn active={activeTab === 'team'} onClick={() => setActiveTab('team')} icon={<Users size={20}/>} label="Team Members" />
          <NavBtn active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={<BarChart3 size={20}/>} label="Analytics" />
          <NavBtn active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={20}/>} label="Settings" />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
              {user?.uid.slice(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold truncate">Admin Session</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.uid}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-semibold capitalize">{activeTab}</h2>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Cari anggota..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
            <button 
              onClick={addMember}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm shadow-indigo-100"
            >
              <Plus size={18} />
              <span>Tambah</span>
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StatCard label="Total Team" value={stats.total} icon={<Users className="text-blue-600"/>} bg="bg-blue-50" />
            <StatCard label="Avg. Performance" value={`${stats.avgPerf}%`} icon={<Target className="text-indigo-600"/>} bg="bg-indigo-50" />
            <StatCard label="High Performers" value={stats.highPerformers} icon={<CheckCircle2 className="text-emerald-600"/>} bg="bg-emerald-50" />
          </div>

          {/* Table / Leaderboard */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Performance Leaderboard</h3>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <AlertCircle size={14} />
                <span>Diperbarui secara real-time</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-500 text-[11px] uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">Rank</th>
                    <th className="px-6 py-4 font-semibold">Member</th>
                    <th className="px-6 py-4 font-semibold">Role</th>
                    <th className="px-6 py-4 font-semibold">Performance</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMembers.map((member, idx) => (
                    <tr key={member.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx < 3 ? 'bg-amber-100 text-amber-700' : 'text-slate-400'}`}>
                          {idx + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-700">{member.name}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-sm">{member.role}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full max-w-[100px] overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ${member.performance > 80 ? 'bg-emerald-500' : member.performance > 60 ? 'bg-indigo-500' : 'bg-rose-500'}`}
                              style={{ width: `${member.performance}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold text-slate-700">{member.performance}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase">
                          {member.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredMembers.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                        Belum ada data anggota tim. Klik "Tambah" untuk memulai.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// UI COMPONENTS
const NavBtn = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${active ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
  >
    {icon}
    <span className="text-sm">{label}</span>
  </button>
);

const StatCard = ({ label, value, icon, bg }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
    <div className={`${bg} p-4 rounded-2xl`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-slate-500 font-medium">{label}</p>
      <h4 className="text-2xl font-bold text-slate-800">{value}</h4>
    </div>
  </div>
);

export default App;
