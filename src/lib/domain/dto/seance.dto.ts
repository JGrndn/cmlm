export interface SeanceDto {
  id: string;
  titre: string;
  ordre: number;
  sequenceId: string;
  date: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SeanceListItemDto extends SeanceDto {
  fiches: { items: { duree: number | null }[] }[];
}

export interface SeanceDetailDto extends SeanceDto {
  fiches: {
    id: string;
    titre: string;
    ordre: number;
    items: {
      id: string;
      ordre: number;
      duree: number | null;
      contenu: Record<string, unknown>;
    }[];
  }[];
}

export interface CreateSeanceInput {
  titre: string;
  sequenceId: string;
  date?: string;
}

export interface UpdateSeanceInput {
  titre?: string;
  date?: string | null;
}
