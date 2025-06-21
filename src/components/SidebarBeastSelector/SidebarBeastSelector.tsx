import React from 'react';
import { BEASTS } from '../../types/beasts';
import type { BeastConfig } from '../../types/beasts';
import type { IndividualBeastData } from '../../types/game';
import './SidebarBeastSelector.css';

interface SidebarBeastSelectorProps {
  currentBeastId: string;
  onBeastChange: (beastId: string) => void;
  beastData?: Record<string, IndividualBeastData>;
  onCreateBeast?: () => void;
}

export const SidebarBeastSelector: React.FC<SidebarBeastSelectorProps> = ({ 
  currentBeastId, 
  onBeastChange, 
  beastData,
  onCreateBeast 
}) => {
  return (
    <div className="sidebar-beast-selector">
      <h4 className="sidebar-title">Your Beasts</h4>
      <div className="sidebar-beast-list">
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
