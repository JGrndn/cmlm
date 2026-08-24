export interface SequenceDto {
  id: string;
  titre: string;
  ordre: number;
  matiereId: string;
  sousDomainId: string | null;
  periodeId: string | null;
  periodeLabel: string | null;
  objectifs: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SequenceListItemDto extends SequenceDto {
  _count: { seances: number };
}

export interface CreateSequenceInput {
  titre: string;
  matiereId: string;
  sousDomainId?: string;
  periodeId?: string;
  objectifs?: string;
}

export interface UpdateSequenceInput {
  titre?: string;
  sousDomainId?: string | null;
  periodeId?: string | null;
  objectifs?: string | null;
}
