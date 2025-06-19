import { useState, useRef, useCallback, useEffect } from 'react';
import { StatusBar } from './components/StatusBar/StatusBar';
import { EditableName } from './components/EditableName/EditableName';
import { GameArea } from './components/GameArea/GameArea';
import { ActionButtons } from './components/ActionButtons/ActionButtons';
import { PetSelector } from './components/PetSelector/PetSelector';
import { Menu } from './components/Menu/Menu';
import { Inventory } from './components/Inventory/Inventory';
import { usePetStats } from './hooks/usePetStats';
import { usePetMovement } from './hooks/usePetMovement';
import { usePooManager } from './hooks/usePooManager';
import { getPetById } from './types/pets';
import { DEFAULT_ITEMS } from './types/inventory';
import type { IndividualPetData } from './types/game';
import type { InventoryItem } from './types/inventory';
import './App.css';

function App() {
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);
  const [currentPetId, setCurrentPetId] = useState('emi');
  
  // Initialize individual pet data from localStorage or defaults
  const [petData, setPetData] = useState<Record<string, IndividualPetData>>(() => {
    const defaultData: Record<string, IndividualPetData> = {
      emi: {
        name: localStorage.getItem('petName_emi') || 'Emi',
        hunger: 50,
        happiness: 50,
        energy: 50,
        isResting: false
      },
      hobbes: {
        name: localStorage.getItem('petName_hobbes') || 'Hobbes',
        hunger: 50,
        happiness: 50,
        energy: 50,
        isResting: false
      }
    };
    
    // Load saved pet data from localStorage
    Object.keys(defaultData).forEach(petId => {
      const savedData = localStorage.getItem(`petData_${petId}`);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          defaultData[petId] = { ...defaultData[petId], ...parsed };
        } catch (error) {
          console.warn(`Failed to parse saved data for pet ${petId}:`, error);
        }
      }
    });
    
    return defaultData;
  });
  
  const [showPetSelector, setShowPetSelector] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  
  // Initialize inventory from localStorage or defaults
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(() => {
    const savedInventory = localStorage.getItem('inventoryItems');
    if (savedInventory) {
      try {
        return JSON.parse(savedInventory);
      } catch (error) {
        console.warn('Failed to parse saved inventory:', error);
      }
    }
    return DEFAULT_ITEMS;
  });
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  
  // Get current pet's data
  const currentPetData = petData[currentPetId];
  
  const {
    stats,
    isResting,
    setIsResting,
    feed,
    play,
    startRest,
    travel,
    cleanup,
    getPetMood
  } = usePetStats({
    hunger: currentPetData.hunger,
    happiness: currentPetData.happiness,
    energy: currentPetData.energy
  }, currentPetId);

  // Update the hook's resting state when switching pets
  useEffect(() => {
    setIsResting(currentPetData.isResting);
  }, [currentPetId, currentPetData.isResting, setIsResting]);

  const { position } = usePetMovement(isResting, gameAreaRef);
  
  const { poos, cleanupPoo } = usePooManager(isResting, gameAreaRef);

  const handlePetChange = useCallback((petId: string) => {
    const petConfig = getPetById(petId);
    if (petConfig) {
      setCurrentPetId(petId);
      setShowPetSelector(false); // Close selector after selection
    }
  }, []);

  const handleNameChange = useCallback((newName: string) => {
    setPetData(prev => ({
      ...prev,
      [currentPetId]: {
        ...prev[currentPetId],
        name: newName
      }
    }));
    
    // Also save to localStorage for the EditableName component
    localStorage.setItem(`petName_${currentPetId}`, newName);
  }, [currentPetId]);

  // Save pet data to localStorage whenever it changes
  const savePetData = useCallback((petId: string, data: IndividualPetData) => {
    localStorage.setItem(`petData_${petId}`, JSON.stringify(data));
  }, []);

  // Update pet data when stats change (with debouncing to prevent flashing)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPetData(prev => {
        const currentStats = prev[currentPetId];
        const newData = {
          name: currentPetData.name,
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
          savePetData(currentPetId, newData);
          return {
            ...prev,
            [currentPetId]: newData
          };
        }
        
        return prev; // No change needed
      });
    }, 50); // 50ms debounce

    return () => clearTimeout(timeoutId);
  }, [stats.hunger, stats.happiness, stats.energy, isResting, currentPetId, currentPetData.name, savePetData]);

  // Menu handlers
  const handleSelectPet = useCallback(() => {
    setShowPetSelector(true);
  }, []);

  const handleOptions = useCallback(() => {
    // TODO: Implement options functionality
    console.log('Options clicked - functionality to be implemented');
  }, []);

  const handleSave = useCallback(() => {
    // TODO: Implement save functionality  
    console.log('Save clicked - functionality to be implemented');
  }, []);

  const handleInventory = useCallback(() => {
    setShowInventory(true);
  }, []);

  const handleItemClick = useCallback((itemId: string) => {
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
  }, []);

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
    <div className="App">
      <Menu 
        onSelectPet={handleSelectPet}
        onOptions={handleOptions}
        onSave={handleSave}
        onInventory={handleInventory}
      />
      
      <h1><EditableName 
        key={currentPetId} 
        initialName={currentPetData.name} 
        onNameChange={handleNameChange} 
        petId={currentPetId} 
      /></h1>
      
      {showPetSelector && (
        <PetSelector 
          currentPetId={currentPetId}
          onPetChange={handlePetChange}
          onClose={() => setShowPetSelector(false)}
          isModal={true}
          petData={petData}
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
      
      <div id="stats-container">
        <StatusBar label="Hunger" value={stats.hunger} id="hunger" />
        <StatusBar label="Happiness" value={stats.happiness} id="happiness" />
        <StatusBar label="Energy" value={stats.energy} id="energy" />
      </div>

      <GameArea
        ref={gameAreaRef}
        backgroundIndex={currentBackgroundIndex}
        petMood={getPetMood()}
        isResting={isResting}
        petPosition={position}
        petId={currentPetId}
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
    </div>
  );
}

export default App;
