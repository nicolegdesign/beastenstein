import type { InventoryItem } from '../types/inventory';
import { ItemAnimationManager } from './ItemAnimationManager';

export interface ItemEffectContext {
  // Beast actions
  play: () => void;
  feed: () => void;
  cleanup: () => void;
  fillHappiness: () => void;
  fillHunger: () => void;
  fillEnergy: () => void;
  fillMana: () => void;
  updateHealth: (newHealth: number) => void;
  
  // Animation container
  gameAreaRef: React.RefObject<HTMLDivElement | null>;
  isResting: boolean;
  setIsLayingDown: (laying: boolean) => void;
  
  // Toast notifications
  setToast: (toast: { message: string; show: boolean; type: 'success' | 'info' }) => void;
  
  // Game state
  stats: {
    health: number;
    hunger: number;
    happiness: number;
    energy: number;
    mana: number;
    level: number;
    age: number;
  };
  poos: Array<{ id: string }>;
  cleanupPoo: (pooId: string) => void;
}

export interface ItemEffectResult {
  success: boolean;
  consumeItem: boolean;
  message?: string;
}

export class ItemEffectsManager {
  /**
   * Apply the effect of an item based on its type and ID
   * @param item The inventory item to use
   * @param context The game context containing actions and state
   * @returns Result indicating success and whether to consume the item
   */
  static applyItemEffect(item: InventoryItem, context: ItemEffectContext): ItemEffectResult {
    const {
      play,
      feed,
      cleanup,
      fillHappiness,
      fillHunger,
      fillEnergy,
      fillMana,
      updateHealth,
      gameAreaRef,
      isResting,
      setIsLayingDown,
      setToast,
      stats,
      poos,
      cleanupPoo
    } = context;

    switch (item.effect) {
      case 'happiness':
        return this.handleHappinessItem(item, {
          play,
          fillHappiness,
          gameAreaRef,
          isResting,
          setToast
        });
        
      case 'hunger':
        return this.handleHungerItem(item, {
          feed,
          fillHunger,
          gameAreaRef,
          isResting,
          setToast
        });
        
      case 'cleanup':
        return this.handleCleanupItem(item, {
          cleanup,
          cleanupPoo,
          poos,
          setToast
        });
        
      case 'health':
        return this.handleHealthItem(item, {
          updateHealth,
          stats,
          setToast
        });
        
      case 'mana':
        return this.handleManaItem(item, {
          fillMana,
          stats,
          setToast
        });
        
      case 'energy':
        return this.handleEnergyItem(item, {
          fillEnergy,
          stats,
          setToast,
          setIsLayingDown
        });
        
      default:
        setToast({
          message: `${item.name} used but had no effect.`,
          show: true,
          type: 'info'
        });
        return { success: false, consumeItem: true };
    }
  }

  /**
   * Handle happiness-boosting items
   */
  private static handleHappinessItem(
    item: InventoryItem,
    context: {
      play: () => void;
      fillHappiness: () => void;
      gameAreaRef: React.RefObject<HTMLDivElement | null>;
      isResting: boolean;
      setToast: (toast: { message: string; show: boolean; type: 'success' | 'info' }) => void;
    }
  ): ItemEffectResult {
    const { play, fillHappiness, gameAreaRef, isResting, setToast } = context;

    if (item.id === 'fuzzyBall') {
      // Fuzzy Ball - same effect as PLAY button
      play();
      // Create tennis ball animation using the manager
      if (gameAreaRef.current && !isResting) {
        ItemAnimationManager.createTennisBallAnimation(gameAreaRef.current);
      }
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

    return { success: true, consumeItem: true };
  }

  /**
   * Handle hunger-satisfying items
   */
  private static handleHungerItem(
    item: InventoryItem,
    context: {
      feed: () => void;
      fillHunger: () => void;
      gameAreaRef: React.RefObject<HTMLDivElement | null>;
      isResting: boolean;
      setToast: (toast: { message: string; show: boolean; type: 'success' | 'info' }) => void;
    }
  ): ItemEffectResult {
    const { feed, fillHunger, gameAreaRef, isResting, setToast } = context;

    if (item.id === 'mysteryMeat') {
      // Mystery Meat - same effect as FEED button
      feed();
      // Create steak animation using the manager
      if (gameAreaRef.current && !isResting) {
        ItemAnimationManager.createSteakAnimation(gameAreaRef.current);
      }
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

    return { success: true, consumeItem: true };
  }

  /**
   * Handle cleanup items (like shovels)
   */
  private static handleCleanupItem(
    item: InventoryItem,
    context: {
      cleanup: () => void;
      cleanupPoo: (pooId: string) => void;
      poos: Array<{ id: string }>;
      setToast: (toast: { message: string; show: boolean; type: 'success' | 'info' }) => void;
    }
  ): ItemEffectResult {
    const { cleanup, cleanupPoo, poos, setToast } = context;

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

    return { success: true, consumeItem: true };
  }

  /**
   * Handle health-restoring items
   */
  private static handleHealthItem(
    item: InventoryItem,
    context: {
      updateHealth: (newHealth: number) => void;
      stats: { health: number };
      setToast: (toast: { message: string; show: boolean; type: 'success' | 'info' }) => void;
    }
  ): ItemEffectResult {
    const { updateHealth, stats, setToast } = context;

    // Health Potion - heal 25% of current beast's health
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

    return { success: true, consumeItem: true };
  }

  /**
   * Handle mana-restoring items
   */
  private static handleManaItem(
    item: InventoryItem,
    context: {
      fillMana: () => void;
      stats: { mana: number };
      setToast: (toast: { message: string; show: boolean; type: 'success' | 'info' }) => void;
    }
  ): ItemEffectResult {
    const { fillMana, stats, setToast } = context;

    // Check if mana is already full
    if (stats.mana >= 100) {
      setToast({
        message: `💙 ${item.name} - Mana is already full!`,
        show: true,
        type: 'info'
      });
      return { success: false, consumeItem: false };
    }

    // Use the mana potion
    fillMana();
    
    setToast({
      message: `💙 ${item.name} restored your beast's mana!`,
      show: true,
      type: 'success'
    });

    return { success: true, consumeItem: true };
  }

  /**
   * Handle energy-restoring items
   */
  private static handleEnergyItem(
    item: InventoryItem,
    context: {
      fillEnergy: () => void;
      stats: { energy: number };
      setToast: (toast: { message: string; show: boolean; type: 'success' | 'info' }) => void;
      setIsLayingDown: (laying: boolean) => void;
    }
  ): ItemEffectResult {
    const { fillEnergy, stats, setToast, setIsLayingDown } = context;

    // Check if energy is already full
    if (stats.energy >= 100) {
      setToast({
        message: `😴 ${item.name} - Energy is already full!`,
        show: true,
        type: 'info'
      });
      return { success: false, consumeItem: false };
    }

    // Use the Cozy Bed - trigger laying down animation first (like Rest button)
    setIsLayingDown(true);
    
    // After the laying animation completes, restore energy
    setTimeout(() => {
      fillEnergy();
      
      setToast({
        message: `😴 ${item.name} used! Your beast feels well-rested and energized!`,
        show: true,
        type: 'success'
      });
      
      // Keep laying animation for a bit longer to show the beast is resting
      setTimeout(() => {
        setIsLayingDown(false);
      }, 2000); // Beast stays laying for 2 seconds (same as Rest button)
    }, 1500); // Wait for laying animation to complete (1.5 seconds)

    return { success: true, consumeItem: true };
  }

  /**
   * Get a list of all supported item effect types
   */
  static getSupportedEffectTypes(): string[] {
    return ['happiness', 'hunger', 'cleanup', 'health', 'mana', 'energy'];
  }

  /**
   * Check if an item can be used in the current context
   * @param item The inventory item to check
   * @param inBattle Whether the player is currently in battle
   */
  static canUseItem(item: InventoryItem, inBattle: boolean = false): boolean {
    if (item.quantity <= 0) return false;

    // Mana potions can only be used in battle
    if (item.effect === 'mana' && !inBattle) {
      return false;
    }

    return this.getSupportedEffectTypes().includes(item.effect);
  }
}
