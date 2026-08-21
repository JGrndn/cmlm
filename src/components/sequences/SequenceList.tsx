'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import type { RouterOutputs } from '@/lib/trpc/types';
import { Plus, Pencil, Trash2, ChevronRight } from 'lucide-react';
import { SequenceSlideOver } from './SequenceSlideOver';

type Sequence = RouterOutputs['sequence']['list'][0];

export function SequenceList({
  matiereId,
  classeurId,
  initialSequences,
}: {
  matiereId: string;
  classeurId: string;
  initialSequences: Sequence[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitre, setEditTitre] = useState('');
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const utils = trpc.useUtils();

  const { data: sequences = initialSequences } = trpc.sequence.list.useQuery(
    { matiereId },
    { initialData: initialSequences },
  );

  const updateMutation = trpc.sequence.update.useMutation({
    onSuccess: () => { utils.sequence.list.invalidate(); setEditingId(null); },
  });
  const deleteMutation = trpc.sequence.delete.useMutation({
    onSuccess: () => utils.sequence.list.invalidate(),
  });

  return (
    <div>
      <ul className="space-y-2 mb-4">
        {sequences.map((s) => (
          <li key={s.id} className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3">
            {editingId === s.id ? (
              <input
                autoFocus
                className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                value={editTitre}
                onChange={(e) => setEditTitre(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') updateMutation.mutate({ id: s.id, titre: editTitre });
                  if (e.key === 'Escape') setEditingId(null);
                }}
              />
            ) : (
              <div className="flex-1 min-w-0">
                <span className="font-medium text-gray-900">{s.titre}</span>
                {s.periode && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{s.periode}</span>}
                <span className="ml-2 text-xs text-gray-400">{s._count.seances} séance{s._count.seances !== 1 ? 's' : ''}</span>
              </div>
            )}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => { setEditingId(s.id); setEditTitre(s.titre); }} className="p-1 text-gray-400 hover:text-blue-600 rounded">
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => { if (confirm('Supprimer cette séquence ?')) deleteMutation.mutate({ id: s.id }); }} className="p-1 text-gray-400 hover:text-red-600 rounded">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <a href={`/classeurs/${classeurId}/matieres/${matiereId}/sequences/${s.id}`} className="p-1 text-gray-400 hover:text-blue-600 rounded">
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
          <Plus className="h-4 w-4" /> Nouvelle séquence
        </button>
      </div>
      <SequenceSlideOver
        matiereId={matiereId}
        isOpen={isSlideOverOpen}
        onClose={() => setIsSlideOverOpen(false)}
        onSuccess={() => utils.sequence.list.invalidate()}
      />
    </div>
  );
}
