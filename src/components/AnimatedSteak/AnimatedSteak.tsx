import React, { useEffect, useState } from 'react';
import './AnimatedSteak.css';

interface AnimatedSteakProps {
  isVisible: boolean;
  onAnimationComplete: () => void;
}

export const AnimatedSteak: React.FC<AnimatedSteakProps> = ({ isVisible, onAnimationComplete }) => {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      // Auto-hide after 1 second
      const timer = setTimeout(() => {
        setShouldRender(false);
        onAnimationComplete();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onAnimationComplete]);

  if (!shouldRender) return null;

  return (
    <div className="animated-steak">
      <img src="./images/items/steak.svg" alt="Steak" className="steak-image" />
    </div>
  );
};
