import { Prisma, type Matiere } from '@/generated/prisma';
import type { MatiereDto, MatiereListItemDto } from '@/lib/domain/dto';

export type PrismaMatiereListItem = Prisma.MatiereGetPayload<{
  include: {
    sousDomaine: { include: { domaine: true } };
    _count: { select: { sequences: true } };
  };
}>;

export function toMatiereDto(raw: Matiere): MatiereDto {
  return {
    id: raw.id,
    titre: raw.titre,
    ordre: raw.ordre,
    classeurId: raw.classeurId,
    sousDomainId: raw.sousDomainId,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export function toMatiereListItem(raw: PrismaMatiereListItem): MatiereListItemDto {
  return {
    ...toMatiereDto(raw),
    sousDomaine: raw.sousDomaine
      ? {
          id: raw.sousDomaine.id,
          label: raw.sousDomaine.label,
          domaine: { id: raw.sousDomaine.domaine.id, label: raw.sousDomaine.domaine.label },
        }
      : null,
    _count: { sequences: raw._count.sequences },
  };
}

export function toMatiereListItems(raws: PrismaMatiereListItem[]): MatiereListItemDto[] {
  return raws.map(toMatiereListItem);
}
