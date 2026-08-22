import { Prisma, type Matiere } from '@/generated/prisma';
import type { MatiereDto, MatiereListItemDto } from '@/lib/domain/dto';

export type PrismaMatiereListItem = Prisma.MatiereGetPayload<{
  include: {
    domaine: true;
    _count: { select: { sequences: true } };
  };
}>;

export function toMatiereDto(raw: Matiere): MatiereDto {
  return {
    id: raw.id,
    titre: raw.titre,
    ordre: raw.ordre,
    classeurId: raw.classeurId,
    domaineId: raw.domaineId,
    periodesVisibles: raw.periodesVisibles as string[],
    sousDomainIdsVisibles: raw.sousDomainIdsVisibles,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export function toMatiereListItem(raw: PrismaMatiereListItem): MatiereListItemDto {
  return {
    ...toMatiereDto(raw),
    domaine: raw.domaine ? { id: raw.domaine.id, label: raw.domaine.label } : null,
    _count: { sequences: raw._count.sequences },
  };
}

export function toMatiereListItems(raws: PrismaMatiereListItem[]): MatiereListItemDto[] {
  return raws.map(toMatiereListItem);
}
