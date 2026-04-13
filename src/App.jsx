import React, { useState, useEffect } from 'react';
import { auth, db, googleProvider } from './firebase';
import { signInWithRedirect, signOut, onAuthStateChanged, getRedirectResult } from 'firebase/auth';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { 
  Plus, Trash2, LogOut, GraduationCap, BookOpen, 
  Microscope, Settings, X, Check, LayoutDashboard, 
  Moon, Sun, Info, ChevronRight, BarChart3, Home, 
  Layers, User as UserIcon, Bell
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
      items = [{ label: 'Assignment 1', completed: false }, { label: 'Assignment 2', completed: false }, { label: 'Quiz 1', completed: false }, { label: 'Quiz 2', completed: false }];
    } else if (type === 'lab') {
      items = [{ label: 'Experiment 1', completed: false }, { label: 'Experiment 2', completed: false }, { label: 'Lab Record', completed: false }, { label: 'Final Viva', completed: false }];
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
    } catch (e) { console.error(e); }
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
        <p className="text-text-muted mb-10 text-lg">Your intellectual journey, organized.</p>
        <button onClick={login} className="btn-primary w-full justify-center py-4">Sign in with Google</button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar Navigation (Desktop) */}
      <aside className="hidden md:flex w-64 bg-card border-r border-border p-6 flex-col gap-8 shadow-xl z-50">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-bg-dark font-bold shadow-lg">ST</div>
          <span className="text-xl font-bold text-main">Atelier</span>
        </div>
        <nav className="flex flex-col gap-2">
          <NavItem active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Home size={20} />} label="Home" />
          <NavItem active={activeTab === 'subjects'} onClick={() => setActiveTab('subjects')} icon={<Layers size={20} />} label="Subjects" />
          <NavItem active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<UserIcon size={20} />} label="Profile" />
        </nav>
        <div className="mt-auto flex flex-col gap-4">
          <button onClick={logout} className="text-text-muted hover:text-red-400 flex items-center gap-2 px-4 py-2 text-sm transition-colors pt-4">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <div className="flex md:hidden justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <img src={user.photoURL} alt="User" className="w-10 h-10 rounded-full border-2 border-primary" />
            <span className="font-bold text-main">Atelier Academic</span>
          </div>
        </div>

        {activeTab === 'home' && <HomeView subjects={subjects} user={user} />}
        {activeTab === 'subjects' && <SubjectsView subjects={subjects} onAdd={setShowModal} onToggle={toggleItem} onDelete={deleteSubject} />}
        {activeTab === 'profile' && <ProfileView user={user} logout={logout} />}

      </main>

      {/* Bottom Nav (Mobile) */}
      <div className="bottom-nav md:hidden">
        <BottomNavItem active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Home size={24} />} label="Home" />
        <BottomNavItem active={activeTab === 'subjects'} onClick={() => setActiveTab('subjects')} icon={<Layers size={24} />} label="Subjects" />
        <BottomNavItem active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<UserIcon size={24} />} label="Profile" />
      </div>

      {showModal && (
        <CreationModal 
          type={showModal} 
          onClose={() => setShowModal(null)} 
          onSubmit={createSubject} 
          name={newSubjectName} 
          setName={setNewSubjectName}
          customItems={customItems}
          setCustomItems={setCustomItems}
        />
      )}
    </div>
  );
}

function HomeView({ subjects, user }) {
  const totalItems = subjects.reduce((acc, s) => acc + (s.items?.length || 0), 0);
  const completedItems = subjects.reduce((acc, s) => acc + (s.items?.filter(i => i.completed).length || 0), 0);
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="fade-in">
      <div className="text-text-muted uppercase tracking-widest text-xs font-bold mb-2">Curated Progress</div>
      <h1 className="hero-title text-main">Master Your <br/> Intellectual <br/> Journey.</h1>

      <div className="glass-card p-8 flex items-center gap-8 mb-10">
        <div className="progress-circle" style={{ '--p': progressPercent }} data-label={`${progressPercent}%`}></div>
        <div>
          <div className="text-text-muted uppercase text-xs font-bold tracking-widest">Academic Standing</div>
          <div className="text-3xl font-bold text-main mt-1">3.8 GPA</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="cat-card" style={{ padding: '30px', margin: 0 }}>
          <div className="cat-label text-primary" style={{ backgroundColor: 'rgba(192, 132, 252, 0.1)' }}>Humanities / Arts</div>
          <h2 className="text-3xl font-bold text-main mb-3">Theory</h2>
          <p className="text-text-muted">Deep conceptual frameworks, philosophy of science, and foundational literature analysis.</p>
          <div className="mt-6 flex items-center justify-between">
            <div className="flex -space-x-2">
              {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-border border-2 border-bg-dark"></div>)}
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-[10px] text-bg-dark font-bold">+4</div>
            </div>
            <div className="text-xs text-text-muted font-bold uppercase">Active Researchers</div>
          </div>
        </div>

        <div className="cat-card" style={{ padding: '30px', margin: 0 }}>
          <div className="cat-label text-accent" style={{ backgroundColor: 'rgba(74, 222, 128, 0.1)' }}>Science / Logic</div>
          <h2 className="text-3xl font-bold text-main mb-3">Lab</h2>
          <p className="text-text-muted">Experimental data, chemical analysis, and real-time computation.</p>
          <div className="mt-8">
            <div className="w-full bg-border h-1.5 rounded-full overflow-hidden">
              <div className="bg-accent h-full w-[40%]"></div>
            </div>
            <div className="text-xs text-accent font-bold uppercase mt-3 tracking-widest">12 Reports Pending</div>
          </div>
        </div>
      </div>

      <div className="cat-card flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10" style={{ padding: '24px' }}>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/5 rounded-xl text-text-muted"><LayoutDashboard size={24}/></div>
          <div>
            <h2 className="text-xl font-bold text-main">Other / Custom</h2>
            <p className="text-sm text-text-muted">Interdisciplinary electives, independent studies, and capstone projects.</p>
          </div>
        </div>
        <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:scale-105 transition-transform" style={{ whiteSpace: 'nowrap' }}>Initialize Default Values</button>
      </div>

      <div className="stat-grid mb-10">
        <StatCardCompact label="Credits" value="128" color="var(--primary)" />
        <StatCardCompact label="Labs" value="14" color="var(--accent)" />
        <StatCardCompact label="Thesis" value="01" color="var(--secondary)" />
        <StatCardCompact label="Backlogs" value="00" color="#f87171" />
      </div>
    </div>
  );
}

function SubjectsView({ subjects, onAdd, onToggle, onDelete }) {
  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-main">My Courses</h2>
        <div className="flex gap-2">
          <button onClick={() => onAdd('theory')} className="p-3 bg-card border border-border rounded-xl text-primary"><BookOpen size={20}/></button>
          <button onClick={() => onAdd('lab')} className="p-3 bg-card border border-border rounded-xl text-accent"><Microscope size={20}/></button>
          <button onClick={() => onAdd('other')} className="p-3 bg-primary text-bg-dark rounded-xl"><Plus size={20}/></button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        {subjects.length === 0 ? (
          <div className="p-20 text-center text-text-muted">No courses tracked yet.</div>
        ) : (
          subjects.map(s => (
            <div key={s.id} className="subject-row">
              <div className="px-4">
                <div className={`badge badge-${s.type} mb-2`}>{s.type}</div>
                <h3 className="font-bold text-main">{s.name}</h3>
              </div>
              <div className="px-4 task-grid">
                {s.items?.map((item, idx) => (
                  <div key={idx} onClick={() => onToggle(s.id, idx)} className={`task-chip ${item.completed ? 'completed' : ''}`}>
                    {item.label}
                  </div>
                ))}
              </div>
              <div className="px-4 text-center">
                <button onClick={() => onDelete(s.id)} className="text-text-muted hover:text-red-400"><Trash2 size={16}/></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ProfileView({ user, logout }) {
  return (
    <div className="fade-in text-center py-20">
      <img src={user.photoURL} className="w-32 h-32 rounded-full border-4 border-primary mx-auto mb-6" alt="Profile" />
      <h2 className="text-3xl font-bold text-main">{user.displayName}</h2>
      <p className="text-text-muted mb-10">{user.email}</p>
      <button onClick={logout} className="btn-primary mx-auto">Sign Out of Account</button>
    </div>
  );
}

function NavItem({ active, onClick, icon, label }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-primary text-bg-dark font-bold shadow-lg' : 'text-text-muted hover:bg-white/5 hover:text-main'}`}>
      {icon} <span className="text-sm">{label}</span>
    </button>
  );
}

function BottomNavItem({ active, onClick, icon, label }) {
  return (
    <div onClick={onClick} className={`bottom-nav-item ${active ? 'active' : ''}`}>
      {icon} <span>{label}</span>
    </div>
  );
}

function StatCardCompact({ label, value, color }) {
  return (
    <div className="stat-card" style={{ borderLeftColor: color }}>
      <div className="text-[10px] text-text-muted uppercase font-bold tracking-widest mb-1">{label}</div>
      <div className="text-2xl font-bold text-main">{value}</div>
    </div>
  );
}

function CreationModal({ type, onClose, onSubmit, name, setName, customItems, setCustomItems }) {
  return (
    <div className="modal-overlay" onClick={e => e.target.className === 'modal-overlay' && onClose()}>
      <div className="glass-card p-8 max-w-lg w-full relative">
        <h2 className="text-2xl font-bold capitalize mb-6 text-main">New {type}</h2>
        <input type="text" autoFocus className="w-full mb-6" placeholder="Subject Name" value={name} onChange={e => setName(e.target.value)} />
        {type === 'other' && (
          <div className="space-y-3 mb-6">
            {customItems.map((it, idx) => (
              <div key={idx} className="flex gap-2">
                <input className="flex-1 py-2 px-3 text-sm" value={it} onChange={e => {
                  const n = [...customItems]; n[idx] = e.target.value; setCustomItems(n);
                }} />
              </div>
            ))}
            <button onClick={() => setCustomItems([...customItems, 'New Milestone'])} className="text-xs text-primary font-bold">+ Add Milestone</button>
          </div>
        )}
        <button onClick={() => onSubmit(type)} className="btn-primary w-full justify-center">Initialize Track</button>
      </div>
    </div>
  );
}

export default App;
