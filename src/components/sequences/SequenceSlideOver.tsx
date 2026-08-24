'use client';

import { trpc } from '@/lib/trpc/client';
import type { RouterOutputs } from '@/lib/trpc/types';
import { ResourceSlideOver } from '@/components/ui/ResourceSlideOver';
import { SequenceForm } from './SequenceForm';

type Sequence = RouterOutputs['sequence']['list'][0];

interface SequenceSlideOverProps {
  matiereId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultPeriodeId?: string;
  defaultDomaineIds?: string[];
  periodeOptions?: { value: string; label: string }[];
  anneeScolaireId?: string;
  sequence?: Sequence;
}

export function SequenceSlideOver({
  matiereId,
  isOpen,
  onClose,
  onSuccess,
  defaultPeriodeId,
  defaultDomaineIds,
  periodeOptions,
  anneeScolaireId,
  sequence,
}: SequenceSlideOverProps) {
  const { data: fetchedPeriodes } = trpc.reference.listPeriodes.useQuery(
    { anneeScolaireId: anneeScolaireId! },
    { enabled: !!anneeScolaireId && !periodeOptions },
  );

  const options =
    periodeOptions ??
    fetchedPeriodes?.map((p) => ({ value: p.id, label: p.label })) ??
    [];

  const createMutation = trpc.sequence.create.useMutation({
    onSuccess: () => { onSuccess(); onClose(); },
  });

  const updateMutation = trpc.sequence.update.useMutation({
    onSuccess: () => { onSuccess(); onClose(); },
  });

  const isEdit = !!sequence;
  const error = isEdit ? updateMutation.error : createMutation.error;
  const isLoading = isEdit ? updateMutation.isPending : createMutation.isPending;

  return (
    <ResourceSlideOver
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Modifier la séquence' : 'Nouvelle séquence'}
      error={error}
    >
      <SequenceForm
        defaultPeriodeId={isEdit ? undefined : defaultPeriodeId}
        periodeOptions={options}
        initialValues={isEdit ? { titre: sequence.titre, periodeId: sequence.periodeId ?? '', objectifs: sequence.objectifs ?? '' } : undefined}
        submitLabel={isEdit ? 'Enregistrer' : 'Créer'}
        onSubmit={(data) => {
          if (isEdit) {
            updateMutation.mutate({
              id: sequence.id,
              titre: data.titre,
              periodeId: data.periodeId || null,
              objectifs: data.objectifs || null,
            });
          } else {
            createMutation.mutate({
              titre: data.titre,
              matiereId,
              domaineIds: defaultDomaineIds,
              periodeId: data.periodeId || undefined,
              objectifs: data.objectifs || undefined,
            });
          }
        }}
        onCancel={onClose}
        isLoading={isLoading}
      />
    </ResourceSlideOver>
  );
}
