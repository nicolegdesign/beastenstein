import React from 'react';
import { BEASTS } from '../../types/beasts';
import type { BeastConfig } from '../../types/beasts';
import type { IndividualBeastData } from '../../types/game';
import './SidebarBeastSelector.css';

interface SidebarBeastSelectorProps {
  currentBeastId: string;
  onBeastChange: (beastId: string) => void;
  beastData?: Record<string, IndividualBeastData>;
}

export const SidebarBeastSelector: React.FC<SidebarBeastSelectorProps> = ({ 
  currentBeastId, 
  onBeastChange, 
  beastData 
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
      </div>
    </div>
  );
};
