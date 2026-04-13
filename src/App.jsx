import React, { useState, useEffect } from 'react';
import { auth, db, googleProvider } from './firebase';
import { signInWithRedirect, signOut, onAuthStateChanged, getRedirectResult } from 'firebase/auth';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { 
  Plus, Trash2, LogOut, GraduationCap, BookOpen, 
  Microscope, Settings, X, Check, LayoutDashboard, 
  Moon, Sun, Info, ChevronRight, BarChart3
} from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [theme, setTheme] = useState('dark');
  const [showModal, setShowModal] = useState(null);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [customItems, setCustomItems] = useState(['Assignment 1']);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    getRedirectResult(auth).catch(e => console.error("Auth error", e));
    const unsubscribe = onAuthStateChanged(auth, u => { setUser(u); setLoading(false); });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'subjects'), where('userId', '==', user.uid));
      return onSnapshot(q, (snapshot) => {
        setSubjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
    }
  }, [user]);

  const login = () => signInWithRedirect(auth, googleProvider);
  const logout = () => signOut(auth);

  const createSubject = async (type) => {
    if (!newSubjectName.trim()) return;
    
    let items = [];
    if (type === 'theory') {
      items = [
        { label: 'Assignment 1', completed: false },
        { label: 'Assignment 2', completed: false },
        { label: 'Quiz 1', completed: false },
        { label: 'Quiz 2', completed: false }
      ];
    } else if (type === 'lab') {
      items = [
        { label: 'Lab Experiment 1', completed: false },
        { label: 'Lab Experiment 2', completed: false },
        { label: 'Lab Record', completed: false },
        { label: 'Final Viva', completed: false }
      ];
    } else {
      items = customItems.map(item => ({ label: item, completed: false }));
    }

    try {
      await addDoc(collection(db, 'subjects'), {
        userId: user.uid,
        name: newSubjectName,
        type,
        items,
        createdAt: serverTimestamp()
      });
      setNewSubjectName('');
      setShowModal(null);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleItem = async (subjectId, itemIndex) => {
    const subject = subjects.find(s => s.id === subjectId);
    const newItems = [...subject.items];
    newItems[itemIndex].completed = !newItems[itemIndex].completed;
    await updateDoc(doc(db, 'subjects', subjectId), { items: newItems });
  };

  const deleteSubject = (id) => deleteDoc(doc(db, 'subjects', id));

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
    </div>
  );

  if (!user) return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="glass-card p-10 max-w-md w-full text-center fade-in">
        <div className="float mb-6"><GraduationCap size={72} className="text-primary mx-auto" /></div>
        <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">StudyTrack</h1>
        <p className="text-text-muted mb-10 text-lg">Your academic workspace, reimagined.</p>
        <button onClick={login} className="btn-primary w-full justify-center py-4">Sign in with Google</button>
      </div>
    </div>
  );

  const filteredSubjects = subjects.filter(s => activeTab === 'home' || s.type === activeTab);

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-card border-r border-border p-6 flex flex-col gap-8 shadow-xl z-50">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-bg-dark font-bold shadow-lg">ST</div>
          <span className="text-xl font-bold text-main">StudyTrack</span>
        </div>

        <nav className="flex flex-col gap-2">
          <NavItem active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <NavItem active={activeTab === 'theory'} onClick={() => setActiveTab('theory')} icon={<BookOpen size={20} />} label="Theory Tracks" />
          <NavItem active={activeTab === 'lab'} onClick={() => setActiveTab('lab')} icon={<Microscope size={20} />} label="Lab Sessions" />
          <NavItem active={activeTab === 'other'} onClick={() => setActiveTab('other')} icon={<Settings size={20} />} label="Custom Tracks" />
        </nav>

        <div className="mt-auto flex flex-col gap-4">
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="btn-outline flex items-center justify-center gap-2 py-3">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button onClick={logout} className="text-text-muted hover:text-red-400 flex items-center gap-2 px-4 py-2 text-sm transition-colors">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <div className="text-primary font-bold uppercase tracking-widest text-xs mb-2">Category Workspace</div>
            <h2 className="text-4xl font-bold capitalize text-main">{activeTab}</h2>
          </div>
          {activeTab !== 'home' && (
            <button onClick={() => setShowModal(activeTab)} className="btn-primary shadow-xl">
              <Plus size={20} /> Create New {activeTab}
            </button>
          )}
        </header>

        {activeTab === 'home' && <HomeOverview subjects={subjects} onNavigate={setActiveTab} />}
        
        {activeTab !== 'home' && (
          <div className="glass-card mb-10 p-6 flex items-start gap-4 border-l-4 border-primary bg-primary/5">
            <Info className="text-primary mt-1" />
            <div>
              <h4 className="font-bold text-main">About {activeTab} Subjects</h4>
              <p className="text-text-muted text-sm leading-relaxed max-w-2xl mt-1">
                {activeTab === 'theory' && "Manage your theoretical lecture courses. Track assignments and quizzes to stay ahead of the curve."}
                {activeTab === 'lab' && "Keep track of your practical experiments, weekly lab reports, and prepares for final vivas."}
                {activeTab === 'other' && "Create fully custom tracking lists for projects, electives, or external certifications."}
              </p>
            </div>
          </div>
        )}

        <div className="glass-card overflow-hidden">
          <div className="bg-white/5 p-4 grid grid-cols-1 md:grid-cols-[1.5fr_3fr_1fr] border-b border-border font-bold text-sm uppercase tracking-wider text-text-muted">
            <div className="px-4">Subject Information</div>
            <div className="px-4">Milestones & Action Items</div>
            <div className="px-4 text-center">Progress</div>
          </div>
          
          {filteredSubjects.length === 0 ? (
            <div className="p-24 text-center">
              <BarChart3 size={48} className="mx-auto mb-4 text-text-muted opacity-20" />
              <p className="text-text-muted italic">No trackable items found in this category.</p>
              {activeTab !== 'home' && (
                <button onClick={() => setShowModal(activeTab)} className="text-primary font-bold mt-4">+ Create your first {activeTab} track</button>
              )}
            </div>
          ) : (
            filteredSubjects.map(s => (
              <div key={s.id} className="subject-row fade-in">
                <div className="px-4">
                  <div className={`badge badge-${s.type} mb-2 inline-block`}>{s.type}</div>
                  <h3 className="text-xl font-bold text-main">{s.name}</h3>
                </div>
                <div className="px-4 task-grid">
                  {s.items?.map((item, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => toggleItem(s.id, idx)}
                      className={`task-chip ${item.completed ? 'completed' : ''}`}
                    >
                      {item.completed ? <Check size={12} /> : <div className="w-3 h-3 rounded-full border border-current opacity-40" />}
                      {item.label}
                    </div>
                  ))}
                </div>
                <div className="px-4 flex items-center justify-center gap-6">
                  <div className="text-right">
                    <div className="text-primary font-bold text-xl">
                      {Math.round((s.items?.filter(i => i.completed).length / s.items?.length) * 100 || 0)}%
                    </div>
                  </div>
                  <button onClick={() => deleteSubject(s.id)} className="text-text-muted hover:text-red-400 p-2 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && setShowModal(null)}>
          <div className="glass-card p-8 max-w-lg w-full relative">
            <button onClick={() => setShowModal(null)} className="absolute top-6 right-6 text-text-muted hover:text-white"><X /></button>
            <h2 className="text-2xl font-bold capitalize mb-8 text-main">Add {showModal} Track</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-text-muted mb-2 uppercase tracking-widest">Subject Reference</label>
                <input type="text" autoFocus placeholder="e.g. Operating Systems" className="w-full" value={newSubjectName} onChange={e => setNewSubjectName(e.target.value)} />
              </div>

              {showModal === 'other' && (
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-2 uppercase tracking-widest">Custom Milestones</label>
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                    {customItems.map((item, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input type="text" className="flex-1 py-3 px-4 text-sm" value={item} onChange={e => {
                          const newItems = [...customItems];
                          newItems[idx] = e.target.value;
                          setCustomItems(newItems);
                        }} />
                        <button onClick={() => setCustomItems(customItems.filter((_, i) => i !== idx))} className="btn-outline p-2 text-red-400 border-none"><Trash2 size={16}/></button>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setCustomItems([...customItems, 'New Milestone'])} className="text-sm text-primary flex items-center gap-2 mt-4 font-bold">
                    <Plus size={14} /> Add Another
                  </button>
                </div>
              )}

              <button onClick={() => createSubject(showModal)} className="btn-primary w-full justify-center py-4 mt-8 shadow-lg">
                Finalize {showModal} Subject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NavItem({ active, onClick, icon, label }) {
  return (
    <button onClick={onClick} className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${active ? 'bg-primary text-bg-dark font-bold shadow-lg' : 'text-text-muted hover:bg-white/5 hover:text-main'}`}>
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      {active && <ChevronRight size={16} />}
    </button>
  );
}

function HomeOverview({ subjects, onNavigate }) {
  const totalItems = subjects.reduce((acc, s) => acc + (s.items?.length || 0), 0);
  const completedItems = subjects.reduce((acc, s) => acc + (s.items?.filter(i => i.completed).length || 0), 0);
  const totalPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
      <div className="glass-card p-10 flex flex-col justify-center border-l-8 border-primary relative overflow-hidden">
        <div className="text-primary font-bold uppercase tracking-tighter text-sm mb-4">Overall Completion</div>
        <div className="text-7xl font-bold text-main mb-2">{totalPercent}%</div>
        <div className="text-text-muted">Across all your registered tracks</div>
        <BarChart3 className="absolute -right-8 -bottom-8 w-48 h-48 opacity-5 text-primary" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatCard title="Theory" count={subjects.filter(s => s.type === 'theory').length} icon={<BookOpen className="text-primary" />} onClick={() => onNavigate('theory')} />
        <StatCard title="Lab" count={subjects.filter(s => s.type === 'lab').length} icon={<Microscope className="text-accent" />} onClick={() => onNavigate('lab')} />
        <StatCard title="Custom" count={subjects.filter(s => s.type === 'other').length} icon={<Settings className="text-secondary" />} onClick={() => onNavigate('other')} />
        <div className="glass-card p-6 flex flex-col justify-center items-center text-center">
          <div className="text-3xl font-bold text-main">{subjects.length}</div>
          <div className="text-xs text-text-muted uppercase font-bold tracking-widest mt-1">Total Tracks</div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, count, icon, onClick }) {
  return (
    <div onClick={onClick} className="glass-card p-6 flex flex-col gap-3 cursor-pointer hover:border-primary transition-all">
      <div className="flex justify-between items-start">
        {icon}
        <ChevronRight size={16} className="text-text-muted" />
      </div>
      <div>
        <div className="text-2xl font-bold text-main">{count}</div>
        <div className="text-xs text-text-muted uppercase font-bold tracking-widest">{title}</div>
      </div>
    </div>
  );
}

export default App;
