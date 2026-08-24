'use client';

import { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import TextAlign from '@tiptap/extension-text-align';
import { Table, TableRow, TableHeader, TableCell } from '@tiptap/extension-table';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Image from '@tiptap/extension-image';
import { trpc } from '@/lib/trpc/client';
import type { Editor } from '@tiptap/react';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Superscript as SuperscriptIcon, Subscript as SubscriptIcon,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, ListTodo,
  Table as TableIcon, ImageIcon,
  Trash2, ChevronLeft, ChevronRight, ChevronsUpDown,
} from 'lucide-react';

interface Phase {
  id: string;
  titre: string;
  duree: number | null;
  description: unknown;
}

function Btn({
  onClick, active, title, children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
      }`}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <div className="w-px h-4 bg-gray-200 mx-0.5" />;
}

function ColorBtn({
  title, icon, value, onChange,
}: {
  title: string;
  icon: React.ReactNode;
  value: string;
  onChange: (color: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="relative">
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); inputRef.current?.click(); }}
        title={title}
        className="p-1 rounded text-gray-500 hover:bg-gray-100 hover:text-gray-700 flex flex-col items-center gap-0"
      >
        {icon}
        <span className="block h-1 w-3.5 rounded-sm mt-0.5" style={{ backgroundColor: value }} />
      </button>
      <input
        ref={inputRef}
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
      />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const [textColor, setTextColor] = useState('#000000');
  const [hlColor, setHlColor] = useState('#fef08a');

  const { isInTable } = useEditorState({
    editor,
    selector: (ctx) => ({
      isInTable: ctx.editor.isActive('tableCell') || ctx.editor.isActive('tableHeader'),
    }),
  });

  return (
    <>
    <div className="flex flex-wrap items-center gap-0.5 px-2 py-1 bg-white border-b border-gray-100">
      {/* Format */}
      <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Gras (Ctrl+B)">
        <Bold className="h-4 w-4" />
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italique (Ctrl+I)">
        <Italic className="h-4 w-4" />
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Souligné (Ctrl+U)">
        <UnderlineIcon className="h-4 w-4" />
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Barré">
        <Strikethrough className="h-4 w-4" />
      </Btn>
      <Sep />
      <Btn onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive('superscript')} title="Exposant">
        <SuperscriptIcon className="h-4 w-4" />
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive('subscript')} title="Indice">
        <SubscriptIcon className="h-4 w-4" />
      </Btn>
      <Sep />
      {/* Colors */}
      <ColorBtn
        title="Couleur du texte"
        icon={<span className="text-xs font-bold leading-none" style={{ fontFamily: 'serif' }}>A</span>}
        value={textColor}
        onChange={(color) => { setTextColor(color); editor.chain().focus().setColor(color).run(); }}
      />
      <ColorBtn
        title="Couleur de surlignage"
        icon={<span className="text-xs font-bold leading-none">ab</span>}
        value={hlColor}
        onChange={(color) => { setHlColor(color); editor.chain().focus().setHighlight({ color }).run(); }}
      />
      <Sep />
      {/* Alignment */}
      <Btn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Aligner à gauche">
        <AlignLeft className="h-4 w-4" />
      </Btn>
      <Btn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Centrer">
        <AlignCenter className="h-4 w-4" />
      </Btn>
      <Btn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Aligner à droite">
        <AlignRight className="h-4 w-4" />
      </Btn>
      <Btn onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Justifier">
        <AlignJustify className="h-4 w-4" />
      </Btn>
      <Sep />
      {/* Lists */}
      <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Liste à puces">
        <List className="h-4 w-4" />
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Liste numérotée">
        <ListOrdered className="h-4 w-4" />
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive('taskList')} title="Cases à cocher">
        <ListTodo className="h-4 w-4" />
      </Btn>
      <Sep />
      {/* Insert */}
      <Btn
        onClick={() =>
          editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
        }
        title="Insérer un tableau"
      >
        <TableIcon className="h-4 w-4" />
      </Btn>
      <Btn
        onClick={() => {
          const url = window.prompt('URL de l\'image');
          if (url) editor.chain().focus().setImage({ src: url }).run();
        }}
        title="Insérer une image"
      >
        <ImageIcon className="h-4 w-4" />
      </Btn>
    </div>

    {/* Contextual table toolbar */}
    {isInTable && (
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1 bg-amber-50 border-b border-amber-200">
        <span className="text-xs text-amber-600 font-medium mr-1">Tableau :</span>
        <Btn onClick={() => editor.chain().focus().addColumnBefore().run()} title="Insérer colonne avant">
          <span className="flex items-center gap-0.5 text-xs"><ChevronLeft className="h-3 w-3" />Col</span>
        </Btn>
        <Btn onClick={() => editor.chain().focus().addColumnAfter().run()} title="Insérer colonne après">
          <span className="flex items-center gap-0.5 text-xs">Col<ChevronRight className="h-3 w-3" /></span>
        </Btn>
        <Btn onClick={() => editor.chain().focus().deleteColumn().run()} title="Supprimer colonne">
          <span className="text-xs">−Col</span>
        </Btn>
        <Sep />
        <Btn onClick={() => editor.chain().focus().addRowBefore().run()} title="Insérer ligne avant">
          <span className="flex items-center gap-0.5 text-xs"><ChevronsUpDown className="h-3 w-3 rotate-180" />Ligne</span>
        </Btn>
        <Btn onClick={() => editor.chain().focus().addRowAfter().run()} title="Insérer ligne après">
          <span className="flex items-center gap-0.5 text-xs">Ligne<ChevronsUpDown className="h-3 w-3" /></span>
        </Btn>
        <Btn onClick={() => editor.chain().focus().deleteRow().run()} title="Supprimer ligne">
          <span className="text-xs">−Ligne</span>
        </Btn>
        <Sep />
        <Btn onClick={() => editor.chain().focus().deleteTable().run()} title="Supprimer le tableau">
          <span className="text-xs text-red-500">Supprimer tableau</span>
        </Btn>
      </div>
    )}
  </>
  );
}

const DUREE_PRESETS = [5, 10, 15, 20, 25, 30];

export function PhaseEditor({ phase }: { phase: Phase; ficheId?: string }) {
  const [titre, setTitre] = useState(phase.titre);
  const [duree, setDuree] = useState<number | null>(phase.duree ?? null);
  const [freeInput, setFreeInput] = useState<string>(
    phase.duree && !DUREE_PRESETS.includes(phase.duree) ? String(phase.duree) : '',
  );
  const utils = trpc.useUtils();
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updatePhase = trpc.phase.update.useMutation({
    onSuccess: () => utils.fiche.list.invalidate(),
  });
  const deletePhase = trpc.phase.delete.useMutation({
    onSuccess: () => utils.fiche.list.invalidate(),
  });

  const editor = useEditor({
    editorProps: {
      attributes: { class: 'phase-editor' },
    },
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Superscript,
      Subscript,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({ nested: true }),
      Image,
    ],
    content: phase.description as object,
    onUpdate({ editor }) {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(() => {
        updatePhase.mutate({ id: phase.id, description: editor.getJSON() as Record<string, unknown> });
      }, 800);
    },
  });

  useEffect(() => () => { if (saveTimeout.current) clearTimeout(saveTimeout.current); }, []);

  return (
    <div className="group bg-gray-50 rounded-md border border-gray-200 overflow-hidden">
      {/* Header row 1: titre + delete */}
      <div className="flex items-center gap-2 px-3 py-2 bg-white border-b border-gray-100">
        <input
          type="text"
          placeholder="Titre de la phase…"
          className="flex-1 text-sm font-medium text-gray-700 bg-transparent outline-none placeholder:text-gray-400"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          onBlur={() => {
            if (titre !== phase.titre) updatePhase.mutate({ id: phase.id, titre });
          }}
        />
        <button
          type="button"
          onClick={() => { if (confirm('Supprimer cette phase ?')) deletePhase.mutate({ id: phase.id }); }}
          className="p-1 text-gray-300 hover:text-red-500 rounded opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Header row 2: durée */}
      <div className="flex flex-wrap items-center gap-1.5 px-3 py-2 bg-white border-b border-gray-100">
        <span className="text-sm text-gray-400 mr-1">Durée :</span>
        {DUREE_PRESETS.map((p) => {
          const active = duree === p;
          return (
            <button
              key={p}
              type="button"
              onClick={() => {
                const next = active ? null : p;
                setDuree(next);
                setFreeInput('');
                updatePhase.mutate({ id: phase.id, duree: next });
              }}
              className={`px-3.5 py-1 rounded-full text-sm font-medium border transition-colors ${
                active
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-500 border-gray-300 hover:border-blue-400 hover:text-blue-600'
              }`}
            >
              {p} min
            </button>
          );
        })}
        <input
          type="number"
          min={1}
          placeholder="autre…"
          className="w-24 text-sm border border-gray-300 rounded px-2 py-1 text-center bg-white text-gray-700"
          value={freeInput}
          onChange={(e) => {
            setFreeInput(e.target.value);
            setDuree(null);
          }}
          onBlur={() => {
            const val = parseInt(freeInput);
            const next = isNaN(val) ? null : val;
            setDuree(next);
            updatePhase.mutate({ id: phase.id, duree: next });
          }}
        />
      </div>

      {/* Toolbar */}
      {editor && <Toolbar editor={editor} />}

      {/* Editor */}
      <div className="p-3">
        <EditorContent
          editor={editor}
          className="text-sm text-gray-800 focus:outline-none
            [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[3rem]
            [&_.ProseMirror_p]:my-1
            [&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:my-2
            [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h2]:my-2
            [&_.ProseMirror_h3]:text-lg [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h3]:my-1.5
            [&_.ProseMirror_ul:not([data-type=taskList])]:list-disc [&_.ProseMirror_ul:not([data-type=taskList])]:pl-5 [&_.ProseMirror_ul:not([data-type=taskList])]:my-1
            [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5 [&_.ProseMirror_ol]:my-1
            [&_.ProseMirror_li]:my-0.5
            [&_.ProseMirror_table]:w-full [&_.ProseMirror_table]:border-collapse [&_.ProseMirror_table]:my-2
            [&_.ProseMirror_td]:border [&_.ProseMirror_td]:border-gray-300 [&_.ProseMirror_td]:p-1.5
            [&_.ProseMirror_th]:border [&_.ProseMirror_th]:border-gray-300 [&_.ProseMirror_th]:p-1.5 [&_.ProseMirror_th]:bg-gray-50 [&_.ProseMirror_th]:font-semibold
            [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-gray-300 [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_blockquote]:text-gray-600
            [&_.ProseMirror_code]:bg-gray-100 [&_.ProseMirror_code]:rounded [&_.ProseMirror_code]:px-1 [&_.ProseMirror_code]:font-mono [&_.ProseMirror_code]:text-xs"
        />
      </div>
    </div>
  );
}
