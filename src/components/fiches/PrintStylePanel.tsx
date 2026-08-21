'use client';

import { useState } from 'react';
import { Printer } from 'lucide-react';

interface PrintOptions {
  orientation: 'portrait' | 'landscape';
  couleur: string;
  police: string;
}

export function PrintStylePanel({ onChange }: { onChange: (opts: PrintOptions) => void }) {
  const [opts, setOpts] = useState<PrintOptions>({
    orientation: 'portrait',
    couleur: '#1e3a8a',
    police: 'sans-serif',
  });

  const update = (partial: Partial<PrintOptions>) => {
    const next = { ...opts, ...partial };
    setOpts(next);
    onChange(next);
  };

  return (
    <div className="print:hidden bg-white border border-gray-200 rounded-lg p-4 mb-6 flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">Orientation</label>
        <select
          className="border border-gray-300 rounded px-2 py-1 text-sm"
          value={opts.orientation}
          onChange={(e) => update({ orientation: e.target.value as 'portrait' | 'landscape' })}
        >
          <option value="portrait">Portrait</option>
          <option value="landscape">Paysage</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">Couleur principale</label>
        <input
          type="color"
          className="h-8 w-10 rounded border border-gray-300 cursor-pointer"
          value={opts.couleur}
          onChange={(e) => update({ couleur: e.target.value })}
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">Police</label>
        <select
          className="border border-gray-300 rounded px-2 py-1 text-sm"
          value={opts.police}
          onChange={(e) => update({ police: e.target.value })}
        >
          <option value="sans-serif">Sans-serif</option>
          <option value="serif">Serif</option>
          <option value="Georgia, serif">Georgia</option>
          <option value="'Courier New', monospace">Monospace</option>
        </select>
      </div>
      <button
        onClick={() => window.print()}
        className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 text-white text-sm rounded-md hover:bg-blue-800"
      >
        <Printer className="h-4 w-4" /> Imprimer
      </button>
    </div>
  );
}
