'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import { Plus, FileText } from 'lucide-react';
import { FicheCard } from '@/components/fiches/FicheCard';

interface Classeur {
  id: string;
  titre: string;
}

interface Phase {
  id: string;
  titre: string;
  duree: number | null;
  description: unknown;
}

interface Fiche {
  id: string;
  titre: string;
  sequenceId: string | null;
  classeurId: string | null;
  ordre: number;
  objectifs: string | null;
  materiels: string[];
  disciplineIds: string[];
  domaineIds: string[];
  sousDomainIds: string[];
  phases: Phase[];
}

interface FichesGlobalesClientProps {
  classeurs: Classeur[];
  fichesByClasseur: { classeur: Classeur; fiches: Fiche[] }[];
}

export function FichesGlobalesClient({ classeurs, fichesByClasseur }: FichesGlobalesClientProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [newTitre, setNewTitre] = useState('');
  const [newClasseurId, setNewClasseurId] = useState(classeurs[0]?.id ?? '');

  const createStandalone = trpc.fiche.createStandalone.useMutation({
    onSuccess: () => {
      setNewTitre('');
      setShowForm(false);
      router.refresh();
    },
  });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitre.trim() || !newClasseurId) return;
    createStandalone.mutate({ titre: newTitre.trim(), classeurId: newClasseurId });
  }

  const invalidate = () => router.refresh();

  if (classeurs.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p className="text-lg">Aucun classeur disponible.</p>
        <p className="text-sm mt-1">
          <a href="/classeurs" className="text-blue-600 hover:underline">Créez d'abord un classeur</a> pour pouvoir ajouter des fiches.
        </p>
      </div>
    );
  }

  const totalFiches = fichesByClasseur.reduce((sum, g) => sum + g.fiches.length, 0);

  return (
    <div className="space-y-8">
      {/* Formulaire de création */}
      {showForm ? (
        <form onSubmit={handleCreate} className="bg-white border border-blue-200 rounded-lg p-4 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">Nouvelle fiche de préparation</h2>
          <div className="flex gap-3">
            <input
              autoFocus
              type="text"
              placeholder="Titre de la séance…"
              className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={newTitre}
              onChange={(e) => setNewTitre(e.target.value)}
            />
            <select
              className="border border-gray-300 rounded px-3 py-2 text-sm bg-white"
              value={newClasseurId}
              onChange={(e) => setNewClasseurId(e.target.value)}
            >
              {classeurs.map((c) => (
                <option key={c.id} value={c.id}>{c.titre}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => { setShowForm(false); setNewTitre(''); }}
              className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!newTitre.trim() || createStandalone.isPending}
              className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Créer
            </button>
          </div>
        </form>
      ) : (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> Nouvelle fiche
          </button>
        </div>
      )}

      {/* Liste vide */}
      {totalFiches === 0 && !showForm && (
        <div className="text-center py-16 text-gray-400">
          <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg">Aucune fiche autonome pour l'instant.</p>
          <p className="text-sm mt-1">Créez une fiche pour commencer à préparer une séance.</p>
        </div>
      )}

      {/* Fiches groupées par classeur */}
      {fichesByClasseur.map(({ classeur, fiches }) =>
        fiches.length === 0 ? null : (
          <section key={classeur.id}>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {classeur.titre}
            </h2>
            <div className="space-y-4">
              {fiches.map((fiche) => (
                <FicheCard
                  key={fiche.id}
                  fiche={fiche}
                  disciplineOptions={[]}
                  domaineOptions={[]}
                  sousDomainOptions={[]}
                  onInvalidate={invalidate}
                />
              ))}
            </div>
          </section>
        ),
      )}
    </div>
  );
}
