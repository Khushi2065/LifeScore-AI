import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Wallet, 
  BookOpen, 
  Brain, 
  Plus, 
  TrendingUp, 
  LogOut, 
  User as UserIcon,
  Sun,
  Moon,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Auth } from './components/Auth';
import { AIAssistant } from './components/AIAssistant';
import { ActivityForms } from './components/ActivityForms';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('dashboard');
  const [scoreData, setScoreData] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
  // FORCE LOGOUT ON EVERY APP START
  localStorage.removeItem('lifescore_token');

  checkAuth();
}, [])

  useEffect(() => {
    if (user) {
      fetchScore();
    }
  }, [user]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const checkAuth = async () => {
    const token = sessionStorage.getItem('lifescore_token')
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.authenticated) {
        setUser(data.user);
      } else {
        localStorage.removeItem('lifescore_token');
      }
    } catch (err) {
      console.error("Auth check failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchScore = async () => {
    const token = localStorage.getItem('lifescore_token');
    try {
      const res = await fetch('/api/data/score', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      setScoreData(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('lifescore_token');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 gap-4">
        <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
        <div className="font-black tracking-tighter text-2xl">Initializing LifeScore AI...</div>
      </div>
    );
  }

  if (!user) {
    return <Auth onLogin={(userData: any) => setUser(userData)} />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row dark:text-slate-100 transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-white font-bold italic shadow-lg shadow-brand/20">L</div>
            <h1 className="text-xl font-bold tracking-tight">LifeScore AI</h1>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-widest font-semibold flex items-center gap-1.5 transition-all">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            Cloud-Native Analytics
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <NavItem icon={<Activity size={18} />} label="Dashboard" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
          <NavItem icon={<Wallet size={18} />} label="Expenses" active={view === 'expenses'} onClick={() => setView('expenses')} />
          <NavItem icon={<Activity size={18} />} label="Fitness" active={view === 'fitness'} onClick={() => setView('fitness')} />
          <NavItem icon={<BookOpen size={18} />} label="Study" active={view === 'study'} onClick={() => setView('study')} />
          <NavItem icon={<Brain size={18} />} label="AI Advisor" active={view === 'ai'} onClick={() => setView('ai')} />
        </nav>

        <div className="p-6 space-y-4">
          <div className="bg-slate-900 dark:bg-slate-800 rounded-xl p-4 text-white shadow-xl shadow-slate-900/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Life Assistant AI</span>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            </div>
            <p className="text-xs leading-relaxed text-white">Your activity focus is up. Keep going!</p>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-white dark:border-slate-700 shadow-sm overflow-hidden text-slate-500 font-bold shrink-0">
                  {user?.username?.substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">{user?.username}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold truncate">{user?.role} Tier</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setIsDark(!isDark)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500">
                  {isDark ? <Sun size={16} /> : <Moon size={16} />}
                </button>
                <button onClick={handleLogout} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded-lg transition-colors">
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Header */}
        <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-400 uppercase tracking-widest font-bold text-[10px]">LifeScore AI</span>
            <span className="text-slate-200 dark:text-slate-700">/</span>
            <span className="font-semibold text-slate-600 dark:text-slate-300 capitalize">{view === 'ai' ? 'Assistant' : view}</span>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden md:flex flex-col text-right">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Status</p>
                <div className="flex items-center justify-end gap-2">
                  <span className="text-xs font-semibold">Active Session</span>
                </div>
             </div>
          </div>
        </header>

        <main className="flex-1 p-8 bg-slate-50 dark:bg-slate-950 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {view === 'dashboard' && <Dashboard score={scoreData} onAdd={(type: string) => setShowAddModal(type)} />}
              {view === 'expenses' && <ActivityListView type="expenses" />}
              {view === 'fitness' && <ActivityListView type="fitness" />}
              {view === 'study' && <ActivityListView type="study" />}
              {view === 'ai' && <AIAssistant context={scoreData} />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="p-4 px-8 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-300 uppercase tracking-widest shrink-0">
          <div className="flex gap-6">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-brand rounded-full"></span>
              Analytics Mode: Active
            </span>
            <span>Identity: JWT-SECURE</span>
          </div>
          <div>Project Ver: 2.1.0-stable</div>
        </footer>
      </div>

      <ActivityForms 
        show={showAddModal} 
        onClose={() => setShowAddModal(null)} 
        onSuccess={fetchScore} 
      />
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all group ${
        active 
          ? 'bg-indigo-50 dark:bg-indigo-950/30 text-brand font-bold shadow-sm' 
          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 font-medium'
      }`}
    >
      <span className={`${active ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'} transition-opacity`}>
        {icon}
      </span>
      {label}
    </button>
  );
}

function Dashboard({ score, onAdd }: { score: any, onAdd: (type: string) => void }) {
  if (!score) return (
    <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 h-64 text-center">
      <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-slate-500 dark:text-slate-400 font-medium italic">Calculating your life metrics...</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Overview</h2>
          <p className="text-slate-400 dark:text-slate-300 text-sm font-medium">Personalized behavioral analysis based on your activity data.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => onAdd('expense')} className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-xl hover:shadow-md transition-all text-sm font-bold">
            <Plus size={16} /> Expense
          </button>
          <button onClick={() => onAdd('fitness')} className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-xl hover:shadow-md transition-all text-sm font-bold">
            <Plus size={16} /> Fitness
          </button>
          <button onClick={() => onAdd('study')} className="flex items-center gap-2 bg-brand text-white px-4 py-2.5 rounded-xl shadow-lg shadow-brand/20 hover:shadow-brand/40 transition-all text-sm font-bold active:scale-95">
            <Plus size={16} /> Study
          </button>
        </div>
      </div>

      {/* Hero Statistics */}
      <div className="grid grid-cols-12 gap-8">
        {/* Main Life Score Card */}
        <div className="col-span-12 lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-10 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-slate-400 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest mb-4">Life Score Index</h3>
            <div className="flex items-baseline gap-3">
              <span className="text-8xl font-black text-brand tracking-tighter">{score.lifeScore}</span>
              <span className="text-2xl font-bold text-emerald-500">+4.2%</span>
            </div>
            <p className="text-slate-400 dark:text-slate-500 mt-6 max-w-sm text-sm leading-relaxed">
              Real-time calculation integrated with Study (40%), Fitness (30%), and Financial Discipline (30%).
            </p>
            
            <div className="mt-10 grid grid-cols-3 gap-6 max-w-md">
              <div className="space-y-3">
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${score.breakdown.study}%` }} className="h-full bg-indigo-500 rounded-full" />
                </div>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest block">Study: {score.breakdown.study}</span>
              </div>
              <div className="space-y-3">
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                   <motion.div initial={{ width: 0 }} animate={{ width: `${score.breakdown.fitness}%` }} className="h-full bg-emerald-500 rounded-full" />
                </div>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest block">Fit: {score.breakdown.fitness}</span>
              </div>
              <div className="space-y-3">
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                   <motion.div initial={{ width: 0 }} animate={{ width: `${score.breakdown.discipline}%` }} className="h-full bg-amber-500 rounded-full" />
                </div>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest block">Spend: {score.breakdown.discipline}</span>
              </div>
            </div>
          </div>
          {/* Decorative Background Shape */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-slate-50 dark:bg-slate-800/30 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity pointer-events-none"></div>
        </div>

        {/* Quick Stats Column */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-4 justify-between">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-brand/30 transition-colors">
            <div>
              <span className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">Study Hours</span>
              <p className="text-3xl font-black mt-1 tracking-tight">{(score.trends.studyHrs || 0).toFixed(1)} <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">hrs/total</span></p>
            </div>
            <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/10 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📖</div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-brand/30 transition-colors">
            <div>
              <span className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">Total Spend</span>
              <p className="text-3xl font-black mt-1 tracking-tight">${score.trends.spent.toLocaleString()} <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">/mo</span></p>
            </div>
            <div className="w-14 h-14 bg-rose-50 dark:bg-rose-900/10 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">💸</div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-brand/30 transition-colors">
            <div>
              <span className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">Active Mins</span>
              <p className="text-3xl font-black mt-1 tracking-tight">{score.trends.fitnessMin} <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">/mo</span></p>
            </div>
            <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">⚡</div>
          </div>
        </div>
      </div>

      {/* Activity Trends */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-10">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="font-black text-xl tracking-tight">Weekly Performance</h3>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Holistic activity trends scaled to base-10 metrics.</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-brand rounded-full"></div><span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Focus</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-400 rounded-full"></div><span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Health</span></div>
          </div>
        </div>
        <div className="h-64">
           <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[
              { name: 'MON', focus: 6, health: 4 },
              { name: 'TUE', focus: 8, health: 5 },
              { name: 'WED', focus: 10, health: 8 },
              { name: 'THU', focus: 7, health: 6 },
              { name: 'FRI', focus: 9, health: 7 },
              { name: 'SAT', focus: 4, health: 9 },
              { name: 'SUN', focus: 3, health: 8 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
              <YAxis hide />
              <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="focus" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="health" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function ActivityListView({ type }: any) {
  const [data, setData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('lifescore_token');
    fetch(`/api/data/${type}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(setData);
  }, [type]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold capitalize tracking-tight">{type} History</h2>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold">Date</th>
              <th className="px-6 py-4 text-sm font-semibold">Category/Subject</th>
              <th className="px-6 py-4 text-sm font-semibold">Value</th>
              <th className="px-6 py-4 text-sm font-semibold">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.map((item: any) => (
              <tr key={item._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4 text-sm">{new Date(item.date).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-sm font-medium">{item.category || item.activityType || item.subject}</td>
                <td className="px-6 py-4 text-sm font-bold">
                  {item.amount ? `$${item.amount}` : item.duration ? `${item.duration} ${type === 'fitness' ? 'min' : 'hrs'}` : '-'}
                </td>
                <td className="px-6 py-4 text-sm text-slate-500 italic">
                  {item.description || (item.calories ? `${item.calories}cal` : item.productivity ? `P:${item.productivity}/10` : 'N/A')}
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic">No records found for this sector yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
