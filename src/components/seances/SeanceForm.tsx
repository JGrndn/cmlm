'use client';

import { useState } from 'react';
import { GenericForm } from '@/components/ui/GenericForm';
import { FormField } from '@/components/ui/FormField';

interface SeanceFormData {
  titre: string;
  date: string;
}

interface SeanceFormProps {
  onSubmit: (data: SeanceFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function SeanceForm({ onSubmit, onCancel, isLoading }: SeanceFormProps) {
  const [formData, setFormData] = useState<SeanceFormData>({ titre: '', date: '' });

  function updateField<K extends keyof SeanceFormData>(field: K, value: SeanceFormData[K]) {
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
        placeholder="Titre de la séance"
        required
      />
      <FormField
        label="Date"
        name="date"
        type="date"
        value={formData.date}
        onChange={(v) => updateField('date', v)}
      />
    </GenericForm>
  );
}
