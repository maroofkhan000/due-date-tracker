import React from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { InlineToggle } from '../components/TaskComponents';
import { useConfirm } from '../contexts/ConfirmContext';

export const ImpThingsOverview = ({ courses }) => {
  const navigate = useNavigate();
  const confirmAction = useConfirm();

  return (
    <main className="main-content fade-in" style={{ paddingTop: '100px' }}>
      <button className="back-btn" onClick={() => navigate('/')}>
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span> Choose Course Focus
      </button>

      <div className="page-header">
        <h1 className="page-title">Imp Things</h1>
        <p className="page-subtitle">Track your standalone goals, crucial milestones, and personal tasks here.</p>
      </div>

      {courses.length === 0 && <p className="text-muted text-center" style={{marginTop: '40px'}}>No important things found. Add one manually using the button below.</p>}

      <div className="subjects-table" style={{ marginBottom: '64px', display: courses.length === 0 ? 'none' : '' }}>
        <table>
          <thead>
            <tr>
              <th>Important Task Name</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {courses.map(course => (
              <tr key={course.id} onClick={() => {}} style={{ cursor: 'pointer' }}>
                <td>
                  <div className="subject-name">
                    <div className="subject-dot" style={{ backgroundColor: 'var(--primary)' }}></div>
                    {course.title}
                  </div>
                </td>
                <td style={{ width: '120px' }}>
                   <div style={{ display: 'flex', alignItems: 'center' }}>
                      <InlineToggle course={course} field="done" label="Complete" isDone={course.done || false} />
                   </div>
                </td>
                <td style={{ width: '50px', textAlign: 'right' }}>
                   <button onClick={async (e) => { 
                      e.stopPropagation(); 
                      if (await confirmAction('Delete Task', `Are you sure you want to remove ${course.title}?`)) deleteDoc(doc(db, 'subjects', course.id)); 
                   }} className="btn-ghost" style={{ padding: '8px', color: '#ff6b6b' }} title="Remove Item">
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
           <div key={course.id} className="subject-card-mobile" onClick={() => {}}>
              <div className="subject-card-name" style={{ marginBottom: '16px' }}>{course.title}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <InlineToggle course={course} field="done" label="Complete" isDone={course.done || false} />
                <button onClick={async (e) => { 
                   e.stopPropagation(); 
                   if (await confirmAction('Delete Task', `Are you sure you want to remove ${course.title}?`)) deleteDoc(doc(db, 'subjects', course.id)); 
                }} className="btn-ghost" style={{ color: '#ff6b6b' }}><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span></button>
              </div>
           </div>
         ))}
      </div>

      <button className="fab" onClick={() => navigate('/custom?type=imp')}>
        <span className="material-symbols-outlined">add</span>
      </button>
    </main>
  );
};
