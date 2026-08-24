'use client';

import { useState } from 'react';
import { GenericForm } from '@/components/ui/GenericForm';
import { FormField } from '@/components/ui/FormField';

interface SequenceFormData {
  titre: string;
  periodeId: string;
  objectifs: string;
}

interface SequenceFormProps {
  onSubmit: (data: SequenceFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  defaultPeriodeId?: string;
  periodeOptions?: { value: string; label: string }[];
  initialValues?: Partial<SequenceFormData>;
  submitLabel?: string;
}

export function SequenceForm({ onSubmit, onCancel, isLoading, defaultPeriodeId, periodeOptions = [], initialValues, submitLabel }: SequenceFormProps) {
  const [formData, setFormData] = useState<SequenceFormData>({
    titre: initialValues?.titre ?? '',
    periodeId: initialValues?.periodeId ?? defaultPeriodeId ?? '',
    objectifs: initialValues?.objectifs ?? '',
  });

  function updateField<K extends keyof SequenceFormData>(field: K, value: SequenceFormData[K]) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <GenericForm onSubmit={handleSubmit} onCancel={onCancel} isLoading={isLoading} submitLabel={submitLabel ?? 'Créer'}>
      <FormField
        label="Titre"
        name="titre"
        type="text"
        value={formData.titre}
        onChange={(v) => updateField('titre', v)}
        placeholder="Titre de la séquence"
        required
      />
      <FormField
        label="Période"
        name="periodeId"
        type="select"
        value={formData.periodeId}
        onChange={(v) => updateField('periodeId', v)}
        options={periodeOptions}
        placeholder="Sans période"
        disabled={!!defaultPeriodeId}
      />
      <FormField
        label="Objectifs"
        name="objectifs"
        type="textarea"
        value={formData.objectifs}
        onChange={(v) => updateField('objectifs', v)}
        placeholder="Objectifs pédagogiques…"
      />
    </GenericForm>
  );
}
