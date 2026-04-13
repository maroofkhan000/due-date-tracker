import React, { useState, useEffect } from 'react';
import { auth, googleProvider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { Bell, Settings, ArrowRight, Plus } from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, u => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#0f1524' }}>
      <div className="animate-spin" style={{ width: '48px', height: '48px', borderRadius: '50%', border: '3px solid rgba(0,229,255,0.15)', borderTopColor: '#00e5ff' }}></div>
    </div>
  );

  if (!user) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#0f1524' }}>
      <div className="card fade-in" style={{ padding: '2.5rem', maxWidth: '26rem', width: '100%', textAlign: 'center' }}>
        <h1 className="font-outfit" style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem' }}>Scholarly Atelier</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Sign in to refine your curriculum.</p>
        <button onClick={login} className="btn-cyan" style={{ width: '100%', justifyContent: 'center' }}>
          Sign in with Google
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Top Navbar */}
      <nav className="navbar">
        <div className="nav-brand font-outfit">Scholarly Atelier</div>
        <div className="nav-links">
          <a href="#" className={`nav-link${activeTab === 'dashboard' ? ' active' : ''}`} onClick={e => { e.preventDefault(); setActiveTab('dashboard'); }}>Dashboard</a>
          <a href="#" className={`nav-link${activeTab === 'courses' ? ' active' : ''}`} onClick={e => { e.preventDefault(); setActiveTab('courses'); }}>Courses</a>
          <a href="#" className={`nav-link${activeTab === 'research' ? ' active' : ''}`} onClick={e => { e.preventDefault(); setActiveTab('research'); }}>Research</a>
          <a href="#" className={`nav-link${activeTab === 'schedule' ? ' active' : ''}`} onClick={e => { e.preventDefault(); setActiveTab('schedule'); }}>Schedule</a>
        </div>
        <div className="nav-actions">
          <button className="nav-icon"><Bell size={20} /></button>
          <button className="nav-icon"><Settings size={20} /></button>
          <img
            src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'User')}&background=0D8ABC&color=fff`}
            alt="User"
            className="avatar"
            title="Sign Out"
            onClick={() => signOut(auth)}
            style={{ cursor: 'pointer' }}
          />
        </div>
      </nav>

      {/* Main Content */}
      <main className="container">
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
              <h2 className="theory-title font-outfit">Principles &amp; Analysis</h2>
              <p className="theory-desc">
                Deep-dive into abstract frameworks, historical contexts, and critical literature reviews. Designed for extensive reading and synthesis.
              </p>
              <button className="btn-cyan">
                Begin Theory Path <ArrowRight style={{ width: '18px', height: '18px' }} />
              </button>
            </div>
          </div>

          {/* Right Stack */}
          <div className="right-col">
            {/* Practice Card */}
            <div className="card practice-card">
              <div className="icon-box">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>
                </svg>
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
                  CONFIGURE NOW <Settings style={{ width: '14px', height: '14px' }} />
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
        <Plus style={{ width: '26px', height: '26px', strokeWidth: 3 }} />
      </button>
    </>
  );
}

export default App;
