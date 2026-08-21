'use client';

import { trpc } from '@/lib/trpc/client';
import { ResourceSlideOver } from '@/components/ui/ResourceSlideOver';
import { MatiereForm } from './MatiereForm';

interface MatiereSlideOverProps {
  classeurId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function MatiereSlideOver({ classeurId, isOpen, onClose, onSuccess }: MatiereSlideOverProps) {
  const createMutation = trpc.matiere.create.useMutation({
    onSuccess: () => {
      onSuccess();
      onClose();
    },
  });

  return (
    <ResourceSlideOver isOpen={isOpen} onClose={onClose} title="Nouvelle matière" error={createMutation.error}>
      <MatiereForm
        onSubmit={(data) => createMutation.mutate({ titre: data.titre, classeurId })}
        onCancel={onClose}
        isLoading={createMutation.isPending}
      />
    </ResourceSlideOver>
  );
}
