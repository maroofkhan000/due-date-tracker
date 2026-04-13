import React, { useState, useEffect } from 'react';
import { auth, db, googleProvider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { 
  Bell, Settings, ArrowRight, 
  Beaker, Plus
} from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, u => { setUser(u); setLoading(false); });
    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login popup failed:", error);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="animate-spin" style={{ borderRadius: '9999px', height: '3rem', width: '3rem', borderTop: '2px solid #00e5ff' }}></div>
    </div>
  );

  if (!user) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '1rem' }}>
      <div className="card fade-in" style={{ padding: '2.5rem', maxWidth: '28rem', width: '100%', textAlign: 'center' }}>
        <h1 className="font-outfit" style={{ fontSize: '2.25rem', fontWeight: 700, marginBottom: '1rem', color: '#00e5ff', letterSpacing: '-0.025em' }}>Scholarly Atelier</h1>
        <p style={{ color: '#94a3b8', marginBottom: '2.5rem', fontSize: '1.125rem' }}>Sign in to refine your curriculum.</p>
        <button onClick={login} className="btn-cyan" style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '1rem' }}>
          Sign in with Google
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Top Navbar */}
      <nav className="navbar fade-in">
        <div className="nav-brand font-outfit">Scholarly Atelier</div>
        <div className="nav-links">
          <button className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
          <button className={`nav-link ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => setActiveTab('courses')}>Courses</button>
          <button className={`nav-link ${activeTab === 'research' ? 'active' : ''}`} onClick={() => setActiveTab('research')}>Research</button>
          <button className={`nav-link ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')}>Schedule</button>
        </div>
        <div className="nav-actions">
          <button className="nav-icon"><Bell size={20} fill="currentColor" /></button>
          <button className="nav-icon"><Settings size={20} fill="currentColor" /></button>
          <img src={user.photoURL} alt="User" className="avatar" title="Sign Out" onClick={() => signOut(auth)} style={{ cursor: 'pointer' }} />
        </div>
      </nav>

      {/* Main Content */}
      <main className="container fade-in">
        <header className="page-header">
          <h1 className="header-title font-outfit">Refine Your Curriculum</h1>
          <p className="header-desc">
            Choose the nature of your next academic endeavor. Your selection determines the methodology and resources allocated to your workspace.
          </p>
        </header>

        <div className="main-grid">
          {/* Big Theoretical Card */}
          <div className="card theory-card">
            <div className="theory-bg"></div>
            <div className="theory-gradient"></div>
            
            <div className="theory-content">
              <div className="badge-row">
                <span className="badge-magenta">THEORETICAL</span>
                <span className="theory-subtitle">48 Modules Available</span>
              </div>
              <h2 className="theory-title font-outfit">Principles & Analysis</h2>
              <p className="theory-desc">
                Deep-dive into abstract frameworks, historical contexts, and critical literature reviews. Designed for extensive reading and synthesis.
              </p>
              <button className="btn-cyan">
                Begin Theory Path <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* Right Stack */}
          <div className="right-col">
            {/* Practice Card */}
            <div className="card practice-card">
              <div className="icon-box">
                <Beaker size={22} fill="currentColor" />
              </div>
              <h3 className="card-title font-outfit">Laboratory Practice</h3>
              <p className="card-desc">
                Practical applications, experimentation, and data analysis. Access virtual labs and technical simulators.
              </p>
              <div className="practice-bottom">
                <span className="practice-label">ACTIVE WORKSHOPS</span>
                <span className="practice-val">12</span>
              </div>
            </div>

            {/* Custom Card */}
            <div className="card custom-card">
              <div style={{ position: 'absolute', right: '10px', bottom: '10px', opacity: 0.03, pointerEvents: 'none' }}>
                <svg width="150" height="150" viewBox="0 0 100 100" fill="#00e5ff">
                  <path d="M50 0 L55 40 L95 45 L55 50 L50 90 L45 50 L5 45 L45 40 Z"/>
                  <path d="M85 70 L87 85 L100 87 L87 89 L85 100 L83 89 L70 87 L83 85 Z"/>
                </svg>
              </div>
              <h3 className="card-title font-outfit" style={{ position: 'relative', zIndex: 2 }}>Custom Elective</h3>
              <p className="card-desc" style={{ position: 'relative', zIndex: 2 }}>
                Build your own interdisciplinary module. Combine cross-faculty resources for a unique academic blend.
              </p>
              <div className="custom-bottom" style={{ position: 'relative', zIndex: 2 }}>
                <button className="btn-config">
                  CONFIGURE NOW <Settings size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <h4 className="stat-val val-cyan font-outfit">98%</h4>
            <h5 className="stat-title">Completion Rate</h5>
            <p className="stat-desc">Students who follow the structured Atelier paths show significantly higher retention rates.</p>
          </div>
          <div className="stat-card">
            <h4 className="stat-val val-lime font-outfit">24/7</h4>
            <h5 className="stat-title">Research Access</h5>
            <p className="stat-desc">Global library access is included with all Theoretical and Practical modules.</p>
          </div>
          <div className="stat-card">
            <h4 className="stat-val val-magenta font-outfit">Sync</h4>
            <h5 className="stat-title">Cross-Platform</h5>
            <p className="stat-desc">Your progress is updated in real-time across the Scholarly mobile and desktop ecosystem.</p>
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <button className="fab">
        <Plus size={26} strokeWidth={3} />
      </button>
    </>
  );
}

export default App;
