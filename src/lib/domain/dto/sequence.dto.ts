export type Periode = 'P1' | 'P2' | 'P3' | 'P4' | 'P5';

export interface SequenceDto {
  id: string;
  titre: string;
  ordre: number;
  matiereId: string;
  sousDomainId: string | null;
  periode: Periode | null;
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
  periode?: Periode;
  objectifs?: string;
}

export interface UpdateSequenceInput {
  titre?: string;
  sousDomainId?: string | null;
  periode?: Periode | null;
  objectifs?: string | null;
}
