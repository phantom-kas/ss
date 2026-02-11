import React from 'react';

const Splash: React.FC = () => {
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
      <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
        Loading...
      </p>
    </div>
  );
};

export default Splash;
