'use client';

interface NiveauOption {
  value: string;
  label: string;
  code: string;
}

interface CycleGroup {
  cycleId: string;
  cycleLabel: string;
  niveaux: NiveauOption[];
}

interface NiveauPickerProps {
  cycles: CycleGroup[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function NiveauPicker({ cycles, selectedIds, onChange }: NiveauPickerProps) {
  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((v) => v !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-2">
      {cycles.map((c) => (
        <div key={c.cycleId}>
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{c.cycleLabel}</span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {c.niveaux.map((n) => {
              const active = selectedIds.includes(n.value);
              return (
                <button
                  key={n.value}
                  type="button"
                  onClick={() => toggle(n.value)}
                  className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                    active
                      ? 'bg-blue-700 text-white border-blue-700'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-700'
                  }`}
                >
                  {n.code}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
