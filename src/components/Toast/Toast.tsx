import React, { useEffect } from 'react';
import './Toast.css';

interface ToastProps {
  message: string;
  show: boolean;
  onClose: () => void;
  type?: 'success' | 'info' | 'warning' | 'error';
}

export const Toast: React.FC<ToastProps> = ({ message, show, onClose, type = 'success' }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Auto-hide after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className={`toast toast-${type}`}>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose}>×</button>
    </div>
  );
};
