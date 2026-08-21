'use client';

import { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { trpc } from '@/lib/trpc/client';
import { Trash2 } from 'lucide-react';

interface Item {
  id: string;
  duree: number | null;
  contenu: unknown;
}

export function ItemEditor({ item, ficheId }: { item: Item; ficheId: string }) {
  const [duree, setDuree] = useState<string>(item.duree?.toString() ?? '');
  const utils = trpc.useUtils();
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateItem = trpc.item.update.useMutation({
    onSuccess: () => utils.fiche.list.invalidate(),
  });
  const deleteItem = trpc.item.delete.useMutation({
    onSuccess: () => utils.fiche.list.invalidate(),
  });

  const editor = useEditor({
    extensions: [StarterKit],
    content: item.contenu as object,
    onUpdate({ editor }) {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(() => {
        updateItem.mutate({ id: item.id, contenu: editor.getJSON() as Record<string, unknown> });
      }, 800);
    },
  });

  useEffect(() => () => { if (saveTimeout.current) clearTimeout(saveTimeout.current); }, []);

  return (
    <div className="group flex gap-2 items-start bg-gray-50 rounded-md p-2 border border-gray-200">
      <div className="flex-1 min-w-0">
        <EditorContent
          editor={editor}
          className="prose prose-sm max-w-none focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[1.5rem]"
        />
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
        <input
          type="number"
          min={1}
          placeholder="min"
          className="w-14 text-xs border border-gray-300 rounded px-1.5 py-1 text-center"
          value={duree}
          onChange={(e) => setDuree(e.target.value)}
          onBlur={() => {
            const val = parseInt(duree);
            updateItem.mutate({ id: item.id, duree: isNaN(val) ? null : val });
          }}
        />
        <button
          onClick={() => { if (confirm('Supprimer cet item ?')) deleteItem.mutate({ id: item.id }); }}
          className="p-1 text-gray-300 hover:text-red-500 rounded opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
