'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Copy, Trash2, BookOpen, Calendar, Layers } from 'lucide-react';
import { ClasseurDuplicateModal } from './ClasseurDuplicateModal';

type ClasseurWithCounts = {
  id: string;
  titre: string;
  niveau: { code: string; label: string; cycle: { label: string } };
  anneeScolaire: { label: string };
  _count: { matieres: number };
};

export function ClasseurCard({ classeur }: { classeur: ClasseurWithCounts }) {
  const [showDuplicate, setShowDuplicate] = useState(false);
  const utils = trpc.useUtils();

  const deleteMutation = trpc.classeur.delete.useMutation({
    onSuccess: () => utils.classeur.list.invalidate(),
  });

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-900 flex-shrink-0" />
            <h3 className="font-semibold text-gray-900 truncate">{classeur.titre}</h3>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => setShowDuplicate(true)}
              className="p-1.5 text-gray-400 hover:text-blue-600 rounded transition-colors"
              title="Dupliquer"
            >
              <Copy className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                if (confirm('Supprimer ce classeur et tout son contenu ?')) {
                  deleteMutation.mutate({ id: classeur.id });
                }
              }}
              className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors"
              title="Supprimer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-1 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {classeur.anneeScolaire.label}
          </div>
          <div className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5" />
            {classeur.niveau.label} — {classeur.niveau.cycle.label}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {classeur._count.matieres} matière{classeur._count.matieres !== 1 ? 's' : ''}
          </span>
          <a
            href={`/classeurs/${classeur.id}`}
            className="text-sm font-medium text-blue-700 hover:text-blue-900"
          >
            Ouvrir →
          </a>
        </div>
      </div>

      {showDuplicate && (
        <ClasseurDuplicateModal
          classeurId={classeur.id}
          classeurTitre={classeur.titre}
          onClose={() => setShowDuplicate(false)}
        />
      )}
    </>
  );
}
