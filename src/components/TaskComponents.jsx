import React from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const InlineToggle = ({ course, field, label, isDone }) => {
  const toggle = async (e) => {
    e.stopPropagation();
    try {
      const newState = !isDone;
      
      let completed = 0;
      let total = course.tasks || 4;
      let nAssign = course.numAssign !== undefined ? course.numAssign : (course.assignment1 !== undefined ? 2 : 0);
      let nQuiz = course.numQuiz !== undefined ? course.numQuiz : (course.quiz1 !== undefined ? 2 : 0);
      
      for (let i = 1; i <= nAssign; i++) {
        if (`assignment${i}` === field) { if(newState) completed++; }
        else if (course[`assignment${i}`]) completed++;
      }
      for (let i = 1; i <= nQuiz; i++) {
        if (`quiz${i}` === field) { if(newState) completed++; }
        else if (course[`quiz${i}`]) completed++;
      }
      
      if (field === 'done') {
        completed = newState ? 1 : 0;
        total = 1;
      }
      
      const prog = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      await updateDoc(doc(db, 'subjects', course.id), { 
        [field]: newState,
        completedTasks: completed,
        progress: prog,
        pending: total - completed
      });
    } catch (err) { 
      console.error(err); 
    }
  };

  return (
    <div onClick={toggle} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer', marginRight: '16px', padding: '4px 0' }}>
      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>{label}</span>
      <div className={`quiz-check-box ${isDone ? 'done' : 'pending'}`}>
        {isDone && <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>}
      </div>
    </div>
  );
};

export const TaskItem = ({ course, field, title, sub, isDone }) => {
  const toggle = async () => {
    try {
      const newState = !isDone;
      
      let completed = 0;
      let total = course.tasks || 4;
      let nAssign = course.numAssign !== undefined ? course.numAssign : (course.assignment1 !== undefined ? 2 : 0);
      let nQuiz = course.numQuiz !== undefined ? course.numQuiz : (course.quiz1 !== undefined ? 2 : 0);
      
      for (let i = 1; i <= nAssign; i++) {
        if (`assignment${i}` === field) { if(newState) completed++; }
        else if (course[`assignment${i}`]) completed++;
      }
      for (let i = 1; i <= nQuiz; i++) {
        if (`quiz${i}` === field) { if(newState) completed++; }
        else if (course[`quiz${i}`]) completed++;
      }
      
      if (field === 'done') {
        completed = newState ? 1 : 0;
        total = 1;
      }
      
      const prog = total > 0 ? Math.round((completed / total) * 100) : 0;

      await updateDoc(doc(db, 'subjects', course.id), { 
        [field]: newState,
        completedTasks: completed,
        progress: prog,
        pending: total - completed
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="quiz-item" onClick={toggle} style={{ cursor: 'pointer' }}>
       <div className="quiz-item-left">
         <div className={`quiz-check-box ${isDone ? 'done' : 'pending'}`}>
            {isDone && <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>}
         </div>
         <div>
           <div className="quiz-item-title">{title}</div>
           <div className="quiz-item-sub">{sub}</div>
         </div>
       </div>
    </div>
  );
};
