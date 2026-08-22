'use client';

import { trpc } from '@/lib/trpc/client';
import { ResourceSlideOver } from '@/components/ui/ResourceSlideOver';
import { MatiereForm } from './MatiereForm';

interface MatiereSlideOverProps {
  classeurId: string;
  cycleId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function MatiereSlideOver({ classeurId, cycleId, isOpen, onClose, onSuccess }: MatiereSlideOverProps) {
  const createMutation = trpc.matiere.create.useMutation({
    onSuccess: () => {
      onSuccess();
      onClose();
    },
  });

  return (
    <ResourceSlideOver isOpen={isOpen} onClose={onClose} title="Nouvelle matière" error={createMutation.error}>
      <MatiereForm
        cycleId={cycleId}
        onSubmit={(data) => createMutation.mutate({ titre: data.titre, classeurId, domaineId: data.domaineId })}
        onCancel={onClose}
        isLoading={createMutation.isPending}
      />
    </ResourceSlideOver>
  );
}
