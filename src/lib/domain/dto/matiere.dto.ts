export interface DomaineDto {
  id: string;
  label: string;
}

export interface MatiereDto {
  id: string;
  titre: string;
  ordre: number;
  classeurId: string;
  domaineId: string | null;
  periodesVisibles: string[];
  sousDomainIdsVisibles: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MatiereListItemDto extends MatiereDto {
  domaine: DomaineDto | null;
  _count: { sequences: number };
}

export interface MatiereInClasseurDto extends MatiereDto {
  domaine: DomaineDto | null;
}

export interface CreateMatiereInput {
  titre: string;
  classeurId: string;
  domaineId?: string;
}

export interface UpdateMatiereInput {
  titre?: string;
  domaineId?: string | null;
  periodesVisibles?: string[];
  sousDomainIdsVisibles?: string[];
}
