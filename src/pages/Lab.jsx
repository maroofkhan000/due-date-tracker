import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { InlineToggle, TaskItem } from '../components/TaskComponents';
import { useConfirm } from '../contexts/ConfirmContext';

export const LabOverview = ({ courses }) => {
  const navigate = useNavigate();
  const confirmAction = useConfirm();

  return (
    <main className="main-content fade-in" style={{ paddingTop: '100px' }}>
      <button className="back-btn" onClick={() => navigate('/')}>
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span> Choose Course Focus
      </button>

      <div className="page-header">
        <h1 className="page-title">Lab Subjects</h1>
        <p className="page-subtitle">Manage your experimental curriculum and track laboratory milestones.</p>
      </div>

      {courses.length === 0 && <p className="text-muted text-center" style={{marginTop: '40px'}}>No lab subjects found. Add one from the Other tab.</p>}

      <div className="subjects-table" style={{ marginBottom: '64px', display: courses.length === 0 ? 'none' : 'block' }}>
        <table>
          <thead>
            <tr>
              <th>Lab Subject</th>
              <th>Assignments</th>
              <th>Quizzes</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {courses.map(course => (
              <tr key={course.id} onClick={() => navigate(`/lab/${course.id}`)} style={{ cursor: 'pointer' }}>
                <td>
                  <div className="subject-name">
                    <div className="subject-dot" style={{ backgroundColor: 'var(--secondary)' }}></div>
                    {course.title}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                     {[...Array(course.numAssign || 2)].map((_, i) => (
                        <InlineToggle key={`a${i}`} course={course} field={`assignment${i+1}`} label={`A${i+1}`} isDone={course[`assignment${i+1}`]} />
                     ))}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                     {[...Array(course.numQuiz || 2)].map((_, i) => (
                        <InlineToggle key={`q${i}`} course={course} field={`quiz${i+1}`} label={`Q${i+1}`} isDone={course[`quiz${i+1}`]} />
                     ))}
                  </div>
                </td>
                <td>
                  <div className="progress-bar-wrap">
                    <div className="progress-bar-track" style={{ background: 'rgba(255,255,255,0.05)' }}>
                       <div className="progress-bar-fill" style={{ width: `${course.progress || 0}%`, background: 'var(--secondary)' }}></div>
                    </div>
                    <span className="progress-val text-secondary" style={{ whiteSpace: 'nowrap' }}>{course.completedTasks || 0}/{course.tasks || 0} ({course.progress || 0}%)</span>
                  </div>
                </td>
                <td style={{ width: '50px', textAlign: 'right' }}>
                   <button onClick={async (e) => { 
                      e.stopPropagation(); 
                      if (await confirmAction('Delete Course', `Are you sure you want to remove ${course.title}?`)) deleteDoc(doc(db, 'subjects', course.id)); 
                   }} className="btn-ghost" style={{ padding: '8px', color: '#ff6b6b' }} title="Remove Subject">
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="subjects-grid" style={{ marginBottom: '64px' }}>
         {courses.map(course => (
           <div key={course.id} className="subject-card-mobile" onClick={() => navigate(`/lab/${course.id}`)}>
              <div className="radial-wrap">
                <svg width="72" height="72" viewBox="0 0 72 72">
                  <circle className="progress-ring-track" cx="36" cy="36" r="32" fill="none" strokeWidth="6" />
                  <circle className="progress-ring-fill" cx="36" cy="36" r="32" fill="none" strokeWidth="6" strokeDasharray={`${2 * Math.PI * 32}`} strokeDashoffset={`${2 * Math.PI * 32 * (1 - (course.progress||0)/100)}`} stroke="var(--secondary)" />
                </svg>
                <div className="radial-label text-secondary">{course.progress || 0}%</div>
              </div>
              <div className="subject-card-name">{course.title}</div>
           </div>
         ))}
      </div>

      <button className="fab" onClick={() => navigate('/custom?type=lab')}>
        <span className="material-symbols-outlined">add</span>
      </button>
    </main>
  );
};

export const LabDetail = ({ courses }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const confirmAction = useConfirm();
  const course = courses.find(c => c.id === id);

  if (!course) return <div className="main-content" style={{paddingTop: '100px'}}><p className="text-muted">Loading lab...</p></div>;

  const handleRemove = async () => {
    if (await confirmAction('Delete Course', `Are you sure you want to permanently remove ${course.title}?`)) {
      await deleteDoc(doc(db, 'subjects', course.id));
      navigate('/lab');
    }
  };

  return (
    <main className="main-content fade-in" style={{ paddingTop: '100px', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="back-btn" onClick={() => navigate('/lab')}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span> Return to Lab Overview
        </button>
        <button onClick={handleRemove} className="btn-ghost" style={{ color: '#ff6b6b' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span> Remove
        </button>
      </div>

      <div className="detail-hero" style={{ alignItems: 'center' }}>
        <div className="detail-hero-content">
          <div className="detail-badge-row">
            <span className="chip chip-teal">Advanced Laboratory</span>
            <span className="text-muted" style={{ fontSize: '13px', fontWeight: 600 }}>Practical</span>
          </div>
          <h1 className="detail-title text-secondary">{course.title}</h1>
          <p className="detail-desc">Advanced practical study of computational networks, focusing on architectural optimization and hardware-accelerated laboratory implementations.</p>
        </div>
        
        <div className="big-radial-wrap">
           <svg width="128" height="128" viewBox="0 0 128 128">
             <circle className="progress-ring-track" cx="64" cy="64" r="56" fill="none" strokeWidth="12" />
             <circle className="progress-ring-fill" cx="64" cy="64" r="56" fill="none" strokeWidth="12" strokeDasharray={`${2 * Math.PI * 56}`} strokeDashoffset={`${2 * Math.PI * 56 * (1 - (course.progress||0)/100)}`} stroke="var(--secondary)" />
           </svg>
           <div className="big-radial-label">
             <span className="big-radial-pct">{course.progress || 0}%</span>
             <span className="big-radial-sub">Done</span>
           </div>
        </div>
      </div>

      <div className="bento-grid">
        <aside className="sidebar-card">
          <h2 className="sidebar-title"><span className="material-symbols-outlined text-secondary">tune</span> Configuration</h2>
          <div className="counter-row">
            <span className="counter-label">Lab Count</span>
            <span className="counter-value" style={{ color: 'var(--on-surface)' }}>{course.sessions || 0}</span>
          </div>
          <div className="counter-row">
            <span className="counter-label">Quiz Count</span>
            <span className="counter-value" style={{ color: 'var(--on-surface)' }}>{course.quizzes || 0}</span>
          </div>
        </aside>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 className="font-headline text-secondary" style={{ fontSize: '24px', fontWeight: 800 }}>Assignments</h3>
                <div className="text-muted" style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Due by Friday</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                 {[...Array(course.numAssign || 2)].map((_, i) => (
                   <TaskItem key={`a${i}`} course={course} field={`assignment${i+1}`} title={`Assignment ${i+1}`} sub="Coursework Tracker" isDone={course[`assignment${i+1}`]} />
                 ))}
              </div>
            </section>

            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 className="font-headline text-tertiary" style={{ fontSize: '24px', fontWeight: 800 }}>Quizzes</h3>
                <div className="text-muted" style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Assessment</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                 {[...Array(course.numQuiz || 2)].map((_, i) => (
                   <TaskItem key={`q${i}`} course={course} field={`quiz${i+1}`} title={`Quiz ${i+1}`} sub="Assessment Module" isDone={course[`quiz${i+1}`]} />
                 ))}
              </div>
            </section>
        </div>
      </div>
    </main>
  );
};
