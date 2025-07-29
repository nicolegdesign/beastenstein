import React, { useState, useEffect } from 'react';
import { useAdventureProgress } from '../../hooks/useLegacyState';
import { LEVEL_DATA } from '../../data/levelData';
import { Gold } from '../Gold/Gold';
import './AdventureMap.css';

interface MapLevel {
  id: number;
  name: string;
  unlocked: boolean;
  completed: boolean;
  x: number; // Percentage position on map
  y: number; // Percentage position on map
}

interface AdventureMapProps {
  onLevelSelect: (level: number) => void;
  onClose: () => void;
  gold: number;
  children?: React.ReactNode;
}

export const AdventureMap: React.FC<AdventureMapProps> = ({ onLevelSelect, onClose, gold, children }) => {
  const { adventureProgress } = useAdventureProgress();
  const [levels, setLevels] = useState<MapLevel[]>([]);

  useEffect(() => {
    // Use centralized adventure progress instead of localStorage - with safety checks
    const unlockedLevels = adventureProgress.unlockedLevels || [1];
    const maxUnlockedLevel = unlockedLevels.length > 0 ? Math.max(...unlockedLevels) : 1;
    const completedLevels = adventureProgress.completedLevels || [];

    // Create levels from shared level data
    const levelData: MapLevel[] = LEVEL_DATA.map(level => ({
      ...level,
      unlocked: level.id === 1 || maxUnlockedLevel >= level.id,
      completed: completedLevels.includes(level.id)
    }));

    setLevels(levelData);
  }, [adventureProgress.unlockedLevels, adventureProgress.completedLevels]);

  const handleLevelClick = (level: MapLevel) => {
    if (level.unlocked) {
      onLevelSelect(level.id);
    }
  };

  // Create path connections between levels
  const renderPath = () => {
    const pathElements = [];
    for (let i = 0; i < levels.length - 1; i++) {
      const current = levels[i];
      const next = levels[i + 1];
      
      if (current && next) {
        const isPathUnlocked = next.unlocked;
        pathElements.push(
          <svg
            key={`path-${i}`}
            className="map-path"
            style={{
              position: 'absolute',
              left: `${Math.min(current.x, next.x)}%`,
              top: `${Math.min(current.y, next.y)}%`,
              width: `${Math.abs(next.x - current.x) + 5}%`,
              height: `${Math.abs(next.y - current.y) + 5}%`,
              pointerEvents: 'none'
            }}
          >
            <line
              x1={current.x > next.x ? `${Math.abs(next.x - current.x)}%` : '0%'}
              y1={current.y > next.y ? `${Math.abs(next.y - current.y)}%` : '0%'}
              x2={next.x > current.x ? `${Math.abs(next.x - current.x)}%` : '0%'}
              y2={next.y > current.y ? `${Math.abs(next.y - current.y)}%` : '0%'}
              stroke={isPathUnlocked ? '#8b5cf6' : '#4a4a4a'}
              strokeWidth="3"
              strokeDasharray={isPathUnlocked ? 'none' : '8,4'}
              opacity={isPathUnlocked ? 0.8 : 0.4}
              className={isPathUnlocked ? 'unlocked-path' : 'locked-path'}
            />
          </svg>
        );
      }
    }
    return pathElements;
  };

  return (
    <div className="adventure-map">
      <div 
        className="map-background"
        style={{ backgroundImage: 'url(./images/dark-forrest-map.jpg)' }}
      />
      
      <div className="map-header">
        <h1 className="map-title">Adventure Map</h1>
        <p className="map-subtitle">Choose your path through the Forbidden Lands</p>
        <div className="map-header-content">
          <Gold amount={gold} size="large" />
          {children && (
            <div className="map-header-inventory">
              {children}
            </div>
          )}
          <button className="close-map-button" onClick={onClose}>
            Quit Adventure
          </button>
        </div>
      </div>

      <div className="map-container">
        {/* Render paths */}
        {renderPath()}
        
        {/* Render level nodes */}
        {levels.map((level) => (
          <div
            key={level.id}
            className={`map-level ${level.unlocked ? 'unlocked' : 'locked'} ${level.completed ? 'completed' : ''}`}
            style={{
              left: `${level.x}%`,
              top: `${level.y}%`
            }}
            onClick={() => handleLevelClick(level)}
          >
            <div className="level-marker">
              <span className="level-icon">{level.id}</span>
              {level.completed && <div className="completion-check">✓</div>}
            </div>
            <div className="level-tooltip">
              <div className="level-name">{level.name}</div>
              <div className="level-info">Level {level.id} Beast</div>
              {!level.unlocked && <div className="level-locked">Locked</div>}
            </div>
          </div>
        ))}
      </div>

      <div className="map-legend">
        <div className="legend-item">
          <div className="legend-marker unlocked"></div>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <div className="legend-marker completed"></div>
          <span>Completed</span>
        </div>
        <div className="legend-item">
          <div className="legend-marker locked"></div>
          <span>Locked</span>
        </div>
      </div>
    </div>
  );
};
