import React from 'react';

export const ProductSkeleton: React.FC = () => (
  <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 animate-pulse">
    <div className="h-52 bg-gray-200" />
    <div className="p-6 space-y-3">
      <div className="h-4 bg-gray-200 rounded-full w-3/4" />
      <div className="h-3 bg-gray-200 rounded-full w-full" />
      <div className="h-3 bg-gray-200 rounded-full w-2/3" />
      <div className="flex justify-between items-center pt-4">
        <div className="h-6 bg-gray-200 rounded-full w-20" />
        <div className="h-12 w-12 bg-gray-200 rounded-2xl" />
      </div>
    </div>
  </div>
);

export const SkeletonGrid: React.FC<{ count?: number }> = ({ count = 8 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <ProductSkeleton key={i} />
    ))}
  </div>
);
