import { supabase } from './supabase';

export const seedGiftBoxes = async () => {
  try {
    // Check if gift boxes already exist
    const { data: existingBoxes, error: checkError } = await supabase
      .from('gift_boxes')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('Error checking for existing gift boxes:', checkError);
      return;
    }

    // If gift boxes already exist, don't seed
    if (existingBoxes && existingBoxes.length > 0) {
      console.log('Gift boxes already exist, skipping seed');
      return;
    }

    // Seed gift boxes
    const giftBoxes = [
      {
        name: 'Gourmet Delight Box',
        description: 'A carefully curated selection of our finest dry fruits and spices, perfect for gifting.',
        base_price: 49.99,
        image_url: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=735&q=80',
        is_customizable: true
      },
      {
        name: 'Wellness Package',
        description: 'Organic superfoods and sprouts for health-conscious individuals.',
        base_price: 59.99,
        image_url: 'https://images.unsplash.com/photo-1601493700518-42b241a914d2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
        is_customizable: true
      },
      {
        name: 'Corporate Gift Hamper',
        description: 'Premium selection for corporate gifting with customizable branding options.',
        base_price: 99.99,
        image_url: 'https://images.unsplash.com/photo-1600348759200-5b94753c5a4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80',
        is_customizable: true
      }
    ];

    const { error: insertError } = await supabase
      .from('gift_boxes')
      .insert(giftBoxes);

    if (insertError) {
      console.error('Error seeding gift boxes:', insertError);
      return;
    }

    console.log('Gift boxes seeded successfully');
  } catch (error) {
    console.error('Unexpected error seeding gift boxes:', error);
  }
};
