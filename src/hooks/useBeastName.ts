import { useGameStateContext } from './useGameStateContext';

/**
 * Dedicated hook for beast name management
 * Now uses centralized state instead of localStorage
 */
export function useBeastName() {
  const { beastNames, updateBeastName } = useGameStateContext();
  
  const getBeastName = (beastId: string): string | null => {
    return beastNames[beastId] || null;
  };

  const setBeastName = (beastId: string, name: string): void => {
    updateBeastName(beastId, name);
  };

  return {
    getBeastName,
    setBeastName
  };
}
