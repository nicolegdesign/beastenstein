import React from 'react';
import './Gold.css';

interface GoldProps {
  amount: number;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
  className?: string;
}

export const Gold: React.FC<GoldProps> = ({ 
  amount, 
  size = 'medium', 
  showIcon = true, 
  className = '' 
}) => {
  return (
    <div className={`gold-display ${size} ${className}`}>
      {showIcon && (
        <img 
          src="./images/icons/gold-coin.svg" 
          alt="Gold" 
          className="gold-icon"
        />
      )}
      <span className="gold-amount">{amount.toLocaleString()}</span>
    </div>
  );
};
