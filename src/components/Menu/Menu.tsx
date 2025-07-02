import React, { useState } from 'react';
import './Menu.css';

interface MenuProps {
  onOptions: () => void;
  onSave: () => void;
  onInventory: () => void;
  onDebug: () => void;
}

export const Menu: React.FC<MenuProps> = ({ onOptions, onSave, onInventory, onDebug }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleMenuItemClick = (action: () => void) => {
    action();
    setIsOpen(false); // Close menu after selection
  };

  return (
    <div className="menu-container">
      <button 
        className={`menu-button ${isOpen ? 'open' : ''}`}
        onClick={toggleMenu}
        aria-label="Menu"
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>
      
      {isOpen && (
        <div className="menu-dropdown">
          <button 
            className="menu-item"
            onClick={() => handleMenuItemClick(onInventory)}
          >
            🎒 Inventory
          </button>
         
          <button 
            className="menu-item" 
            onClick={() => handleMenuItemClick(onOptions)}
          >
            ⚙️ Options
          </button>
          <button 
            className="menu-item"
            onClick={() => handleMenuItemClick(onDebug)}
          >
            🐛 Debug
          </button>
          <button 
            className="menu-item"
            onClick={() => handleMenuItemClick(onSave)}
          >
            💾 Save
          </button>
        </div>
      )}
      
      {isOpen && <div className="menu-overlay" onClick={() => setIsOpen(false)}></div>}
    </div>
  );
};
