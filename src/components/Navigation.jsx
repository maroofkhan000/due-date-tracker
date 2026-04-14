import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useConfirm } from '../contexts/ConfirmContext';

export const TopNav = ({ user }) => {
  const location = useLocation();
  const confirmAction = useConfirm();
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <header className="top-nav">
      <div className="nav-brand">Scholarly Atelier</div>
      <nav className="nav-links">
        <Link to="/" className={`nav-link ${isActive('/') && location.pathname === '/' ? 'active' : ''}`}>Dashboard</Link>
        <Link to="/theory" className={`nav-link ${isActive('/theory') ? 'active' : ''}`}>Theory Sub</Link>
        <Link to="/lab" className={`nav-link ${isActive('/lab') ? 'active' : ''}`}>Lab</Link>
        <Link to="/imp-things" className={`nav-link ${isActive('/imp-things') ? 'active' : ''}`}>Other</Link>
      </nav>
      <div className="nav-actions">
        <button 
          className="btn-ghost" 
          style={{ color: '#ff6b6b', border: '1px solid rgba(255, 107, 107, 0.25)', padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={async () => {
             const confirmed = await confirmAction('Sign Out', 'Are you sure you want to sign out of your account and end this session?');
             if (confirmed) signOut(auth);
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
          <span style={{ fontSize: '14px', fontWeight: 600 }}>Sign Out</span>
        </button>
      </div>
    </header>
  );
};

export const BottomNav = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <nav className="bottom-nav">
      <Link to="/" className={`bottom-nav-item ${isActive('/') && location.pathname === '/' ? 'active' : ''}`}>
        <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>home_app_logo</span>
        Home
      </Link>
      <Link to="/theory" className={`bottom-nav-item ${isActive('/theory') ? 'active' : ''}`}>
        <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>menu_book</span>
        Theory Sub
      </Link>
      <Link to="/lab" className={`bottom-nav-item ${isActive('/lab') ? 'active' : ''}`}>
        <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>science</span>
        Lab
      </Link>
      <Link to="/imp-things" className={`bottom-nav-item ${isActive('/imp-things') ? 'active' : ''}`}>
        <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>grid_view</span>
        Other
      </Link>
    </nav>
  );
};
