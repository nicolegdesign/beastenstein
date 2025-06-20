import { useState, useRef, useCallback, useEffect } from 'react';
import { StatusBar } from './components/StatusBar/StatusBar';
import { EditableName } from './components/EditableName/EditableName';
import { BeastDen } from './components/BeastDen/BeastDen';
import { ActionButtons } from './components/ActionButtons/ActionButtons';
import { BeastSelector } from './components/BeastSelector/BeastSelector';
import { Menu } from './components/Menu/Menu';
import { Inventory } from './components/Inventory/Inventory';
import { Options } from './components/Options/Options';
import { Toast } from './components/Toast/Toast';
import { BattleArena } from './components/BattleArena/BattleArena';
import { Debug } from './components/Debug/Debug';
import { useBeastStats } from './hooks/useBeastStats';
import { useBeastMovement } from './hooks/useBeastMovement';
import { usePooManager } from './hooks/usePooManager';
import { getBeastById } from './types/pets';
import { DEFAULT_ITEMS } from './types/inventory';
import { DEFAULT_OPTIONS } from './types/options';
import type { IndividualBeastData } from './types/game';
import type { InventoryItem } from './types/inventory';
import type { GameOptions } from './types/options';
import './App.css';

function App() {
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);
  const [currentBeastId, setCurrentBeastId] = useState('emi');
  
  // Initialize individual beast data from localStorage or defaults
  const [beastData, setBeastData] = useState<Record<string, IndividualBeastData>>(() => {
    const defaultData: Record<string, IndividualBeastData> = {
      emi: {
        name: localStorage.getItem('beastName_emi') || 'Emi',
        hunger: 50,
        happiness: 50,
        energy: 50,
        isResting: false
      },
      hobbes: {
        name: localStorage.getItem('beastName_hobbes') || 'Hobbes',
        hunger: 50,
        happiness: 50,
        energy: 50,
        isResting: false
      }
    };
    
    // Load saved beast data from localStorage
    Object.keys(defaultData).forEach(beastId => {
      const savedData = localStorage.getItem(`beastData_${beastId}`);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          defaultData[beastId] = { ...defaultData[beastId], ...parsed };
        } catch (error) {
          console.warn(`Failed to parse saved data for beast ${beastId}:`, error);
        }
      }
    });
    
    return defaultData;
  });
  
  const [showBeastSelector, setShowBeastSelector] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [inBattleArena, setInBattleArena] = useState(false);
  
  // Initialize game options from localStorage or defaults
  const [gameOptions, setGameOptions] = useState<GameOptions>(() => {
    const savedOptions = localStorage.getItem('gameOptions');
    if (savedOptions) {
      try {
        return { ...DEFAULT_OPTIONS, ...JSON.parse(savedOptions) };
      } catch (error) {
        console.warn('Failed to parse saved options:', error);
      }
    }
    return DEFAULT_OPTIONS;
  });
  
  const [toast, setToast] = useState<{ message: string; show: boolean; type: 'success' | 'info' }>({ 
    message: '', 
    show: false, 
    type: 'success' 
  });
  
  // Initialize inventory from localStorage or defaults
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(() => {
    const savedInventory = localStorage.getItem('inventoryItems');
    
    if (savedInventory) {
      try {
        const savedItems = JSON.parse(savedInventory);
        
        // Merge saved data with default items to ensure we have the latest properties
        const mergedItems = DEFAULT_ITEMS.map(defaultItem => {
          const savedItem = savedItems.find((item: { id: string; quantity: number }) => item.id === defaultItem.id);
          return {
            ...defaultItem, // Start with default (includes effect property)
            quantity: savedItem?.quantity ?? defaultItem.quantity // Preserve saved quantity
          };
        });
        
        return mergedItems;
      } catch (error) {
        console.warn('Failed to parse saved inventory:', error);
      }
    }
    
    return DEFAULT_ITEMS;
  });
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  
  // Get current beast's data
  const currentBeastData = beastData[currentBeastId];
  
  const {
    stats,
    isResting,
    setIsResting,
    feed,
    play,
    startRest,
    travel,
    cleanup,
    fillHappiness,
    fillHunger,
    getBeastMood
  } = useBeastStats({
    hunger: currentBeastData.hunger,
    happiness: currentBeastData.happiness,
    energy: currentBeastData.energy
  }, currentBeastId, gameOptions);

  // Update the hook's resting state when switching beasts
  useEffect(() => {
    setIsResting(currentBeastData.isResting);
  }, [currentBeastId, currentBeastData.isResting, setIsResting]);

  const { position } = useBeastMovement(isResting, gameAreaRef);
  
  const { poos, cleanupPoo } = usePooManager(isResting, gameAreaRef, gameOptions);

  const handleBeastChange = useCallback((beastId: string) => {
    const beastConfig = getBeastById(beastId);
    if (beastConfig) {
      setCurrentBeastId(beastId);
      setShowBeastSelector(false); // Close selector after selection
    }
  }, []);

  const handleNameChange = useCallback((newName: string) => {
    setBeastData(prev => ({
      ...prev,
      [currentBeastId]: {
        ...prev[currentBeastId],
        name: newName
      }
    }));
    
    // Also save to localStorage for the EditableName component
    localStorage.setItem(`beastName_${currentBeastId}`, newName);
  }, [currentBeastId]);

  // Save beast data to localStorage whenever it changes
  const saveBeastData = useCallback((beastId: string, data: IndividualBeastData) => {
    localStorage.setItem(`beastData_${beastId}`, JSON.stringify(data));
  }, []);

  // Update beast data when stats change (with debouncing to prevent flashing)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setBeastData(prev => {
        const currentStats = prev[currentBeastId];
        const newData = {
          name: currentBeastData.name,
          hunger: stats.hunger,
          happiness: stats.happiness,
          energy: stats.energy,
          isResting: isResting
        };
        
        // Only update if the stats have actually changed
        if (
          currentStats.hunger !== stats.hunger ||
          currentStats.happiness !== stats.happiness ||
          currentStats.energy !== stats.energy ||
          currentStats.isResting !== isResting
        ) {
          saveBeastData(currentBeastId, newData);
          return {
            ...prev,
            [currentBeastId]: newData
          };
        }
        
        return prev; // No change needed
      });
    }, 50); // 50ms debounce

    return () => clearTimeout(timeoutId);
  }, [stats.hunger, stats.happiness, stats.energy, isResting, currentBeastId, currentBeastData.name, saveBeastData]);

  // Menu handlers
  const handleSelectBeast = useCallback(() => {
    setShowBeastSelector(true);
  }, []);

  const handleOptions = useCallback(() => {
    setShowOptions(true);
  }, []);

  const handleOptionsChange = useCallback((newOptions: GameOptions) => {
    setGameOptions(newOptions);
    localStorage.setItem('gameOptions', JSON.stringify(newOptions));
    
    setToast({
      message: '⚙️ Options updated successfully!',
      show: true,
      type: 'success'
    });
  }, []);

  const handleSave = useCallback(() => {
    // TODO: Implement save functionality  
    console.log('Save clicked - functionality to be implemented');
  }, []);

  const handleInventory = useCallback(() => {
    setShowInventory(true);
  }, []);

  const handleBattleArena = useCallback(() => {
    setInBattleArena(prev => !prev);
  }, []);

  const handleDebug = useCallback(() => {
    setShowDebug(true);
  }, []);

  const handleItemClick = useCallback((itemId: string) => {
    // Find the item to check its effect
    const item = inventoryItems.find(item => item.id === itemId);
    if (!item || item.quantity <= 0) return;

    // Apply item effect based on type
    switch (item.effect) {
      case 'happiness':
        // Stuffed Lion - fill happiness to 100
        fillHappiness();
        setToast({ 
          message: `🦁 ${item.name} used! Happiness is now full!`, 
          show: true, 
          type: 'success' 
        });
        break;
        
      case 'hunger':
        // Beast Biscuit - fill hunger to 100
        fillHunger();
        setToast({ 
          message: `🍪 ${item.name} used! Hunger is now full!`, 
          show: true, 
          type: 'success' 
        });
        break;
        
      case 'cleanup': {
        // Shovel - clean up all poos
        const pooCount = poos.length;
        poos.forEach(poo => {
          cleanupPoo(poo.id);
        });
        // Also give happiness boost for cleaning
        cleanup();
        setToast({ 
          message: `🔧 ${item.name} used! Cleaned up ${pooCount} poo${pooCount !== 1 ? 's' : ''}!`, 
          show: true, 
          type: 'success' 
        });
        break;
      }
        
      default:
        // No effect for unknown items
        setToast({ 
          message: `${item.name} used but had no effect.`, 
          show: true, 
          type: 'info' 
        });
        break;
    }

    // Reduce item quantity
    setInventoryItems(prevItems => {
      const updatedItems = prevItems.map(item => {
        if (item.id === itemId && item.quantity > 0) {
          return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      });
      
      // Save to localStorage
      localStorage.setItem('inventoryItems', JSON.stringify(updatedItems));
      return updatedItems;
    });
  }, [inventoryItems, fillHappiness, fillHunger, cleanup, poos, cleanupPoo, setToast]);

  const handlePooCleanup = useCallback((pooId: string) => {
    cleanupPoo(pooId);
    cleanup(); // Boost happiness for cleaning up
  }, [cleanupPoo, cleanup]);

  const handleTravel = useCallback(() => {
    travel();
    setCurrentBackgroundIndex((prev) => (prev + 1) % 4);
  }, [travel]);

  const createTennisBall = useCallback(() => {
    if (!gameAreaRef.current || isResting) return;

    const gameArea = gameAreaRef.current;
    const tennisBall = document.createElement('div');
    tennisBall.className = 'tennis-ball';
    
    const ballImg = document.createElement('img');
    ballImg.src = './images/tennisBall.svg';
    ballImg.alt = 'Tennis Ball';
    tennisBall.appendChild(ballImg);
    
    gameArea.appendChild(tennisBall);
    
    requestAnimationFrame(() => {
      tennisBall.classList.add('bounce-animation');
    });
    
    setTimeout(() => {
      if (tennisBall.parentNode) {
        tennisBall.remove();
      }
    }, 2500);
  }, [isResting]);

  const handlePlay = useCallback(() => {
    play();
    createTennisBall();
  }, [play, createTennisBall]);

  return (
    <div className="App">      <Menu 
        onSelectBeast={handleSelectBeast}
        onOptions={handleOptions}
        onSave={handleSave}
        onInventory={handleInventory}
        onBattleArena={handleBattleArena}
        onDebug={handleDebug}
        inBattleArena={inBattleArena}
      />

      <h1><EditableName 
        key={currentBeastId}
        initialName={currentBeastData.name} 
        onNameChange={handleNameChange} 
        beastId={currentBeastId} 
      /></h1>
      
      {showBeastSelector && (
        <BeastSelector 
          currentBeastId={currentBeastId}
          onBeastChange={handleBeastChange}
          onClose={() => setShowBeastSelector(false)}
          isModal={true}
          beastData={beastData}
        />
      )}
      
      {showInventory && (
        <Inventory 
          items={inventoryItems}
          onItemClick={handleItemClick}
          onClose={() => setShowInventory(false)}
          isModal={true}
        />
      )}
      
      {showOptions && (
        <Options 
          options={gameOptions}
          onOptionsChange={handleOptionsChange}
          onClose={() => setShowOptions(false)}
          isModal={true}
        />
      )}
      
      {showDebug && (
        <Debug 
          options={gameOptions}
          onOptionsChange={handleOptionsChange}
          onClose={() => setShowDebug(false)}
          isModal={true}
        />
      )}
      
      <div id="stats-container">
        <StatusBar label="Hunger" value={stats.hunger} id="hunger" />
        <StatusBar label="Happiness" value={stats.happiness} id="happiness" />
        <StatusBar label="Energy" value={stats.energy} id="energy" />
      </div>

      {inBattleArena ? (
        <BattleArena
          beastId={currentBeastId}
          beastMood={getBeastMood()}
          showBeastBorder={gameOptions.showBeastBorder}
        />
      ) : (
        <>
          <BeastDen
            ref={gameAreaRef}
            backgroundIndex={currentBackgroundIndex}
            beastMood={getBeastMood()}
            isResting={isResting}
            beastPosition={position}
            beastId={currentBeastId}
            hunger={stats.hunger}
            poos={poos}
            onFeedFromBowl={feed}
            onRestFromBed={startRest}
            onCleanupPoo={handlePooCleanup}
          />

          <ActionButtons
            onFeed={feed}
            onPlay={handlePlay}
            onRest={startRest}
            onTravel={handleTravel}
            isResting={isResting}
          />
        </>
      )}

      <Toast
        message={toast.message}
        show={toast.show}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
}

export default App;
