import React, { useState, useEffect } from 'react';
import { auth, db, googleProvider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Plus, Trash2, LogOut, CheckCircle, Circle, BookOpen, GraduationCap, ClipboardList, LayoutDashboard } from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'subjects'), where('userId', '==', user.uid));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const subjectsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSubjects(subjectsData);
      });
      return () => unsubscribe();
    } else {
      setSubjects([]);
    }
  }, [user]);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const logout = () => signOut(auth);

  const addSubject = async (e) => {
    e.preventDefault();
    if (!newSubject.trim()) return;
    try {
      await addDoc(collection(db, 'subjects'), {
        userId: user.uid,
        name: newSubject,
        assignment1: false,
        assignment2: false,
        quiz1: false,
        quiz2: false,
        labQuiz: false,
        createdAt: new Date()
      });
      setNewSubject('');
    } catch (error) {
      console.error("Error adding subject", error);
    }
  };

  const deleteSubject = async (id) => {
    try {
      await deleteDoc(doc(db, 'subjects', id));
    } catch (error) {
      console.error("Error deleting subject", error);
    }
  };

  const toggleStatus = async (id, field, currentValue) => {
    try {
      await updateDoc(doc(db, 'subjects', id), {
        [field]: !currentValue
      });
    } catch (error) {
      console.error("Error updating status", error);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-height-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
    </div>
  );

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="glass-card p-10 max-w-md w-full text-center fade-in">
          <GraduationCap size={64} className="mx-auto mb-6 text-purple-500" />
          <h1 className="text-4xl font-bold mb-4">StudyTrack</h1>
          <p className="text-text-muted mb-8">Stay organized, track your progress, and never miss a deadline again.</p>
          <button onClick={login} className="btn-primary w-full justify-center text-lg">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="w-5 h-5 bg-white rounded-full p-0.5" />
            Continue with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 fade-in">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <LayoutDashboard className="text-purple-500" />
            My Dashboard
          </h1>
          <p className="text-text-muted">Welcome back, {user.displayName}!</p>
        </div>
        <button onClick={logout} className="btn-outline flex items-center gap-2">
          <LogOut size={18} />
          Sign Out
        </button>
      </header>

      <form onSubmit={addSubject} className="mb-12 flex gap-4">
        <input 
          type="text" 
          placeholder="Enter subject name (e.g. Data Structures)..." 
          className="flex-1"
          value={newSubject}
          onChange={(e) => setNewSubject(e.target.value)}
        />
        <button type="submit" className="btn-primary">
          <Plus size={20} />
          Add Subject
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {subjects.map(subject => (
          <div key={subject.id} className="glass-card p-6 flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold text-white">{subject.name}</h2>
              <button 
                onClick={() => deleteSubject(subject.id)}
                className="text-text-muted hover:text-red-400 transition-colors"
                title="Remove Subject"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <TrackerItem 
                label="Assignment 1" 
                checked={subject.assignment1} 
                onToggle={() => toggleStatus(subject.id, 'assignment1', subject.assignment1)} 
                icon={<ClipboardList size={16} />}
              />
              <TrackerItem 
                label="Assignment 2" 
                checked={subject.assignment2} 
                onToggle={() => toggleStatus(subject.id, 'assignment2', subject.assignment2)} 
                icon={<ClipboardList size={16} />}
              />
              <TrackerItem 
                label="Quiz 1" 
                checked={subject.quiz1} 
                onToggle={() => toggleStatus(subject.id, 'quiz1', subject.quiz1)} 
                icon={<BookOpen size={16} />}
              />
              <TrackerItem 
                label="Quiz 2" 
                checked={subject.quiz2} 
                onToggle={() => toggleStatus(subject.id, 'quiz2', subject.quiz2)} 
                icon={<BookOpen size={16} />}
              />
              <TrackerItem 
                label="Lab Quiz" 
                checked={subject.labQuiz} 
                onToggle={() => toggleStatus(subject.id, 'labQuiz', subject.labQuiz)} 
                icon={<div className="w-4 h-4 rounded-full border border-current opacity-70" />}
              />
            </div>
            
            <div className="mt-6 pt-4 border-t border-border flex justify-between items-center text-sm">
              <span className="text-text-muted">Progress</span>
              <span className="text-primary-light font-bold">
                {Math.round(([subject.assignment1, subject.assignment2, subject.quiz1, subject.quiz2, subject.labQuiz].filter(Boolean).length / 5) * 100)}%
              </span>
            </div>
          </div>
        ))}
        
        {subjects.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <p className="text-text-muted text-lg italic">No subjects added yet. Start by adding one above!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TrackerItem({ label, checked, onToggle, icon }) {
  return (
    <div 
      className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-300 ${checked ? 'bg-success/10' : 'hover:bg-white/5'}`}
      onClick={onToggle}
    >
      <div className="flex items-center gap-3">
        <span className={checked ? 'text-success' : 'text-text-muted'}>
          {icon}
        </span>
        <span className={`font-medium ${checked ? 'text-white line-through opacity-50' : 'text-text-main'}`}>
          {label}
        </span>
      </div>
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${checked ? 'bg-success border-success' : 'border-border'}`}>
        {checked && <CheckCircle size={14} className="text-white" />}
      </div>
    </div>
  );
}

export default App;
