import React from 'react';
import './StatusBar.css';

interface StatusBarProps {
  label: string;
  value: number;
  id: string;
  maxValue?: number; // Optional max value, defaults to 100
}

export const StatusBar: React.FC<StatusBarProps> = ({ label, value, id, maxValue = 100 }) => {
  // Calculate percentage based on the actual max value
  const percentage = Math.min(100, (value / maxValue) * 100);
  
  const getStatusClass = (percentage: number): string => {
    if (percentage >= 70) return 'status-high';
    if (percentage >= 30) return 'status-medium';
    return 'status-low';
  };

  return (
    <div className="stat">
      <label>{label}:</label>
      <div className="status-bar">
        <div 
          id={`${id}-bar`}
          className={`status-fill ${getStatusClass(percentage)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span id={id}>{value}/{maxValue}</span>
    </div>
  );
};
