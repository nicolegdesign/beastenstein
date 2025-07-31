import type { InventoryItem } from '../types/inventory';
import { ItemAnimationManager } from './ItemAnimationManager';

export interface ItemEffectContext {
  // Beast actions
  play: () => void;
  feed: () => void;
  cleanup: () => void;
  fillHappiness: () => void;
  fillHunger: () => void;
  updateHealth: (newHealth: number) => void;
  
  // Animation container
  gameAreaRef: React.RefObject<HTMLDivElement | null>;
  isResting: boolean;
  
  // Toast notifications
  setToast: (toast: { message: string; show: boolean; type: 'success' | 'info' }) => void;
  
  // Game state
  stats: {
    health: number;
    hunger: number;
    happiness: number;
    energy: number;
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
      updateHealth,
      gameAreaRef,
      isResting,
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
          setToast
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
   * Handle mana-restoring items (battle-only)
   */
  private static handleManaItem(
    item: InventoryItem,
    context: {
      setToast: (toast: { message: string; show: boolean; type: 'success' | 'info' }) => void;
    }
  ): ItemEffectResult {
    const { setToast } = context;

    // Mana Potion - can only be used during battle
    setToast({
      message: `💙 ${item.name} can only be used during battle!`,
      show: true,
      type: 'info'
    });

    // Don't consume the item if it can't be used
    return { success: false, consumeItem: false };
  }

  /**
   * Get a list of all supported item effect types
   */
  static getSupportedEffectTypes(): string[] {
    return ['happiness', 'hunger', 'cleanup', 'health', 'mana'];
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
