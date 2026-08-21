'use client';

import { ReactNode } from 'react';
import { SlideOver } from './SlideOver';

interface ResourceSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  error?: { message: string } | null;
  children: ReactNode;
}

export function ResourceSlideOver({
  isOpen,
  onClose,
  title,
  size = 'md',
  error,
  children,
}: ResourceSlideOverProps) {
  return (
    <SlideOver isOpen={isOpen} onClose={onClose} title={title} size={size}>
      {error && (
        <div className="mb-6 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error.message}
        </div>
      )}
      {children}
    </SlideOver>
  );
}
