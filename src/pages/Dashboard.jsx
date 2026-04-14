import React from 'react';
import { useNavigate } from 'react-router-dom';

export const SubjectSelection = ({ theoryCount, labCount }) => {
  const navigate = useNavigate();

  return (
    <main className="main-content fade-in" style={{ paddingTop: '100px' }}>
      <section className="page-header">
        <h1 className="page-title">Refine Your Curriculum</h1>
        <p className="page-subtitle">Select the type of coursework you want to track. Your choice will format the layout and tasks to match your specific tracking needs.</p>
      </section>

      <div className="selection-grid">
        {/* Theory Card */}
        <div className="selection-card-large" onClick={() => navigate('/theory')}>
          <img src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=2000&auto=format&fit=crop" className="selection-card-img" alt="Library" />
          <div className="selection-card-overlay"></div>
          <div className="selection-card-body">
            <div className="detail-badge-row">
              <span className="chip chip-purple">Theoretical</span>
              <span className="text-muted font-headline" style={{ fontSize: '13px', fontWeight: 600 }}>{theoryCount} Modules Active</span>
            </div>
            <h3 className="detail-title" style={{ fontSize: '32px', color: 'var(--on-surface)' }}>Theory Subjects</h3>
            <p className="detail-desc" style={{ marginBottom: '24px' }}>Track your standard lecture-based subjects. Easily monitor assignments, quizzes, and overall coursework completion.</p>
            <button className="btn-primary">Begin Theory Path <span className="material-symbols-outlined">arrow_forward</span></button>
          </div>
        </div>

        {/* Lab Card */}
        <div className="selection-card-small" onClick={() => navigate('/lab')}>
          <div className="selection-card-icon"><span className="material-symbols-outlined" style={{ fontSize: '32px' }}>science</span></div>
          <h3 className="font-headline" style={{ fontSize: '22px', fontWeight: 800, marginBottom: '12px' }}>Laboratory Practice</h3>
          <p className="text-muted" style={{ fontSize: '13px', flex: 1 }}>Track lab sessions, experiments, and project deliverables with dedicated practical overview boards.</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', marginTop: '24px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--secondary)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Active Labs</span>
            <span className="chip chip-teal">{labCount}</span>
          </div>
        </div>

        {/* Custom Elective Card */}
        <div className="selection-full-card" onClick={() => navigate('/custom')} style={{ marginTop: '0px' }}>
          <h3 className="font-headline" style={{ fontSize: '24px', fontWeight: 800, marginBottom: '16px', color: 'var(--on-surface)' }}>Custom Setup</h3>
          <p className="text-muted" style={{ fontSize: '14px', marginBottom: '32px', maxWidth: '600px', lineHeight: '1.6' }}>Securely log important academic milestones, independent projects, or custom curriculum modules. Configure your own framework to strictly track any miscellaneous coursework that falls outside standard parameters.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
             Configure Now <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>settings_suggest</span>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h4 className="stat-value text-primary">Map</h4>
          <h5 className="stat-title">Assignment Tracker</h5>
          <p className="stat-desc">Log your assignments easily and watch your task completion bars fill up seamlessly.</p>
        </div>
        <div className="stat-card">
          <h4 className="stat-value text-secondary">Organize</h4>
          <h5 className="stat-title">Detailed Breakdowns</h5>
          <p className="stat-desc">Isolate theory courses from dense laboratory practicals to avoid overlapping schedules.</p>
        </div>
        <div className="stat-card">
          <h4 className="stat-value text-tertiary">Sync</h4>
          <h5 className="stat-title">Cross-Platform</h5>
          <p className="stat-desc">Your progress is updated in real-time directly across the Progress Tracker.</p>
        </div>
      </div>
    </main>
  );
};
