import { Prisma, type Sequence } from '@/generated/prisma';
import type { SequenceDto, SequenceListItemDto } from '@/lib/domain/dto';
import type { Periode } from '@/lib/domain/dto/sequence.dto';

export type PrismaSequenceListItem = Prisma.SequenceGetPayload<{
  include: { _count: { select: { seances: true } } };
}>;

export function toSequenceDto(raw: Sequence): SequenceDto {
  return {
    id: raw.id,
    titre: raw.titre,
    ordre: raw.ordre,
    matiereId: raw.matiereId,
    periode: raw.periode as Periode | null,
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
