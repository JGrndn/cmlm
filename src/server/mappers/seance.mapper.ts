import { Prisma, type Seance } from '@/generated/prisma';
import type { SeanceDto, SeanceListItemDto, SeanceDetailDto } from '@/lib/domain/dto';

export type PrismaSeanceListItem = Prisma.SeanceGetPayload<{
  include: { fiches: { include: { items: { select: { duree: true } } } } };
}>;

export type PrismaSeanceDetail = Prisma.SeanceGetPayload<{
  include: { fiches: { include: { items: true } } };
}>;

export function toSeanceDto(raw: Seance): SeanceDto {
  return {
    id: raw.id,
    titre: raw.titre,
    ordre: raw.ordre,
    sequenceId: raw.sequenceId,
    date: raw.date,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export function toSeanceListItem(raw: PrismaSeanceListItem): SeanceListItemDto {
  return {
    ...toSeanceDto(raw),
    fiches: raw.fiches.map((f) => ({
      items: f.items.map((i) => ({ duree: i.duree })),
    })),
  };
}

export function toSeanceListItems(raws: PrismaSeanceListItem[]): SeanceListItemDto[] {
  return raws.map(toSeanceListItem);
}

export function toSeanceDetail(raw: PrismaSeanceDetail): SeanceDetailDto {
  return {
    ...toSeanceDto(raw),
    fiches: raw.fiches.map((f) => ({
      id: f.id,
      titre: f.titre,
      ordre: f.ordre,
      items: f.items.map((i) => ({
        id: i.id,
        ordre: i.ordre,
        duree: i.duree,
        contenu: i.contenu as Record<string, unknown>,
      })),
    })),
  };
}
