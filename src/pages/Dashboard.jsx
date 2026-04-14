import React from 'react';
import { useNavigate } from 'react-router-dom';

export const SubjectSelection = ({ theoryCount, labCount }) => {
  const navigate = useNavigate();

  return (
    <main className="main-content fade-in" style={{ paddingTop: '100px' }}>
      <section className="page-header">
        <h1 className="page-title">Refine Your Curriculum</h1>
        <p className="page-subtitle">Choose the nature of your next academic endeavor. Your selection determines the methodology and resources allocated to your workspace.</p>
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
            <h3 className="detail-title" style={{ fontSize: '32px', color: 'var(--on-surface)' }}>Principles &amp; Analysis</h3>
            <p className="detail-desc" style={{ marginBottom: '24px' }}>Deep-dive into abstract frameworks, historical contexts, and critical literature reviews. Designed for extensive reading and synthesis.</p>
            <button className="btn-primary">Begin Theory Path <span className="material-symbols-outlined">arrow_forward</span></button>
          </div>
        </div>

        {/* Lab Card */}
        <div className="selection-card-small" onClick={() => navigate('/lab')}>
          <div className="selection-card-icon"><span className="material-symbols-outlined" style={{ fontSize: '32px' }}>science</span></div>
          <h3 className="font-headline" style={{ fontSize: '22px', fontWeight: 800, marginBottom: '12px' }}>Laboratory Practice</h3>
          <p className="text-muted" style={{ fontSize: '13px', flex: 1 }}>Practical applications, experimentation, and data analysis tasks. Access virtual labs and technical simulators.</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', marginTop: '24px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--secondary)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Active Labs</span>
            <span className="chip chip-teal">{labCount}</span>
          </div>
        </div>

        {/* Custom Elective Card */}
        <div className="selection-full-card" onClick={() => navigate('/custom')} style={{ marginTop: '0px' }}>
          <h3 className="font-headline" style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px', color: 'var(--on-surface)' }}>Custom Elective</h3>
          <p className="text-muted" style={{ fontSize: '14px', marginBottom: '24px', maxWidth: '600px' }}>Build your own interdisciplinary module. Combine cross-faculty resources for a unique academic blend tailored to your specific research interests.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
             Configure Now <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>settings_suggest</span>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h4 className="stat-value text-primary">98%</h4>
          <h5 className="stat-title">Completion Rate</h5>
          <p className="stat-desc">Students who follow the structured paths show significantly higher retention rates.</p>
        </div>
        <div className="stat-card">
          <h4 className="stat-value text-secondary">24/7</h4>
          <h5 className="stat-title">Research Access</h5>
          <p className="stat-desc">Global library access is included with all Theoretical and Practical modules.</p>
        </div>
        <div className="stat-card">
          <h4 className="stat-value text-tertiary">Sync</h4>
          <h5 className="stat-title">Cross-Platform</h5>
          <p className="stat-desc">Your progress is updated in real-time across the Scholarly ecosystem.</p>
        </div>
      </div>
    </main>
  );
};
