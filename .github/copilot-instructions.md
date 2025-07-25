# Copilot Instructions for Beastenstein - Beast Battle Game

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilot-instructions.md-file -->

This is a complex React TypeScript beast collection and battle game with sophisticated turn-based combat, beast customization, and RPG mechanics.

## Project Overview
**Beastenstein** is an advanced beast battle game featuring:
- Multi-beast team combat with speed-based turn order
- Customizable beasts with modular body parts system
- Adventure mode with progression and loot drops
- Experience/leveling system with max level caps
- Beast care simulation (hunger, happiness, energy, health)
- Comprehensive inventory and beast management
- Rich animations using Framer Motion

## Core Architecture

### Technology Stack
- **React 19.1.0** + **TypeScript** - Modern React with strict typing
- **Vite 6.3.5** - Build tool and dev server  
- **Framer Motion 12.18.1** - Comprehensive animation system for beasts and UI
- **LocalStorage** - Persistence for beast data, progress, and user preferences
- **Context API** - State management (InventoryProvider pattern)

### Project Structure
```
src/
├── components/           # 20+ React components organized by feature
│   ├── Adventure/        # Complex battle system with turn-based combat
│   ├── BeastDen/        # Main beast care interface
│   ├── BeastSelection/  # Beast creation and selection flows
│   ├── AnimatedCustomBeast/ # Beast rendering with mood animations
│   └── [Other components...]
├── hooks/               # Custom hooks for game logic
│   ├── useBeastStats.ts # Beast stat management with aging/experience
│   ├── useBeastMovement.ts # Beast positioning and movement
│   └── usePooManager.ts # Poo spawning and cleanup mechanics
├── types/               # TypeScript definitions
│   ├── game.ts         # Core game state interfaces
│   ├── inventory.ts    # Inventory and loot system types
│   └── abilities.ts    # Combat ability system types
├── data/               # Game data and configurations
│   ├── beastTemplates.ts # Pre-built beast configurations
│   ├── abilities.ts    # Combat abilities and effects
│   └── lootData.ts     # Adventure loot tables
└── contexts/           # React contexts for global state
    └── InventoryContext.tsx # Beast part inventory management
```

## Game Systems

### 1. Beast System
**Core Concept**: Beasts are complex entities with both care stats and combat stats
- **Care Stats**: hunger, happiness, energy, health, age (affects gameplay and aging)
- **Combat Stats**: attack, defense, speed, magic (for battle calculations)
- **Experience System**: Beasts gain XP from battles, level up with stat improvements
- **Max Level System**: Based on soul essence used during creation
- **Aging System**: Real-time aging affects beast appearance and behavior

### 2. Combat System (Most Complex Component: `Adventure.tsx`)
**Turn-Based Combat**: Speed-based initiative system with multi-beast teams
```typescript
interface CombatState {
  playerBeasts: BattleBeast[];
  opponentBeasts: BattleBeast[];
  turnOrder: string[]; // Speed-sorted beast IDs
  currentTurnIndex: number;
  currentRound: number;
  selectedPlayerBeast: string | null;
  selectedTarget: string | null;
}
```

**Key Combat Features**:
- Speed determines turn order (fastest first)
- Status effects (buffs/debuffs) with duration tracking
- Ability cooldowns and mana management
- Position-based targeting (front line vs back line)
- Automated AI turns with strategic targeting
- Real-time battle log and visual feedback

### 3. Beast Customization System
**Modular Parts**: Head, body, wings, tail with stat bonuses
- Parts provide stat bonuses that stack
- Visual composition from SVG parts
- Inventory system for collecting and managing parts
- Beast templates for quick creation

### 4. Adventure and Progression
- **Level-based progression** with unlockable content
- **Loot system** with rarity-based drops
- **Experience distribution** among team members
- **Victory rewards** including parts and consumables

## Development Guidelines

### Component Architecture
- **Functional components** with React hooks exclusively
- **Single responsibility**: Each component handles one game feature
- **Custom hooks** for complex game logic (stats, movement, combat)
- **TypeScript interfaces** for all game state and props
- **Framer Motion** for all animations (beast moods, UI transitions)

### State Management Patterns
```typescript
// Example: Combat state updates
setCombatState(prev => {
  const newState = { ...prev };
  // Atomic state updates with immutable patterns
  return newState;
});
```

### Key Custom Hooks
- **`useBeastStats(beastId)`**: Manages individual beast stats, aging, experience
- **`useBeastMovement()`**: Handles beast positioning and movement animations  
- **`usePooManager()`**: Manages poo spawning, cleanup mini-game

### Animation Standards
- **Beast moods**: normal, happy, sad, laying, attack
- **Framer Motion** for all UI transitions
- **Sound integration** with user preference controls
- **Performance optimization** with React.memo for animated components

### Data Persistence
- **LocalStorage** for all game data persistence
- **Beast data**: Individual stats, experience, levels stored by beast ID
- **User preferences**: Sound settings, beast order, adventure progress
- **Inventory**: Parts, sets, consumables with quantities

### Combat Implementation
When working on combat features:
- **Turn order calculation** based on effective speed stats
- **Status effect application** with proper duration tracking
- **Damage calculation** with attack/defense stat interactions
- **Target validation** respecting front/back line positioning rules
- **AI behavior** with basic strategic decision making

### TypeScript Patterns
```typescript
// Core interfaces
interface BeastCombatStats {
  attack: number;
  defense: number; 
  speed: number;
  magic: number;
}

interface IndividualBeastData extends BeastFullStats {
  name: string;
  experience: number;
  maxLevel: number;
  createdAt: number;
}
```

### Code Style Requirements
- **Descriptive naming**: Components, hooks, and functions should clearly indicate purpose
- **Type safety**: All props, state, and function parameters must have explicit TypeScript types
- **Error handling**: Implement proper error boundaries and validation for game state
- **Performance**: Use React.memo, useMemo, and useCallback for optimization in complex components
- **Cleanup**: Always clean up intervals, timeouts, and event listeners in useEffect

### Common Patterns
- **Game state transitions**: map → setup → battle → victory/defeat → loot
- **Beast selection**: Ordered list maintained in localStorage for consistent team composition
- **Experience distribution**: Team-wide XP sharing with individual level calculations
- **Animation timing**: Coordinate battle animations with state updates using setTimeout
- **Sound management**: Conditional sound playback based on user preferences

## Critical Files to Understand
1. **`src/components/Adventure/Adventure.tsx`** - Main combat system (1800+ lines)
2. **`src/types/game.ts`** - Core type definitions for all game entities
3. **`src/hooks/useBeastStats.ts`** - Beast stat management and aging logic
4. **`src/App.tsx`** - Main application flow and screen management
5. **`src/contexts/InventoryContext.tsx`** - Global inventory state management

This is a sophisticated game with RPG-depth mechanics. Always consider the interconnected nature of beast stats, combat calculations, and user progression when making changes.
