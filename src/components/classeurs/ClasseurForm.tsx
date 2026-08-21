'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { GenericForm } from '@/components/ui/GenericForm';
import { FormField } from '@/components/ui/FormField';

interface ClasseurFormData {
  titre: string;
  niveauId: string;
  anneeScolaireId: string;
}

interface ClasseurFormProps {
  onSubmit: (data: ClasseurFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ClasseurForm({ onSubmit, onCancel, isLoading }: ClasseurFormProps) {
  const [formData, setFormData] = useState<ClasseurFormData>({ titre: '', niveauId: '', anneeScolaireId: '' });
  const { data: niveaux = [] } = trpc.reference.listNiveaux.useQuery();
  const { data: annees = [] } = trpc.reference.listAnnees.useQuery();

  function updateField<K extends keyof ClasseurFormData>(field: K, value: ClasseurFormData[K]) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <GenericForm onSubmit={handleSubmit} onCancel={onCancel} isLoading={isLoading} submitLabel="Créer">
      <FormField
        label="Titre"
        name="titre"
        type="text"
        value={formData.titre}
        onChange={(v) => updateField('titre', v)}
        placeholder="Titre du classeur"
        required
      />
      <FormField
        label="Niveau scolaire"
        name="niveauId"
        type="select"
        value={formData.niveauId}
        onChange={(v) => updateField('niveauId', v)}
        required
        options={niveaux.map((n) => ({ value: n.id, label: `${n.label} (${n.cycle.label})` }))}
        placeholder="Sélectionner un niveau…"
      />
      <FormField
        label="Année scolaire"
        name="anneeScolaireId"
        type="select"
        value={formData.anneeScolaireId}
        onChange={(v) => updateField('anneeScolaireId', v)}
        required
        options={annees.map((a) => ({ value: a.id, label: a.label }))}
        placeholder="Sélectionner une année…"
      />
    </GenericForm>
  );
}
