// Level data for Adventure Map
export interface LevelData {
  id: number;
  name: string;
  x: number; // Percentage position on map
  y: number; // Percentage position on map
}

export const LEVEL_DATA: LevelData[] = [
  { id: 1, name: 'Shadow Grove', x: 15, y: 85 },
  { id: 2, name: 'Misty Hollow', x: 25, y: 70 },
  { id: 3, name: 'Thornwood Path', x: 40, y: 60 },
  { id: 4, name: 'Whispering Vale', x: 55, y: 45 },
  { id: 5, name: 'Moonlit Clearing', x: 70, y: 35 },
  { id: 6, name: 'Ancient Ruins', x: 80, y: 50 },
  { id: 7, name: 'Cursed Marshland', x: 75, y: 65 },
  { id: 8, name: 'Shadowbark Forest', x: 60, y: 75 },
  { id: 9, name: 'Nightmare Woods', x: 45, y: 85 },
  { id: 10, name: 'Castle Beastenstein', x: 85, y: 15 }
];

// Helper function to get level name by ID
export const getLevelName = (levelId: number): string => {
  const level = LEVEL_DATA.find(l => l.id === levelId);
  return level ? level.name : `Level ${levelId}`;
};
