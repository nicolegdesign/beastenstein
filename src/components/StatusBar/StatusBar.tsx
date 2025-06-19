import React from 'react';
import './StatusBar.css';

interface StatusBarProps {
  label: string;
  value: number;
  id: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({ label, value, id }) => {
  const getStatusClass = (value: number): string => {
    if (value >= 70) return 'status-high';
    if (value >= 30) return 'status-medium';
    return 'status-low';
  };

  return (
    <div className="stat">
      <label>{label}:</label>
      <div className="status-bar">
        <div 
          id={`${id}-bar`}
          className={`status-fill ${getStatusClass(value)}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span id={id}>{value}</span>
    </div>
  );
};
