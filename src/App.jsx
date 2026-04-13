import React, { useState, useEffect } from 'react';
import { auth, db, googleProvider } from './firebase';
import { signInWithRedirect, signOut, onAuthStateChanged, getRedirectResult } from 'firebase/auth';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { 
  Plus, Trash2, LogOut, GraduationCap, BookOpen, 
  Microscope, Settings, X, Check, LayoutDashboard, 
  Home, Layers, User as UserIcon, Bell, Star, ChevronRight
} from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [selectedSubjectDetail, setSelectedSubjectDetail] = useState(null);
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
      items = [{ label: 'Assigment 1', completed: false }, { label: 'Assignment 2', completed: false }, { label: 'Quiz 1', completed: false }, { label: 'Quiz 2', completed: false }];
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
    <div className="flex items-center justify-center min-h-screen bg-[#0a0e14]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#facc15]"></div>
    </div>
  );

  if (!user) return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#0a0e14]">
      <div className="glass-card p-10 max-w-md w-full text-center fade-in">
        <div className="float mb-6"><GraduationCap size={72} className="text-[#facc15] mx-auto" /></div>
        <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#facc15] to-[#fef08a]">StudyTrack</h1>
        <p className="text-[#94a3b8] mb-10 text-lg">Intellectual Atelier for Knowledge Seekers.</p>
        <button onClick={login} className="btn-primary w-full justify-center py-4 bg-[#facc15] text-[#0a0e14]">Sign in with Google</button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#0a0e14]">
      {/* Sidebar Navigation */}
      <aside className="hidden md:flex w-64 bg-[#161b22]/50 border-r border-white/5 p-6 flex-col gap-8 shadow-xl z-50">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-[#facc15] rounded-xl flex items-center justify-center text-[#0a0e14] font-bold shadow-lg">AA</div>
          <span className="text-xl font-bold text-[#facc15]">Atelier</span>
        </div>
        <nav className="flex flex-col gap-2">
          <NavItem active={activeTab === 'home'} onClick={() => { setActiveTab('home'); setSelectedSubCategory(null); setSelectedSubjectDetail(null); }} icon={<Home size={20} />} label="Home" />
          <NavItem active={activeTab === 'subjects'} onClick={() => { setActiveTab('subjects'); setSelectedSubCategory(null); setSelectedSubjectDetail(null); }} icon={<Layers size={20} />} label="Curriculum" />
          <NavItem active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<UserIcon size={20} />} label="Profile" />
        </nav>
        <div className="mt-auto pt-4 border-t border-white/5">
          <button onClick={logout} className="text-[#94a3b8] hover:text-[#fb7185] flex items-center gap-2 px-4 py-2 text-sm transition-colors w-full">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <div className="flex md:hidden justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <img src={user.photoURL} alt="User" className="w-10 h-10 rounded-full border-2 border-[#facc15]" />
            <span className="font-bold text-[#facc15]">Atelier Academic</span>
          </div>
          <Star className="text-[#facc15] animate-pulse" />
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
      <div className="bottom-nav md:hidden bg-[#161b22]/90 border-t border-white/5">
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
    <div className="fade-in max-w-5xl mx-auto">
      <div className="text-[#94a3b8] uppercase tracking-widest text-[10px] font-black mb-3">Academic Excellence</div>
      <h1 className="hero-title text-[#f1f5f9] mb-12">Master Your <br/> Intellectual <br/> Journey.</h1>

      <div className="glass-card p-10 flex flex-col md:flex-row items-center gap-10 mb-14 bg-[#161b22]/70 border-white/5 shadow-2xl">
        <div className="progress-circle shadow-[0_0_30px_rgba(250,204,21,0.2)]" style={{ '--p': progressPercent }} data-label={`${progressPercent}%`}></div>
        <div>
          <div className="text-[#94a3b8] uppercase text-xs font-black tracking-widest mb-1">Academic Standing</div>
          <div className="text-4xl font-bold text-[#f1f5f9] mb-2">3.8 GPA</div>
          <div className="flex items-center gap-2 text-[#34d399] text-sm font-bold">
            <Check size={16}/> Top 2% of the Atelier
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
        <CategoryCard type="theory" label="Arts & Logic" title="Theory" desc="Deep conceptual frameworks and philosophy of science." color="#facc15" bg="rgba(250, 204, 21, 0.1)" onClick={() => onNavigateCategory('theory')} />
        <CategoryCard type="lab" label="Science / Logic" title="Lab" desc="Experimental data and real-time computation." color="#22d3ee" bg="rgba(34, 211, 238, 0.1)" onClick={() => onNavigateCategory('lab')} />
        <CategoryCard type="other" label="Interdisciplinary" title="Other" desc="Custom tracking for autonomous studies." color="#fb7185" bg="rgba(251, 113, 133, 0.1)" onClick={() => onNavigateCategory('other')} />
      </div>

      <div className="highlight-banner border-white/5 shadow-2xl">
        <div className="cat-label text-white bg-[#34d399] mb-4 inline-block font-black shadow-lg">HIGHLIGHT</div>
        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Weekly Scholarly Seminar</h2>
        <p className="text-white/80 text-sm max-w-sm font-medium leading-relaxed">Join the curated discussion on foundational literature analysis every Friday at the Atelier.</p>
      </div>

      <div className="quote-card mb-24 border-l-4 border-[#22d3ee] bg-[#161b22]/50 shadow-xl">
        <p className="text-xl text-[#f1f5f9] font-medium italic leading-relaxed mb-6">"The unexamined subject is not worth studying. This atelier provides the digital lens through which your intellectual growth becomes tangible."</p>
        <button className="btn-glass bg-white/5 hover:bg-[#facc15] hover:text-[#0a0e14]">Initialize Default Values</button>
      </div>
    </div>
  );
}

function CurriculumOverview({ subjects, onSelectCategory }) {
  return (
    <div className="fade-in max-w-5xl mx-auto text-center md:text-left">
      <h2 className="text-4xl font-black text-[#f1f5f9] mb-4">Curriculum</h2>
      <p className="text-[#94a3b8] mb-12 max-w-xl mx-auto md:mx-0">Explore the foundations of human thought through our curated modules. Track progression across core disciplines.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
        <LargeCurriculumLink title="Theory Subjects" count={subjects.filter(s=>s.type==='theory').length} color="#facc15" onClick={()=>onSelectCategory('theory')} />
        <LargeCurriculumLink title="Lab Sessions" count={subjects.filter(s=>s.type==='lab').length} color="#22d3ee" onClick={()=>onSelectCategory('lab')} />
        <LargeCurriculumLink title="Custom Tracks" count={subjects.filter(s=>s.type==='other').length} color="#fb7185" onClick={()=>onSelectCategory('other')} />
      </div>
    </div>
  );
}

function LargeCurriculumLink({ title, count, color, onClick }) {
  return (
    <div onClick={onClick} className="glass-card p-10 cursor-pointer hover:border-primary transition-all group border-l-4 bg-[#161b22]/50" style={{ borderLeftColor: color }}>
      <div className="flex justify-between items-start mb-6">
        <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-[#facc15]/10 transition-colors"><Layers size={32} style={{ color: color }}/></div>
        <ChevronRight className="text-text-muted group-hover:translate-x-1 transition-transform" />
      </div>
      <h3 className="text-2xl font-bold text-[#f1f5f9] mb-2">{title}</h3>
      <div className="text-[#94a3b8] uppercase text-[10px] font-black tracking-widest">{count} Tracks Active</div>
    </div>
  );
}

function CategoryGridView({ type, subjects, onSelectSubject, onBack, onAdd }) {
  return (
    <div className="fade-in max-w-5xl mx-auto">
      <button onClick={onBack} className="text-[#94a3b8] flex items-center gap-2 mb-8 hover:text-[#facc15] transition-colors uppercase text-xs font-black tracking-widest"><ChevronRight size={16} className="rotate-180"/> Back to Overview</button>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <h2 className="text-4xl font-black text-[#f1f5f9] capitalize mb-3">{type} Subjects</h2>
          <p className="text-[#94a3b8] max-w-sm">Curating and tracking your cognitive progression across core disciplines.</p>
        </div>
        <button onClick={onAdd} className="btn-primary shadow-[0_0_20px_rgba(250,204,21,0.3)]"><Plus size={20}/> New Subject</button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
        {subjects.map(s => {
          const completed = s.items?.filter(i=>i.completed).length || 0;
          const total = s.items?.length || 1;
          const pct = Math.round((completed/total)*100);
          return (
            <div key={s.id} onClick={() => onSelectSubject(s.id)} className="subject-card-small flex flex-row items-center gap-6 text-left group hover:scale-105">
              <div className="mini-progress flex-shrink-0" style={{ '--p': pct }} data-label={`${pct}%`}></div>
              <h3 className="font-bold text-[#f1f5f9] text-xl group-hover:text-[#facc15] transition-colors">{s.name}</h3>
            </div>
          );
        })}
        {subjects.length === 0 && <div className="col-span-full p-24 text-center glass-card text-[#94a3b8] italic">No tracks found.</div>}
      </div>
    </div>
  );
}

function SubjectDetailView({ subject, onBack, onToggle, onDelete }) {
  if (!subject) return null;
  return (
    <div className="fade-in max-w-5xl mx-auto">
      <button onClick={onBack} className="text-[#94a3b8] flex items-center gap-2 mb-8 hover:text-[#facc15] transition-colors uppercase text-xs font-black tracking-widest"><ChevronRight size={16} className="rotate-180"/> Back to Grid</button>
      <div className="glass-card overflow-hidden bg-[#161b22]/70 border-white/5">
        <div className="p-10 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="cat-label bg-[#facc15]/10 text-[#facc15] mb-2 inline-block font-black text-[10px] tracking-widest uppercase py-1 px-3 rounded-md">{subject.type}</div>
            <h1 className="text-4xl font-black text-[#f1f5f9]">{subject.name}</h1>
          </div>
          <button onClick={() => onDelete(subject.id)} className="p-4 bg-red-400/5 text-red-400 rounded-2xl hover:bg-red-400/10 transition-all"><Trash2/></button>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subject.items?.map((item, idx) => (
              <div key={idx} onClick={() => onToggle(subject.id, idx)} className={`p-8 rounded-2xl flex items-center justify-between cursor-pointer transition-all border ${item.completed ? 'bg-[#34d399]/10 border-[#34d399]/30' : 'bg-white/5 border-white/5 hover:border-[#facc15]'}`}>
                <div className="flex items-center gap-6">
                  <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${item.completed ? 'bg-[#34d399] border-[#34d399]' : 'border-white/20'}`}>
                    {item.completed && <Check size={16} className="text-[#0a0e14] font-black"/>}
                  </div>
                  <span className={`text-lg font-bold ${item.completed ? 'text-[#34d399] line-through opacity-50' : 'text-[#f1f5f9]'}`}>{item.label}</span>
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
    <div onClick={onClick} className="cat-card border-l-4 cursor-pointer hover:scale-[1.02] transition-transform shadow-2xl h-full flex flex-col bg-[#161b22]/70" style={{ borderLeftColor: color }}>
      <div className="cat-label text-[10px] uppercase tracking-widest font-black mb-4 inline-block px-3 py-1 rounded" style={{ color: color, backgroundColor: bg }}>{label}</div>
      <h2 className="text-2xl font-black text-[#f1f5f9] mb-3">{title}</h2>
      <p className="text-[#94a3b8] text-sm leading-relaxed mb-8 flex-1 font-medium">{desc}</p>
      <div className="flex items-center gap-2 text-[#facc15] font-black text-[10px] uppercase tracking-widest mt-auto">Details <ChevronRight size={14} /></div>
    </div>
  );
}

function NavItem({ active, onClick, icon, label }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-4 px-6 py-4 rounded-xl transition-all ${active ? 'bg-[#facc15] text-[#0a0e14] font-black shadow-xl scale-105' : 'text-[#94a3b8] hover:bg-white/5 hover:text-[#facc15]'}`}>
      {icon} <span className="text-sm uppercase tracking-widest font-bold">{label}</span>
    </button>
  );
}

function BottomNavItem({ active, onClick, icon, label }) {
  return (
    <div onClick={onClick} className={`bottom-nav-item py-1 ${active ? 'active' : ''}`}>
      {icon} <span className="font-black text-[9px] mt-1">{label}</span>
    </div>
  );
}

function ProfileView({ user, logout }) {
  return (
    <div className="fade-in text-center py-24 max-w-xl mx-auto">
      <div className="relative inline-block mb-10">
        <img src={user.photoURL} className="w-40 h-40 rounded-full border-4 border-[#facc15] p-2 shadow-2xl mx-auto" alt="Profile" />
        <div className="absolute -bottom-2 -right-2 bg-[#facc15] p-3 rounded-full shadow-lg"><Star size={24} className="text-[#0a0e14]"/></div>
      </div>
      <h2 className="text-4xl font-black text-[#f1f5f9] mb-2">{user.displayName}</h2>
      <p className="text-[#94a3b8] text-lg font-medium mb-12">{user.email}</p>
      <button onClick={logout} className="btn-primary mx-auto px-12 py-5 shadow-[0_0_30px_rgba(250,204,21,0.2)]">Sign Out of Atelier</button>
    </div>
  );
}

function CreationModal({ type, onClose, onSubmit, name, setName, customItems, setCustomItems }) {
  return (
    <div className="modal-overlay z-[2000] p-4" onClick={e => e.target.className === 'modal-overlay' && onClose()}>
      <div className="glass-card p-10 max-w-lg w-full relative bg-[#161b22] border-[#facc15]/20 shadow-[0_40px_100px_rgba(0,0,0,0.9)] animate-in fade-in zoom-in duration-300">
        <h2 className="text-3xl font-black capitalize mb-8 text-[#f1f5f9] tracking-tight">Initialize {type}</h2>
        <div className="space-y-8">
          <div>
            <label className="text-xs font-black text-[#94a3b8] uppercase tracking-widest block mb-3">Module Identity</label>
            <input type="text" autoFocus className="w-full bg-white/5 border-white/10 text-white rounded-xl py-4 px-6 focus:border-[#facc15] outline-none transition-all" placeholder="e.g. Theoretical Physics" value={name} onChange={e => setName(e.target.value)} />
          </div>
          {type === 'other' && (
            <div>
              <label className="text-xs font-black text-[#94a3b8] uppercase tracking-widest block mb-4">Milestone Architecture</label>
              <div className="space-y-3 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
                {customItems.map((it, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input className="flex-1 py-3 px-4 bg-white/5 border-white/5 text-white rounded-lg text-sm" value={it} onChange={e => {
                      const n = [...customItems]; n[idx] = e.target.value; setCustomItems(n);
                    }} />
                  </div>
                ))}
              </div>
              <button onClick={() => setCustomItems([...customItems, 'New Milestone'])} className="text-[10px] text-[#facc15] font-black uppercase tracking-widest mt-4 flex items-center gap-2">+ Add Milestone</button>
            </div>
          )}
          <button onClick={() => onSubmit(type)} className="btn-primary w-full justify-center py-5 text-lg shadow-[0_0_30px_rgba(250,204,21,0.2)]">Begin Track</button>
        </div>
      </div>
    </div>
  );
}

export default App;
