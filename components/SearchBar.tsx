import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder = 'Buscar productos...' }) => {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-14 pr-14 py-5 bg-white rounded-[2rem] font-bold outline-none border-2 border-transparent focus:border-[#1a2f1c] transition-all shadow-sm"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1a2f1c] transition-colors"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
};
