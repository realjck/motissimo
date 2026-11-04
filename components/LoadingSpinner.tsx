
import React from 'react';

const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)] space-y-4 bg-slate-100 dark:bg-gray-900">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
    <p className="text-xl text-slate-700 dark:text-slate-300">Génération de la grille en cours...</p>
  </div>
);

export default LoadingSpinner;
