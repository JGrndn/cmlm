'use client';

import { useState } from 'react';
import { ClasseurSlideOver } from './ClasseurSlideOver';

export function ClasseurCreateButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-md text-sm font-medium hover:bg-blue-800"
      >
        + Nouveau classeur
      </button>
      <ClasseurSlideOver isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
