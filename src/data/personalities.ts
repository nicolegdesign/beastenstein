export interface Personality {
  name: string;
  statModifiers: {
    attack?: number;
    defense?: number;
    speed?: number;
    magic?: number;
  };
}

// Personality definitions with stat modifiers
export const PERSONALITIES: Personality[] = [
  // Attack +2
{ name: "Ferocious", statModifiers: { attack: 2 } },
{ name: "Reckless", statModifiers: { attack: 2 } },

// Attack +1
{ name: "Brave", statModifiers: { attack: 1 } },
{ name: "Wild", statModifiers: { attack: 1 } },
{ name: "Proud", statModifiers: { attack: 1 } },
{ name: "Fearless", statModifiers: { attack: 1 } },
{ name: "Spiteful", statModifiers: { attack: 1 } },

// Defense +2
{ name: "Protective", statModifiers: { defense: 2 } },
{ name: "Heroic", statModifiers: { defense: 2 } },

// Defense +1
{ name: "Loyal", statModifiers: { defense: 1 } },
{ name: "Grumpy", statModifiers: { defense: 1 } },
{ name: "Tough", statModifiers: { defense: 1 } },

// Magic +2
{ name: "Mysterious", statModifiers: { magic: 2 } },
{ name: "Wise", statModifiers: { magic: 2 } },

// Magic +1
{ name: "Clever", statModifiers: { magic: 1 } },
{ name: "Cunning", statModifiers: { magic: 1 } },
{ name: "Curious", statModifiers: { magic: 1 } },
{ name: "Charming", statModifiers: { magic: 1 } },
{ name: "Eccentric", statModifiers: { magic: 1 } },

// Speed +2
{ name: "Swift", statModifiers: { speed: 2 } },
{ name: "Sneaky", statModifiers: { speed: 2 } },

// Speed +1
{ name: "Shy", statModifiers: { speed: 1 } },
{ name: "Playful", statModifiers: { speed: 1 } },
{ name: "Jumpy", statModifiers: { speed: 1 } },
{ name: "Joyful", statModifiers: { speed: 1 } },
{ name: "Mischievous", statModifiers: { speed: 1 } },
{ name: "Anxious", statModifiers: { speed: 1 } },

// No stat change
{ name: "Gentle", statModifiers: {} },
{ name: "Greedy", statModifiers: {} },
{ name: "Moody", statModifiers: {} },
{ name: "Lazy", statModifiers: {} },

];

// Function to get a random personality
export const getRandomPersonality = (): Personality => {
  const randomIndex = Math.floor(Math.random() * PERSONALITIES.length);
  return PERSONALITIES[randomIndex];
};

// Function to get the default "Brave" personality
export const getDefaultPersonality = (): Personality => {
  return PERSONALITIES.find(p => p.name === "Brave") || PERSONALITIES[0];
};
