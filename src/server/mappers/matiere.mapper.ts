import { Prisma, type Matiere } from '@/generated/prisma';
import type { MatiereDto, MatiereListItemDto } from '@/lib/domain/dto';

export type PrismaMatiereListItem = Prisma.MatiereGetPayload<{
  include: {
    discipline: true;
    _count: { select: { sequences: true } };
  };
}>;

export function toMatiereDto(raw: Matiere): MatiereDto {
  return {
    id: raw.id,
    titre: raw.titre,
    ordre: raw.ordre,
    classeurId: raw.classeurId,
    disciplineId: raw.disciplineId,
    periodesVisibles: raw.periodesVisibles as string[],
    domaineIdsVisibles: raw.domaineIdsVisibles,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export function toMatiereListItem(raw: PrismaMatiereListItem): MatiereListItemDto {
  return {
    ...toMatiereDto(raw),
    discipline: raw.discipline ? { id: raw.discipline.id, label: raw.discipline.label } : null,
    _count: { sequences: raw._count.sequences },
  };
}

export function toMatiereListItems(raws: PrismaMatiereListItem[]): MatiereListItemDto[] {
  return raws.map(toMatiereListItem);
}
