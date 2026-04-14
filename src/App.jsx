import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { auth, googleProvider, db } from './firebase';
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

import { TopNav, BottomNav } from './components/Navigation';
import { SubjectSelection } from './pages/Dashboard';
import { TheoryOverview, TheoryDetail } from './pages/Theory';
import { LabOverview, LabDetail } from './pages/Lab';
import { ImpThingsOverview } from './pages/ImpThings';
import { CustomSetup } from './pages/CustomSetup';
import { ConfirmProvider } from './contexts/ConfirmContext';
import './modal.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Real-time Firestore Data
  const [theoryCourses, setTheoryCourses] = useState([]);
  const [labCourses, setLabCourses] = useState([]);
  const [impThings, setImpThings] = useState([]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, u => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'subjects'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allSubjects = snapshot.docs.map(doc => {
        const data = doc.data();
        
        // Dynamic mapping of legacy properties (From assignment/quiz booleans)
        let completed = 0;
        let total = data.tasks || 4;
        let submissionsRaw = 0;
        let nAssign = data.numAssign !== undefined ? data.numAssign : (data.assignment1 !== undefined ? 2 : 0);
        let nQuiz = data.numQuiz !== undefined ? data.numQuiz : (data.quiz1 !== undefined ? 2 : 0);
        
        for (let i = 1; i <= nAssign; i++) {
           if (data[`assignment${i}`]) { completed++; submissionsRaw++; }
        }
        for (let i = 1; i <= nQuiz; i++) {
           if (data[`quiz${i}`]) completed++;
        }
        
        const actualTasks = nAssign + nQuiz;
        if (actualTasks > 0) total = actualTasks;

        const prog = total > 0 ? Math.round((completed / total) * 100) : (data.progress || 0);
        
        let autoType = data.type;
        if (!autoType) {
           // Segregate legacy subjects based on name clues
           const legacyTitle = (data.name || data.title || '').toLowerCase();
           autoType = legacyTitle.includes('lab') ? 'lab' : 'theory';
        }

        return {
           id: doc.id,
           title: data.name || data.title,
           progress: prog,
           completedTasks: completed,
           tasks: total,
           submissions: submissionsRaw,
           pending: total - completed,
           sessions: data.sessions || 0,
           quizzes: data.quizzes || 0,
           type: autoType,
           ...data
        }
      });
      
      setTheoryCourses(allSubjects.filter(c => c.type !== 'lab' && c.type !== 'imp'));
      setLabCourses(allSubjects.filter(c => c.type === 'lab'));
      setImpThings(allSubjects.filter(c => c.type === 'imp'));
    });

    return () => unsubscribe();
  }, [user]);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  if (loading) return <div className="loading-page"><div className="loader"></div></div>;

  if (!user) return (
    <div className="login-page">
      <div className="login-glow-1"></div>
      <div className="login-glow-2"></div>
      <div className="login-card fade-in">
        <div className="login-logo"><span className="material-symbols-outlined" style={{ fontSize: '28px' }}>school</span></div>
        <h1 className="login-title">Progress Tracker</h1>
        <p className="login-sub">Access your curated academic workspace and  progress.</p>
        <button onClick={login} className="google-btn">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{width: 18, height: 18}} />
          Authenticate with Google
        </button>
        <div className="login-divider">
          <div className="login-divider-line"></div>
          <span className="login-divider-text">Institution</span>
          <div className="login-divider-line"></div>
        </div>
        <div className="login-footer">Secure access provided by Google Authentication.</div>
      </div>
    </div>
  );

  return (
    <ConfirmProvider>
      <Router>
        <TopNav user={user} />
        <Routes>
          <Route path="/" element={<SubjectSelection theoryCount={theoryCourses.length} labCount={labCourses.length} />} />
          <Route path="/theory" element={<TheoryOverview courses={theoryCourses} />} />
          <Route path="/theory/:id" element={<TheoryDetail courses={theoryCourses} />} />
          <Route path="/lab" element={<LabOverview courses={labCourses} />} />
          <Route path="/lab/:id" element={<LabDetail courses={labCourses} />} />
          <Route path="/imp-things" element={<ImpThingsOverview courses={impThings} />} />
          <Route path="/custom" element={<CustomSetup user={user} />} />
          <Route path="*" element={<SubjectSelection theoryCount={theoryCourses.length} labCount={labCourses.length} />} />
        </Routes>
        <BottomNav />
      </Router>
    </ConfirmProvider>
  );
}

export default App;
