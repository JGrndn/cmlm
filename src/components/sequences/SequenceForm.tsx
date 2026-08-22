'use client';

import { useState } from 'react';
import { GenericForm } from '@/components/ui/GenericForm';
import { FormField } from '@/components/ui/FormField';
import type { Periode } from '@/generated/prisma';

const PERIODES: Periode[] = ['P1', 'P2', 'P3', 'P4', 'P5'];

interface SequenceFormData {
  titre: string;
  periode: Periode | '';
  objectifs: string;
}

interface SequenceFormProps {
  onSubmit: (data: SequenceFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  defaultPeriode?: Periode;
}

export function SequenceForm({ onSubmit, onCancel, isLoading, defaultPeriode }: SequenceFormProps) {
  const [formData, setFormData] = useState<SequenceFormData>({
    titre: '',
    periode: defaultPeriode ?? '',
    objectifs: '',
  });

  function updateField<K extends keyof SequenceFormData>(field: K, value: SequenceFormData[K]) {
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
        placeholder="Titre de la séquence"
        required
      />
      <FormField
        label="Période"
        name="periode"
        type="select"
        value={formData.periode}
        onChange={(v) => updateField('periode', v as Periode | '')}
        options={PERIODES.map((p) => ({ value: p, label: p }))}
        placeholder="Sans période"
        disabled={!!defaultPeriode}
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
