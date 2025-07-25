/**
 * Dedicated hook for custom beast data management
 * Currently uses localStorage but should eventually be moved to centralized state
 */
export function useCustomBeastData() {
  const getCustomBeastData = (beastId: string): unknown => {
    try {
      const customBeastData = localStorage.getItem(`customBeast_${beastId}`);
      return customBeastData ? JSON.parse(customBeastData) : null;
    } catch (error) {
      console.warn(`Failed to load custom beast data for ${beastId}:`, error);
      return null;
    }
  };

  const setCustomBeastData = (beastId: string, beastData: unknown): void => {
    try {
      localStorage.setItem(`customBeast_${beastId}`, JSON.stringify(beastData));
    } catch (error) {
      console.error(`Failed to save custom beast data for ${beastId}:`, error);
    }
  };

  return {
    getCustomBeastData,
    setCustomBeastData
  };
}
