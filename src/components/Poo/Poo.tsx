import React from 'react';
import './Poo.css';

interface PooProps {
  id: string;
  x: number;
  y: number;
  onCleanup: (id: string) => void;
}

export const Poo: React.FC<PooProps> = ({ id, x, y, onCleanup }) => {
  const handleClick = () => {
    onCleanup(id);
  };

  return (
    <div 
      className="poo"
      style={{
        left: `${x}px`,
        top: `${y}px`
      }}
      onClick={handleClick}
      title="Click to clean up!"
    >
      <img src="/images/poo.png" alt="Poo" />
    </div>
  );
};
