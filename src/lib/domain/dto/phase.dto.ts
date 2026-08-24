export interface PhaseDto {
  id: string;
  ficheId: string;
  titre: string;
  duree: number | null;
  description: unknown;
  ordre: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePhaseInput {
  ficheId: string;
  titre?: string;
  description?: Record<string, unknown>;
  duree?: number;
}

export interface UpdatePhaseInput {
  titre?: string;
  duree?: number | null;
  description?: Record<string, unknown>;
}
