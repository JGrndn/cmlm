'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { X } from 'lucide-react';

interface PeriodeRow {
  label: string;
  dateDebut: string;
  dateFin: string;
}

const DEFAULT_PERIODES: PeriodeRow[] = [
  { label: 'P1', dateDebut: '', dateFin: '' },
  { label: 'P2', dateDebut: '', dateFin: '' },
  { label: 'P3', dateDebut: '', dateFin: '' },
  { label: 'P4', dateDebut: '', dateFin: '' },
  { label: 'P5', dateDebut: '', dateFin: '' },
];

interface AnneeScolaireCreateModalProps {
  onClose: () => void;
  onCreated: (anneeId: string, anneeLabel: string) => void;
}

export function AnneeScolaireCreateModal({ onClose, onCreated }: AnneeScolaireCreateModalProps) {
  const [label, setLabel] = useState('');
  const [debut, setDebut] = useState('');
  const [fin, setFin] = useState('');
  const [periodes, setPeriodes] = useState<PeriodeRow[]>(DEFAULT_PERIODES);

  const createMutation = trpc.reference.createAnneeScolaire.useMutation({
    onSuccess: (annee) => {
      onCreated(annee.id, annee.label);
    },
  });

  const updatePeriode = (index: number, field: keyof PeriodeRow, value: string) => {
    setPeriodes((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };

  const isValid =
    label.trim() &&
    debut.trim() &&
    fin.trim() &&
    periodes.every((p) => p.label.trim() && p.dateDebut && p.dateFin);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    createMutation.mutate({
      label: label.trim(),
      debut: parseInt(debut),
      fin: parseInt(fin),
      periodes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Nouvelle année scolaire</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Label <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder="ex : 2027-2028"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Début</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder="2027"
                value={debut}
                onChange={(e) => setDebut(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fin</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder="2028"
                value={fin}
                onChange={(e) => setFin(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Périodes</h3>
            <div className="space-y-2">
              <div className="grid grid-cols-[80px_1fr_1fr] gap-2 text-xs text-gray-500 font-medium px-1">
                <span>Nom</span>
                <span>Début</span>
                <span>Fin</span>
              </div>
              {periodes.map((p, i) => (
                <div key={i} className="grid grid-cols-[80px_1fr_1fr] gap-2">
                  <input
                    type="text"
                    className="border border-gray-300 rounded-md px-2 py-1.5 text-sm"
                    value={p.label}
                    onChange={(e) => updatePeriode(i, 'label', e.target.value)}
                    required
                  />
                  <input
                    type="date"
                    className="border border-gray-300 rounded-md px-2 py-1.5 text-sm"
                    value={p.dateDebut}
                    onChange={(e) => updatePeriode(i, 'dateDebut', e.target.value)}
                    required
                  />
                  <input
                    type="date"
                    className="border border-gray-300 rounded-md px-2 py-1.5 text-sm"
                    value={p.dateFin}
                    onChange={(e) => updatePeriode(i, 'dateFin', e.target.value)}
                    required
                  />
                </div>
              ))}
            </div>
          </div>

          {createMutation.error && (
            <p className="text-sm text-red-600">{createMutation.error.message}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!isValid || createMutation.isPending}
              className="px-4 py-2 text-sm bg-blue-700 text-white rounded-md hover:bg-blue-800 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Création…' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
