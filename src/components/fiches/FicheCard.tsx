'use client';

import { useState, useRef, useEffect } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Plus, Trash2, Clock, ChevronDown, ChevronUp, X } from 'lucide-react';
import { PhaseEditor } from '@/components/phases/PhaseEditor';
import { MultiSelectField } from '@/components/ui/MultiSelectField';

interface Phase {
  id: string;
  titre: string;
  duree: number | null;
  description: unknown;
}

interface FicheCardProps {
  fiche: {
    id: string;
    titre: string;
    sequenceId: string | null;
    ordre: number;
    objectifs: string | null;
    materiels: string[];
    disciplineIds: string[];
    domaineIds: string[];
    sousDomainIds: string[];
    phases: Phase[];
  };
  disciplineOptions: { value: string; label: string }[];
  domaineOptions: { value: string; label: string }[];
  sousDomainOptions: { value: string; label: string }[];
  onInvalidate?: () => void;
}

export function FicheCard({ fiche, disciplineOptions, domaineOptions, sousDomainOptions, onInvalidate }: FicheCardProps) {
  const [expanded, setExpanded] = useState(true);
  const [titre, setTitre] = useState(fiche.titre);
  const [objectifs, setObjectifs] = useState(fiche.objectifs ?? '');
  const [newMateriel, setNewMateriel] = useState('');
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const utils = trpc.useUtils();

  const updateFiche = trpc.fiche.update.useMutation({
    onSuccess: () => onInvalidate ? onInvalidate() : utils.fiche.list.invalidate(),
  });
  const deleteFiche = trpc.fiche.delete.useMutation({
    onSuccess: () => onInvalidate ? onInvalidate() : utils.fiche.list.invalidate(),
  });
  const createPhase = trpc.phase.create.useMutation({
    onSuccess: () => onInvalidate ? onInvalidate() : utils.fiche.list.invalidate(),
  });

  useEffect(() => () => { if (saveTimeout.current) clearTimeout(saveTimeout.current); }, []);

  const totalDuree = fiche.phases.reduce((sum, p) => sum + (p.duree ?? 0), 0);

  function debounceUpdate(data: Parameters<typeof updateFiche.mutate>[0]) {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => updateFiche.mutate(data), 800);
  }

  function addMateriel() {
    const val = newMateriel.trim();
    if (!val) return;
    const next = [...fiche.materiels, val];
    updateFiche.mutate({ id: fiche.id, materiels: next });
    setNewMateriel('');
  }

  function removeMateriel(index: number) {
    const next = fiche.materiels.filter((_, i) => i !== index);
    updateFiche.mutate({ id: fiche.id, materiels: next });
  }

  return (
    <div id={`fiche-${fiche.id}`} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200">
        <input
          type="text"
          className="flex-1 font-medium text-gray-800 bg-transparent outline-none text-sm"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          onBlur={() => {
            if (titre !== fiche.titre && titre.trim()) updateFiche.mutate({ id: fiche.id, titre });
          }}
        />
        <div className="flex items-center gap-2 flex-shrink-0">
          {totalDuree > 0 && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              <Clock className="h-3 w-3" /> {totalDuree} min
            </span>
          )}
          <button
            onClick={() => { if (confirm('Supprimer cette séance ?')) deleteFiche.mutate({ id: fiche.id }); }}
            className="p-1 text-gray-400 hover:text-red-600 rounded"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setExpanded((v) => !v)} className="p-1 text-gray-400 hover:text-gray-600 rounded">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-4 space-y-4">
          <MultiSelectField
            label="Disciplines"
            options={disciplineOptions}
            selectedIds={fiche.disciplineIds}
            onChange={(ids) => updateFiche.mutate({ id: fiche.id, disciplineIds: ids })}
          />
          <MultiSelectField
            label="Domaines"
            options={domaineOptions}
            selectedIds={fiche.domaineIds}
            onChange={(ids) => updateFiche.mutate({ id: fiche.id, domaineIds: ids })}
          />
          <MultiSelectField
            label="Sous-domaines"
            options={sousDomainOptions}
            selectedIds={fiche.sousDomainIds}
            onChange={(ids) => updateFiche.mutate({ id: fiche.id, sousDomainIds: ids })}
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Objectifs</label>
            <textarea
              rows={3}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={objectifs}
              onChange={(e) => setObjectifs(e.target.value)}
              onBlur={() => debounceUpdate({ id: fiche.id, objectifs: objectifs || null })}
              placeholder="Objectifs de la séance…"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Matériel</label>
            <div className="space-y-1.5 mb-2">
              {fiche.materiels.map((m, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="flex-1">{m}</span>
                  <button onClick={() => removeMateriel(i)} className="p-0.5 text-gray-400 hover:text-red-500">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ajouter un élément de matériel…"
                className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm"
                value={newMateriel}
                onChange={(e) => setNewMateriel(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addMateriel(); } }}
              />
              <button
                type="button"
                onClick={addMateriel}
                disabled={!newMateriel.trim()}
                className="px-2 py-1.5 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Déroulement</label>
            <div className="space-y-2">
              {fiche.phases.map((phase) => (
                <PhaseEditor key={phase.id} phase={phase} ficheId={fiche.id} onInvalidate={onInvalidate} />
              ))}
            </div>
            <button
              type="button"
              onClick={() => createPhase.mutate({ ficheId: fiche.id })}
              disabled={createPhase.isPending}
              className="mt-3 flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:border-blue-400 transition-colors disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" /> Ajouter une phase
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
