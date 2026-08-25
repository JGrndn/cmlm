import type { MatiereInClasseurDto } from './matiere.dto';

export interface NiveauDto {
  id: string;
  label: string;
  code: string;
  cycle: { id: string; label: string };
}

export interface AnneeScolaireDto {
  id: string;
  label: string;
  debut: number;
  fin: number;
}

export interface ClasseurDto {
  id: string;
  titre: string;
  niveauId: string;
  anneeScolaireId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClasseurListItemDto extends ClasseurDto {
  niveau: NiveauDto;
  anneeScolaire: AnneeScolaireDto;
  _count: { matieres: number };
}

export interface ClasseurDetailDto extends ClasseurDto {
  niveau: NiveauDto;
  anneeScolaire: AnneeScolaireDto;
  matieres: MatiereInClasseurDto[];
}

export interface CreateClasseurInput {
  titre: string;
  niveauId: string;
  anneeScolaireId: string;
}

export interface UpdateClasseurInput {
  titre?: string;
  niveauId?: string;
  anneeScolaireId?: string;
}
