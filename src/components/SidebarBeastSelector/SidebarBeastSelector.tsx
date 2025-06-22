import React, { useState, useEffect } from 'react';
import { BEASTS } from '../../types/beasts';
import type { BeastConfig } from '../../types/beasts';
import type { IndividualBeastData } from '../../types/game';
import './SidebarBeastSelector.css';

interface CustomBeast {
  id: string;
  name: string;
  bodyPart: string;
  headPart: string;
  tailPart: string;
  wingPart: string;
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
              {/* Use a simple preview for custom beasts - we could enhance this later */}
              <div className="custom-beast-preview">
                <span className="custom-beast-icon">🧬</span>
              </div>
              <div className="sidebar-beast-info">
                <span className="sidebar-beast-name">{displayName}</span>
                {data && (
                  <div className="sidebar-beast-level">Lv.{data.level}</div>
                )}
                <div className="custom-beast-indicator">Custom</div>
              </div>
            </button>
          );
        })}
        
        {/* Create New Beast Button */}
        <button
          className="sidebar-create-beast-button"
          onClick={() => onCreateBeast?.()}
          title="Create New Beast"
        >
          <div className="plus-icon">+</div>
          <div className="sidebar-beast-info">
            <span className="sidebar-beast-name">Create Beast</span>
          </div>
        </button>
      </div>
    </div>
  );
};
