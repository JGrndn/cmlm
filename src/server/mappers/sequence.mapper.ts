import { Prisma } from '@/generated/prisma';
import type { SequenceDto, SequenceListItemDto } from '@/lib/domain/dto';

export type PrismaSequenceListItem = Prisma.SequenceGetPayload<{
  include: {
    _count: { select: { fiches: true } };
    periode: { select: { id: true; label: true } };
    niveaux: { select: { id: true } };
    disciplines: { select: { id: true } };
    domaines: { select: { id: true } };
    sousDomaines: { select: { id: true } };
    objectifsLearning: { select: { id: true } };
  };
}>;

export type PrismaSequenceSingle = Prisma.SequenceGetPayload<{
  include: {
    periode: { select: { id: true; label: true } };
    niveaux: { select: { id: true } };
    disciplines: { select: { id: true } };
    domaines: { select: { id: true } };
    sousDomaines: { select: { id: true } };
    objectifsLearning: { select: { id: true } };
  };
}>;

export function toSequenceDto(raw: PrismaSequenceSingle): SequenceDto {
  return {
    id: raw.id,
    titre: raw.titre,
    ordre: raw.ordre,
    matiereId: raw.matiereId,
    niveauIds: raw.niveaux.map((n) => n.id),
    periodeId: raw.periodeId,
    periodeLabel: raw.periode?.label ?? null,
    objectifs: raw.objectifs,
    disciplineIds: raw.disciplines.map((d) => d.id),
    domaineIds: raw.domaines.map((d) => d.id),
    sousDomainIds: raw.sousDomaines.map((d) => d.id),
    objectifIds: raw.objectifsLearning.map((o) => o.id),
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export function toSequenceListItem(raw: PrismaSequenceListItem): SequenceListItemDto {
  return {
    ...toSequenceDto(raw),
    _count: { fiches: raw._count.fiches },
  };
}

export function toSequenceListItems(raws: PrismaSequenceListItem[]): SequenceListItemDto[] {
  return raws.map(toSequenceListItem);
}
