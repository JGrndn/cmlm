'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { PrintStylePanel } from '@/components/fiches/PrintStylePanel';
import { tiptapJsonToHtml } from '@/lib/tiptap/tiptapJsonToHtml';
import { use } from 'react';

interface PrintOptions {
  orientation: 'portrait' | 'landscape';
  couleur: string;
  police: string;
}

export default function FichePrintPage({
  params,
}: {
  params: Promise<{ id: string; matiereId: string; sequenceId: string; ficheId: string }>;
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

  const phases = fiche.phases as { id: string; titre: string; duree: number | null; description: unknown }[];

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

          {fiche.objectifs && (
            <p className="text-sm text-gray-600 mb-6 italic">{fiche.objectifs}</p>
          )}

          <div className="space-y-6">
            {phases.map((phase) => (
              <div key={phase.id} className="flex gap-4">
                {phase.duree && (
                  <div
                    className="flex-shrink-0 w-14 text-center text-sm font-medium py-1 rounded self-start"
                    style={{ color: opts.couleur, backgroundColor: `${opts.couleur}15` }}
                  >
                    {phase.duree} min
                  </div>
                )}
                <div className="flex-1">
                  {phase.titre && (
                    <h3
                      className="font-semibold text-sm mb-1"
                      style={{ color: opts.couleur }}
                    >
                      {phase.titre}
                    </h3>
                  )}
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: tiptapJsonToHtml(phase.description as Record<string, unknown>),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </>
  );
}
