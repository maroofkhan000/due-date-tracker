import React, { useState, useEffect } from 'react';
import { auth, db, googleProvider } from './firebase';
import { signInWithRedirect, signOut, onAuthStateChanged, getRedirectResult } from 'firebase/auth';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { 
  Plus, Trash2, LogOut, GraduationCap, BookOpen, 
  Microscope, Settings, X, Check, LayoutDashboard, 
  Moon, Sun, Info, ChevronRight, BarChart3, Home, 
  Layers, User as UserIcon, Bell, Star
} from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedSubCategory, setSelectedSubCategory] = useState(null); // 'theory' | 'lab' | 'other'
  const [selectedSubjectDetail, setSelectedSubjectDetail] = useState(null); // Document ID
  const [showModal, setShowModal] = useState(null);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [customItems, setCustomItems] = useState(['Assignment 1']);

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
    if (!subject) return;
    const newItems = [...subject.items];
    newItems[itemIndex].completed = !newItems[itemIndex].completed;
    await updateDoc(doc(db, 'subjects', subjectId), { items: newItems });
  };

  const deleteSubject = (id) => {
    deleteDoc(doc(db, 'subjects', id));
    setSelectedSubjectDetail(null);
  };

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
        <p className="text-text-muted mb-10 text-lg">Intellectual Atelier for Knowledge Seeks.</p>
        <button onClick={login} className="btn-primary w-full justify-center py-4">Sign in with Google</button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar Navigation (Desktop) */}
      <aside className="hidden md:flex w-64 bg-card border-r border-border p-6 flex-col gap-8 shadow-xl z-50">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-bg-dark font-bold shadow-lg">IA</div>
          <span className="text-xl font-bold text-main">Intellectual</span>
        </div>
        <nav className="flex flex-col gap-2">
          <NavItem active={activeTab === 'home'} onClick={() => { setActiveTab('home'); setSelectedSubCategory(null); setSelectedSubjectDetail(null); }} icon={<Home size={20} />} label="Home" />
          <NavItem active={activeTab === 'subjects'} onClick={() => { setActiveTab('subjects'); setSelectedSubCategory(null); setSelectedSubjectDetail(null); }} icon={<Layers size={20} />} label="Curriculum" />
          <NavItem active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<UserIcon size={20} />} label="Profile" />
        </nav>
        <div className="mt-auto pt-4 border-t border-border">
          <button onClick={logout} className="text-text-muted hover:text-red-400 flex items-center gap-2 px-4 py-2 text-sm transition-colors w-full">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        {/* Mobile Header */}
        <div className="flex md:hidden justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <img src={user.photoURL} alt="User" className="w-10 h-10 rounded-full border-2 border-primary" />
            <span className="font-bold text-main">Intellectual Atelier</span>
          </div>
          <Star className="text-primary animate-pulse" />
        </div>

        {activeTab === 'home' && <HomeView subjects={subjects} user={user} onNavigateCategory={(cat) => { setActiveTab('subjects'); setSelectedSubCategory(cat); }} />}
        
        {activeTab === 'subjects' && (
          <div className="fade-in">
            {!selectedSubCategory ? (
              <CurriculumOverview subjects={subjects} onSelectCategory={setSelectedSubCategory} />
            ) : !selectedSubjectDetail ? (
              <CategoryGridView 
                type={selectedSubCategory} 
                subjects={subjects.filter(s => s.type === selectedSubCategory)} 
                onSelectSubject={setSelectedSubjectDetail}
                onBack={() => setSelectedSubCategory(null)}
                onAdd={() => setShowModal(selectedSubCategory)}
              />
            ) : (
              <SubjectDetailView 
                subject={subjects.find(s => s.id === selectedSubjectDetail)}
                onBack={() => setSelectedSubjectDetail(null)}
                onToggle={toggleItem}
                onDelete={deleteSubject}
              />
            )}
          </div>
        )}

        {activeTab === 'profile' && <ProfileView user={user} logout={logout} />}

      </main>

      {/* Bottom Nav (Mobile) */}
      <div className="bottom-nav md:hidden">
        <BottomNavItem active={activeTab === 'home'} onClick={() => { setActiveTab('home'); setSelectedSubCategory(null); setSelectedSubjectDetail(null); }} icon={<Home size={24} />} label="Home" />
        <BottomNavItem active={activeTab === 'subjects'} onClick={() => { setActiveTab('subjects'); setSelectedSubCategory(null); setSelectedSubjectDetail(null); }} icon={<Layers size={24} />} label="Subjects" />
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

function HomeView({ subjects, user, onNavigateCategory }) {
  const totalItems = subjects.reduce((acc, s) => acc + (s.items?.length || 0), 0);
  const completedItems = subjects.reduce((acc, s) => acc + (s.items?.filter(i => i.completed).length || 0), 0);
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="fade-in">
      <div className="text-text-muted uppercase tracking-widest text-xs font-bold mb-2">Curated Progress</div>
      <h1 className="hero-title text-main">Elevate Your <br/> Intellectual <br/> Portfolio.</h1>

      <div className="glass-card p-8 flex items-center gap-8 mb-10">
        <div className="progress-circle" style={{ '--p': progressPercent }} data-label={`${progressPercent}%`}></div>
        <div>
          <div className="text-text-muted uppercase text-xs font-bold tracking-widest">Atelier Rating</div>
          <div className="text-3xl font-bold text-main mt-1">First Class Honors</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <CategoryCard type="theory" label="Arts & Logic" title="Theory" desc="Curated theoretical modules across core disciplines." color="var(--primary-light)" bg="rgba(251, 191, 36, 0.1)" onClick={() => onNavigateCategory('theory')} />
        <CategoryCard type="lab" label="Observation" title="Lab" desc="Experimental computation and analytical datasets." color="var(--accent)" bg="rgba(34, 211, 238, 0.1)" onClick={() => onNavigateCategory('lab')} />
        <CategoryCard type="other" label="Independent" title="Other" desc="Custom tracking for autonomous scholarly study." color="var(--secondary)" bg="rgba(219, 39, 119, 0.1)" onClick={() => onNavigateCategory('other')} />
      </div>

      <div className="highlight-banner">
        <div className="cat-label text-white bg-success/80 mb-4 inline-block">Highlight</div>
        <h2 className="text-3xl font-bold text-white mb-2">Weekly Scholarly Seminar</h2>
        <p className="text-white/80 text-sm max-w-md">Join the elite discussion on foundational literature analysis every Friday at the Atelier.</p>
      </div>

      <div className="quote-card mb-20 relative overflow-hidden">
        <Star className="absolute -right-6 -top-6 w-24 h-24 text-accent opacity-5 rotate-12" />
        <p className="text-lg mb-4">"The unexamined subject is not worth studying. This atelier provides the digital lens through which your intellectual growth becomes tangible."</p>
        <button className="btn-glass">Join Discussion</button>
      </div>
    </div>
  );
}

function CurriculumOverview({ subjects, onSelectCategory }) {
  return (
    <div className="fade-in">
      <h2 className="text-4xl font-bold text-main mb-3">Curriculum</h2>
      <p className="text-text-muted mb-10 max-w-xl">Explore the foundations of human thought through our curated modules. Track your cognitive progression across core disciplines.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <LargeCurriculumLink title="Theory Subjects" count={subjects.filter(s=>s.type==='theory').length} color="var(--primary)" onClick={()=>onSelectCategory('theory')} />
        <LargeCurriculumLink title="Lab Sessions" count={subjects.filter(s=>s.type==='lab').length} color="var(--accent)" onClick={()=>onSelectCategory('lab')} />
        <LargeCurriculumLink title="Custom Tracks" count={subjects.filter(s=>s.type==='other').length} color="var(--secondary)" onClick={()=>onSelectCategory('other')} />
      </div>
    </div>
  );
}

function LargeCurriculumLink({ title, count, color, onClick }) {
  return (
    <div onClick={onClick} className="glass-card p-10 cursor-pointer hover:border-primary transition-all group border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-white/5 rounded-2xl group-hover:text-primary transition-colors"><Layers size={32}/></div>
        <ChevronRight className="text-text-muted group-hover:translate-x-1 transition-transform" />
      </div>
      <h3 className="text-2xl font-bold text-main mb-2">{title}</h3>
      <div className="text-text-muted uppercase text-xs font-bold tracking-widest">{count} Modules Registered</div>
    </div>
  );
}

function CategoryGridView({ type, subjects, onSelectSubject, onBack, onAdd }) {
  return (
    <div className="fade-in">
      <button onClick={onBack} className="text-text-muted flex items-center gap-2 mb-6 hover:text-main transition-colors"><ChevronRight size={18} className="rotate-180"/> Back to Curriculum</button>
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-4xl font-bold text-main capitalize mb-2">{type} Subjects</h2>
          <p className="text-text-muted max-w-lg">Track your cognitive progression across the atelier's core {type} disciplines.</p>
        </div>
        <button onClick={onAdd} className="btn-primary"><Plus size={20}/> New Module</button>
      </div>
      
      <div className="curriculum-grid">
        {subjects.map(s => {
          const completed = s.items?.filter(i=>i.completed).length || 0;
          const total = s.items?.length || 1;
          const pct = Math.round((completed/total)*100);
          return (
            <div key={s.id} onClick={() => onSelectSubject(s.id)} className="subject-card-small">
              <div className="mini-progress" style={{ '--p': pct }} data-label={`${pct}%`}></div>
              <h3 className="font-bold text-main text-lg">{s.name}</h3>
            </div>
          );
        })}
        {subjects.length === 0 && <div className="col-span-full p-20 text-center glass-card text-text-muted italic">No modules registered in this category.</div>}
      </div>
    </div>
  );
}

function SubjectDetailView({ subject, onBack, onToggle, onDelete }) {
  if (!subject) return null;
  return (
    <div className="fade-in">
      <button onClick={onBack} className="text-text-muted flex items-center gap-2 mb-6 hover:text-main"><ChevronRight size={18} className="rotate-180"/> Back to Grid</button>
      <div className="glass-card overflow-hidden">
        <div className="p-10 border-b border-border flex justify-between items-center bg-white/5">
          <div>
            <div className={`badge badge-${subject.type} mb-2`}>{subject.type}</div>
            <h1 className="text-4xl font-bold text-main">{subject.name}</h1>
          </div>
          <button onClick={() => onDelete(subject.id)} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-colors"><Trash2/></button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subject.items?.map((item, idx) => (
              <div key={idx} onClick={() => onToggle(subject.id, idx)} className={`p-6 rounded-2xl flex items-center justify-between cursor-pointer transition-all border ${item.completed ? 'bg-success/5 border-success/30' : 'bg-white/5 border-border hover:border-primary'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${item.completed ? 'bg-success border-success' : 'border-border'}`}>
                    {item.completed && <Check size={14} className="text-bg-dark"/>}
                  </div>
                  <span className={`font-medium ${item.completed ? 'text-success line-through opacity-60' : 'text-main'}`}>{item.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryCard({ label, title, desc, color, bg, onClick }) {
  return (
    <div onClick={onClick} className="cat-card border-l-4 cursor-pointer hover:scale-[1.02] transition-transform shadow-lg h-full flex flex-col" style={{ borderLeftColor: color }}>
      <div className="cat-label" style={{ color: color, backgroundColor: bg }}>{label}</div>
      <h2 className="text-2xl font-bold text-main mb-2">{title}</h2>
      <p className="text-text-muted text-sm leading-relaxed mb-6 flex-1">{desc}</p>
      <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">Explore <ChevronRight size={14} /></div>
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

function ProfileView({ user, logout }) {
  return (
    <div className="fade-in text-center py-20">
      <img src={user.photoURL} className="w-32 h-32 rounded-full border-4 border-primary mx-auto mb-6" alt="Profile" />
      <h2 className="text-3xl font-bold text-main">{user.displayName}</h2>
      <p className="text-text-muted mb-10">{user.email}</p>
      <button onClick={logout} className="btn-primary mx-auto">Sign Out</button>
    </div>
  );
}

function CreationModal({ type, onClose, onSubmit, name, setName, customItems, setCustomItems }) {
  return (
    <div className="modal-overlay" onClick={e => e.target.className === 'modal-overlay' && onClose()}>
      <div className="glass-card p-8 max-w-lg w-full relative">
        <h2 className="text-2xl font-bold capitalize mb-6 text-main">Enroll {type}</h2>
        <input type="text" autoFocus className="w-full mb-6" placeholder="Module Name" value={name} onChange={e => setName(e.target.value)} />
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
        <button onClick={() => onSubmit(type)} className="btn-primary w-full justify-center">Add to Curriculum</button>
      </div>
    </div>
  );
}

export default App;
