'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { PrintStylePanel } from '@/components/fiches/PrintStylePanel';
import { use } from 'react';

interface PrintOptions {
  orientation: 'portrait' | 'landscape';
  couleur: string;
  police: string;
}

export default function FichePrintPage({
  params,
}: {
  params: Promise<{ id: string; matiereId: string; sequenceId: string; seanceId: string; ficheId: string }>;
}) {
  const { ficheId } = use(params);
  const [opts, setOpts] = useState<PrintOptions>({
    orientation: 'portrait',
    couleur: '#1e3a8a',
    police: 'sans-serif',
  });

  const { data: fiche, isLoading } = trpc.fiche.getById.useQuery({ id: ficheId });

  if (isLoading) return <div className="p-8 text-gray-400">Chargement…</div>;
  if (!fiche) return <div className="p-8 text-red-500">Fiche introuvable.</div>;

  return (
    <>
      <style>{`
        @media print {
          @page { size: A4 ${opts.orientation}; margin: 1.5cm; }
        }
        :root {
          --print-color: ${opts.couleur};
          --print-font: ${opts.police};
        }
      `}</style>

      <div className="p-6 max-w-3xl mx-auto">
        <PrintStylePanel onChange={setOpts} />

        <article
          className="bg-white rounded-lg border border-gray-200 p-8 print:border-0 print:p-0 print:rounded-none"
          style={{ fontFamily: opts.police }}
        >
          <h1
            className="text-2xl font-bold mb-6 pb-3 border-b-2"
            style={{ color: opts.couleur, borderColor: opts.couleur }}
          >
            {fiche.titre}
          </h1>

          <div className="space-y-6">
            {(fiche.items as { id: string; duree: number | null; contenu: unknown }[]).map((item, i) => (
              <div key={item.id} className="flex gap-4">
                {item.duree && (
                  <div
                    className="flex-shrink-0 w-12 text-center text-sm font-medium py-1 rounded"
                    style={{ color: opts.couleur, backgroundColor: `${opts.couleur}15` }}
                  >
                    {item.duree} min
                  </div>
                )}
                <div
                  className="flex-1 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: tiptapJsonToHtml(item.contenu as Record<string, unknown>),
                  }}
                />
              </div>
            ))}
          </div>
        </article>
      </div>
    </>
  );
}

function tiptapJsonToHtml(json: Record<string, unknown>): string {
  if (!json || typeof json !== 'object') return '';
  const node = json as { type?: string; text?: string; content?: unknown[]; marks?: { type: string }[] };

  if (node.type === 'doc') {
    return (node.content ?? []).map((c) => tiptapJsonToHtml(c as Record<string, unknown>)).join('');
  }
  if (node.type === 'paragraph') {
    const inner = (node.content ?? []).map((c) => tiptapJsonToHtml(c as Record<string, unknown>)).join('');
    return `<p>${inner || '<br>'}</p>`;
  }
  if (node.type === 'text') {
    let text = node.text ?? '';
    for (const mark of node.marks ?? []) {
      if (mark.type === 'bold') text = `<strong>${text}</strong>`;
      if (mark.type === 'italic') text = `<em>${text}</em>`;
      if (mark.type === 'underline') text = `<u>${text}</u>`;
    }
    return text;
  }
  if (node.type === 'bulletList') {
    return `<ul>${(node.content ?? []).map((c) => tiptapJsonToHtml(c as Record<string, unknown>)).join('')}</ul>`;
  }
  if (node.type === 'orderedList') {
    return `<ol>${(node.content ?? []).map((c) => tiptapJsonToHtml(c as Record<string, unknown>)).join('')}</ol>`;
  }
  if (node.type === 'listItem') {
    return `<li>${(node.content ?? []).map((c) => tiptapJsonToHtml(c as Record<string, unknown>)).join('')}</li>`;
  }
  if (node.type === 'heading') {
    const level = (node as Record<string, unknown> & { attrs?: { level?: number } }).attrs?.level ?? 2;
    const inner = (node.content ?? []).map((c) => tiptapJsonToHtml(c as Record<string, unknown>)).join('');
    return `<h${level}>${inner}</h${level}>`;
  }
  return (node.content ?? []).map((c) => tiptapJsonToHtml(c as Record<string, unknown>)).join('');
}
