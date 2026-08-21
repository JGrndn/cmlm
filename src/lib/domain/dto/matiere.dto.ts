export interface SousDomainDto {
  id: string;
  label: string;
  domaine: { id: string; label: string };
}

export interface MatiereDto {
  id: string;
  titre: string;
  ordre: number;
  classeurId: string;
  sousDomainId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MatiereListItemDto extends MatiereDto {
  sousDomaine: SousDomainDto | null;
  _count: { sequences: number };
}

export interface MatiereInClasseurDto extends MatiereDto {
  sousDomaine: SousDomainDto | null;
}

export interface CreateMatiereInput {
  titre: string;
  classeurId: string;
  sousDomainId?: string;
}

export interface UpdateMatiereInput {
  titre?: string;
  sousDomainId?: string | null;
}
