# ItemEffectsManager Service

## Overview

The `ItemEffectsManager` is a service class that centralizes all item effect logic for the Beastenstein game. This was extracted from `App.tsx` to improve code organization and maintainability.

## Architecture

### Core Concept
- **Single Responsibility**: Handles all item effects in one place
- **Context Pattern**: Uses an interface to receive game state and actions
- **Result Pattern**: Returns structured results indicating success and consumption
- **Type Safety**: Full TypeScript support with proper interfaces

### Key Features
- Handles 5 different effect types: `happiness`, `hunger`, `cleanup`, `health`, `mana`
- Supports different behaviors for items with same effect type (e.g., Fuzzy Ball vs Stuffed Lion)
- Integrates with unified ItemAnimationManager for special items (Mystery Meat, Fuzzy Ball)
- Battle-context awareness (mana potions only work in combat) 
- Proper item consumption logic

## Usage

### Basic Usage
```typescript
import { ItemEffectsManager } from '../services/ItemEffectsManager';

// Create context with game state and actions
const effectContext = {
  // Beast actions
  play: () => void,
  feed: () => void,
  cleanup: () => void,
  fillHappiness: () => void,
  fillHunger: () => void,
  updateHealth: (newHealth: number) => void,
  
  // Animation container
  gameAreaRef: React.RefObject<HTMLDivElement | null>,
  isResting: boolean,
  
  // Toast notifications
  setToast: (toast) => void,
  
  // Game state
  stats: { health: number, hunger: number, ... },
  poos: Array<{ id: string }>,
  cleanupPoo: (pooId: string) => void
};

// Apply item effect
const result = ItemEffectsManager.applyItemEffect(item, effectContext);

// Handle result
if (result.consumeItem) {
  // Reduce item quantity
}
```

### Utility Methods
```typescript
// Check if item can be used in current context
const canUse = ItemEffectsManager.canUseItem(item, inBattle);

// Get all supported effect types
const supportedTypes = ItemEffectsManager.getSupportedEffectTypes();
```

## Item Effect Types

### 1. Happiness Items
- **Fuzzy Ball**: Triggers play action + tennis ball animation
- **Stuffed Lion**: Fills happiness to 100%

### 2. Hunger Items
- **Mystery Meat**: Triggers feed action + steak animation
- **Beast Biscuit**: Fills hunger to 100%

### 3. Cleanup Items
- **Shovel**: Cleans all poos + happiness boost

### 4. Health Items
- **Health Potion**: Heals 25% of max health

### 5. Mana Items
- **Mana Potion**: Only usable in battle (prevents consumption if not in battle)

## Benefits of This Architecture

### Code Organization
- **Separation of Concerns**: Item logic separated from component logic
- **Single Source of Truth**: All item effects in one place
- **Easy Testing**: Service can be unit tested independently
- **Maintainability**: Easy to add new items or modify existing effects

### Extensibility
- **New Item Types**: Add new cases to the switch statement
- **Battle Integration**: Context pattern allows battle-specific logic
- **Animation Support**: Built-in support for special effect animations
- **Error Handling**: Structured result pattern for error handling

### Performance
- **No Dependencies**: Pure functions with minimal overhead
- **Type Safety**: Compile-time checking prevents runtime errors
- **Memory Efficient**: Static methods, no instance creation needed

## Future Enhancements

1. **Configuration-Driven Effects**: Move item effects to data files
2. **Effect Chaining**: Support for items with multiple effects
3. **Conditional Effects**: Effects that depend on beast state
4. **Status Effects**: Temporary buffs/debuffs from items
5. **Crafting Integration**: Items that combine to create new items

## Integration Points

- **App.tsx**: Primary usage in `handleItemClick`
- **Adventure.tsx**: Uses via prop passing to CompactInventory
- **CompactInventory**: Displays items and triggers effects
- **Battle System**: Future integration for mana potions and battle items
