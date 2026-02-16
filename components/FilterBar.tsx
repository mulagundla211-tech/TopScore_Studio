import React, { useState, useRef, useEffect } from 'react';
import { Filters } from '../types';

interface FilterBarProps {
  allCategories: string[];
  allSubCategories: string[];
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

const MultiSelect: React.FC<{
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  disabled?: boolean;
}> = ({ label, options, selected, onChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAllSelected = selected.length === 0;

  const handleToggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((s) => s !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  const handleSelectAll = () => {
    onChange([]);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`flex-1 min-w-[200px] sm:min-w-[240px] ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">
        {label}
      </label>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between gap-2 p-3 bg-white border rounded-xl min-h-[48px] transition-all text-left ${
            isOpen ? 'border-indigo-500 ring-2 ring-indigo-500/10' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex flex-wrap gap-1 items-center overflow-hidden">
            {isAllSelected ? (
              <span className="text-sm text-slate-400 font-medium italic">All Selected</span>
            ) : (
              <div className="flex gap-1 overflow-hidden">
                <span className="bg-indigo-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-lg whitespace-nowrap">
                  {selected.length} Selected
                </span>
                <span className="text-xs text-slate-500 truncate max-w-[120px]">
                  {selected.join(', ')}
                </span>
              </div>
            )}
          </div>
          <svg className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
            <div 
              onClick={handleSelectAll}
              className={`px-4 py-3 text-sm cursor-pointer hover:bg-slate-50 border-b border-slate-100 flex items-center justify-between font-semibold ${selected.length === 0 ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-600'}`}
            >
              <span>All {label}s</span>
              {selected.length === 0 && <span className="text-indigo-600 font-bold">✓</span>}
            </div>
            {options.length > 0 ? (
              options.map((opt) => (
                <div
                  key={opt}
                  onClick={() => handleToggle(opt)}
                  className={`px-4 py-3 text-sm cursor-pointer hover:bg-slate-50 flex items-center justify-between border-b border-slate-50 last:border-0 ${selected.includes(opt) ? 'text-indigo-600 bg-indigo-50/50 font-medium' : 'text-slate-600'}`}
                >
                  <span className="truncate pr-4">{opt}</span>
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selected.includes(opt) ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'}`}>
                    {selected.includes(opt) && <span className="text-[10px] font-bold leading-none">✓</span>}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-xs text-slate-400 italic text-center">No options available</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const FilterBar: React.FC<FilterBarProps> = ({
  allCategories,
  allSubCategories,
  filters,
  onFilterChange,
}) => {
  const handleCategoryChange = (selected: string[]) => {
    onFilterChange({
      ...filters,
      categories: selected,
      subCategories: [], 
    });
  };

  const handleSubCategoryChange = (selected: string[]) => {
    onFilterChange({
      ...filters,
      subCategories: selected,
    });
  };

  const clearAll = () => {
    onFilterChange({
      categories: [],
      subCategories: [],
    });
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-end mb-8">
      <MultiSelect
        label="Category"
        options={allCategories}
        selected={filters.categories}
        onChange={handleCategoryChange}
      />

      <MultiSelect
        label="Sub Category"
        options={allSubCategories}
        selected={filters.subCategories}
        onChange={handleSubCategoryChange}
        disabled={allCategories.length === 0}
      />

      <button
        onClick={clearAll}
        className="h-[48px] px-6 text-sm font-bold text-slate-500 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded-xl transition-all border border-slate-200 hover:border-indigo-100 flex items-center gap-2 whitespace-nowrap"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Reset Filters
      </button>
    </div>
  );
};

export default FilterBar;