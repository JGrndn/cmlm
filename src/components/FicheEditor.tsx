'use client';

interface FicheEditorProps {
  ficheId: string;
}

export default function FicheEditor({ ficheId }: FicheEditorProps) {
  return (
    <div className="fiche-editor">
      <p>Éditeur de la fiche {ficheId} — liste d'items à implémenter.</p>
    </div>
  );
}
