'use client';

interface PdfPreviewProps {
  ficheId: string;
}

export default function PdfPreview({ ficheId }: PdfPreviewProps) {
  return (
    <div className="pdf-preview">
      <p>Aperçu PDF de la fiche {ficheId} — à implémenter.</p>
    </div>
  );
}
