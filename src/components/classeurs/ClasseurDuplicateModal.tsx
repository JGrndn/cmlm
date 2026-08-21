'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { X } from 'lucide-react';

export function ClasseurDuplicateModal({
  classeurId,
  classeurTitre,
  onClose,
}: {
  classeurId: string;
  classeurTitre: string;
  onClose: () => void;
}) {
  const [anneeScolaireId, setAnneeScolaireId] = useState('');
  const { data: annees } = trpc.reference.listAnnees.useQuery();
  const utils = trpc.useUtils();

  const duplicateMutation = trpc.classeur.duplicate.useMutation({
    onSuccess: () => {
      utils.classeur.list.invalidate();
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Dupliquer « {classeurTitre} »</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <label className="block text-sm font-medium text-gray-700 mb-1">Année scolaire cible</label>
        <select
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mb-4"
          value={anneeScolaireId}
          onChange={(e) => setAnneeScolaireId(e.target.value)}
        >
          <option value="">Sélectionner une année</option>
          {annees?.map((a) => (
            <option key={a.id} value={a.id}>
              {a.label}
            </option>
          ))}
        </select>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            disabled={!anneeScolaireId || duplicateMutation.isPending}
            onClick={() => duplicateMutation.mutate({ id: classeurId, anneeScolaireId })}
            className="px-4 py-2 text-sm bg-blue-700 text-white rounded-md hover:bg-blue-800 disabled:opacity-50"
          >
            {duplicateMutation.isPending ? 'Duplication…' : 'Dupliquer'}
          </button>
        </div>
      </div>
    </div>
  );
}
