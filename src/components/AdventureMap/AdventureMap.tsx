import React, { useState, useEffect } from 'react';
import { useAdventureProgress } from '../../hooks/useLegacyState';
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
}

export const AdventureMap: React.FC<AdventureMapProps> = ({ onLevelSelect, onClose }) => {
  const { adventureProgress } = useAdventureProgress();
  const [levels, setLevels] = useState<MapLevel[]>([]);

  useEffect(() => {
    // Use centralized adventure progress instead of localStorage - with safety checks
    const unlockedLevels = adventureProgress.unlockedLevels || [1];
    const maxUnlockedLevel = unlockedLevels.length > 0 ? Math.max(...unlockedLevels) : 1;
    const completedLevels = adventureProgress.completedLevels || [];

    // Create 10 levels with winding path positions
    const levelData: MapLevel[] = [
      { id: 1, name: 'Shadow Grove', x: 15, y: 85, unlocked: true, completed: completedLevels.includes(1) },
      { id: 2, name: 'Misty Hollow', x: 25, y: 70, unlocked: maxUnlockedLevel >= 2, completed: completedLevels.includes(2) },
      { id: 3, name: 'Thornwood Path', x: 40, y: 60, unlocked: maxUnlockedLevel >= 3, completed: completedLevels.includes(3) },
      { id: 4, name: 'Whispering Vale', x: 55, y: 45, unlocked: maxUnlockedLevel >= 4, completed: completedLevels.includes(4) },
      { id: 5, name: 'Moonlit Clearing', x: 70, y: 35, unlocked: maxUnlockedLevel >= 5, completed: completedLevels.includes(5) },
      { id: 6, name: 'Ancient Ruins', x: 80, y: 50, unlocked: maxUnlockedLevel >= 6, completed: completedLevels.includes(6) },
      { id: 7, name: 'Cursed Marshland', x: 75, y: 65, unlocked: maxUnlockedLevel >= 7, completed: completedLevels.includes(7) },
      { id: 8, name: 'Shadowbark Forest', x: 60, y: 75, unlocked: maxUnlockedLevel >= 8, completed: completedLevels.includes(8) },
      { id: 9, name: 'Nightmare Woods', x: 45, y: 85, unlocked: maxUnlockedLevel >= 9, completed: completedLevels.includes(9) },
      { id: 10, name: 'Castle Beastenstein', x: 85, y: 15, unlocked: maxUnlockedLevel >= 10, completed: completedLevels.includes(10) }
    ];

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
        <button className="close-map-button" onClick={onClose}>
          ✕ Close Map
        </button>
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
              <span className="level-number">{level.id}</span>
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
