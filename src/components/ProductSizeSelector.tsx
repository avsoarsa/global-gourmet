'use client';

import { useState } from 'react';

interface SizeOption {
  id: string;
  label: string;
  weight: string;
  price: number;
  stock: number;
}

interface ProductSizeSelectorProps {
  basePrice: number;
  onSizeChange: (option: SizeOption) => void;
  initialSize?: string;
}

export default function ProductSizeSelector({ basePrice, onSizeChange, initialSize = 'medium' }: ProductSizeSelectorProps) {
  const [selectedSize, setSelectedSize] = useState(initialSize);
  
  const sizeOptions: SizeOption[] = [
    {
      id: 'small',
      label: 'Small Pack',
      weight: '250g',
      price: basePrice * 0.5,
      stock: 50
    },
    {
      id: 'medium',
      label: 'Medium Pack',
      weight: '500g',
      price: basePrice,
      stock: 35
    },
    {
      id: 'large',
      label: 'Large Pack',
      weight: '1kg',
      price: basePrice * 1.8,
      stock: 20
    },
    {
      id: 'bulk',
      label: 'Bulk Pack',
      weight: '5kg',
      price: basePrice * 8,
      stock: 10
    }
  ];

  const handleSizeChange = (sizeId: string) => {
    setSelectedSize(sizeId);
    const selectedOption = sizeOptions.find(option => option.id === sizeId);
    if (selectedOption) {
      onSizeChange(selectedOption);
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-gray-700 mb-2 font-medium">
        Select Size
      </label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {sizeOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => handleSizeChange(option.id)}
            className={`border rounded-md p-3 text-center transition-all ${
              selectedSize === option.id
                ? 'border-amber-600 bg-amber-50 text-amber-600'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="font-medium">{option.label}</div>
            <div className="text-sm text-gray-500">{option.weight}</div>
            <div className="mt-1 font-bold">${option.price.toFixed(2)}</div>
            <div className="text-xs text-gray-500 mt-1">
              {option.stock > 0 ? `${option.stock} available` : 'Out of stock'}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
