import React, { useState, useEffect } from 'react';
import { auth, db, googleProvider } from './firebase';
import { signInWithRedirect, signOut, onAuthStateChanged, getRedirectResult } from 'firebase/auth';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { 
  Plus, Trash2, LogOut, CheckCircle, BookOpen, GraduationCap, 
  ClipboardList, LayoutDashboard, Microscope, Settings, X, Check
} from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(null); // 'theory' | 'lab' | 'other'
  const [newSubjectName, setNewSubjectName] = useState('');
  const [customItems, setCustomItems] = useState(['Assignment 1', 'Assignment 2', 'Quiz 1', 'Quiz 2']);

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

  const createSubject = async () => {
    if (!newSubjectName.trim()) return;
    
    let items = [];
    if (showModal === 'theory') {
      items = [
        { label: 'Assignment 1', completed: false },
        { label: 'Assignment 2', completed: false },
        { label: 'Quiz 1', completed: false },
        { label: 'Quiz 2', completed: false }
      ];
    } else if (showModal === 'lab') {
      items = [
        { label: 'Lab Report 1', completed: false },
        { label: 'Lab Report 2', completed: false },
        { label: 'Lab Quiz', completed: false },
        { label: 'Final Viva', completed: false }
      ];
    } else {
      items = customItems.map(item => ({ label: item, completed: false }));
    }

    try {
      await addDoc(collection(db, 'subjects'), {
        userId: user.uid,
        name: newSubjectName,
        type: showModal,
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
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500"></div>
    </div>
  );

  if (!user) return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="glass-card p-10 max-w-md w-full text-center fade-in">
        <div className="float mb-6"><GraduationCap size={72} className="text-primary-light mx-auto" /></div>
        <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary-light to-secondary">StudyTrack</h1>
        <p className="text-text-muted mb-10 text-lg">Organize your subjects, track your progress.</p>
        <button onClick={login} className="btn-primary w-full justify-center py-4">Sign in with Google</button>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 fade-in">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold mb-1 flex items-center gap-3">
            <LayoutDashboard className="text-primary-light" /> My Workspace
          </h1>
          <p className="text-text-muted">Welcome, {user.displayName}</p>
        </div>
        <button onClick={logout} className="btn-outline">Sign Out</button>
      </header>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="btn-group">
          <button onClick={() => { setShowModal('theory'); setNewSubjectName(''); }} className="btn-tab active">
            <BookOpen size={18} /> Theory Subject
          </button>
          <button onClick={() => { setShowModal('lab'); setNewSubjectName(''); }} className="btn-tab">
            <Microscope size={18} /> Lab Subject
          </button>
          <button onClick={() => { setShowModal('other'); setNewSubjectName(''); setCustomItems(['Assignment 1']); }} className="btn-tab">
            <Settings size={18} /> Other / Custom
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="bg-white/5 p-4 grid grid-cols-1 md:grid-cols-[1.5fr_3fr_1fr] border-b border-border font-bold text-sm uppercase tracking-wider text-text-muted">
          <div className="px-4">Subject Name</div>
          <div className="px-4">Milestones & Progress</div>
          <div className="px-4 text-center">Status</div>
        </div>
        
        {subjects.length === 0 ? (
          <div className="p-20 text-center text-text-muted italic">Click a button above to add your first subject.</div>
        ) : (
          subjects.map(s => (
            <div key={s.id} className="subject-row">
              <div className="px-4">
                <div className={`badge badge-${s.type} mb-2 inline-block`}>{s.type}</div>
                <h3 className="text-xl font-bold text-white">{s.name}</h3>
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
              <div className="px-4 flex items-center justify-center gap-4">
                <div className="text-right">
                  <div className="text-xs text-text-muted uppercase font-bold mb-1">Completion</div>
                  <div className="text-primary-light font-bold">
                    {Math.round((s.items?.filter(i => i.completed).length / s.items?.length) * 100 || 0)}%
                  </div>
                </div>
                <button onClick={() => deleteSubject(s.id)} className="text-text-muted hover:text-red-400 p-2">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="glass-card p-8 max-w-lg w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold capitalize">Add {showModal} Subject</h2>
              <button onClick={() => setShowModal(null)} className="text-text-muted hover:text-white"><X /></button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-text-muted mb-2 uppercase">Subject Name</label>
                <input 
                  type="text" 
                  autoFocus
                  placeholder="e.g. Computer Networks" 
                  className="w-full"
                  value={newSubjectName}
                  onChange={e => setNewSubjectName(e.target.value)}
                />
              </div>

              {showModal === 'other' && (
                <div>
                  <label className="block text-sm font-bold text-text-muted mb-2 uppercase">Custom Milestones</label>
                  <div className="space-y-3">
                    {customItems.map((item, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input 
                          type="text" 
                          className="flex-1 py-2 text-sm" 
                          value={item}
                          onChange={e => {
                            const newItems = [...customItems];
                            newItems[idx] = e.target.value;
                            setCustomItems(newItems);
                          }}
                        />
                        <button onClick={() => setCustomItems(customItems.filter((_, i) => i !== idx))} className="btn-outline py-2 px-3 text-red-400"><Trash2 size={16}/></button>
                      </div>
                    ))}
                    <button onClick={() => setCustomItems([...customItems, 'New Item'])} className="text-sm text-primary-light flex items-center gap-1 mt-2">
                      <Plus size={14} /> Add Milestone
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-6">
                <button onClick={createSubject} className="btn-primary w-full justify-center py-4">
                  Create {showModal} Track
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
