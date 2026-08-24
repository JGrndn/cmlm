'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { useRouter } from 'next/navigation';
import { AnneeScolaireCreateModal } from '@/components/annees/AnneeScolaireCreateModal';

export function ClasseurCreateForm() {
  const [titre, setTitre] = useState('');
  const [niveauId, setNiveauId] = useState('');
  const [anneeScolaireId, setAnneeScolaireId] = useState('');
  const [open, setOpen] = useState(false);
  const [showCreateAnnee, setShowCreateAnnee] = useState(false);
  const router = useRouter();

  const { data: niveaux } = trpc.reference.listNiveaux.useQuery();
  const { data: annees, refetch: refetchAnnees } = trpc.reference.listAnnees.useQuery();

  const createMutation = trpc.classeur.create.useMutation({
    onSuccess: (classeur) => {
      router.push(`/classeurs/${classeur.id}`);
    },
  });

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-md text-sm font-medium hover:bg-blue-800"
      >
        + Nouveau classeur
      </button>
    );
  }

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (titre && niveauId && anneeScolaireId) {
            createMutation.mutate({ titre, niveauId, anneeScolaireId });
          }
        }}
        className="bg-white border border-gray-200 rounded-lg p-4 space-y-3 max-w-md"
      >
        <h3 className="font-semibold text-gray-900">Nouveau classeur</h3>
        <input
          placeholder="Titre du classeur"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          required
        />
        <select
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          value={niveauId}
          onChange={(e) => setNiveauId(e.target.value)}
          required
        >
          <option value="">Niveau scolaire…</option>
          {niveaux?.map((n) => (
            <option key={n.id} value={n.id}>{n.label} ({n.cycle.label})</option>
          ))}
        </select>
        <div>
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            value={anneeScolaireId}
            onChange={(e) => setAnneeScolaireId(e.target.value)}
            required
          >
            <option value="">Année scolaire…</option>
            {annees?.map((a) => (
              <option key={a.id} value={a.id}>{a.label}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowCreateAnnee(true)}
            className="mt-1 text-xs text-blue-600 hover:underline"
          >
            + Créer une nouvelle année scolaire
          </button>
        </div>
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={() => setOpen(false)} className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
            Annuler
          </button>
          <button
            type="submit"
            disabled={!titre || !niveauId || !anneeScolaireId || createMutation.isPending}
            className="px-3 py-2 text-sm bg-blue-700 text-white rounded-md hover:bg-blue-800 disabled:opacity-50"
          >
            {createMutation.isPending ? 'Création…' : 'Créer'}
          </button>
        </div>
      </form>

      {showCreateAnnee && (
        <AnneeScolaireCreateModal
          onClose={() => setShowCreateAnnee(false)}
          onCreated={async (anneeId) => {
            await refetchAnnees();
            setAnneeScolaireId(anneeId);
            setShowCreateAnnee(false);
          }}
        />
      )}
    </>
  );
}
