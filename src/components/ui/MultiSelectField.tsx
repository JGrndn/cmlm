'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface MultiSelectFieldProps {
  label: string;
  options: Option[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
}

export function MultiSelectField({
  label,
  options,
  selectedIds,
  onChange,
  placeholder = 'Sélectionner…',
}: MultiSelectFieldProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((v) => v !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const selectedLabels = options.filter((o) => selectedIds.includes(o.value));

  return (
    <div className="mb-4" ref={ref}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <span className={selectedLabels.length === 0 ? 'text-gray-400' : 'text-gray-700'}>
            {selectedLabels.length === 0
              ? placeholder
              : `${selectedLabels.length} sélectionné${selectedLabels.length > 1 ? 's' : ''}`}
          </span>
          <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0 ml-1" />
        </button>

        {open && (
          <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {options.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-400">Aucune option disponible</div>
            ) : (
              options.map((o) => (
                <label
                  key={o.value}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(o.value)}
                    onChange={() => toggle(o.value)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600"
                  />
                  {o.label}
                </label>
              ))
            )}
          </div>
        )}
      </div>

      {selectedLabels.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selectedLabels.map((o) => (
            <span
              key={o.value}
              className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full"
            >
              {o.label}
              <button
                type="button"
                onClick={() => toggle(o.value)}
                className="hover:text-blue-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
