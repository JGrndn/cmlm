import { ReactNode } from 'react';

interface GenericFormProps {
  onSubmit: (e: React.FormEvent) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  children: ReactNode;
  submitLabel?: string;
  cancelLabel?: string;
}

export function GenericForm({
  onSubmit,
  onCancel,
  isLoading,
  children,
  submitLabel = 'Sauvegarder',
  cancelLabel = 'Annuler',
}: GenericFormProps) {
  return (
    <form onSubmit={onSubmit}>
      {children}
      <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-gray-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm bg-blue-700 text-white rounded-md hover:bg-blue-800 disabled:opacity-50"
        >
          {isLoading ? 'Enregistrement…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
