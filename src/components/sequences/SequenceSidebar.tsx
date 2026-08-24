'use client';

import { trpc } from '@/lib/trpc/client';
import { ChevronDown, ChevronRight, FileText, Layers, AlignLeft } from 'lucide-react';
import { useState } from 'react';

interface Phase {
  id: string;
  titre: string;
}

interface Fiche {
  id: string;
  titre: string;
  phases: Phase[];
}

interface SequenceSidebarProps {
  sequenceId: string;
  sequenceTitre: string;
  initialFiches: Fiche[];
}

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function SequenceSidebar({ sequenceId, sequenceTitre, initialFiches }: SequenceSidebarProps) {
  const { data: fiches = initialFiches } = trpc.fiche.list.useQuery(
    { sequenceId },
    { initialData: initialFiches as never },
  );

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  function toggle(id: string) {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <nav className="sticky top-6 w-56 flex-shrink-0 select-none">
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Séquence */}
        <button
          type="button"
          onClick={() => scrollTo('sequence-top')}
          className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm font-semibold text-gray-800 bg-gray-50 border-b border-gray-200 hover:bg-gray-100 transition-colors"
        >
          <Layers className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />
          <span className="truncate">{sequenceTitre}</span>
        </button>

        {/* Séances */}
        <ul className="py-1">
          {(fiches as Fiche[]).map((fiche) => {
            const open = !collapsed[fiche.id];
            return (
              <li key={fiche.id}>
                {/* Fiche row */}
                <div className="flex items-center group">
                  <button
                    type="button"
                    onClick={() => toggle(fiche.id)}
                    className="p-1 ml-1 text-gray-400 hover:text-gray-600 flex-shrink-0"
                  >
                    {open
                      ? <ChevronDown className="h-3 w-3" />
                      : <ChevronRight className="h-3 w-3" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollTo(`fiche-${fiche.id}`)}
                    className="flex-1 flex items-center gap-1.5 px-1 py-1.5 text-left text-xs text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded mr-1 transition-colors truncate"
                  >
                    <FileText className="h-3 w-3 flex-shrink-0 text-gray-400" />
                    <span className="truncate">{fiche.titre || 'Sans titre'}</span>
                  </button>
                </div>

                {/* Phases */}
                {open && fiche.phases.length > 0 && (
                  <ul className="ml-6 border-l border-gray-100 mb-1">
                    {fiche.phases.map((phase) => (
                      <li key={phase.id}>
                        <button
                          type="button"
                          onClick={() => scrollTo(`phase-${phase.id}`)}
                          className="w-full flex items-center gap-1.5 pl-2 pr-2 py-1 text-left text-xs text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        >
                          <AlignLeft className="h-3 w-3 flex-shrink-0 text-gray-300" />
                          <span className="truncate">{phase.titre || 'Phase sans titre'}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}

          {(fiches as Fiche[]).length === 0 && (
            <li className="px-3 py-2 text-xs text-gray-400 italic">Aucune séance</li>
          )}
        </ul>
      </div>
    </nav>
  );
}
