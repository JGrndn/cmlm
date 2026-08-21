'use client';

import { trpc } from '@/lib/trpc/client';
import { ResourceSlideOver } from '@/components/ui/ResourceSlideOver';
import { SeanceForm } from './SeanceForm';

interface SeanceSlideOverProps {
  sequenceId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SeanceSlideOver({ sequenceId, isOpen, onClose, onSuccess }: SeanceSlideOverProps) {
  const createMutation = trpc.seance.create.useMutation({
    onSuccess: () => {
      onSuccess();
      onClose();
    },
  });

  return (
    <ResourceSlideOver isOpen={isOpen} onClose={onClose} title="Nouvelle séance" error={createMutation.error}>
      <SeanceForm
        onSubmit={(data) =>
          createMutation.mutate({
            titre: data.titre,
            sequenceId,
            date: data.date ? new Date(data.date).toISOString() : undefined,
          })
        }
        onCancel={onClose}
        isLoading={createMutation.isPending}
      />
    </ResourceSlideOver>
  );
}
