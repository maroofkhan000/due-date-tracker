import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export const CustomSetup = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryType = new URLSearchParams(location.search).get('type');

  const [title, setTitle] = useState('');
  const [type, setType] = useState(queryType || 'imp'); // 'theory', 'lab', or 'imp'
  const [numAssign, setNumAssign] = useState(queryType ? 2 : 0);
  const [numQuiz, setNumQuiz] = useState(queryType ? 2 : 0);
  const [loadingAction, setLoadingAction] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !user) return;
    
    setLoadingAction(true);
    try {
      const dynamicPayload = {};
      for (let i = 1; i <= numAssign; i++) dynamicPayload[`assignment${i}`] = false;
      for (let i = 1; i <= numQuiz; i++) dynamicPayload[`quiz${i}`] = false;
      const tTasks = numAssign + numQuiz;

      await addDoc(collection(db, 'subjects'), {
        name: title,        
        title: title,       
        progress: 0,
        submissions: 0,
        pending: tTasks,
        completedTasks: 0,
        tasks: tTasks,
        numAssign: numAssign,
        numQuiz: numQuiz,
        sessions: 0,
        quizzes: 0,
        userId: user.uid,
        type: type,
        createdAt: serverTimestamp(),
        ...dynamicPayload
      });
      if (type.trim().toLowerCase() === 'theory') navigate('/theory');
      else if (type.trim().toLowerCase() === 'lab') navigate('/lab');
      else navigate('/imp-things');
    } catch (err) {
      console.error("Error creating subject: ", err);
      setLoadingAction(false);
    }
  };

  return (
     <main className="main-content fade-in text-center" style={{ maxWidth: '800px', paddingTop: '120px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '40px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--on-surface-variant)' }}>Curriculum</span>
          <span className="material-symbols-outlined text-muted" style={{ fontSize: '16px' }}>chevron_right</span>
          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--primary)' }}>New Subject Setup</span>
        </div>

        <h1 className="page-title" style={{ marginBottom: '16px' }}>Define Your <span className="gradient-text">Workspace</span></h1>
        <p className="page-subtitle" style={{ margin: '0 auto 48px' }}>Customize your academic module by specifying categories and weightage. The curriculum will be synchronized to your cloud workspace.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-card text-left" style={{ marginBottom: '24px' }}>
            <div>
               <label className="form-label">{type === 'imp' ? 'Imp Things Name' : 'Subject Name'}</label>
               <input type="text" className="input-field" placeholder={queryType ? "e.g. Advanced Comparative Literature" : "e.g. Upcoming Workshop or Goal"} value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            {queryType ? (
               <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
                  <div style={{ flex: 1 }}>
                     <label className="form-label">Assignments Count</label>
                     <input type="number" min="0" max="10" className="input-field" value={numAssign} onChange={(e) => setNumAssign(parseInt(e.target.value) || 0)} />
                  </div>
                  <div style={{ flex: 1 }}>
                     <label className="form-label">Quizzes Count</label>
                     <input type="number" min="0" max="10" className="input-field" value={numQuiz} onChange={(e) => setNumQuiz(parseInt(e.target.value) || 0)} />
                  </div>
               </div>
            ) : null}
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
             <button type="button" className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => navigate('/')}>Cancel</button>
             <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '16px' }} disabled={loadingAction}>
               {loadingAction ? 'Initializing...' : 'Initialize Subject'}
             </button>
          </div>
        </form>
     </main>
  );
};
