import React from 'react';
import './Inventory.css';

export interface InventoryItem {
  id: string;
  name: string;
  image: string;
  quantity: number;
  description?: string;
}

interface InventoryProps {
  items: InventoryItem[];
  onItemClick: (itemId: string) => void;
  onClose: () => void;
  isModal?: boolean;
}

export const Inventory: React.FC<InventoryProps> = ({ 
  items, 
  onItemClick, 
  onClose, 
  isModal = false 
}) => {
  const handleItemClick = (itemId: string) => {
    onItemClick(itemId);
  };

  const inventoryContent = (
    <div className="inventory-content">
      <div className="inventory-header">
        <h2>🎒 Inventory</h2>
        <button className="close-button" onClick={onClose}>✕</button>
      </div>
      <div className="inventory-grid">
        {items.map((item) => (
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="inventory-modal">
        <div className="inventory-backdrop" onClick={onClose}></div>
        {inventoryContent}
      </div>
    );
  }

  return inventoryContent;
};
