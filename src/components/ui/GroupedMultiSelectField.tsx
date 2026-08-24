'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

export interface GroupedOption {
  groupId: string;
  groupLabel: string;
  items: { value: string; label: string }[];
}

interface GroupedMultiSelectFieldProps {
  label: string;
  groups: GroupedOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
}

export function GroupedMultiSelectField({
  label,
  groups,
  selectedIds,
  onChange,
  placeholder = 'Sélectionner…',
}: GroupedMultiSelectFieldProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const allItems = groups.flatMap((g) => g.items);
  const selectedItems = allItems.filter((item) => selectedIds.includes(item.value));
  const visibleGroups = groups.filter((g) => g.items.length > 0);

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((v) => v !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const remove = (id: string) => onChange(selectedIds.filter((v) => v !== id));

  return (
    <div className="mb-4" ref={ref}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between rounded-md border border-gray-300 px-3 py-2 text-sm bg-white text-left shadow-sm hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <span className={selectedIds.length === 0 ? 'text-gray-400' : 'text-gray-700'}>
            {selectedIds.length === 0
              ? placeholder
              : `${selectedIds.length} sélectionné${selectedIds.length > 1 ? 's' : ''}`}
          </span>
          <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
        </button>

        {open && (
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-64 overflow-y-auto">
            {visibleGroups.length === 0 ? (
              <p className="px-3 py-2 text-sm text-gray-400 italic">Aucune option disponible</p>
            ) : (
              visibleGroups.map((g) => (
                <div key={g.groupId}>
                  <div className="px-3 pt-2 pb-0.5 text-xs font-semibold text-gray-400 uppercase tracking-wide bg-gray-50 sticky top-0">
                    {g.groupLabel}
                  </div>
                  {g.items.map((item) => (
                    <label
                      key={item.value}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.value)}
                        onChange={() => toggle(item.value)}
                        className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600"
                      />
                      {item.label}
                    </label>
                  ))}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selectedItems.map((item) => {
            const group = groups.find((g) => g.items.some((i) => i.value === item.value));
            return (
              <span
                key={item.value}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-200"
              >
                {group && <span className="text-blue-400">{group.groupLabel} /</span>}
                {item.label}
                <button
                  type="button"
                  onClick={() => remove(item.value)}
                  className="ml-0.5 text-blue-400 hover:text-blue-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
