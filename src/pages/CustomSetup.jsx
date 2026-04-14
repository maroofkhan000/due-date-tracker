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
    <main className="main-content fade-in setup-page">
      <div className="setup-header">
        <h1 className="page-title">Define Your <span className="gradient-text">Workspace</span></h1>
        <p className="page-subtitle">Customize your academic module by specifying categories and weightage. The curriculum will be synchronized to your cloud workspace.</p>
      </div>

      <form onSubmit={handleSubmit} className="setup-form">
        <div className="form-card" style={{ marginBottom: '24px' }}>
          <div>
            <label className="form-label">{type === 'imp' ? 'Imp Things Name' : 'Subject Name'}</label>
            <input type="text" className="input-field" placeholder={queryType ? "e.g. Advanced Comparative Literature" : "e.g. Upcoming Workshop or Goal"} value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          {queryType ? (
            <div className="setup-count-row">
              <div className="setup-count-field">
                <label className="form-label">Assignments Count</label>
                <input type="number" min="0" max="10" className="input-field" value={numAssign} onChange={(e) => setNumAssign(parseInt(e.target.value) || 0)} />
              </div>
              <div className="setup-count-field">
                <label className="form-label">Quizzes Count</label>
                <input type="number" min="0" max="10" className="input-field" value={numQuiz} onChange={(e) => setNumQuiz(parseInt(e.target.value) || 0)} />
              </div>
            </div>
          ) : null}
        </div>

        <div className="setup-btn-row">
          <button type="button" className="btn-ghost setup-btn" onClick={() => navigate('/')}>Cancel</button>
          <button type="submit" className="btn-primary setup-btn" disabled={loadingAction}>
            {loadingAction ? 'Initializing...' : 'Initialize Subject'}
          </button>
        </div>
      </form>
    </main>
  );
};
