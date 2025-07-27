import React from 'react';
import { useExperienceBar } from '../../hooks/useExperience';
import './ExperienceBar.css';

interface ExperienceBarProps {
  currentExperience: number;
  experienceGained?: number;
  maxLevel?: number;
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  showGainedAnimation?: boolean;
  className?: string;
}

export const ExperienceBar: React.FC<ExperienceBarProps> = ({
  currentExperience,
  experienceGained = 0,
  maxLevel = 50,
  size = 'medium',
  showText = true,
  showGainedAnimation = true,
  className = ''
}) => {
  const { baseData, gainData, display } = useExperienceBar(
    currentExperience,
    experienceGained,
    maxLevel
  );

  const sizeClass = `exp-bar--${size}`;
  const containerClass = `exp-bar-container ${sizeClass} ${className}`.trim();

  return (
    <div className={containerClass}>
      <div className="exp-bar">
        <div 
          className="exp-bar-fill"
          style={{ width: `${baseData.progressPercent}%` }}
        />
        {showGainedAnimation && experienceGained > 0 && (
          <div 
            className="exp-bar-gained"
            style={{ 
              width: `${gainData.gainedPercent}%`,
              left: `${baseData.progressPercent}%`
            }}
          />
        )}
      </div>
      
      {showText && (
        <div className="exp-bar-text">
          {baseData.isAtMaxLevel ? (
            'MAX LEVEL'
          ) : (
            `${display.current} (${display.toNext})`
          )}
        </div>
      )}
      
      {gainData.willLevelUp && (
        <div className="level-up-indicator">
          LEVEL UP! +{gainData.levelsGained}
        </div>
      )}
    </div>
  );
};
