'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Plus, Trash2, Clock, Printer } from 'lucide-react';
import { ItemEditor } from '@/components/items/ItemEditor';

export interface FicheItem {
  id: string;
  duree: number | null;
  contenu: unknown;
}

export interface Fiche {
  id: string;
  titre: string;
  items: FicheItem[];
}

function computeTotalDuree(fiches: Fiche[]): number {
  let total = 0;
  for (const fiche of fiches) {
    for (const item of fiche.items) {
      total += item.duree ?? 0;
    }
  }
  return total;
}

export function FicheEditor({
  seanceId,
  seanceTitre,
  initialFiches,
  classeurId,
  matiereId,
  sequenceId,
}: {
  seanceId: string;
  seanceTitre: string;
  initialFiches: Fiche[];
  classeurId: string;
  matiereId: string;
  sequenceId: string;
}) {
  const [newFicheTitre, setNewFicheTitre] = useState('');
  const utils = trpc.useUtils();

  const query = trpc.fiche.list.useQuery(
    { seanceId },
    { initialData: initialFiches as never },
  );
  const fiches: Fiche[] = (query.data ?? initialFiches) as unknown as Fiche[];

  const createFiche = trpc.fiche.create.useMutation({
    onSuccess: () => { utils.fiche.list.invalidate(); setNewFicheTitre(''); },
  });
  const deleteFiche = trpc.fiche.delete.useMutation({
    onSuccess: () => utils.fiche.list.invalidate(),
  });

  const totalDuree = computeTotalDuree(fiches);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{seanceTitre}</h2>
        {totalDuree > 0 && (
          <span className="inline-flex items-center gap-1.5 text-sm text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
            <Clock className="h-3.5 w-3.5" /> {totalDuree} min au total
          </span>
        )}
      </div>

      <div className="space-y-6">
        {fiches.map((fiche) => (
          <div key={fiche.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h3 className="font-medium text-gray-800">{fiche.titre}</h3>
              <div className="flex items-center gap-2">
                <a
                  href={`/classeurs/${classeurId}/matieres/${matiereId}/sequences/${sequenceId}/seances/${seanceId}/fiches/${fiche.id}/print`}
                  className="inline-flex items-center gap-1 text-xs text-blue-700 hover:text-blue-900"
                >
                  <Printer className="h-3.5 w-3.5" /> Voir la fiche
                </a>
                <button
                  onClick={() => { if (confirm('Supprimer cette fiche ?')) deleteFiche.mutate({ id: fiche.id }); }}
                  className="p-1 text-gray-400 hover:text-red-600 rounded"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {fiche.items.map((item) => (
                <ItemEditor key={item.id} item={item} ficheId={fiche.id} />
              ))}
              <AddItemButton ficheId={fiche.id} />
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); if (newFicheTitre.trim()) createFiche.mutate({ titre: newFicheTitre, seanceId }); }}
        className="flex gap-2 mt-6"
      >
        <input
          placeholder="Titre de la nouvelle fiche…"
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
          value={newFicheTitre}
          onChange={(e) => setNewFicheTitre(e.target.value)}
        />
        <button
          type="submit"
          disabled={!newFicheTitre.trim() || createFiche.isPending}
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-700 text-white text-sm rounded-md hover:bg-blue-800 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> Ajouter une fiche
        </button>
      </form>
    </div>
  );
}

function AddItemButton({ ficheId }: { ficheId: string }) {
  const utils = trpc.useUtils();
  const createItem = trpc.item.create.useMutation({
    onSuccess: () => utils.fiche.list.invalidate(),
  });

  return (
    <button
      onClick={() => createItem.mutate({ ficheId, contenu: { type: 'doc', content: [{ type: 'paragraph' }] } })}
      disabled={createItem.isPending}
      className="flex items-center gap-1.5 text-sm text-blue-700 hover:text-blue-900 py-1"
    >
      <Plus className="h-3.5 w-3.5" /> Ajouter un item
    </button>
  );
}
