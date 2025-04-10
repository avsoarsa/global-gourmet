'use client';

interface NutritionInfo {
  servingSize: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  sugar: number;
  vitamins: string[];
  minerals: string[];
}

interface ProductNutritionProps {
  nutrition: NutritionInfo | null;
}

export default function ProductNutrition({ nutrition }: ProductNutritionProps) {
  if (!nutrition) {
    return null;
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <h3 className="font-bold text-gray-800 mb-4">Nutrition Information</h3>
      
      <div className="space-y-2">
        <div className="flex justify-between border-b border-gray-100 pb-2">
          <span className="text-gray-600">Serving Size</span>
          <span className="font-medium">{nutrition.servingSize}</span>
        </div>
        
        <div className="flex justify-between border-b border-gray-100 pb-2">
          <span className="text-gray-600">Calories</span>
          <span className="font-medium">{nutrition.calories}</span>
        </div>
        
        <div className="flex justify-between border-b border-gray-100 pb-2">
          <span className="text-gray-600">Protein</span>
          <span className="font-medium">{nutrition.protein}g</span>
        </div>
        
        <div className="flex justify-between border-b border-gray-100 pb-2">
          <span className="text-gray-600">Fat</span>
          <span className="font-medium">{nutrition.fat}g</span>
        </div>
        
        <div className="flex justify-between border-b border-gray-100 pb-2">
          <span className="text-gray-600">Carbohydrates</span>
          <span className="font-medium">{nutrition.carbs}g</span>
        </div>
        
        <div className="flex justify-between border-b border-gray-100 pb-2">
          <span className="text-gray-600">Fiber</span>
          <span className="font-medium">{nutrition.fiber}g</span>
        </div>
        
        <div className="flex justify-between border-b border-gray-100 pb-2">
          <span className="text-gray-600">Sugar</span>
          <span className="font-medium">{nutrition.sugar}g</span>
        </div>
      </div>
      
      <div className="mt-4">
        <h4 className="font-medium text-gray-800 mb-2">Vitamins</h4>
        <div className="flex flex-wrap gap-2">
          {nutrition.vitamins.map((vitamin, index) => (
            <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              {vitamin}
            </span>
          ))}
        </div>
      </div>
      
      <div className="mt-4">
        <h4 className="font-medium text-gray-800 mb-2">Minerals</h4>
        <div className="flex flex-wrap gap-2">
          {nutrition.minerals.map((mineral, index) => (
            <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {mineral}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
