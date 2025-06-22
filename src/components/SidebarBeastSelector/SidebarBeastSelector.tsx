import React, { useState, useEffect } from 'react';
import { BEASTS } from '../../types/beasts';
import type { BeastConfig } from '../../types/beasts';
import type { IndividualBeastData } from '../../types/game';
import './SidebarBeastSelector.css';

interface CustomBeast {
  id: string;
  name: string;
  head: {
    id: string;
    name: string;
    source: string;
    imagePath: string;
    type: 'head';
  };
  torso: {
    id: string;
    name: string;
    source: string;
    imagePath: string;
    type: 'torso';
  };
  armLeft: {
    id: string;
    name: string;
    source: string;
    imagePath: string;
    type: 'armLeft';
  };
  armRight: {
    id: string;
    name: string;
    source: string;
    imagePath: string;
    type: 'armRight';
  };
  legLeft: {
    id: string;
    name: string;
    source: string;
    imagePath: string;
    type: 'legLeft';
  };
  legRight: {
    id: string;
    name: string;
    source: string;
    imagePath: string;
    type: 'legRight';
  };
}

interface SidebarBeastSelectorProps {
  currentBeastId: string;
  onBeastChange: (beastId: string) => void;
  beastData?: Record<string, IndividualBeastData>;
  onCreateBeast?: () => void;
  refreshTrigger?: number; // Add this to force refresh when custom beasts are created
}

export const SidebarBeastSelector: React.FC<SidebarBeastSelectorProps> = ({ 
  currentBeastId, 
  onBeastChange, 
  beastData,
  onCreateBeast,
  refreshTrigger
}) => {
  const [customBeasts, setCustomBeasts] = useState<CustomBeast[]>([]);

  // Load custom beasts from localStorage
  useEffect(() => {
    const loadCustomBeasts = () => {
      const customBeastsList: CustomBeast[] = [];
      
      // Scan localStorage for custom beast entries
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('customBeast_')) {
          try {
            const customBeastData = localStorage.getItem(key);
            if (customBeastData) {
              const parsedBeast = JSON.parse(customBeastData);
              const beastId = key.replace('customBeast_', '');
              customBeastsList.push({
                id: beastId,
                ...parsedBeast
              });
            }
          } catch (error) {
            console.warn(`Failed to parse custom beast data for key ${key}:`, error);
          }
        }
      }
      
      setCustomBeasts(customBeastsList);
    };

    loadCustomBeasts();
  }, [refreshTrigger]); // Refresh when refreshTrigger changes
  return (
    <div className="sidebar-beast-selector">
      <h4 className="sidebar-title">Your Beasts</h4>
      <div className="sidebar-beast-list">
        {/* Static BEASTS */}
        {BEASTS.map((beast: BeastConfig) => {
          const data = beastData?.[beast.id];
          const displayName = data?.name || beast.name;
          
          return (
            <button
              key={beast.id}
              className={`sidebar-beast-button ${currentBeastId === beast.id ? 'active' : ''}`}
              onClick={() => onBeastChange(beast.id)}
              title={`Switch to ${displayName}`}
            >
              <img src={beast.images.normal} alt={displayName} />
              <div className="sidebar-beast-info">
                <span className="sidebar-beast-name">{displayName}</span>
                {data && (
                  <div className="sidebar-beast-level">Lv.{data.level}</div>
                )}
              </div>
            </button>
          );
        })}

        {/* Custom Beasts */}
        {customBeasts.map((customBeast) => {
          const data = beastData?.[customBeast.id];
          const displayName = data?.name || customBeast.name;
          
          return (
            <button
              key={customBeast.id}
              className={`sidebar-beast-button ${currentBeastId === customBeast.id ? 'active' : ''}`}
              onClick={() => onBeastChange(customBeast.id)}
              title={`Switch to ${displayName}`}
            >
              {/* Use the head image for custom beasts */}
              <img src={customBeast.head?.imagePath || './images/pet-normal.png'} alt={displayName} />
              <div className="sidebar-beast-info">
                <span className="sidebar-beast-name">{displayName}</span>
                {data && (
                  <div className="sidebar-beast-level">Lv.{data.level}</div>
                )}
              </div>
            </button>
          );
        })}
        
        {/* Create New Beast Button */}
        {(() => {
          const totalBeasts = beastData ? Object.keys(beastData).length : 0;
          const isAtLimit = totalBeasts >= 8;
          
          return (
            <button
              className={`sidebar-create-beast-button ${isAtLimit ? 'disabled' : ''}`}
              onClick={() => !isAtLimit && onCreateBeast?.()}
              title={isAtLimit ? "Maximum of 8 beasts reached" : "Create New Beast"}
              disabled={isAtLimit}
            >
              <div className="plus-icon">+</div>
              <div className="sidebar-beast-info">
                <span className="sidebar-beast-name">
                  {isAtLimit ? `Max (${totalBeasts}/8)` : 'Create Beast'}
                </span>
              </div>
            </button>
          );
        })()}
      </div>
    </div>
  );
};
