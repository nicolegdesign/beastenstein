# Copilot Instructions for Virtual Beast Game

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is a React TypeScript virtual beast game project with the following features:

## Game Features
- Virtual beast with three stats: hunger, happiness, and energy
- Interactive feeding bowl that changes states (empty/full)
- Beast bed for resting functionality
- Background cycling through multiple environments
- Beast animations based on mood (happy, normal, sad bouncing)
- Poo cleanup mini-game with random spawning
- Tennis ball play animation
- Beast movement around the beast den
- Editable beast name with localStorage persistence

## Architecture Guidelines
- Use functional components with React hooks
- Implement TypeScript interfaces for all game state
- Use custom hooks for game logic (useGameLoop, useBeastStats, useAnimations)
- Prefer CSS modules or styled-components for styling
- Use React's useEffect for game timers and intervals
- Implement proper cleanup for intervals and timeouts

## Code Style
- Use descriptive component and hook names
- Keep components small and focused on single responsibilities
- Use proper TypeScript typing for all props and state
- Implement error boundaries for game state
- Use React.memo for performance optimization where needed
