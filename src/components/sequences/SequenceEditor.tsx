'use client';

import { useRef, useEffect, useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Plus } from 'lucide-react';
import { FicheCard } from '@/components/fiches/FicheCard';
import { NiveauPicker } from '@/components/ui/NiveauPicker';
import { GroupedMultiSelectField } from '@/components/ui/GroupedMultiSelectField';

interface Phase {
  id: string;
  titre: string;
  duree: number | null;
  description: unknown;
}

interface Fiche {
  id: string;
  titre: string;
  sequenceId: string;
  ordre: number;
  objectifs: string | null;
  materiels: string[];
  disciplineIds: string[];
  domaineIds: string[];
  sousDomainIds: string[];
  phases: Phase[];
}

interface SousDomaine {
  value: string;
  label: string;
  domaineId: string;
  objectifs: { value: string; label: string; sousDomainId: string }[];
}

interface Domaine {
  value: string;
  label: string;
  disciplineId: string;
  sousDomaines: SousDomaine[];
}

interface Discipline {
  value: string;
  label: string;
  domaines: Domaine[];
}

interface CycleGroup {
  cycleId: string;
  cycleLabel: string;
  niveaux: { value: string; label: string; code: string }[];
}

interface ReferenceTree {
  niveauxByCycle: CycleGroup[];
  disciplines: Discipline[];
}

interface SequenceEditorProps {
  sequenceId: string;
  classeurId: string;
  matiereId: string;
  initialData: {
    id: string;
    titre: string;
    niveauIds: string[];
    periodeId: string | null;
    objectifs: string | null;
    disciplineIds: string[];
    domaineIds: string[];
    sousDomainIds: string[];
    objectifIds: string[];
    fiches: Fiche[];
    matiere: {
      classeur: { niveauId: string; anneeScolaireId: string };
      disciplineId: string | null;
    };
  };
  referenceTree: ReferenceTree;
}

export function SequenceEditor({
  sequenceId,
  classeurId,
  matiereId,
  initialData,
  referenceTree,
}: SequenceEditorProps) {
  const [titre, setTitre] = useState(initialData.titre);
  const [objectifs, setObjectifs] = useState(initialData.objectifs ?? '');
  const [niveauIds, setNiveauIds] = useState<string[]>(initialData.niveauIds);
  const [disciplineIds, setDisciplineIds] = useState<string[]>(initialData.disciplineIds);
  const [domaineIds, setDomaineIds] = useState<string[]>(initialData.domaineIds);
  const [sousDomainIds, setSousDomainIds] = useState<string[]>(initialData.sousDomainIds);
  const [objectifIds, setObjectifIds] = useState<string[]>(initialData.objectifIds);
  const [newFicheTitre, setNewFicheTitre] = useState('');
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const utils = trpc.useUtils();

  const { data: fiches = initialData.fiches } = trpc.fiche.list.useQuery(
    { sequenceId },
    { initialData: initialData.fiches as never },
  );

  const updateSeq = trpc.sequence.update.useMutation({
    onSuccess: () => utils.sequence.list.invalidate(),
  });
  const createFiche = trpc.fiche.create.useMutation({
    onSuccess: () => { utils.fiche.list.invalidate(); setNewFicheTitre(''); },
  });

  useEffect(() => () => { if (saveTimeout.current) clearTimeout(saveTimeout.current); }, []);

  function debounce(data: Parameters<typeof updateSeq.mutate>[0]) {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => updateSeq.mutate(data), 800);
  }

  // ── Flattened reference data ──────────────────────────────────────────────
  const allDomaines = useMemo(
    () => referenceTree.disciplines.flatMap((d) => d.domaines),
    [referenceTree],
  );
  const allSousDomaines = useMemo(
    () => allDomaines.flatMap((d) => d.sousDomaines),
    [allDomaines],
  );
  const allObjectifs = useMemo(
    () => allSousDomaines.flatMap((sd) => sd.objectifs),
    [allSousDomaines],
  );

  // ── Filtered options in cascade ───────────────────────────────────────────
  const filteredDomaines = useMemo(() => {
    if (disciplineIds.length === 0) return allDomaines;
    return allDomaines.filter((d) => disciplineIds.includes(d.disciplineId));
  }, [disciplineIds, allDomaines]);

  const filteredSousDomaines = useMemo(() => {
    if (domaineIds.length === 0) return filteredDomaines.flatMap((d) => d.sousDomaines);
    return allSousDomaines.filter((sd) => domaineIds.includes(sd.domaineId));
  }, [domaineIds, filteredDomaines, allSousDomaines]);

  const filteredObjectifs = useMemo(() => {
    if (sousDomainIds.length === 0) return [];
    return allObjectifs.filter((o) => sousDomainIds.includes(o.sousDomainId));
  }, [sousDomainIds, allObjectifs]);

  // ── Grouped options for dropdowns ─────────────────────────────────────────
  const domaineGroups = useMemo(
    () =>
      referenceTree.disciplines
        .map((disc) => ({
          groupId: disc.value,
          groupLabel: disc.label,
          items: filteredDomaines
            .filter((d) => d.disciplineId === disc.value)
            .map((d) => ({ value: d.value, label: d.label })),
        }))
        .filter((g) => g.items.length > 0),
    [referenceTree.disciplines, filteredDomaines],
  );

  const sousDomainGroups = useMemo(
    () =>
      filteredDomaines
        .map((dom) => ({
          groupId: dom.value,
          groupLabel: dom.label,
          items: filteredSousDomaines
            .filter((sd) => sd.domaineId === dom.value)
            .map((sd) => ({ value: sd.value, label: sd.label })),
        }))
        .filter((g) => g.items.length > 0),
    [filteredDomaines, filteredSousDomaines],
  );

  const objectifGroups = useMemo(
    () =>
      allSousDomaines
        .filter((sd) => sousDomainIds.includes(sd.value))
        .map((sd) => ({
          groupId: sd.value,
          groupLabel: sd.label,
          items: filteredObjectifs
            .filter((o) => o.sousDomainId === sd.value)
            .map((o) => ({ value: o.value, label: o.label })),
        }))
        .filter((g) => g.items.length > 0),
    [allSousDomaines, sousDomainIds, filteredObjectifs],
  );

  // ── Cascade cleanup ───────────────────────────────────────────────────────
  function handleDisciplineChange(ids: string[]) {
    setDisciplineIds(ids);
    const validDomaines = ids.length === 0
      ? domaineIds
      : domaineIds.filter((did) => allDomaines.find((d) => d.value === did && ids.includes(d.disciplineId)));
    if (validDomaines.length !== domaineIds.length) handleDomaineChange(validDomaines, ids);
    else updateSeq.mutate({ id: sequenceId, disciplineIds: ids });
  }

  function handleDomaineChange(ids: string[], forDisciplineIds = disciplineIds) {
    setDomaineIds(ids);
    const validSDs = ids.length === 0
      ? sousDomainIds
      : sousDomainIds.filter((sid) => allSousDomaines.find((sd) => sd.value === sid && ids.includes(sd.domaineId)));
    if (validSDs.length !== sousDomainIds.length) handleSousDomainChange(validSDs, ids, forDisciplineIds);
    else updateSeq.mutate({ id: sequenceId, disciplineIds: forDisciplineIds, domaineIds: ids });
  }

  function handleSousDomainChange(ids: string[], forDomaineIds = domaineIds, forDisciplineIds = disciplineIds) {
    setSousDomainIds(ids);
    const validObjIds = objectifIds.filter((oid) =>
      allObjectifs.find((o) => o.value === oid && ids.includes(o.sousDomainId)),
    );
    setObjectifIds(validObjIds);
    updateSeq.mutate({
      id: sequenceId,
      disciplineIds: forDisciplineIds,
      domaineIds: forDomaineIds,
      sousDomainIds: ids,
      objectifIds: validObjIds,
    });
  }

  function handleObjectifChange(ids: string[]) {
    setObjectifIds(ids);
    updateSeq.mutate({ id: sequenceId, objectifIds: ids });
  }

  // ── Flat options for FicheCard ────────────────────────────────────────────
  const disciplineOptions = referenceTree.disciplines.map((d) => ({ value: d.value, label: d.label }));
  const domaineOptions = allDomaines.map((d) => ({ value: d.value, label: d.label }));
  const sousDomainOptions = allSousDomaines.map((sd) => ({ value: sd.value, label: sd.label }));

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-700 mb-4">Métadonnées de la séquence</h2>

        {/* Titre */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
          <input
            type="text"
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            onBlur={() => {
              if (titre !== initialData.titre && titre.trim()) updateSeq.mutate({ id: sequenceId, titre });
            }}
          />
        </div>

        {/* Niveaux */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Niveaux</label>
          <NiveauPicker
            cycles={referenceTree.niveauxByCycle}
            selectedIds={niveauIds}
            onChange={(ids) => {
              setNiveauIds(ids);
              updateSeq.mutate({ id: sequenceId, niveauIds: ids });
            }}
          />
        </div>

        {/* Disciplines */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Disciplines</label>
          <div className="flex flex-wrap gap-1.5">
            {referenceTree.disciplines.map((d) => {
              const active = disciplineIds.includes(d.value);
              return (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => {
                    const ids = active
                      ? disciplineIds.filter((v) => v !== d.value)
                      : [...disciplineIds, d.value];
                    handleDisciplineChange(ids);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    active
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400 hover:text-indigo-600'
                  }`}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Domaines */}
        <GroupedMultiSelectField
          label="Domaines"
          groups={domaineGroups}
          selectedIds={domaineIds}
          onChange={handleDomaineChange}
          placeholder={disciplineIds.length === 0 ? 'Sélectionner un domaine…' : 'Filtré par discipline(s) sélectionnée(s)'}
        />

        {/* Sous-domaines */}
        <GroupedMultiSelectField
          label="Sous-domaines"
          groups={sousDomainGroups}
          selectedIds={sousDomainIds}
          onChange={handleSousDomainChange}
          placeholder="Sélectionner un sous-domaine…"
        />

        {/* Objectifs d'apprentissage */}
        {filteredObjectifs.length > 0 && (
          <GroupedMultiSelectField
            label="Objectifs d'apprentissage"
            groups={objectifGroups}
            selectedIds={objectifIds}
            onChange={handleObjectifChange}
            placeholder="Sélectionner des objectifs…"
          />
        )}

        {/* Notes libres */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes / objectifs libres</label>
          <textarea
            rows={3}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={objectifs}
            onChange={(e) => setObjectifs(e.target.value)}
            onBlur={() => debounce({ id: sequenceId, objectifs: objectifs || null })}
            placeholder="Notes pédagogiques libres…"
          />
        </div>
      </div>

      {/* Séances */}
      <div>
        <h2 className="text-base font-semibold text-gray-700 mb-3">
          Séances ({(fiches as Fiche[]).length})
        </h2>

        <div className="space-y-3">
          {(fiches as Fiche[]).map((fiche) => (
            <FicheCard
              key={fiche.id}
              fiche={fiche}
              disciplineOptions={disciplineOptions}
              domaineOptions={domaineOptions}
              sousDomainOptions={sousDomainOptions}
            />
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (newFicheTitre.trim()) createFiche.mutate({ titre: newFicheTitre, sequenceId });
          }}
          className="flex gap-2 mt-4"
        >
          <input
            placeholder="Titre de la nouvelle séance…"
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
            value={newFicheTitre}
            onChange={(e) => setNewFicheTitre(e.target.value)}
          />
          <button
            type="submit"
            disabled={!newFicheTitre.trim() || createFiche.isPending}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-700 text-white text-sm rounded-md hover:bg-blue-800 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> Ajouter séance
          </button>
        </form>
      </div>
    </div>
  );
}
