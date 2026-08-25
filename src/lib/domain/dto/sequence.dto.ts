import type { FicheWithPhasesDto } from './fiche.dto';

export interface SequenceDetailDto extends SequenceDto {
  _count: { fiches: number };
  fiches: FicheWithPhasesDto[];
}

export interface SequenceDto {
  id: string;
  titre: string;
  ordre: number;
  matiereId: string;
  niveauIds: string[];
  periodeId: string | null;
  periodeLabel: string | null;
  objectifs: string | null;
  disciplineIds: string[];
  domaineIds: string[];
  sousDomainIds: string[];
  objectifIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SequenceListItemDto extends SequenceDto {
  _count: { fiches: number };
}

export interface CreateSequenceInput {
  titre: string;
  matiereId: string;
  niveauIds?: string[];
  periodeId?: string;
  objectifs?: string;
  domaineIds?: string[];
  disciplineIds?: string[];
  sousDomainIds?: string[];
  objectifIds?: string[];
}

export interface UpdateSequenceInput {
  titre?: string;
  niveauIds?: string[];
  periodeId?: string | null;
  objectifs?: string | null;
  disciplineIds?: string[];
  domaineIds?: string[];
  sousDomainIds?: string[];
  objectifIds?: string[];
}
