import { seedGiftBoxes } from './seed-gift-boxes';

export const initializeApp = async () => {
  try {
    // Seed gift boxes
    await seedGiftBoxes();
    
    // Add more initialization steps here as needed
    
    console.log('App initialization completed');
  } catch (error) {
    console.error('Error initializing app:', error);
  }
};
