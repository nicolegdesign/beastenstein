import { useState, useRef, useCallback, useEffect } from 'react';
import { StatusBar } from './components/StatusBar/StatusBar';
import { EditableName } from './components/EditableName/EditableName';
import { BeastDen } from './components/BeastDen/BeastDen';
import { ActionButtons } from './components/ActionButtons/ActionButtons';
import { SidebarBeastSelector } from './components/SidebarBeastSelector/SidebarBeastSelector';
import { Mausoleum } from './components/Mausoleum/Mausoleum';
import { Menu } from './components/Menu/Menu';
import { Options } from './components/Options/Options';
import { Toast } from './components/Toast/Toast';
import { Adventure } from './components/Adventure/Adventure';
import { Debug } from './components/Debug/Debug';
import { IntroStory } from './components/IntroStory/IntroStory';
import { BeastSelection } from './components/BeastSelection/BeastSelection';
import { StartScreen } from './components/StartScreen/StartScreen';
import { GameStateProvider } from './contexts/GameStateContext';
import { GoldProvider } from './contexts/GoldContext';
import { useBeastData } from './hooks/useBeastData';
import { useInventoryItems, useGameOptions, useBeastPartInventory } from './hooks/useLegacyState';
import { useCustomBeastData } from './hooks/useCustomBeastData';
import { useBeastStats } from './hooks/useBeastStats';
import { useBeastMovement } from './hooks/useBeastMovement';
import { usePooManager } from './hooks/usePooManager';
import { useLevelUp } from './hooks/useLevelUp';
import { useGold } from './hooks/useGold';
import { Gold } from './components/Gold/Gold';
import { CompactInventory } from './components/CompactInventory/CompactInventory';
import type { BeastCombatStats } from './types/game';
import type { IndividualBeastData } from './types/game';
import type { GameOptions } from './types/options';
import type { InventoryItem } from './types/inventory';
import { createBeastFromTemplate } from './data/beastTemplates';
import { findSoulEssenceById } from './data/soulEssences';
import { BeastManager, type CustomBeast } from './services/BeastManager';
import { ExperienceManager } from './services/ExperienceManager';
import './App.css';

function App() {
  return (
    <GoldProvider>
      <GameStateProvider>
        <AppContent />
      </GameStateProvider>
    </GoldProvider>
  );
}

function AppContent() {
  // Use centralized game state
  const { setInventory: setBeastPartInventory } = useBeastPartInventory();
  const { beastData, setBeastData, currentBeastId, setCurrentBeastId } = useBeastData();
  const { setCustomBeastData, getCustomBeastData } = useCustomBeastData();
  const { gold } = useGold();
  
  // Game flow state
  const [gameState, setGameState] = useState<'startScreen' | 'intro' | 'beastSelection' | 'game'>(() => {
    // Always start with the start screen for new sessions
    return 'startScreen';
  });

  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);
  
  const [showOptions, setShowOptions] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [inAdventure, setInAdventure] = useState(false);
  const [showMausoleum, setShowMausoleum] = useState(false);
  const [sidebarRefreshTrigger, setSidebarRefreshTrigger] = useState(0);
  const [showSteakAnimation, setShowSteakAnimation] = useState(false);
  const [isLayingDown, setIsLayingDown] = useState(false);
  
  // Use centralized game state for options and inventory
  const { gameOptions, setGameOptions } = useGameOptions();
  const { inventoryItems, setInventoryItems } = useInventoryItems();
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const levelUpSoundRef = useRef<HTMLAudioElement>(null);
  const beastDenMusicRef = useRef<HTMLAudioElement>(null);
  const adventureSoundRef = useRef<HTMLAudioElement>(null);
  
  // Get current beast's data
  const currentBeastData = beastData[currentBeastId];

  const [toast, setToast] = useState<{ message: string; show: boolean; type: 'success' | 'info' }>({ 
    message: '', 
    show: false, 
    type: 'success' 
  });
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [previousLevel, setPreviousLevel] = useState(currentBeastData?.level || 1);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
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
    getBeastMood,
    getExperience,
    setExternalExperience,
    resetToBaseStats,
    updateHealth
  } = useBeastStats({
    hunger: currentBeastData?.hunger || 50,
    happiness: currentBeastData?.happiness || 50,
    energy: currentBeastData?.energy || 50,
    health: currentBeastData?.health || 100,
    level: currentBeastData?.level || 1,
    age: currentBeastData?.age || 0
  }, currentBeastId, gameOptions, currentBeastData?.createdAt || Date.now(), currentBeastData?.experience || 0, currentBeastData?.maxLevel || 5);

  // Update the hook's resting state when switching beasts
  useEffect(() => {
    setIsResting(currentBeastData?.isResting || false);
  }, [currentBeastId, currentBeastData?.isResting, setIsResting]);

  const { position, facing } = useBeastMovement(isResting, gameAreaRef, gameOptions.disableRandomMovement);
  
  const { poos, cleanupPoo } = usePooManager(isResting, gameAreaRef, gameOptions);

  const { checkForLevelUp } = useLevelUp({
    gameOptions,
    setShowLevelUp,
    setToast,
    setBeastData,
    levelUpSoundRef,
    updateHealth
  });

  // Start screen handlers
  const handleNewGame = useCallback(() => {
    // Clear all game data for a fresh start
    localStorage.clear();
    
    // Reset all state to initial values
    setBeastData(() => ({}));
    setCurrentBeastId('');
    
    // Give the player some starter beast parts and soul essences
    setBeastPartInventory(() => ({
      parts: {
        'nightwolf-head': 2,
        'nightwolf-torso': 2,
        'woodenpuppet-head': 1,
        'woodenpuppet-torso': 1
      },
      sets: {
        'nightwolf-arms': 2,
        'nightwolf-legs': 2,
        'woodenpuppet-arms': 1,
        'woodenpuppet-legs': 1
      },
      soulEssences: {
        'dim-soul': 5,
        'glowing-soul': 3
      }
    }));
    
    setGameOptions(() => ({
      disableStatDecay: false,
      disablePooSpawning: false,
      disableRandomMovement: false,
      soundEffectsEnabled: true,
      musicEnabled: true
    }));
    
    // Start with the intro story for new game
    setGameState('intro');
  }, [setBeastData, setCurrentBeastId, setBeastPartInventory, setGameOptions]);

  const handleLoadGame = useCallback(() => {
    // Only called when hasSavedData is true, so we can go directly to the game
    setGameState('game');
  }, []);

  // Intro flow handlers
  const handleIntroComplete = useCallback(() => {
    setGameState('beastSelection');
  }, []);

  const handleBeastSelected = useCallback((name: string) => {
    // Create the first Night Wolf beast with the chosen name
    const now = Date.now();
    const customBeastId = `custom_${now}`;
    
    const newBeastData: IndividualBeastData = {
      name: name,
      hunger: 90,
      happiness: 90,
      energy: 90,
      health: 100,
      level: 1,
      age: 0,
      attack: 7,  // Base 6 + 1 from Brave personality
      defense: 6,
      speed: 6,
      magic: 6,
      isResting: false,
      createdAt: now,
      experience: 0,
      maxLevel: 5  // Dim soul max level
    };
    
    // Create the custom beast configuration using the factory function
    const customBeast = createBeastFromTemplate('nightwolf', name);
    if (!customBeast) {
      console.error('Failed to create Night Wolf beast from template');
      return;
    }
    
    // Save to state and localStorage
    setBeastData(prev => ({ ...prev, [customBeastId]: newBeastData }));
    setCurrentBeastId(customBeastId);
    
    // Save custom beast data to centralized state
    setCustomBeastData(customBeastId, customBeast);
    
    // Save to localStorage with consolidated format
    const allBeastData = { [customBeastId]: newBeastData };
    localStorage.setItem('beastData', JSON.stringify(allBeastData));
    localStorage.setItem('hasPlayedBefore', 'true');
    
    // Transition to game
    setGameState('game');
  }, [setBeastData, setCurrentBeastId, setCustomBeastData]);

  const handleBeastChange = useCallback((beastId: string) => {
    // All beasts are now custom beasts
    const hasCustomBeastData = beastData[beastId];
    
    if (hasCustomBeastData) {
      setCurrentBeastId(beastId);
    }
  }, [beastData, setCurrentBeastId]);

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
  }, [currentBeastId, setBeastData]);

  const handleCreateCustomBeast = useCallback((customBeast: CustomBeast) => {
    const result = BeastManager.createCustomBeast(customBeast, Object.keys(beastData).length);
    
    if (!result.success) {
      setToast({
        message: result.error || 'Failed to create beast',
        show: true,
        type: 'info'
      });
      return;
    }

    // Add to beast data
    if (result.beastId && result.beastData) {
      setBeastData(prev => ({
        ...prev,
        [result.beastId!]: result.beastData!
      }));

      // Save custom beast data to centralized state
      setCustomBeastData(result.beastId, customBeast);

      // Trigger sidebar refresh to show the new custom beast
      setSidebarRefreshTrigger(prev => prev + 1);
      
      // Switch to the new beast and close mausoleum
      setCurrentBeastId(result.beastId);
      setShowMausoleum(false);
      
      // Show success message
      setToast({
        message: `${customBeast.name} has been created!`,
        show: true,
        type: 'success'
      });
    }
  }, [beastData, setBeastData, setCurrentBeastId, setCustomBeastData]);

  // Save beast data to localStorage whenever it changes
  const saveBeastData = useCallback((beastId: string, data: IndividualBeastData) => {
    BeastManager.saveBeastData(beastId, data);
  }, []);

  // Function to update experience globally (both localStorage and hook state)
  const updateBeastExperience = useCallback((beastId: string, newExperience: number): boolean => {
    const success = BeastManager.updateBeastExperience(beastId, newExperience);
    
    if (success) {
      // Update the local state
      setBeastData(prev => ({
        ...prev,
        [beastId]: {
          ...prev[beastId],
          experience: newExperience
        }
      }));
      
      // If this is the current beast, update the hook's state too
      if (beastId === currentBeastId) {
        setExternalExperience(newExperience);
      }
      
      // Check for level up and apply bonuses if needed
      checkForLevelUp(beastId, beastData[beastId], newExperience);
    }
    
    return success;
  }, [currentBeastId, setExternalExperience, setBeastData, beastData, checkForLevelUp]);

  // Update beast data when stats change (with debouncing to prevent flashing)
  useEffect(() => {
    // Don't update if no current beast data exists (e.g., during initial load)
    if (!currentBeastData) return;
    
    const timeoutId = setTimeout(() => {
      setBeastData(prev => {
        const currentStats = prev[currentBeastId];
        const newData = {
          name: currentBeastData.name,
          hunger: stats.hunger,
          happiness: stats.happiness,
          energy: stats.energy,
          health: stats.health,
          level: stats.level,
          age: stats.age,
          attack: currentStats.attack,
          defense: currentStats.defense,
          speed: currentStats.speed,
          magic: currentStats.magic,
          isResting: isResting,
          createdAt: currentBeastData.createdAt,
          experience: getExperience(),
          maxLevel: currentBeastData.maxLevel || 5  // Preserve existing maxLevel or default to 5
        };
        
        // Only update if the stats have actually changed
        if (
          currentStats.hunger !== stats.hunger ||
          currentStats.happiness !== stats.happiness ||
          currentStats.energy !== stats.energy ||
          currentStats.health !== stats.health ||
          currentStats.level !== stats.level ||
          currentStats.age !== stats.age ||
          currentStats.isResting !== isResting ||
          currentStats.experience !== getExperience()
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
  }, [stats.hunger, stats.happiness, stats.energy, stats.health, stats.level, stats.age, isResting, currentBeastId, currentBeastData, saveBeastData, getExperience, setBeastData]);

  // Level up detection and celebration
  useEffect(() => {
    // Don't trigger level up animation on initial load or if previous level is invalid or no beast data
    if (stats.level > previousLevel && !isInitialLoad && previousLevel > 0 && currentBeastData) {
      const levelsGained = stats.level - previousLevel;
      const bonuses = BeastManager.calculateLevelUpBonuses(currentBeastId, levelsGained);
      
      setShowLevelUp(true);
      setToast({
        message: `🎉 ${currentBeastData.name} reached Level ${stats.level}! (+${bonuses.statIncrease / levelsGained} to all stats, +${bonuses.healthIncrease} health)`,
        show: true,
        type: 'success'
      });

      // Play level up sound
      if (levelUpSoundRef.current && gameOptions.soundEffectsEnabled) {
        levelUpSoundRef.current.currentTime = 0;
        levelUpSoundRef.current.volume = 0.7;
        levelUpSoundRef.current.play().catch(error => {
          console.log('Could not play level up sound:', error);
        });
      }
      
      setBeastData(prev => {
        const updatedData = BeastManager.applyLevelUpBonuses(
          prev[currentBeastId],
          bonuses.statIncrease,
          bonuses.healthIncrease
        );
        
        saveBeastData(currentBeastId, updatedData);
        
        return {
          ...prev,
          [currentBeastId]: updatedData
        };
      });

      // Also update the current health in the stats hook to match the new max health
      updateHealth(stats.health + bonuses.healthIncrease);
      
      // Hide level up effect after animation
      setTimeout(() => {
        setShowLevelUp(false);
      }, 3000);
    }
    setPreviousLevel(stats.level);
    
    // Mark that initial load is complete
    if (isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [stats.level, stats.health, previousLevel, currentBeastData, isInitialLoad, currentBeastId, saveBeastData, gameOptions.soundEffectsEnabled, updateHealth, setBeastData]);

  // Beast den music management
  useEffect(() => {
    const musicElement = beastDenMusicRef.current;
    
    if (gameState === 'game' && musicElement && gameOptions.musicEnabled) {
      if (!inAdventure) {
        // Play beast den music when in the beast den
        musicElement.volume = 0.2; // Set volume to 30%
        musicElement.loop = true; // Loop the music
        musicElement.play().catch(error => {
          console.log('Could not play beast den music:', error);
        });
      } else {
        // Stop beast den music when in adventure
        musicElement.pause();
        musicElement.currentTime = 0; // Reset to beginning
      }
    } else if (musicElement) {
      // Stop music if music is disabled
      musicElement.pause();
      musicElement.currentTime = 0;
    }

    // Cleanup function to stop music when component unmounts or game state changes
    return () => {
      if (musicElement) {
        musicElement.pause();
        musicElement.currentTime = 0;
      }
    };
  }, [gameState, inAdventure, gameOptions.musicEnabled]);

  // Initialize previous level when switching beasts
  useEffect(() => {
    if (currentBeastData) {
      setPreviousLevel(currentBeastData.level);
      setIsInitialLoad(true); // Reset initial load flag when switching beasts
    }
  }, [currentBeastId, currentBeastData]);

  // Function to get species name based on head and torso parts (custom beasts only)
  const getBeastSpecies = useCallback((beastId: string): string => {
    // All beasts are now custom beasts
    if (beastId.startsWith('custom_')) {
      try {
        const customBeastData = getCustomBeastData(beastId);
        if (customBeastData && typeof customBeastData === 'object') {
          const customBeast = customBeastData as { head?: { imagePath?: string }, torso?: { imagePath?: string } };
          
          // Extract species from head part image path
          // Example: "./images/beasts/night-wolf/night-wolf-head.svg" -> "wolf"
          let headSpecies = '';
          if (customBeast.head?.imagePath) {
            const headImagePath = customBeast.head.imagePath;
            // Extract filename from path and remove extension
            const headFileName = headImagePath.split('/').pop()?.replace(/\.(svg|png|jpg|jpeg)$/i, '') || '';
            // Split by hyphens and take the second word
            const headParts = headFileName.split('-');
            if (headParts.length >= 2) {
              headSpecies = headParts[1]; // "night-wolf-head" -> "wolf"
            }
          }
          
          // Extract species from torso part image path  
          // Example: "./images/beasts/night-wolf/night-wolf-torso.svg" -> "night"
          let torsoSpecies = '';
          if (customBeast.torso?.imagePath) {
            const torsoImagePath = customBeast.torso.imagePath;
            // Extract filename from path and remove extension
            const torsoFileName = torsoImagePath.split('/').pop()?.replace(/\.(svg|png|jpg|jpeg)$/i, '') || '';
            // Split by hyphens and take the first word
            const torsoParts = torsoFileName.split('-');
            if (torsoParts.length >= 1) {
              torsoSpecies = torsoParts[0]; // "night-wolf-torso" -> "night"
            }
          }
          
          if (headSpecies && torsoSpecies) {
            // Capitalize first letter of each word
            const capitalizedTorso = torsoSpecies.charAt(0).toUpperCase() + torsoSpecies.slice(1);
            const capitalizedHead = headSpecies.charAt(0).toUpperCase() + headSpecies.slice(1);
            return `${capitalizedTorso} ${capitalizedHead}`;
          }
        }
      } catch (error) {
        console.warn(`Failed to determine species for custom beast ${beastId}:`, error);
      }
    }
    return 'Unknown Species';
  }, [getCustomBeastData]);

  // Function to get gender symbol for a custom beast
  const getBeastGender = useCallback((beastId: string): { symbol: string; gender: string } => {
    if (beastId.startsWith('custom_')) {
      try {
        const customBeastData = getCustomBeastData(beastId);
        if (customBeastData && typeof customBeastData === 'object') {
          const customBeast = customBeastData as { gender?: string };
          const gender = customBeast.gender;
          return {
            symbol: gender === 'male' ? '♂' : '♀',
            gender: gender || ''
          };
        }
      } catch (error) {
        console.warn(`Failed to get gender for custom beast ${beastId}:`, error);
      }
    }
    return { symbol: '', gender: '' };
  }, [getCustomBeastData]);

    // Function to get personality name for a custom beast
  const getBeastPersonality = useCallback((beastId: string): string => {
    if (beastId.startsWith('custom_')) {
      try {
        const customBeastData = getCustomBeastData(beastId);
        if (customBeastData && typeof customBeastData === 'object') {
          const customBeast = customBeastData as { personality?: { name?: string } };
          return customBeast.personality?.name || 'Unknown';
        }
      } catch (error) {
        console.warn(`Failed to get personality for custom beast ${beastId}:`, error);
      }
    }
    return 'Unknown';
  }, [getCustomBeastData]);

  // Menu handlers
  const handleOptions = useCallback(() => {
    setShowOptions(true);
  }, []);

  const handleOptionsChange = useCallback((newOptions: GameOptions) => {
    setGameOptions(() => newOptions);
    localStorage.setItem('gameOptions', JSON.stringify(newOptions));
    
    setToast({
      message: '⚙️ Options updated successfully!',
      show: true,
      type: 'success'
    });
  }, [setGameOptions]);

  const handleSave = useCallback(() => {
    // TODO: Implement save functionality  
    console.log('Save clicked - functionality to be implemented');
  }, []);

  const handleAdventure = useCallback(() => {
    // Play adventure sound effect
    if (adventureSoundRef.current && gameOptions.soundEffectsEnabled) {
      adventureSoundRef.current.currentTime = 0;
      adventureSoundRef.current.volume = 0.1;
      adventureSoundRef.current.play().catch(error => {
        console.log('Could not play adventure sound:', error);
      });
    }
    
    setInAdventure(prev => !prev);
  }, [gameOptions.soundEffectsEnabled]);

  const handleDebug = useCallback(() => {
    setShowDebug(true);
  }, []);

  const createTennisBall = useCallback(() => {
    if (!gameAreaRef.current || isResting) return;

    const gameArea = gameAreaRef.current;
    const tennisBall = document.createElement('div');
    tennisBall.className = 'tennis-ball';
    
    const ballImg = document.createElement('img');
    ballImg.src = './images/items/tennisBall.svg';
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

  const handleItemClick = useCallback((itemId: string) => {
    // Find the item to check its effect
    const item = inventoryItems.find(item => item.id === itemId);
    if (!item || item.quantity <= 0) return;

    // Apply item effect based on type
    switch (item.effect) {
      case 'happiness':
        // Handle different happiness items
        if (item.id === 'fuzzyBall') {
          // Fuzzy Ball - same effect as PLAY button
          play();
          createTennisBall(); // Add the tennis ball animation
          setToast({ 
            message: `🎾 ${item.name} used! Same effect as playing!`, 
            show: true, 
            type: 'success' 
          });
        } else {
          // Stuffed Lion - fill happiness to 100
          fillHappiness();
          setToast({ 
            message: `🦁 ${item.name} used! Happiness is now full!`, 
            show: true, 
            type: 'success' 
          });
        }
        break;
        
      case 'hunger':
        // Handle different hunger items
        if (item.id === 'mysteryMeat') {
          // Mystery Meat - same effect as FEED button
          feed();
          setShowSteakAnimation(true); // Add the steak animation
          setToast({ 
            message: `🥩 ${item.name} used! Same effect as feeding!`, 
            show: true, 
            type: 'success' 
          });
        } else {
          // Beast Biscuit - fill hunger to 100
          fillHunger();
          setToast({ 
            message: `🍪 ${item.name} used! Hunger is now full!`, 
            show: true, 
            type: 'success' 
          });
        }
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
      
      case 'health':
        // Health Potion - heal 25% of current beast's health
        {
          const currentHealth = stats.health;
          const maxHealth = 100; // TODO: Get actual max health including bonuses
          const healAmount = Math.floor(maxHealth * 0.25);
          const newHealth = Math.min(maxHealth, currentHealth + healAmount);
          updateHealth(newHealth);
          setToast({ 
            message: `💚 ${item.name} used! Healed ${newHealth - currentHealth} health!`, 
            show: true, 
            type: 'success' 
          });
        }
        break;
        
      case 'mana':
        // Mana Potion - can only be used during battle
        setToast({ 
          message: `💙 ${item.name} can only be used during battle!`, 
          show: true, 
          type: 'info' 
        });
        // Don't consume the item if it can't be used
        return;
        
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
  }, [inventoryItems, fillHappiness, fillHunger, feed, play, createTennisBall, cleanup, poos, cleanupPoo, setToast, setInventoryItems, stats.health, updateHealth, setShowSteakAnimation]);

  const handleAddInventoryItem = useCallback((item: InventoryItem) => {
    setInventoryItems(prevItems => {
      // Check if item already exists in inventory
      const existingItemIndex = prevItems.findIndex(existingItem => existingItem.id === item.id);
      
      let updatedItems;
      if (existingItemIndex >= 0) {
        // Item exists, increase quantity
        updatedItems = prevItems.map((existingItem, index) => {
          if (index === existingItemIndex) {
            return { ...existingItem, quantity: existingItem.quantity + item.quantity };
          }
          return existingItem;
        });
      } else {
        // New item, add to inventory
        updatedItems = [...prevItems, item];
      }
      
      // Save to localStorage
      localStorage.setItem('inventoryItems', JSON.stringify(updatedItems));
      return updatedItems;
    });
  }, [setInventoryItems]);

  const handlePooCleanup = useCallback((pooId: string) => {
    cleanupPoo(pooId);
    cleanup(); // Boost happiness for cleaning up
  }, [cleanupPoo, cleanup]);

  const handleTravel = useCallback(() => {
    travel();
    setCurrentBackgroundIndex((prev) => (prev + 1) % 4);
  }, [travel]);

  const handleReleaseToWild = useCallback(() => {
    const beastName = currentBeastData?.name || 'Beast';
    
    // Check if this is the last beast - prevent deletion if so
    const remainingBeasts = Object.keys(beastData).filter(id => id !== currentBeastId);
    if (remainingBeasts.length === 0) {
      setToast({
        message: 'Cannot release the last beast to the wild! You must have at least one beast.',
        show: true,
        type: 'info'
      });
      return;
    }
    
    const confirmed = window.confirm(
      `Are you sure you want to release ${beastName} to the wild? This will permanently delete this beast and cannot be undone.`
    );
    
    if (!confirmed) return;

    // Remove beast data from state
    setBeastData(prev => {
      const newData = { ...prev };
      delete newData[currentBeastId];
      return newData;
    });

    // Remove from localStorage using BeastManager
    BeastManager.deleteBeast(currentBeastId);

    // Switch to the first remaining beast
    const nextBeastId = BeastManager.getNextBeastId(beastData, currentBeastId);
    if (nextBeastId) {
      setCurrentBeastId(nextBeastId);
    }
    
    // Add a Dim Soul to inventory as a reward for releasing the beast
    setInventoryItems(prevItems => {
      const updatedItems = prevItems.map(item => {
        if (item.id === 'dim-soul') {
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      });
      
      // Save to localStorage
      localStorage.setItem('inventoryItems', JSON.stringify(updatedItems));
      return updatedItems;
    });
    
    // Also add a Dim Soul to the beast part inventory (used by Mausoleum)
    setBeastPartInventory(prevInventory => {
      const updatedInventory = {
        ...prevInventory,
        soulEssences: {
          ...prevInventory.soulEssences,
          'dim-soul': (prevInventory.soulEssences['dim-soul'] || 0) + 1
        }
      };
      return updatedInventory;
    });
    
    // Trigger sidebar refresh to update the beast list
    setSidebarRefreshTrigger(prev => prev + 1);
    
    // Show confirmation message
    setToast({
      message: `${beastName} has been released to the wild 🌿 You received a Dim Soul!`,
      show: true,
      type: 'info'
    });
  }, [currentBeastId, currentBeastData, beastData, setBeastData, setSidebarRefreshTrigger, setToast, setBeastPartInventory, setCurrentBeastId, setInventoryItems]);

  const handlePlay = useCallback(() => {
    play();
    createTennisBall();
  }, [play, createTennisBall]);

  const handleFeed = useCallback(() => {
    feed();
    setShowSteakAnimation(true);
  }, [feed]);

  const handleSteakAnimationComplete = useCallback(() => {
    setShowSteakAnimation(false);
  }, []);

  const handleRest = useCallback(() => {
    // Trigger laying down animation first
    setIsLayingDown(true);
    
    // After the laying animation completes, start the actual rest
    setTimeout(() => {
      startRest();
      // Keep laying animation for a bit longer to show the beast is resting
      setTimeout(() => {
        setIsLayingDown(false);
      }, 2000); // Beast stays laying for 2 seconds
    }, 1500); // Wait for laying animation to complete (1.5 seconds)
  }, [startRest]);

  const handleResetAllBeasts = useCallback(() => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      "⚠️ Are you sure you want to reset ALL beasts to base stats?\n\n" +
      "This will:\n" +
      "• Set all stats to base values (Level 1, 50 hunger/happiness/energy, 100 health, 0 age)\n" +
      "• Keep beast names and combat stats\n" +
      "• Reset creation time to now\n\n" +
      "This action cannot be undone!"
    );
    
    if (!confirmed) return;
    
    const now = Date.now();
    
    setBeastData(prev => {
      const resetData: Record<string, IndividualBeastData> = {};
      
      Object.keys(prev).forEach(beastId => {
        const currentBeast = prev[beastId];
        resetData[beastId] = {
          ...currentBeast,
          hunger: 50,
          happiness: 50,
          energy: 50,
          health: 100,
          level: 1,
          age: 0,
          isResting: false,
          createdAt: now
        };
        
        // Save to localStorage using consolidated approach
        try {
          const beastDataKey = 'beastData';
          const existingData = localStorage.getItem(beastDataKey);
          const allBeastData = existingData ? JSON.parse(existingData) : {};
          allBeastData[beastId] = resetData[beastId];
          localStorage.setItem(beastDataKey, JSON.stringify(allBeastData));
        } catch (error) {
          console.error('Failed to save reset data:', error);
          // Fallback to old method
          localStorage.setItem(`beastData_${beastId}`, JSON.stringify(resetData[beastId]));
        }
      });
      
      return resetData;
    });

    // Immediately reset the current beast's stats in the hook
    resetToBaseStats();
    
    setToast({
      message: 'Beast has been reset to default stats!',
      show: true,
      type: 'info'
    });
    
    // Close debug panel
    setShowDebug(false);
  }, [resetToBaseStats, setToast, setShowDebug, setBeastData]);

  const handleTestLevelUp = useCallback(() => {
    if (!currentBeastData) return;
    
    // Give the beast 100 experience points to trigger a level up
    const currentExp = getExperience();
    const newExp = currentExp + 100;
    
    updateBeastExperience(currentBeastId, newExp);
    setExternalExperience(newExp);
    
    setToast({
      message: '🧪 Added 100 experience points for testing!',
      show: true,
      type: 'info'
    });
  }, [currentBeastData, currentBeastId, getExperience, updateBeastExperience, setExternalExperience, setToast]);

  const handleAddTestItems = useCallback(() => {
    // Import the battle rewards to get all available items
    import('./data/battleRewards').then(({ BATTLE_ITEM_DROPS }) => {
      setInventoryItems(prevItems => {
        // Create a copy of existing items
        const updatedItems = [...prevItems];
        
        // Add one of each item from BATTLE_ITEM_DROPS
        BATTLE_ITEM_DROPS.forEach((item: InventoryItem) => {
          const existingItemIndex = updatedItems.findIndex(existingItem => existingItem.id === item.id);
          
          if (existingItemIndex >= 0) {
            // Item exists, increase quantity by 1
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              quantity: updatedItems[existingItemIndex].quantity + 1
            };
          } else {
            // New item, add to inventory with quantity 1
            updatedItems.push({
              ...item,
              quantity: 1
            });
          }
        });
        
        // Save to localStorage
        localStorage.setItem('inventoryItems', JSON.stringify(updatedItems));
        return updatedItems;
      });
      
      setToast({
        message: '🎒 Added one of every item to inventory for testing!',
        show: true,
        type: 'success'
      });
    }).catch(error => {
      console.error('Failed to load battle rewards:', error);
      setToast({
        message: '❌ Failed to add test items',
        show: true,
        type: 'info'
      });
    });
  }, [setInventoryItems, setToast]);

  // Calculate enhanced combat stats including stat bonuses from beast parts
  const getEnhancedCombatStats = (beastId: string): BeastCombatStats => {
    const currentBeast = beastData[beastId];
    const baseStats = {
      attack: currentBeast?.attack || 0,
      defense: currentBeast?.defense || 0,
      speed: currentBeast?.speed || 0,
      magic: currentBeast?.magic || 0
    };

    try {
      const customBeastData = getCustomBeastData(beastId);
      if (customBeastData && typeof customBeastData === 'object') {
        const customBeast = customBeastData as {
          head?: { statBonus?: { attack?: number; defense?: number; speed?: number; magic?: number } };
          torso?: { statBonus?: { attack?: number; defense?: number; speed?: number; magic?: number } };
          armLeft?: { statBonus?: { attack?: number; defense?: number; speed?: number; magic?: number } };
          armRight?: { statBonus?: { attack?: number; defense?: number; speed?: number; magic?: number } };
          legLeft?: { statBonus?: { attack?: number; defense?: number; speed?: number; magic?: number } };
          legRight?: { statBonus?: { attack?: number; defense?: number; speed?: number; magic?: number } };
        };
        
        // Calculate stat bonuses from all parts
        let attackBonus = 0;
        let defenseBonus = 0;
        let speedBonus = 0;
        let magicBonus = 0;

        // Add bonuses from each part
        [customBeast.head, customBeast.torso, customBeast.armLeft, customBeast.armRight, customBeast.legLeft, customBeast.legRight].forEach(part => {
          if (part?.statBonus) {
            attackBonus += part.statBonus.attack || 0;
            defenseBonus += part.statBonus.defense || 0;
            speedBonus += part.statBonus.speed || 0;
            magicBonus += part.statBonus.magic || 0;
          }
        });

        return {
          attack: baseStats.attack + attackBonus,
          defense: baseStats.defense + defenseBonus,
          speed: baseStats.speed + speedBonus,
          magic: baseStats.magic + magicBonus
        };
      }
    } catch (error) {
      console.error('Failed to load custom beast data for enhanced stats:', error);
    }

    return baseStats;
  };

  // Calculate enhanced health including health bonuses from beast parts
  const getEnhancedHealth = (beastId: string): number => {
    const currentBeast = beastData[beastId];
    const baseHealth = currentBeast?.health || 100;

    try {
      const customBeastData = getCustomBeastData(beastId);
      if (customBeastData && typeof customBeastData === 'object') {
        const customBeast = customBeastData as {
          head?: { statBonus?: { health?: number } };
          torso?: { statBonus?: { health?: number } };
          armLeft?: { statBonus?: { health?: number } };
          armRight?: { statBonus?: { health?: number } };
          legLeft?: { statBonus?: { health?: number } };
          legRight?: { statBonus?: { health?: number } };
        };
        
        let healthBonus = 0;

        // Add health bonuses from all parts
        [customBeast.head, customBeast.torso, customBeast.armLeft, customBeast.armRight, customBeast.legLeft, customBeast.legRight].forEach(part => {
          if (part?.statBonus) {
            healthBonus += part.statBonus.health || 0;
          }
        });

        return baseHealth + healthBonus;
      }
    } catch (error) {
      console.error('Failed to load custom beast data for enhanced health:', error);
    }

    return baseHealth;
  };

  return (
      <div className="App">
        {/* Start Screen */}
        {gameState === 'startScreen' && (
          <StartScreen 
            onNewGame={handleNewGame}
            onLoadGame={handleLoadGame}
            hasSavedData={Object.keys(beastData || {}).length > 0}
          />
        )}

        {/* Intro Story Screen */}
        {gameState === 'intro' && (
          <IntroStory 
            onComplete={handleIntroComplete} 
            musicEnabled={gameOptions.musicEnabled}
          />
        )}

        {/* Beast Selection Screen */}
        {gameState === 'beastSelection' && (
          <BeastSelection onBeastSelected={handleBeastSelected} />
        )}

        {/* Main Game Screen */}
        {gameState === 'game' && currentBeastData && (
          <>
            <Menu 
              onOptions={handleOptions}
              onSave={handleSave}
              onDebug={handleDebug}
            />

            {/* Beast name and info in upper left */}
            <div className="beast-header">
              <h1><EditableName 
                key={currentBeastId}
                initialName={currentBeastData.name} 
          onNameChange={handleNameChange} 
          beastId={currentBeastId} 
        /></h1>
        
        <div className="beast-info-plate">
          <div className="info-text">
            <span className="species-text">
              {(() => {
                const personality = getBeastPersonality(currentBeastId);
                return personality ? (
                  <span className="personality-text">
                    {personality}
                  </span>
                ) : null;
              })()}
              {getBeastSpecies(currentBeastId)}
              {(() => {
                const genderInfo = getBeastGender(currentBeastId);
                return genderInfo.symbol ? (
                  <span className={`gender-symbol ${genderInfo.gender}`}>
                    {genderInfo.symbol}
                  </span>
                ) : null;
              })()}
            </span>
            <span>LEVEL {stats.level}/{currentBeastData.maxLevel || 5}</span>
            <span>AGE {stats.age}</span>
            <span>EXP {getExperience()}/{(() => {
              // Calculate total experience needed for next level
              const currentExp = getExperience();
              const maxLevel = currentBeastData.maxLevel || 5;
              const experienceData = ExperienceManager.getExperienceData(currentExp, maxLevel);
              if (experienceData.isAtMaxLevel) {
                return 'MAX';
              }
              return ExperienceManager.getTotalExperienceForLevel(experienceData.currentLevel + 1);
            })()}</span>
          </div>
        </div>
        
        {/* Gold Display */}
        <div className="gold-display-container">
          <Gold amount={gold} size="medium" />
        </div>
      </div>

      {/* Top stats bar - compact horizontal layout */}
      <div id="top-stats-container">
        <StatusBar label="Health" value={stats.health} id="health" />
        <StatusBar label="Hunger" value={stats.hunger} id="hunger" />
        <StatusBar label="Happiness" value={stats.happiness} id="happiness" />
        <StatusBar label="Energy" value={stats.energy} id="energy" />
      </div>

      {/* Sidebar Beast Selector */}
      <SidebarBeastSelector
        currentBeastId={currentBeastId}
        onBeastChange={handleBeastChange}
        beastData={beastData}
        onCreateBeast={() => {
          setShowMausoleum(true);
        }}
        refreshTrigger={sidebarRefreshTrigger}
      />
      
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
          onResetAllBeasts={handleResetAllBeasts}
          onTestLevelUp={handleTestLevelUp}
          onAddTestItems={handleAddTestItems}
        />
      )}
      
      {showMausoleum && (
        <Mausoleum
          onClose={() => setShowMausoleum(false)}
          onCreateBeast={handleCreateCustomBeast}
        />
      )}
      
      {inAdventure ? (
        <Adventure
          playerStats={{
            ...getEnhancedCombatStats(currentBeastId),
            health: getEnhancedHealth(currentBeastId)
          }}
          onClose={() => setInAdventure(false)}
          onUpdateExperience={updateBeastExperience}
          soundEffectsEnabled={gameOptions.soundEffectsEnabled}
          inventoryItems={inventoryItems}
          onItemClick={handleItemClick}
          onAddInventoryItem={handleAddInventoryItem}
        />
      ) : (
        <>
          <BeastDen
            ref={gameAreaRef}
            backgroundIndex={currentBackgroundIndex}
            beastMood={getBeastMood()}
            isResting={isResting}
            isLayingDown={isLayingDown}
            beastPosition={position}
            beastFacing={facing}
            beastId={currentBeastId}
            hunger={stats.hunger}
            poos={poos}
            onFeedFromBowl={handleFeed}
            onRestFromBed={handleRest}
            onCleanupPoo={handlePooCleanup}
            showSteakAnimation={showSteakAnimation}
            onSteakAnimationComplete={handleSteakAnimationComplete}
            soundEffectsEnabled={gameOptions.soundEffectsEnabled}
          />

          {/* Adventure Button - Outside of Beast Den */}
          <div className="adventure-button-container">
            <button 
              className="adventure-button"
              onClick={handleAdventure}
              title="Enter the Adventure Mode"
            >
              <div className="adventure-button-icon">🗺️</div>
              <div className="adventure-button-text">START YOUR ADVENTURE</div>
            </button>
          </div>

          {/* Combat Stats Container - positioned on the right side */}
          <div className="combat-stats-container">
            <div className="combat-stats-table">
              <h4 className="stats-title">Combat Stats ✨</h4>
              <div className="stats-subtitle">Enhanced with Part Bonuses</div>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-icon">⚔️</span>
                  <span className="stat-label">Attack</span>
                  <span className="stat-value">{getEnhancedCombatStats(currentBeastId).attack}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">🛡️</span>
                  <span className="stat-label">Defense</span>
                  <span className="stat-value">{getEnhancedCombatStats(currentBeastId).defense}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">⚡</span>
                  <span className="stat-label">Speed</span>
                  <span className="stat-value">{getEnhancedCombatStats(currentBeastId).speed}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">🔮</span>
                  <span className="stat-label">Magic</span>
                  <span className="stat-value">{getEnhancedCombatStats(currentBeastId).magic}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">❤️</span>
                  <span className="stat-label">Health</span>
                  <span className="stat-value">{getEnhancedHealth(currentBeastId)}</span>
                </div>
              </div>
              
              {/* Soul Essence Display */}
              <div className="soul-essence-display">
                <h5 className="soul-essence-title">Soul Essence</h5>
                {(() => {
                  let soulEssence = null;
                  
                  try {
                    const customBeastData = getCustomBeastData(currentBeastId);
                    if (customBeastData && typeof customBeastData === 'object') {
                      const customBeast = customBeastData as { soulEssence?: { id?: string } };
                      if (customBeast.soulEssence?.id) {
                        soulEssence = findSoulEssenceById(customBeast.soulEssence.id);
                      }
                    }
                  } catch (error) {
                    console.error('Failed to get soul essence:', error);
                  }
                  
                  if (soulEssence) {
                    return (
                      <div className="soul-essence-info">
                        <div className="soul-essence-icon">
                          <img src={soulEssence.imagePath} alt={soulEssence.name} />
                        </div>
                        <div className="soul-essence-details">
                          <div className="soul-essence-name">{soulEssence.name}</div>
                          <div className={`soul-essence-rarity ${soulEssence.rarity}`}>{soulEssence.rarity}</div>
                          <div className="soul-essence-level-cap">Max Level: {soulEssence.maxLevel}</div>
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <div className="soul-essence-info">
                      <div className="soul-essence-name">No Soul</div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Compact Inventory for Beast Den - Outside of combat stats */}
          <div className="beast-den-inventory">
            <CompactInventory 
              items={inventoryItems}
              onItemClick={handleItemClick}
            />
          </div>

          <ActionButtons
            onFeed={handleFeed}
            onPlay={handlePlay}
            onRest={handleRest}
            onTravel={handleTravel}
            onReleaseToWild={handleReleaseToWild}
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

      {showLevelUp && (
        <div className="level-up-effect">
          🎉 LEVEL UP! 🎉
        </div>
      )}

      {/* Level up sound effect */}
      <audio
        ref={levelUpSoundRef}
        preload="auto"
        style={{ display: 'none' }}
      >
        <source src="./sounds/chime2.mp3" type="audio/mpeg" />
      </audio>

      {/* Beast den background music */}
      <audio
        ref={beastDenMusicRef}
        preload="auto"
        style={{ display: 'none' }}
      >
        <source src="./sounds/beast-den-music.mp3" type="audio/mpeg" />
      </audio>

      {/* Adventure sound effect */}
      <audio
        ref={adventureSoundRef}
        preload="auto"
        style={{ display: 'none' }}
      >
        <source src="./sounds/dungeon_door1.mp3" type="audio/mpeg" />
      </audio>
          </>
        )}
      </div>
  );
}

export default App;
