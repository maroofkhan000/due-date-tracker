import React, { createContext, useState, useContext } from 'react';

const ConfirmContext = createContext();

export const useConfirm = () => useContext(ConfirmContext);

export const ConfirmProvider = ({ children }) => {
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, onCancel: null });

  const confirmAction = (title, message) => {
    return new Promise((resolve) => {
      setModal({
        isOpen: true,
        title,
        message,
        onConfirm: () => {
          setModal({ isOpen: false, title: '', message: '', onConfirm: null, onCancel: null });
          resolve(true);
        },
        onCancel: () => {
          setModal({ isOpen: false, title: '', message: '', onConfirm: null, onCancel: null });
          resolve(false);
        }
      });
    });
  };

  return (
    <ConfirmContext.Provider value={confirmAction}>
      {children}
      {modal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-card fade-in">
            <h3 className="font-headline text-primary" style={{fontSize: '22px', marginBottom: '12px'}}>{modal.title}</h3>
            <p className="text-muted" style={{marginBottom: '32px', fontSize: '15px', lineHeight: '1.6'}}>{modal.message}</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn-ghost" onClick={modal.onCancel}>Cancel</button>
              <button className="btn-primary" style={{backgroundColor: '#ff4d4f', color: '#fff'}} onClick={modal.onConfirm}>Confirm Action</button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};
