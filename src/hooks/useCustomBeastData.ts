import { useGameStateContext } from './useGameStateContext';

/**
 * Dedicated hook for custom beast data management
 * Now uses centralized state instead of localStorage
 */
export function useCustomBeastData() {
  const { customBeasts, updateCustomBeast } = useGameStateContext();
  
  const getCustomBeastData = (beastId: string): unknown => {
    return customBeasts[beastId] || null;
  };

  const setCustomBeastData = (beastId: string, beastData: unknown): void => {
    updateCustomBeast(beastId, beastData);
  };

  return {
    getCustomBeastData,
    setCustomBeastData
  };
}
