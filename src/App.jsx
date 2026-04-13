import React, { useState, useEffect } from 'react';
import { auth, db, googleProvider } from './firebase';
import { signInWithRedirect, signOut, onAuthStateChanged, getRedirectResult } from 'firebase/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { 
  Bell, Settings, ArrowRight, 
  Beaker, Plus
} from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('courses');

  useEffect(() => {
    getRedirectResult(auth).catch(e => console.error("Auth error", e));
    const unsubscribe = onAuthStateChanged(auth, u => { setUser(u); setLoading(false); });
    return () => unsubscribe();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#00e5ff]"></div>
    </div>
  );

  if (!user) return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="glass-card p-10 max-w-md w-full text-center fade-in">
        <h1 className="text-4xl font-bold mb-4 font-outfit text-[#00e5ff] tracking-tight">Scholarly Atelier</h1>
        <p className="text-[#94a3b8] mb-10 text-lg">Sign in to refine your curriculum.</p>
        <button onClick={() => signInWithRedirect(auth, googleProvider)} className="btn-cyan w-full justify-center py-4 text-center items-center">
          Sign in with Google
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Top Navbar */}
      <nav className="relative z-20 px-8 py-5 flex items-center justify-between border-b border-white border-opacity-5">
        <div className="text-2xl font-bold font-outfit tracking-tight" style={{ color: '#00e5ff' }}>Scholarly Atelier</div>
        <div className="hidden md:flex items-center space-x-10 text-sm font-medium">
          <button className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
          <button className={`nav-link ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => setActiveTab('courses')}>Courses</button>
          <button className={`nav-link ${activeTab === 'research' ? 'active' : ''}`} onClick={() => setActiveTab('research')}>Research</button>
          <button className={`nav-link ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')}>Schedule</button>
        </div>
        <div className="flex items-center gap-5">
          <button className="text-[#00e5ff] hover:text-white transition-colors"><Bell size={20} fill="currentColor" /></button>
          <button className="text-[#00e5ff] hover:text-white transition-colors"><Settings size={20} fill="currentColor" /></button>
          <button onClick={() => signOut(auth)} title="Sign Out">
            <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full border border-white/10 hover:border-[#00e5ff] transition-colors" />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex-1 p-8 md:p-12 max-w-[1280px] mx-auto w-full fade-in">
        <div className="mb-10">
          <h1 className="font-outfit text-4xl md:text-5xl font-bold text-white mb-4">Refine Your Curriculum</h1>
          <p className="text-[#94a3b8] max-w-2xl text-lg leading-relaxed">
            Choose the nature of your next academic endeavor. Your selection determines the methodology and resources allocated to your workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Big Theoretical Card */}
          <div className="lg:col-span-2 relative overflow-hidden rounded-[24px] border border-white/5 p-10 flex flex-col justify-end min-h-[440px] group transition-all">
            <div className="absolute inset-0 bg-[#0f1524]"></div>
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541963463532-d68292c34b19?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-30 mix-blend-luminosity"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#0f1524] via-[#0f1524]/80 to-transparent"></div>
            
            <div className="relative z-10 w-full md:w-3/4">
              <div className="flex items-center gap-3 mb-4">
                <span className="badge-magenta">THEORETICAL</span>
                <span className="text-sm text-gray-300 font-medium">48 Modules Available</span>
              </div>
              <h2 className="font-outfit text-[2.5rem] leading-none font-bold text-white mb-4">Principles & Analysis</h2>
              <p className="text-gray-300 text-[15px] mb-8 leading-relaxed max-w-md">
                Deep-dive into abstract frameworks, historical contexts, and critical literature reviews. Designed for extensive reading and synthesis.
              </p>
              <button className="btn-cyan flex items-center gap-2 w-max text-sm shadow-[0_0_15px_rgba(0,229,255,0.3)] hover:shadow-[0_0_25px_rgba(0,229,255,0.5)]">
                Begin Theory Path <ArrowRight size={18} />
              </button>
            </div>
            {/* Outline Glow */}
            <div className="absolute inset-0 border border-[#f000ff]/0 group-hover:border-[#f000ff]/30 rounded-[24px] transition-colors duration-500 pointer-events-none"></div>
          </div>

          {/* Right Column Stacked */}
          <div className="flex flex-col gap-6 h-full">
            <div className="bg-[#1c2235] rounded-[24px] border border-white/5 p-8 flex flex-col justify-between h-full relative group hover:border-[#a3e635]/30 transition-colors">
              <div>
                <div className="w-12 h-12 rounded-[10px] border border-[#a3e635]/30 flex items-center justify-center mb-6 shadow-[inset_0_0_15px_rgba(163,230,53,0.1)] bg-[#a3e635]/5">
                  <Beaker className="text-[#a3e635]" size={22} fill="currentColor" />
                </div>
                <h3 className="font-outfit text-2xl font-bold text-white mb-3 tracking-tight">Laboratory Practice</h3>
                <p className="text-[#94a3b8] text-[13px] leading-relaxed mb-6">
                  Practical applications, experimentation, and data analysis. Access virtual labs and technical simulators.
                </p>
              </div>
              <div className="flex items-center justify-between pt-4 mt-auto">
                <span className="text-[#a3e635] text-[10px] font-bold tracking-[0.15em]">ACTIVE WORKSHOPS</span>
                <span className="bg-[#a3e635]/20 text-[#a3e635] text-[10px] font-bold px-2.5 py-1 rounded">12</span>
              </div>
            </div>

            <div className="bg-[#1c2235] rounded-[24px] border border-white/5 p-8 flex flex-col h-full relative overflow-hidden group hover:border-[#00e5ff]/30 transition-colors">
              <div className="absolute right-0 bottom-0 opacity-[0.03] pointer-events-none transform translate-x-4 translate-y-4">
                <svg width="200" height="200" viewBox="0 0 100 100" className="fill-[#00e5ff]">
                  <path d="M50 0 L55 40 L95 45 L55 50 L50 90 L45 50 L5 45 L45 40 Z"/>
                  <path d="M85 70 L87 85 L100 87 L87 89 L85 100 L83 89 L70 87 L83 85 Z"/>
                </svg>
              </div>
              <h3 className="font-outfit text-2xl font-bold text-white mb-3 tracking-tight relative z-10">Custom Elective</h3>
              <p className="text-[#94a3b8] text-[13px] leading-relaxed mb-8 relative z-10">
                Build your own interdisciplinary module. Combine cross-faculty resources for a unique academic blend.
              </p>
              <div className="mt-auto relative z-10">
                <button className="text-[#00e5ff] text-[10px] font-bold tracking-[0.15em] flex items-center gap-2 hover:text-white transition-colors">
                  CONFIGURE NOW <Settings size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#151a2d] rounded-[20px] p-7 border border-white/5 hover:border-white/10 transition-colors">
            <h4 className="text-5xl font-outfit font-bold text-[#00e5ff] mb-2">98%</h4>
            <h5 className="font-bold text-white mb-2 text-[15px]">Completion Rate</h5>
            <p className="text-sm text-[#94a3b8] leading-relaxed">Students who follow the structured Atelier paths show significantly higher retention rates.</p>
          </div>
          <div className="bg-[#151a2d] rounded-[20px] p-7 border border-white/5 hover:border-white/10 transition-colors">
            <h4 className="text-5xl font-outfit font-bold text-[#a3e635] mb-2">24/7</h4>
            <h5 className="font-bold text-white mb-2 text-[15px]">Research Access</h5>
            <p className="text-sm text-[#94a3b8] leading-relaxed">Global library access is included with all Theoretical and Practical modules.</p>
          </div>
          <div className="bg-[#151a2d] rounded-[20px] p-7 border border-white/5 hover:border-white/10 transition-colors">
            <h4 className="text-5xl font-outfit font-bold text-[#f000ff] mb-2">Sync</h4>
            <h5 className="font-bold text-white mb-2 text-[15px]">Cross-Platform</h5>
            <p className="text-sm text-[#94a3b8] leading-relaxed">Your progress is updated in real-time across the Scholarly mobile and desktop ecosystem.</p>
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <button className="fixed bottom-12 right-12 z-50 w-14 h-14 bg-[#00e5ff] rounded-full flex items-center justify-center text-[#0f1523] shadow-[0_0_25px_rgba(0,229,255,0.4)] hover:scale-110 transition-transform">
        <Plus size={26} strokeWidth={3} />
      </button>
      
    </div>
  );
}

export default App;
