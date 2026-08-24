import type { PrismaClient } from '@/generated/prisma';
import { DomainError } from '@/lib/errors/domain-error';
import type {
  SequenceDto,
  SequenceListItemDto,
  CreateSequenceInput,
  UpdateSequenceInput,
} from '@/lib/domain/dto';
import { toSequenceDto, toSequenceListItems } from '@/server/mappers/sequence.mapper';

const PERIODE_SELECT = { select: { id: true, label: true } } as const;

const LIST_INCLUDE = {
  _count: { select: { seances: true } },
  periode: PERIODE_SELECT,
} as const;

const SINGLE_INCLUDE = {
  periode: PERIODE_SELECT,
} as const;

export class SequenceService {
  constructor(private readonly db: PrismaClient) {}

  async list(matiereId: string, userId: string): Promise<SequenceListItemDto[]> {
    const matiere = await this.db.matiere.findFirst({
      where: { id: matiereId, classeur: { userId } },
    });
    if (!matiere) throw new DomainError('Matière non trouvée', 'NOT_FOUND');

    const rows = await this.db.sequence.findMany({
      where: { matiereId },
      orderBy: { ordre: 'asc' },
      include: LIST_INCLUDE,
    });
    return toSequenceListItems(rows);
  }

  async create(input: CreateSequenceInput, userId: string): Promise<SequenceDto> {
    const matiere = await this.db.matiere.findFirst({
      where: { id: input.matiereId, classeur: { userId } },
    });
    if (!matiere) throw new DomainError('Matière non trouvée', 'NOT_FOUND');

    const count = await this.db.sequence.count({ where: { matiereId: input.matiereId } });
    const row = await this.db.sequence.create({
      data: {
        titre: input.titre,
        matiereId: input.matiereId,
        domaineId: input.domaineId,
        periodeId: input.periodeId,
        objectifs: input.objectifs,
        ordre: count + 1,
      },
      include: SINGLE_INCLUDE,
    });
    return toSequenceDto(row);
  }

  async update(id: string, input: UpdateSequenceInput, userId: string): Promise<SequenceDto> {
    await this.assertOwner(id, userId);
    const row = await this.db.sequence.update({
      where: { id },
      data: {
        titre: input.titre,
        domaineId: input.domaineId,
        periodeId: input.periodeId,
        objectifs: input.objectifs,
      },
      include: SINGLE_INCLUDE,
    });
    return toSequenceDto(row);
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.assertOwner(id, userId);
    await this.db.sequence.delete({ where: { id } });
  }

  async reorder(ids: string[], userId: string): Promise<void> {
    await Promise.all(
      ids.map((id, ordre) =>
        this.db.sequence.updateMany({
          where: { id, matiere: { classeur: { userId } } },
          data: { ordre: ordre + 1 },
        }),
      ),
    );
  }

  private async assertOwner(id: string, userId: string) {
    const row = await this.db.sequence.findFirst({
      where: { id, matiere: { classeur: { userId } } },
    });
    if (!row) throw new DomainError('Séquence non trouvée', 'NOT_FOUND');
    return row;
  }
}

export const sequenceService = (db: PrismaClient) => new SequenceService(db);
