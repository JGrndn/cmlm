import { Prisma, type Classeur } from '@/generated/prisma';
import type {
  ClasseurDto,
  ClasseurListItemDto,
  ClasseurDetailDto,
  MatiereInClasseurDto,
} from '@/lib/domain/dto';

export type PrismaClasseurListItem = Prisma.ClasseurGetPayload<{
  include: {
    niveau: { include: { cycle: true } };
    anneeScolaire: true;
    _count: { select: { matieres: true } };
  };
}>;

export type PrismaClasseurDetail = Prisma.ClasseurGetPayload<{
  include: {
    niveau: { include: { cycle: true } };
    anneeScolaire: true;
    matieres: { include: { discipline: true } };
  };
}>;

export function toClasseurDto(raw: Classeur): ClasseurDto {
  return {
    id: raw.id,
    titre: raw.titre,
    niveauId: raw.niveauId,
    anneeScolaireId: raw.anneeScolaireId,
    userId: raw.userId,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export function toClasseurListItem(raw: PrismaClasseurListItem): ClasseurListItemDto {
  return {
    ...toClasseurDto(raw),
    niveau: {
      id: raw.niveau.id,
      label: raw.niveau.label,
      cycle: { id: raw.niveau.cycle.id, label: raw.niveau.cycle.label },
    },
    anneeScolaire: {
      id: raw.anneeScolaire.id,
      label: raw.anneeScolaire.label,
      debut: raw.anneeScolaire.debut,
      fin: raw.anneeScolaire.fin,
    },
    _count: { matieres: raw._count.matieres },
  };
}

export function toClasseurListItems(raws: PrismaClasseurListItem[]): ClasseurListItemDto[] {
  return raws.map(toClasseurListItem);
}

export function toClasseurDetail(raw: PrismaClasseurDetail): ClasseurDetailDto {
  return {
    ...toClasseurDto(raw),
    niveau: {
      id: raw.niveau.id,
      label: raw.niveau.label,
      cycle: { id: raw.niveau.cycle.id, label: raw.niveau.cycle.label },
    },
    anneeScolaire: {
      id: raw.anneeScolaire.id,
      label: raw.anneeScolaire.label,
      debut: raw.anneeScolaire.debut,
      fin: raw.anneeScolaire.fin,
    },
    matieres: raw.matieres.map(
      (m): MatiereInClasseurDto => ({
        id: m.id,
        titre: m.titre,
        ordre: m.ordre,
        classeurId: m.classeurId,
        disciplineId: m.disciplineId,
        periodesVisibles: m.periodesVisibles as string[],
        domaineIdsVisibles: m.domaineIdsVisibles,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
        discipline: m.discipline ? { id: m.discipline.id, label: m.discipline.label } : null,
      }),
    ),
  };
}
