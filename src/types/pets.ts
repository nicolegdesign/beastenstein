export interface BeastConfig {
  id: string;
  name: string;
  images: {
    normal: string;
    happy: string;
    sad: string;
    rest: string;
  };
}

export const BEASTS: BeastConfig[] = [
  {
    id: 'emi',
    name: 'Emi',
    images: {
      normal: './images/pet-normal.png',
      happy: './images/pet-happy.png',
      sad: './images/pet-sad.png',
      rest: './images/pet-rest.png',
    },
  },
  {
    id: 'hobbes',
    name: 'Hobbes', 
    images: {
      normal: './images/pet2-normal.png',
      happy: './images/pet2-happy.png',
      sad: './images/pet2-sad.png',
      rest: './images/pet2-rest.png',
    },
  },
];

export const getBeastById = (id: string): BeastConfig | undefined => {
  return BEASTS.find(beast => beast.id === id);
};
