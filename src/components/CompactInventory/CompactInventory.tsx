import React, { useState } from 'react';
import type { InventoryItem } from '../../types/inventory';
import './CompactInventory.css';

interface CompactInventoryProps {
  items: InventoryItem[];
  onItemClick: (itemId: string) => void;
}

export const CompactInventory: React.FC<CompactInventoryProps> = ({ 
  items, 
  onItemClick 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Filter out items with zero quantity
  const availableItems = items.filter(item => item.quantity > 0);

  const handleItemClick = (itemId: string) => {
    onItemClick(itemId);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`compact-inventory ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="inventory-header" onClick={toggleExpanded}>
        <div className="inventory-title">
          <span className="inventory-icon">🎒</span>
          <span className="inventory-text">Inventory</span>
        </div>
        <div className="inventory-toggle">
          {isExpanded ? '◀' : '▶'}
        </div>
      </div>
      
      {isExpanded && (
        <div className="inventory-items">
          {availableItems.map((item) => (
            <div 
              key={item.id}
              className="inventory-item"
              onClick={() => handleItemClick(item.id)}
              title={item.description || item.name}
            >
              <div className="item-image">
                <img src={item.image} alt={item.name} />
              </div>
              <div className="item-info">
                <span className="item-name">{item.name}</span>
                <span className="item-quantity">x{item.quantity}</span>
                <span className={`item-rarity ${item.rarity}`}>{item.rarity}</span>
              </div>
            </div>
          ))}
          {availableItems.length === 0 && (
            <div className="inventory-empty">
              <span>No items in inventory</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
