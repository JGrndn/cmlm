'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import type { RouterOutputs } from '@/lib/trpc/types';
import { Plus, Pencil, Trash2, ChevronRight } from 'lucide-react';
import { MatiereSlideOver } from './MatiereSlideOver';

type Matiere = Omit<RouterOutputs['matiere']['list'][0], 'createdAt' | 'updatedAt'> & {
  createdAt: Date | string;
  updatedAt: Date | string;
};

export function MatiereList({
  classeurId,
  cycleId,
  initialMatieres,
}: {
  classeurId: string;
  cycleId: string;
  initialMatieres: Matiere[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitre, setEditTitre] = useState('');
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const utils = trpc.useUtils();

  const { data: matieres = initialMatieres } = trpc.matiere.list.useQuery(
    { classeurId },
    { initialData: initialMatieres as RouterOutputs['matiere']['list'] },
  );

  const updateMutation = trpc.matiere.update.useMutation({
    onSuccess: () => { utils.matiere.list.invalidate(); setEditingId(null); },
  });
  const deleteMutation = trpc.matiere.delete.useMutation({
    onSuccess: () => utils.matiere.list.invalidate(),
  });

  return (
    <div>
      <ul className="space-y-2 mb-4">
        {matieres.map((m) => (
          <li key={m.id} className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3">
            {editingId === m.id ? (
              <input
                autoFocus
                className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                value={editTitre}
                onChange={(e) => setEditTitre(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') updateMutation.mutate({ id: m.id, titre: editTitre });
                  if (e.key === 'Escape') setEditingId(null);
                }}
              />
            ) : (
              <div className="flex-1 min-w-0">
                <span className="font-medium text-gray-900">{m.titre}</span>
                {m.discipline && (
                  <span className="ml-2 text-xs text-gray-400">{m.discipline.label}</span>
                )}
                <span className="ml-2 text-xs text-gray-400">{m._count.sequences} séquence{m._count.sequences !== 1 ? 's' : ''}</span>
              </div>
            )}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => { setEditingId(m.id); setEditTitre(m.titre); }}
                className="p-1 text-gray-400 hover:text-blue-600 rounded"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => { if (confirm('Supprimer cette matière ?')) deleteMutation.mutate({ id: m.id }); }}
                className="p-1 text-gray-400 hover:text-red-600 rounded"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <a href={`/classeurs/${classeurId}/matieres/${m.id}`} className="p-1 text-gray-400 hover:text-blue-600 rounded">
                <ChevronRight className="h-4 w-4" />
              </a>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex justify-end">
        <button
          onClick={() => setIsSlideOverOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-700 text-white text-sm rounded-md hover:bg-blue-800"
        >
          <Plus className="h-4 w-4" /> Nouvelle matière
        </button>
      </div>
      <MatiereSlideOver
        classeurId={classeurId}
        cycleId={cycleId}
        isOpen={isSlideOverOpen}
        onClose={() => setIsSlideOverOpen(false)}
        onSuccess={() => utils.matiere.list.invalidate()}
      />
    </div>
  );
}
