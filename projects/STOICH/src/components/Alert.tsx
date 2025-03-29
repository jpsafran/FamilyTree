import React from 'react';
import './Alert.css';

interface AlertProps {
  message: string;
  onClose: () => void;
}

const Alert: React.FC<AlertProps> = ({ message, onClose }) => (
  <div className="alert-overlay" onClick={onClose}>
    <div className="alert-content" onClick={e => e.stopPropagation()}>
      <p>{message}</p>
      <button onClick={onClose}>OK</button>
    </div>
  </div>
);

export default Alert;
