import React, { useState, useEffect, useCallback } from 'react';
import type { IndividualBeastData } from '../../types/game';
import type { Personality } from '../../data/personalities';
import './SidebarBeastSelector.css';

// Maximum number of beasts allowed
const MAX_BEASTS = 8;

interface CustomBeast {
  id: string;
  name: string;
  gender: 'male' | 'female';
  personality: Personality;
  head: {
    id: string;
    name: string;
    imagePath: string;
    type: 'head';
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  };
  torso: {
    id: string;
    name: string;
    imagePath: string;
    type: 'torso';
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  };
  armLeft: {
    id: string;
    name: string;
    imagePath: string;
    type: 'armLeft';
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  };
  armRight: {
    id: string;
    name: string;
    imagePath: string;
    type: 'armRight';
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  };
  legLeft: {
    id: string;
    name: string;
    imagePath: string;
    type: 'legLeft';
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  };
  legRight: {
    id: string;
    name: string;
    imagePath: string;
    type: 'legRight';
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
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
  const [draggedBeastId, setDraggedBeastId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Load and save beast order from localStorage
  const getBeastOrder = (): string[] => {
    const stored = localStorage.getItem('beastOrder');
    return stored ? JSON.parse(stored) : [];
  };

  const saveBeastOrder = (order: string[]) => {
    localStorage.setItem('beastOrder', JSON.stringify(order));
  };

  // Sort beasts according to saved order
  const sortBeastsByOrder = useCallback((beasts: CustomBeast[]): CustomBeast[] => {
    const order = getBeastOrder();
    const beastMap = new Map(beasts.map(beast => [beast.id, beast]));
    const orderedBeasts: CustomBeast[] = [];
    const unorderedBeasts: CustomBeast[] = [];

    // Add beasts in saved order
    order.forEach(id => {
      const beast = beastMap.get(id);
      if (beast) {
        orderedBeasts.push(beast);
        beastMap.delete(id);
      }
    });

    // Add any remaining beasts that weren't in the saved order
    beastMap.forEach(beast => unorderedBeasts.push(beast));

    return [...orderedBeasts, ...unorderedBeasts];
  }, []);

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, beastId: string) => {
    setDraggedBeastId(beastId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (!draggedBeastId) return;

    const newBeasts = [...customBeasts];
    const draggedIndex = newBeasts.findIndex(beast => beast.id === draggedBeastId);
    
    if (draggedIndex === -1 || draggedIndex === dropIndex) {
      setDraggedBeastId(null);
      setDragOverIndex(null);
      return;
    }

    // Remove dragged beast and insert at new position
    const [draggedBeast] = newBeasts.splice(draggedIndex, 1);
    newBeasts.splice(dropIndex, 0, draggedBeast);

    // Update state and save order
    setCustomBeasts(newBeasts);
    saveBeastOrder(newBeasts.map(beast => beast.id));
    
    setDraggedBeastId(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedBeastId(null);
    setDragOverIndex(null);
  };

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
      
      // Sort beasts according to saved order
      const sortedBeasts = sortBeastsByOrder(customBeastsList);
      setCustomBeasts(sortedBeasts);
    };

    loadCustomBeasts();
  }, [refreshTrigger, sortBeastsByOrder]); // Refresh when refreshTrigger changes
  return (
    <div className="sidebar-beast-selector">
      <h4 className="sidebar-title">
        Your Beasts 
        <span className="beast-count">
          {beastData ? Object.keys(beastData).length : 0}/{MAX_BEASTS}
        </span>
      </h4>
      <div className="sidebar-beast-list">
        {/* Custom Beasts */}
        {customBeasts.map((customBeast, index) => {
          const data = beastData?.[customBeast.id];
          const displayName = data?.name || customBeast.name;
          const isDragging = draggedBeastId === customBeast.id;
          const isDragOver = dragOverIndex === index;
          
          return (
            <button
              key={customBeast.id}
              draggable
              className={`sidebar-beast-button ${currentBeastId === customBeast.id ? 'active' : ''} ${isDragging ? 'dragging' : ''} ${isDragOver ? 'drag-over' : ''}`}
              onClick={() => onBeastChange(customBeast.id)}
              onDragStart={(e) => handleDragStart(e, customBeast.id)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              title={`Switch to ${displayName} (drag to reorder)`}
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
          const isAtLimit = totalBeasts >= MAX_BEASTS;
          
          return (
            <button
              className={`sidebar-create-beast-button ${isAtLimit ? 'disabled' : ''}`}
              onClick={() => !isAtLimit && onCreateBeast?.()}
              title={isAtLimit ? `Maximum of ${MAX_BEASTS} beasts reached` : "Create New Beast"}
              disabled={isAtLimit}
            >
              <div className="plus-icon">+</div>
              <div className="sidebar-beast-info">
                <span className="sidebar-beast-name">
                  {isAtLimit ? `Max (${totalBeasts}/${MAX_BEASTS})` : 'Create Beast'}
                </span>
              </div>
            </button>
          );
        })()}
      </div>
    </div>
  );
};
