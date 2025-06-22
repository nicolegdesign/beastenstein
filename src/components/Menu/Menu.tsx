import React, { useState } from 'react';
import './Menu.css';

interface MenuProps {
  onSelectBeast: () => void;
  onOptions: () => void;
  onSave: () => void;
  onInventory: () => void;
  onBattleArena: () => void;
  onAdventure: () => void;
  onDebug: () => void;
  inBattleArena: boolean;
  inAdventure: boolean;
}

export const Menu: React.FC<MenuProps> = ({ onSelectBeast, onOptions, onSave, onInventory, onBattleArena, onAdventure, onDebug, inBattleArena, inAdventure }) => {
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
            onClick={() => handleMenuItemClick(onSelectBeast)}
          >
            🐾 Select Your Beast
          </button>
          <button 
            className="menu-item"
            onClick={() => handleMenuItemClick(onInventory)}
          >
            🎒 Inventory
          </button>
          <button 
            className="menu-item"
            onClick={() => handleMenuItemClick(onBattleArena)}
          >
            {inBattleArena ? '🏠 Leave Arena' : '⚔️ Battle Arena'}
          </button>
          <button 
            className="menu-item"
            onClick={() => handleMenuItemClick(onAdventure)}
          >
            {inAdventure ? '🏠 Leave Adventure' : '🗺️ Adventure'}
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
