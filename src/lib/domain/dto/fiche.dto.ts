import type { PhaseDto } from './phase.dto';

export interface FicheDto {
  id: string;
  titre: string;
  sequenceId: string;
  ordre: number;
  objectifs: string | null;
  materiels: string[];
  disciplineIds: string[];
  domaineIds: string[];
  sousDomainIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FicheWithPhasesDto extends FicheDto {
  phases: PhaseDto[];
}

export interface CreateFicheInput {
  titre: string;
  sequenceId: string;
}

export interface UpdateFicheInput {
  titre?: string;
  objectifs?: string | null;
  materiels?: string[];
  disciplineIds?: string[];
  domaineIds?: string[];
  sousDomainIds?: string[];
}
