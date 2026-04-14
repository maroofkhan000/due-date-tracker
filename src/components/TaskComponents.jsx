import React from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { calcProgress } from '../utils/progressCalc';

/**
 * InlineToggle — compact checkbox used inside table rows.
 * Shows a label above a checkbox square.
 */
export const InlineToggle = ({ course, field, label, isDone }) => {
  const handleToggle = async (e) => {
    e.stopPropagation();
    try {
      const newState = !isDone;
      const { completed, total, prog } = calcProgress(course, field, newState);
      await updateDoc(doc(db, 'subjects', course.id), {
        [field]: newState,
        completedTasks: completed,
        progress: prog,
        pending: total - completed,
      });
    } catch (err) {
      console.error('[InlineToggle] Failed to update:', err);
    }
  };

  return (
    <div
      onClick={handleToggle}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        cursor: 'pointer',
        marginRight: '16px',
        padding: '4px 0',
      }}
    >
      <span style={{ fontSize: '11px', color: 'var(--on-surface-variant)', fontWeight: 700 }}>
        {label}
      </span>
      <div className={`quiz-check-box ${isDone ? 'done' : 'pending'}`}>
        {isDone && <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>}
      </div>
    </div>
  );
};

/**
 * TaskItem — full card-style toggle row used on detail pages.
 */
export const TaskItem = ({ course, field, title, sub, isDone }) => {
  const handleToggle = async () => {
    try {
      const newState = !isDone;
      const { completed, total, prog } = calcProgress(course, field, newState);
      await updateDoc(doc(db, 'subjects', course.id), {
        [field]: newState,
        completedTasks: completed,
        progress: prog,
        pending: total - completed,
      });
    } catch (err) {
      console.error('[TaskItem] Failed to update:', err);
    }
  };

  return (
    <div className="quiz-item" onClick={handleToggle} style={{ cursor: 'pointer' }}>
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
