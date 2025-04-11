'use client';

interface Recipe {
  id: string;
  title: string;
  description: string;
  prepTime: string;
  cookTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  imageUrl: string;
}

interface ProductRecipesProps {
  productName: string;
}

export default function ProductRecipes({ productName }: ProductRecipesProps) {
  // Sample recipes based on product name
  const getRecipes = (): Recipe[] => {
    // This would ideally come from an API or database
    const commonRecipes: Recipe[] = [
      {
        id: '1',
        title: 'Healthy Trail Mix',
        description: 'A nutritious mix of nuts, seeds, and dried fruits for a quick energy boost.',
        prepTime: '10 mins',
        cookTime: '0 mins',
        difficulty: 'Easy',
        imageUrl: '/images/products/trail-mix.jpg'
      },
      {
        id: '2',
        title: 'Homemade Granola',
        description: 'Crunchy, sweet, and customizable granola perfect for breakfast or snacking.',
        prepTime: '15 mins',
        cookTime: '25 mins',
        difficulty: 'Medium',
        imageUrl: '/images/products/almonds.jpg'
      }
    ];

    // Product-specific recipes
    if (productName.toLowerCase().includes('walnut')) {
      return [
        {
          id: '3',
          title: 'Walnut Banana Bread',
          description: 'Moist banana bread loaded with crunchy walnuts for a perfect breakfast or snack.',
          prepTime: '15 mins',
          cookTime: '60 mins',
          difficulty: 'Easy',
          imageUrl: '/images/products/walnuts.jpg'
        },
        {
          id: '4',
          title: 'Maple Walnut Salad',
          description: 'Fresh greens with maple-glazed walnuts, goat cheese, and a light vinaigrette.',
          prepTime: '10 mins',
          cookTime: '5 mins',
          difficulty: 'Easy',
          imageUrl: '/images/products/cashews.jpg'
        },
        ...commonRecipes
      ];
    } else if (productName.toLowerCase().includes('almond')) {
      return [
        {
          id: '5',
          title: 'Almond Butter',
          description: 'Homemade creamy almond butter without additives or preservatives.',
          prepTime: '5 mins',
          cookTime: '15 mins',
          difficulty: 'Easy',
          imageUrl: '/images/products/almonds.jpg'
        },
        {
          id: '6',
          title: 'Almond Crusted Chicken',
          description: 'Tender chicken breasts with a crunchy almond crust, baked to perfection.',
          prepTime: '20 mins',
          cookTime: '25 mins',
          difficulty: 'Medium',
          imageUrl: '/images/products/cashews.jpg'
        },
        ...commonRecipes
      ];
    } else if (productName.toLowerCase().includes('cashew')) {
      return [
        {
          id: '7',
          title: 'Cashew Curry',
          description: 'Creamy and flavorful curry with cashews, vegetables, and aromatic spices.',
          prepTime: '15 mins',
          cookTime: '30 mins',
          difficulty: 'Medium',
          imageUrl: '/images/products/cashews.jpg'
        },
        {
          id: '8',
          title: 'Cashew Cheese',
          description: 'Dairy-free cheese alternative made from soaked cashews, perfect for vegans.',
          prepTime: '10 mins (plus soaking time)',
          cookTime: '0 mins',
          difficulty: 'Medium',
          imageUrl: '/images/products/cashews.jpg'
        },
        ...commonRecipes
      ];
    } else {
      // Default recipes for other products
      return commonRecipes;
    }
  };

  const recipes = getRecipes();

  // Ensure we always have 4 recipes
  const ensureFourRecipes = (recipes: Recipe[]): Recipe[] => {
    if (recipes.length >= 4) return recipes.slice(0, 4);

    // Add generic recipes if we don't have enough
    const genericRecipes: Recipe[] = [
      {
        id: 'generic-1',
        title: `${productName} Energy Bites`,
        description: 'Quick and easy no-bake energy bites perfect for a healthy snack on the go.',
        prepTime: '15 mins',
        cookTime: '0 mins',
        difficulty: 'Easy',
        imageUrl: 'https://images.unsplash.com/photo-1490567674331-72de84996c6c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'generic-2',
        title: `${productName} Breakfast Bowl`,
        description: 'A nutritious breakfast bowl with yogurt, honey, and fresh fruits.',
        prepTime: '5 mins',
        cookTime: '0 mins',
        difficulty: 'Easy',
        imageUrl: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'generic-3',
        title: `${productName} Smoothie`,
        description: 'Refreshing and nutritious smoothie packed with vitamins and minerals.',
        prepTime: '5 mins',
        cookTime: '0 mins',
        difficulty: 'Easy',
        imageUrl: 'https://images.unsplash.com/photo-1553530666-ba11a90a0868?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'generic-4',
        title: `${productName} Salad`,
        description: 'A refreshing salad with mixed greens, avocado, and a light dressing.',
        prepTime: '10 mins',
        cookTime: '0 mins',
        difficulty: 'Easy',
        imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
      }
    ];

    return [...recipes, ...genericRecipes].slice(0, 4);
  };

  const displayRecipes = ensureFourRecipes(recipes);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayRecipes.map((recipe) => (
          <div key={recipe.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative h-40">
              <img
                src={recipe.imageUrl}
                alt={recipe.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 bg-gradient-to-t from-black/70 to-transparent w-full p-3">
                <h4 className="text-white font-medium text-sm">{recipe.title}</h4>
              </div>
            </div>
            <div className="p-3">
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{recipe.description}</p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded-full">
                  <i className="fas fa-clock mr-1"></i> {recipe.prepTime}
                </span>
                <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded-full">
                  <i className="fas fa-fire mr-1"></i> {recipe.cookTime}
                </span>
              </div>
              <button className="mt-3 text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center">
                View Recipe <i className="fas fa-arrow-right ml-1 text-xs"></i>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
