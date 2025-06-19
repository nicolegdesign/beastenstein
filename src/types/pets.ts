export interface PetConfig {
  id: string;
  name: string;
  images: {
    normal: string;
    happy: string;
    sad: string;
    rest: string;
  };
}

export const PETS: PetConfig[] = [
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

export const getPetById = (id: string): PetConfig | undefined => {
  return PETS.find(pet => pet.id === id);
};
