'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import type { RouterOutputs } from '@/lib/trpc/types';
import { Plus, Pencil, Trash2, ChevronRight } from 'lucide-react';
import type { Periode } from '@/generated/prisma';

const PERIODES: Periode[] = ['P1', 'P2', 'P3', 'P4', 'P5'];

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
  const [newTitre, setNewTitre] = useState('');
  const [newPeriode, setNewPeriode] = useState<Periode | ''>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitre, setEditTitre] = useState('');
  const utils = trpc.useUtils();

  const { data: sequences = initialSequences } = trpc.sequence.list.useQuery(
    { matiereId },
    { initialData: initialSequences },
  );

  const createMutation = trpc.sequence.create.useMutation({
    onSuccess: () => { utils.sequence.list.invalidate(); setNewTitre(''); setNewPeriode(''); },
  });
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

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (newTitre.trim()) createMutation.mutate({ titre: newTitre, matiereId, periode: newPeriode || undefined });
        }}
        className="flex gap-2"
      >
        <input
          placeholder="Nouvelle séquence…"
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
          value={newTitre}
          onChange={(e) => setNewTitre(e.target.value)}
        />
        <select
          className="border border-gray-300 rounded-md px-2 py-2 text-sm"
          value={newPeriode}
          onChange={(e) => setNewPeriode(e.target.value as Periode | '')}
        >
          <option value="">Période</option>
          {PERIODES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <button
          type="submit"
          disabled={!newTitre.trim() || createMutation.isPending}
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-700 text-white text-sm rounded-md hover:bg-blue-800 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> Ajouter
        </button>
      </form>
    </div>
  );
}
