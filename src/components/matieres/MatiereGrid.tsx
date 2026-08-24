'use client';

import React, { useState, useRef, useEffect } from 'react';
import { trpc } from '@/lib/trpc/client';
import type { RouterOutputs } from '@/lib/trpc/types';
import { Plus, ChevronDown, Trash2 } from 'lucide-react';
import { SequenceSlideOver } from '@/components/sequences/SequenceSlideOver';

type Sequence = RouterOutputs['sequence']['list'][0];
type Domaine = { id: string; label: string; matiereId: string | null };
type PeriodeItem = { id: string; label: string; dateDebut: Date | string; dateFin: Date | string };

interface MatiereGridProps {
  classeurId: string;
  matiereId: string;
  disciplineId: string;
  anneeScolaireId: string;
  domaines: Domaine[];
  initialSequences: Sequence[];
  initialPeriodes: PeriodeItem[];
  initialPeriodesVisibles: string[];
  initialDomaineIdsVisibles: string[];
}

function formatShortDate(d: Date | string) {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
}

export function MatiereGrid({
  classeurId,
  matiereId,
  disciplineId,
  anneeScolaireId,
  domaines,
  initialSequences,
  initialPeriodes,
  initialPeriodesVisibles,
  initialDomaineIdsVisibles,
}: MatiereGridProps) {
  const [allPeriodes] = useState<PeriodeItem[]>(initialPeriodes);
  const [allDomaines, setAllDomaines] = useState<Domaine[]>(domaines);
  const [visibleIds, setVisibleIds] = useState<Set<string>>(() =>
    (initialDomaineIdsVisibles ?? []).length
      ? new Set(initialDomaineIdsVisibles)
      : new Set(domaines.map((s) => s.id)),
  );
  const [visiblePeriodes, setVisiblePeriodes] = useState<Set<string>>(() =>
    (initialPeriodesVisibles ?? []).length
      ? new Set(initialPeriodesVisibles)
      : new Set(allPeriodes.map((p) => p.id)),
  );
  const [dropdownOpen, setDropdownOpen] = useState<'domaines' | 'periodes' | null>(null);
  const [slideOver, setSlideOver] = useState<{ periodeId: string; domaineId: string } | null>(null);
  const [isAddingD, setIsAddingD] = useState(false);
  const [newDLabel, setNewDLabel] = useState('');
  const dDropdownRef = useRef<HTMLDivElement>(null);
  const pDropdownRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);
  const utils = trpc.useUtils();
  const saveMutation = trpc.matiere.update.useMutation();

  const createDMutation = trpc.reference.createDomaine.useMutation({
    onSuccess: (newD) => {
      setAllDomaines((prev) => [...prev, { ...newD, matiereId: newD.matiereId }]);
      setVisibleIds((prev) => new Set([...prev, newD.id]));
      setNewDLabel('');
      setIsAddingD(false);
    },
  });

  const deleteDMutation = trpc.reference.deleteDomaine.useMutation({
    onSuccess: (_, { id }) => {
      setAllDomaines((prev) => prev.filter((s) => s.id !== id));
      setVisibleIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    },
  });

  const { data: sequences = initialSequences } = trpc.sequence.list.useQuery(
    { matiereId },
    { initialData: initialSequences },
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dDropdownRef.current && !dDropdownRef.current.contains(e.target as Node) &&
        pDropdownRef.current && !pDropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(null);
        setIsAddingD(false);
        setNewDLabel('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    const timer = setTimeout(() => {
      saveMutation.mutate({
        id: matiereId,
        periodesVisibles: [...visiblePeriodes],
        domaineIdsVisibles: [...visibleIds],
      });
    }, 400);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleIds, visiblePeriodes]);

  const toggle = (id: string) => {
    setVisibleIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const togglePeriode = (id: string) => {
    setVisiblePeriodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const visibleDomaines = allDomaines.filter((s) => visibleIds.has(s.id));
  const activePeriodes = allPeriodes.filter((p) => visiblePeriodes.has(p.id));

  const cellSequences = (domaineId: string, periodeId: string) =>
    sequences.filter((s) => s.domaineId === domaineId && s.periodeId === periodeId);

  const periodeOptions = allPeriodes.map((p) => ({ value: p.id, label: p.label }));

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <div className="relative inline-block" ref={dDropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((v) => (v === 'domaines' ? null : 'domaines'))}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
          >
            Domaines ({visibleIds.size}/{allDomaines.length})
            <ChevronDown className="h-4 w-4" />
          </button>
          {dropdownOpen === 'domaines' && (
            <div className="absolute top-full left-0 mt-1 z-10 bg-white border border-gray-200 rounded-md shadow-lg min-w-48 py-1">
              {allDomaines.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <label className="flex items-center gap-2 flex-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visibleIds.has(d.id)}
                      onChange={() => toggle(d.id)}
                      className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600"
                    />
                    {d.label}
                  </label>
                  {d.matiereId && (
                    <button
                      type="button"
                      onClick={() => deleteDMutation.mutate({ id: d.id })}
                      disabled={deleteDMutation.isPending}
                      className="text-gray-400 hover:text-red-500 flex-shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
              <hr className="my-1 border-gray-200" />
              {isAddingD ? (
                <div className="px-3 py-1.5 flex items-center gap-1">
                  <input
                    autoFocus
                    className="flex-1 text-sm border border-gray-300 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={newDLabel}
                    onChange={(e) => setNewDLabel(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newDLabel.trim()) {
                        createDMutation.mutate({ disciplineId, matiereId, label: newDLabel.trim() });
                      }
                      if (e.key === 'Escape') {
                        setIsAddingD(false);
                        setNewDLabel('');
                      }
                    }}
                    placeholder="Nom du domaine…"
                    disabled={createDMutation.isPending}
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAddingD(true)}
                  className="flex items-center gap-1.5 w-full px-3 py-1.5 text-sm text-blue-600 hover:bg-gray-50"
                >
                  <Plus className="h-3.5 w-3.5" /> Nouveau domaine
                </button>
              )}
            </div>
          )}
        </div>

        <div className="relative inline-block" ref={pDropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((v) => (v === 'periodes' ? null : 'periodes'))}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
          >
            Périodes ({visiblePeriodes.size}/{allPeriodes.length})
            <ChevronDown className="h-4 w-4" />
          </button>
          {dropdownOpen === 'periodes' && (
            <div className="absolute top-full left-0 mt-1 z-10 bg-white border border-gray-200 rounded-md shadow-lg min-w-48 py-1">
              {allPeriodes.map((p) => (
                <label
                  key={p.id}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={visiblePeriodes.has(p.id)}
                    onChange={() => togglePeriode(p.id)}
                    className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600"
                  />
                  <span className="flex-1">
                    <span className="font-medium">{p.label}</span>
                    <span className="ml-1.5 text-gray-400 text-xs">
                      {formatShortDate(p.dateDebut)} – {formatShortDate(p.dateFin)}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              {activePeriodes.map((p) => (
                <th
                  key={p.id}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 font-medium text-gray-700 text-center"
                  style={{ width: `${100 / activePeriodes.length}%` }}
                >
                  <div>{p.label}</div>
                  <div className="text-xs font-normal text-gray-400">
                    {formatShortDate(p.dateDebut)} – {formatShortDate(p.dateFin)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleDomaines.map((d) => (
              <React.Fragment key={d.id}>
                <tr key={`${d.id}-header`}>
                  <td
                    colSpan={activePeriodes.length || 1}
                    className="px-3 py-1.5 border border-gray-200 bg-gray-100 font-medium text-gray-700 text-sm"
                  >
                    {d.label}
                  </td>
                </tr>
                <tr key={`${d.id}-data`}>
                  {activePeriodes.map((p) => {
                    const seqs = cellSequences(d.id, p.id);
                    return (
                      <td key={p.id} className="px-2 py-2 border border-gray-200 align-top">
                        <ul className="space-y-1 mb-1">
                          {seqs.map((s) => (
                            <li key={s.id}>
                              <a
                                href={`/classeurs/${classeurId}/matieres/${matiereId}/sequences/${s.id}`}
                                className="block text-xs text-blue-700 hover:underline leading-tight"
                              >
                                {s.titre}
                              </a>
                            </li>
                          ))}
                        </ul>
                        <button
                          type="button"
                          onClick={() => setSlideOver({ periodeId: p.id, domaineId: d.id })}
                          className="flex items-center gap-0.5 text-xs text-gray-400 hover:text-blue-600"
                        >
                          <Plus className="h-3 w-3" />
                          Ajouter
                        </button>
                      </td>
                    );
                  })}
                </tr>
              </React.Fragment>
            ))}
            {(visibleDomaines.length === 0 || activePeriodes.length === 0) && (
              <tr>
                <td
                  colSpan={activePeriodes.length || 1}
                  className="px-3 py-6 text-center text-sm text-gray-400 border border-gray-200"
                >
                  Aucun élément sélectionné
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {slideOver && (
        <SequenceSlideOver
          matiereId={matiereId}
          isOpen
          onClose={() => setSlideOver(null)}
          onSuccess={() => utils.sequence.list.invalidate()}
          defaultPeriodeId={slideOver.periodeId}
          defaultDomaineId={slideOver.domaineId}
          periodeOptions={periodeOptions}
        />
      )}
    </div>
  );
}
