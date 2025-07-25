import type { BattleBeast, CombatState } from '../types/combat';
import { CombatEngine } from './CombatEngine';

export class TurnManager {
  /**
   * Get the current beast whose turn it is
   */
  static getCurrentTurnBeast(state: CombatState): BattleBeast | null {
    if (state.turnOrder.length === 0 || state.currentTurnIndex >= state.turnOrder.length) {
      return null;
    }
    
    const currentBeastId = state.turnOrder[state.currentTurnIndex];
    const allBeasts = [...state.playerBeasts, ...state.opponentBeasts];
    return allBeasts.find(beast => beast.id === currentBeastId && !beast.isDefeated) || null;
  }

  /**
   * Check if it's currently a player's turn
   */
  static isPlayerTurn(state: CombatState): boolean {
    const currentBeast = TurnManager.getCurrentTurnBeast(state);
    return currentBeast ? state.playerBeasts.some(beast => beast.id === currentBeast.id) : false;
  }

  /**
   * Advance to the next turn
   */
  static advanceTurn(state: CombatState): CombatState {
    let newTurnIndex = state.currentTurnIndex + 1;
    let newRound = state.currentRound;
    let newTurnOrder = state.turnOrder;

    // If we've gone through all beasts in the turn order, start a new round
    if (newTurnIndex >= state.turnOrder.length) {
      newTurnIndex = 0;
      newRound = state.currentRound + 1;
      // Recalculate turn order in case beasts have been defeated or speed has changed
      newTurnOrder = CombatEngine.calculateTurnOrder(state.playerBeasts, state.opponentBeasts);
      
      console.log(`Starting round ${newRound}`);
      
      // If turn order is empty (all beasts defeated), battle should end
      if (newTurnOrder.length === 0) {
        return state; // Don't advance turn if battle is over
      }
    }

    // Skip defeated beasts
    while (newTurnIndex < newTurnOrder.length) {
      const nextBeastId = newTurnOrder[newTurnIndex];
      const allBeasts = [...state.playerBeasts, ...state.opponentBeasts];
      const nextBeast = allBeasts.find(beast => beast.id === nextBeastId);
      
      if (nextBeast && !nextBeast.isDefeated) {
        break; // Found a valid beast for the next turn
      }
      
      newTurnIndex++;
    }

    // If we still don't have a valid turn, start a new round
    if (newTurnIndex >= newTurnOrder.length) {
      newTurnIndex = 0;
      newRound++;
      newTurnOrder = CombatEngine.calculateTurnOrder(state.playerBeasts, state.opponentBeasts);
    }

    const newState = {
      ...state,
      currentTurnIndex: newTurnIndex,
      currentRound: newRound,
      turnOrder: newTurnOrder
    };

    const currentBeast = TurnManager.getCurrentTurnBeast(newState);
    console.log(`Turn ${newTurnIndex + 1}: ${currentBeast?.customBeast.name || 'Unknown'} (${TurnManager.isPlayerTurn(newState) ? 'Player' : 'AI'})`);

    return newState;
  }

  /**
   * Update cooldowns and status effects for all beasts at the end of a turn
   */
  static updateTurnEffects(state: CombatState): CombatState {
    return {
      ...state,
      playerBeasts: CombatEngine.updateCooldowns(state.playerBeasts),
      opponentBeasts: CombatEngine.updateCooldowns(state.opponentBeasts)
    };
  }
}
