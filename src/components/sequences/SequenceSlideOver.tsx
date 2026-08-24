'use client';

import { trpc } from '@/lib/trpc/client';
import { ResourceSlideOver } from '@/components/ui/ResourceSlideOver';
import { SequenceForm } from './SequenceForm';

interface SequenceSlideOverProps {
  matiereId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultPeriodeId?: string;
  defaultSousDomainId?: string;
  periodeOptions?: { value: string; label: string }[];
  anneeScolaireId?: string;
}

export function SequenceSlideOver({
  matiereId,
  isOpen,
  onClose,
  onSuccess,
  defaultPeriodeId,
  defaultSousDomainId,
  periodeOptions,
  anneeScolaireId,
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
    onSuccess: () => {
      onSuccess();
      onClose();
    },
  });

  return (
    <ResourceSlideOver isOpen={isOpen} onClose={onClose} title="Nouvelle séquence" error={createMutation.error}>
      <SequenceForm
        defaultPeriodeId={defaultPeriodeId}
        periodeOptions={options}
        onSubmit={(data) =>
          createMutation.mutate({
            titre: data.titre,
            matiereId,
            sousDomainId: defaultSousDomainId,
            periodeId: data.periodeId || undefined,
            objectifs: data.objectifs || undefined,
          })
        }
        onCancel={onClose}
        isLoading={createMutation.isPending}
      />
    </ResourceSlideOver>
  );
}
