import { Prisma, type Sequence } from '@/generated/prisma';
import type { SequenceDto, SequenceListItemDto } from '@/lib/domain/dto';

export type PrismaSequenceListItem = Prisma.SequenceGetPayload<{
  include: {
    _count: { select: { seances: true } };
    periode: { select: { id: true; label: true } };
  };
}>;

export type PrismaSequenceWithPeriode = Sequence & {
  periode?: { id: string; label: string } | null;
};

export function toSequenceDto(raw: PrismaSequenceWithPeriode): SequenceDto {
  return {
    id: raw.id,
    titre: raw.titre,
    ordre: raw.ordre,
    matiereId: raw.matiereId,
    domaineId: raw.domaineId,
    periodeId: raw.periodeId,
    periodeLabel: raw.periode?.label ?? null,
    objectifs: raw.objectifs,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export function toSequenceListItem(raw: PrismaSequenceListItem): SequenceListItemDto {
  return {
    ...toSequenceDto(raw),
    _count: { seances: raw._count.seances },
  };
}

export function toSequenceListItems(raws: PrismaSequenceListItem[]): SequenceListItemDto[] {
  return raws.map(toSequenceListItem);
}
