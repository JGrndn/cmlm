'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface ItemEditorProps {
  initialContent?: object;
  onChange?: (content: object) => void;
}

export default function ItemEditor({ initialContent, onChange }: ItemEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent ?? '<p>Contenu de l\'item…</p>',
    onUpdate: ({ editor }) => {
      onChange?.(editor.getJSON());
    },
  });

  return (
    <div className="item-editor border rounded p-2">
      <EditorContent editor={editor} />
    </div>
  );
}
