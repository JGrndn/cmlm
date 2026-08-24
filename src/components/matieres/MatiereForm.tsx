'use client';

import { GenericForm } from '@/components/ui/GenericForm';
import { FormField } from '@/components/ui/FormField';
import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';

interface MatiereFormData {
  titre: string;
  disciplineId?: string;
}

interface MatiereFormProps {
  cycleId: string;
  onSubmit: (data: MatiereFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function MatiereForm({ cycleId, onSubmit, onCancel, isLoading }: MatiereFormProps) {
  const [formData, setFormData] = useState<MatiereFormData>({ titre: '' });

  const { data: disciplines = [] } = trpc.reference.listDisciplines.useQuery({ cycleId });

  const disciplineOptions = disciplines.map((d) => ({ value: d.id, label: d.label }));

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
        onChange={(v) => setFormData((prev) => ({ ...prev, titre: v }))}
        placeholder="Titre de la matière"
        required
      />
      <FormField
        label="Discipline"
        name="disciplineId"
        type="select"
        value={formData.disciplineId ?? ''}
        onChange={(v) => setFormData((prev) => ({ ...prev, disciplineId: v || undefined }))}
        placeholder="— Aucune discipline —"
        options={disciplineOptions}
      />
    </GenericForm>
  );
}
