'use client';

import { GenericForm } from '@/components/ui/GenericForm';
import { FormField } from '@/components/ui/FormField';
import { useState } from 'react';

interface MatiereFormData {
  titre: string;
}

interface MatiereFormProps {
  onSubmit: (data: MatiereFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function MatiereForm({ onSubmit, onCancel, isLoading }: MatiereFormProps) {
  const [formData, setFormData] = useState<MatiereFormData>({ titre: '' });

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
        onChange={(v) => setFormData({ titre: v })}
        placeholder="Titre de la matière"
        required
      />
    </GenericForm>
  );
}
