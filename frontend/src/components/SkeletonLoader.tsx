import React from 'react';

export const TaskCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 skeleton"></div>
          <div className="h-4 bg-gray-200 rounded w-full skeleton"></div>
        </div>
      </div>
      
      <div className="flex gap-2 mb-4">
        <div className="h-6 bg-gray-200 rounded-full w-20 skeleton"></div>
        <div className="h-6 bg-gray-200 rounded-full w-20 skeleton"></div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="h-4 bg-gray-200 rounded w-32 skeleton"></div>
        <div className="h-8 bg-gray-200 rounded w-16 skeleton"></div>
      </div>
    </div>
  );
};

export const TaskListSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <TaskCardSkeleton key={index} />
      ))}
    </div>
  );
};

