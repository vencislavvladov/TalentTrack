import React from 'react';
import { Grid, List } from 'lucide-react';

interface ViewToggleProps {
  view: 'card' | 'list';
  onViewChange: (view: 'card' | 'list') => void;
  className?: string;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ view, onViewChange, className = "" }) => {
  return (
    <div className={`flex items-center bg-gray-100 rounded-lg p-1 ${className}`}>
      <button
        onClick={() => onViewChange('card')}
        className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all duration-200 ${
          view === 'card'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-800'
        }`}
      >
        <Grid className="h-4 w-4" />
        <span className="text-sm font-medium">Cards</span>
      </button>
      <button
        onClick={() => onViewChange('list')}
        className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all duration-200 ${
          view === 'list'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-800'
        }`}
      >
        <List className="h-4 w-4" />
        <span className="text-sm font-medium">List</span>
      </button>
    </div>
  );
};

export default ViewToggle;