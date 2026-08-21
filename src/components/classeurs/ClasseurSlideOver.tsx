'use client';

import { trpc } from '@/lib/trpc/client';
import { useRouter } from 'next/navigation';
import { ResourceSlideOver } from '@/components/ui/ResourceSlideOver';
import { ClasseurForm } from './ClasseurForm';

interface ClasseurSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ClasseurSlideOver({ isOpen, onClose }: ClasseurSlideOverProps) {
  const router = useRouter();
  const createMutation = trpc.classeur.create.useMutation({
    onSuccess: (classeur) => {
      onClose();
      router.push(`/classeurs/${classeur.id}`);
    },
  });

  return (
    <ResourceSlideOver isOpen={isOpen} onClose={onClose} title="Nouveau classeur" error={createMutation.error}>
      <ClasseurForm
        onSubmit={(data) => createMutation.mutate(data)}
        onCancel={onClose}
        isLoading={createMutation.isPending}
      />
    </ResourceSlideOver>
  );
}
