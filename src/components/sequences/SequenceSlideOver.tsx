'use client';

import { trpc } from '@/lib/trpc/client';
import { ResourceSlideOver } from '@/components/ui/ResourceSlideOver';
import { SequenceForm } from './SequenceForm';
import type { Periode } from '@/generated/prisma';

interface SequenceSlideOverProps {
  matiereId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultPeriode?: Periode;
  defaultSousDomainId?: string;
}

export function SequenceSlideOver({
  matiereId,
  isOpen,
  onClose,
  onSuccess,
  defaultPeriode,
  defaultSousDomainId,
}: SequenceSlideOverProps) {
  const createMutation = trpc.sequence.create.useMutation({
    onSuccess: () => {
      onSuccess();
      onClose();
    },
  });

  return (
    <ResourceSlideOver isOpen={isOpen} onClose={onClose} title="Nouvelle séquence" error={createMutation.error}>
      <SequenceForm
        defaultPeriode={defaultPeriode}
        onSubmit={(data) =>
          createMutation.mutate({
            titre: data.titre,
            matiereId,
            sousDomainId: defaultSousDomainId,
            periode: (data.periode as Periode) || undefined,
            objectifs: data.objectifs || undefined,
          })
        }
        onCancel={onClose}
        isLoading={createMutation.isPending}
      />
    </ResourceSlideOver>
  );
}
