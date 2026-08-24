export interface DisciplineDto {
  id: string;
  label: string;
}

export interface MatiereDto {
  id: string;
  titre: string;
  ordre: number;
  classeurId: string;
  disciplineId: string | null;
  periodesVisibles: string[];
  domaineIdsVisibles: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MatiereListItemDto extends MatiereDto {
  discipline: DisciplineDto | null;
  _count: { sequences: number };
}

export interface MatiereInClasseurDto extends MatiereDto {
  discipline: DisciplineDto | null;
}

export interface CreateMatiereInput {
  titre: string;
  classeurId: string;
  disciplineId?: string;
}

export interface UpdateMatiereInput {
  titre?: string;
  disciplineId?: string | null;
  periodesVisibles?: string[];
  domaineIdsVisibles?: string[];
}
