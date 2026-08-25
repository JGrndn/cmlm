import type { PrismaClient } from '@/generated/prisma';
import { DomainError } from '@/lib/errors/domain-error';
import type { FicheWithPhasesDto, CreateFicheInput, UpdateFicheInput } from '@/lib/domain/dto';
import { toFicheDto } from '@/server/mappers/fiche.mapper';

const M2M_ID_SELECT = { select: { id: true } } as const;

const FICHE_INCLUDE = {
  phases: { orderBy: { ordre: 'asc' as const } },
  disciplines: M2M_ID_SELECT,
  domaines: M2M_ID_SELECT,
  sousDomaines: M2M_ID_SELECT,
  classeur: true as const,
} as const;

function connectIds(ids?: string[]) {
  return ids?.map((id) => ({ id })) ?? [];
}

export class FicheService {
  constructor(private readonly db: PrismaClient) {}

  async list(sequenceId: string, userId: string): Promise<FicheWithPhasesDto[]> {
    const seq = await this.db.sequence.findFirst({
      where: { id: sequenceId, matiere: { classeur: { userId } } },
    });
    if (!seq) throw new DomainError('Séquence non trouvée', 'NOT_FOUND');

    const rows = await this.db.fiche.findMany({
      where: { sequenceId },
      orderBy: { ordre: 'asc' },
      include: FICHE_INCLUDE,
    });
    return rows.map(toFicheDto);
  }

  async listStandalone(classeurId: string, userId: string): Promise<FicheWithPhasesDto[]> {
    const classeur = await this.db.classeur.findFirst({
      where: { id: classeurId, userId },
    });
    if (!classeur) throw new DomainError('Classeur non trouvé', 'NOT_FOUND');

    const rows = await this.db.fiche.findMany({
      where: { classeurId, sequenceId: null },
      orderBy: { ordre: 'asc' },
      include: FICHE_INCLUDE,
    });
    return rows.map(toFicheDto);
  }

  async getById(id: string, userId: string): Promise<FicheWithPhasesDto> {
    const row = await this.db.fiche.findUnique({
      where: { id },
      include: {
        ...FICHE_INCLUDE,
        sequence: { include: { matiere: { include: { classeur: true } } } },
      },
    });
    if (!row) throw new DomainError('Fiche non trouvée', 'NOT_FOUND');
    const owned =
      row.sequence?.matiere.classeur.userId === userId ||
      row.classeur?.userId === userId;
    if (!owned) throw new DomainError('Fiche non trouvée', 'NOT_FOUND');
    return toFicheDto(row);
  }

  async create(input: CreateFicheInput, userId: string): Promise<FicheWithPhasesDto> {
    const seq = await this.db.sequence.findFirst({
      where: { id: input.sequenceId, matiere: { classeur: { userId } } },
    });
    if (!seq) throw new DomainError('Séquence non trouvée', 'NOT_FOUND');

    const count = await this.db.fiche.count({ where: { sequenceId: input.sequenceId } });
    const row = await this.db.fiche.create({
      data: { titre: input.titre, sequenceId: input.sequenceId, ordre: count + 1, materiels: [] },
      include: FICHE_INCLUDE,
    });
    return toFicheDto(row);
  }

  async createStandalone(titre: string, classeurId: string, userId: string): Promise<FicheWithPhasesDto> {
    const classeur = await this.db.classeur.findFirst({
      where: { id: classeurId, userId },
    });
    if (!classeur) throw new DomainError('Classeur non trouvé', 'NOT_FOUND');

    const count = await this.db.fiche.count({ where: { classeurId, sequenceId: null } });
    const row = await this.db.fiche.create({
      data: { titre, classeurId, ordre: count + 1, materiels: [] },
      include: FICHE_INCLUDE,
    });
    return toFicheDto(row);
  }

  async attachToSequence(ficheId: string, sequenceId: string, userId: string): Promise<FicheWithPhasesDto> {
    await this.assertOwner(ficheId, userId);

    const seq = await this.db.sequence.findFirst({
      where: { id: sequenceId, matiere: { classeur: { userId } } },
    });
    if (!seq) throw new DomainError('Séquence non trouvée', 'NOT_FOUND');

    const count = await this.db.fiche.count({ where: { sequenceId } });
    const row = await this.db.fiche.update({
      where: { id: ficheId },
      data: { sequenceId, classeurId: null, ordre: count + 1 },
      include: FICHE_INCLUDE,
    });
    return toFicheDto(row);
  }

  async update(id: string, input: UpdateFicheInput, userId: string): Promise<FicheWithPhasesDto> {
    await this.assertOwner(id, userId);
    const row = await this.db.fiche.update({
      where: { id },
      data: {
        titre: input.titre,
        objectifs: input.objectifs,
        ...(input.materiels !== undefined && { materiels: input.materiels }),
        ...(input.disciplineIds !== undefined && {
          disciplines: { set: connectIds(input.disciplineIds) },
        }),
        ...(input.domaineIds !== undefined && {
          domaines: { set: connectIds(input.domaineIds) },
        }),
        ...(input.sousDomainIds !== undefined && {
          sousDomaines: { set: connectIds(input.sousDomainIds) },
        }),
      },
      include: FICHE_INCLUDE,
    });
    return toFicheDto(row);
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.assertOwner(id, userId);
    await this.db.fiche.delete({ where: { id } });
  }

  async reorder(ids: string[], userId: string): Promise<void> {
    await Promise.all(
      ids.map((id, ordre) =>
        this.db.fiche.updateMany({
          where: { id, sequence: { matiere: { classeur: { userId } } } },
          data: { ordre: ordre + 1 },
        }),
      ),
    );
  }

  private async assertOwner(id: string, userId: string) {
    const row = await this.db.fiche.findUnique({
      where: { id },
      include: {
        sequence: { include: { matiere: { include: { classeur: true } } } },
        classeur: true,
      },
    });
    if (!row) throw new DomainError('Fiche non trouvée', 'NOT_FOUND');
    const owned =
      row.sequence?.matiere.classeur.userId === userId ||
      row.classeur?.userId === userId;
    if (!owned) throw new DomainError('Fiche non trouvée', 'NOT_FOUND');
    return row;
  }
}

export const ficheService = (db: PrismaClient) => new FicheService(db);
