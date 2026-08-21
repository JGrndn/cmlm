'use client';

import { ReactNode, useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface SlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  position?: 'right' | 'left';
}

export function SlideOver({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  position = 'right',
}: SlideOverProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!shouldRender) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full',
  };

  const positionClasses = position === 'right' ? 'right-0' : 'left-0';
  const slideClasses =
    position === 'right'
      ? isVisible ? 'translate-x-0' : 'translate-x-full'
      : isVisible ? 'translate-x-0' : '-translate-x-full';

  return (
    <>
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${isVisible ? 'bg-opacity-50' : 'bg-opacity-0'}`}
        onClick={onClose}
      />
      <div className={`fixed inset-y-0 ${positionClasses} z-50 flex ${sizeClasses[size]} w-full`}>
        <div
          className={`relative flex flex-col w-full bg-white shadow-2xl transition-transform duration-300 ease-in-out transform ${slideClasses}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-2 hover:bg-gray-200"
              aria-label="Fermer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
        </div>
      </div>
    </>
  );
}
