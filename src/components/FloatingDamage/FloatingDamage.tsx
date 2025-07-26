import React from 'react';
import { motion } from 'framer-motion';
import './FloatingDamage.css';

interface FloatingDamageProps {
  damage: number;
  type: 'damage' | 'heal' | 'crit' | 'miss' | 'mana';
  position: { x: number; y: number };
  onComplete?: () => void;
}

export const FloatingDamage: React.FC<FloatingDamageProps> = ({ 
  damage, 
  type, 
  position, 
  onComplete 
}) => {
  const getDisplayText = () => {
    switch (type) {
      case 'heal':
        return `+${damage}`;
      case 'crit':
        return `${damage} CRIT!`;
      case 'miss':
        return 'MISS!';
      case 'mana':
        return `-${damage} MP`;
      default:
        return `-${damage}`;
    }
  };

  return (
    <motion.div
      className={`floating-damage ${type}`}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        pointerEvents: 'none',
        zIndex: 1000,
        userSelect: 'none'
      }}
      initial={{ 
        y: 0, 
        opacity: 1, 
        scale: type === 'crit' ? 1.2 : 1,
        x: 0
      }}
      animate={{ 
        y: -80, 
        opacity: 0, 
        scale: type === 'crit' ? 1.8 : type === 'miss' ? 0.8 : 1.2,
        x: (Math.random() - 0.5) * 40 // Random horizontal drift
      }}
      transition={{ 
        duration: type === 'crit' ? 2 : 1.5, 
        ease: "easeOut"
      }}
      onAnimationComplete={onComplete}
    >
      {getDisplayText()}
    </motion.div>
  );
};
