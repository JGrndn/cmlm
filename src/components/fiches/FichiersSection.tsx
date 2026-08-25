'use client';

import { useState, useRef } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Paperclip, Trash2, FileText, Upload, Loader2 } from 'lucide-react';

interface FichiersSectionProps {
  ficheId: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function FichiersSection({ ficheId }: FichiersSectionProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();

  const { data: fichiers = [] } = trpc.fichier.list.useQuery({ ficheId });
  const deleteFichier = trpc.fichier.delete.useMutation({
    onSuccess: () => utils.fichier.list.invalidate({ ficheId }),
  });

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('ficheId', ficheId);

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Erreur lors de l\'upload');
      }
      utils.fichier.list.invalidate({ ficheId });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">Fichiers joints</label>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 disabled:opacity-50"
        >
          {uploading
            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
            : <Upload className="h-3.5 w-3.5" />}
          {uploading ? 'Upload…' : 'Ajouter un PDF'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {error && (
        <p className="text-xs text-red-600 mb-2">{error}</p>
      )}

      {fichiers.length === 0 && !uploading && (
        <p className="text-xs text-gray-400 italic flex items-center gap-1.5">
          <Paperclip className="h-3.5 w-3.5" /> Aucun fichier attaché
        </p>
      )}

      {fichiers.length > 0 && (
        <ul className="space-y-1.5">
          {fichiers.map((f) => (
            <li key={f.id} className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-red-400 flex-shrink-0" />
              <a
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-blue-700 hover:underline truncate"
              >
                {f.nom}
              </a>
              <span className="text-xs text-gray-400 flex-shrink-0">{formatSize(f.taille)}</span>
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Supprimer « ${f.nom} » ?`)) {
                    deleteFichier.mutate({ id: f.id });
                  }
                }}
                disabled={deleteFichier.isPending}
                className="p-0.5 text-gray-400 hover:text-red-600 disabled:opacity-40 flex-shrink-0"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
