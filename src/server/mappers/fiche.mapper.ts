import { Prisma } from '@/generated/prisma';
import type { FicheWithPhasesDto, PhaseDto } from '@/lib/domain/dto';

export type PrismaFicheWithPhases = Prisma.FicheGetPayload<{
  include: {
    phases: { orderBy: { ordre: 'asc' } };
    disciplines: { select: { id: true } };
    domaines: { select: { id: true } };
    sousDomaines: { select: { id: true } };
  };
}>;

export function toPhaseDto(raw: PrismaFicheWithPhases['phases'][0]): PhaseDto {
  return {
    id: raw.id,
    ficheId: raw.ficheId,
    titre: raw.titre,
    duree: raw.duree,
    description: raw.description,
    ordre: raw.ordre,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export function toFicheDto(raw: PrismaFicheWithPhases): FicheWithPhasesDto {
  return {
    id: raw.id,
    titre: raw.titre,
    sequenceId: raw.sequenceId,
    ordre: raw.ordre,
    objectifs: raw.objectifs,
    materiels: raw.materiels,
    disciplineIds: raw.disciplines.map((d) => d.id),
    domaineIds: raw.domaines.map((d) => d.id),
    sousDomainIds: raw.sousDomaines.map((d) => d.id),
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    phases: raw.phases.map(toPhaseDto),
  };
}
