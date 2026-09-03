import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const CustomSelect = ({
  value,
  onChange,
  options = [],
  placeholder = 'Select option...',
  className = '',
  menuClassName = '',
  size = 'md',
  disabled = false,
  align = 'left' // 'left' | 'right'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Normalize options to { value, label, icon, color, badge }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'string' || typeof opt === 'number') {
      return { value: opt, label: opt.toString() };
    }
    return opt;
  });

  const selectedOption = normalizedOptions.find((o) => o.value === value) || null;

  const sizeClasses = {
    sm: 'py-1.5 px-3 text-xs',
    md: 'py-2 px-3.5 text-xs font-semibold',
    lg: 'py-2.5 px-4 text-sm font-semibold'
  };

  return (
    <div className="relative inline-block text-left w-full sm:w-auto" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between space-x-2 bg-white hover:bg-slate-50/80 active:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-xl transition-all duration-150 shadow-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 ${sizeClasses[size] || sizeClasses.md} ${
          isOpen ? 'ring-2 ring-purple-500/20 border-purple-500 shadow-sm' : ''
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      >
        <span className="flex items-center space-x-2 truncate">
          {selectedOption?.icon && (
            <span className="flex-shrink-0">{selectedOption.icon}</span>
          )}
          <span className={`truncate ${selectedOption ? 'text-slate-800 font-bold' : 'text-slate-400 font-normal'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'rotate-180 text-purple-600' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} mt-1.5 min-w-[170px] w-full max-h-64 overflow-y-auto bg-white/95 backdrop-blur-md rounded-xl p-1.5 shadow-2xl border border-slate-200/90 z-50 animate-in fade-in zoom-in-95 duration-150 ${menuClassName}`}
        >
          {normalizedOptions.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 text-left cursor-pointer ${
                  isSelected
                    ? 'bg-purple-50 text-purple-900 font-bold'
                    : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center space-x-2 truncate mr-2">
                  {opt.icon && <span className="flex-shrink-0">{opt.icon}</span>}
                  <span className="truncate">{opt.label}</span>
                  {opt.badge && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 font-bold">
                      {opt.badge}
                    </span>
                  )}
                </div>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-purple-600 flex-shrink-0 ml-1.5" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
