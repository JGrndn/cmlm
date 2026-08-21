import type { PrismaClient } from '@/generated/prisma';
import { DomainError } from '@/lib/errors/domain-error';
import type {
  SeanceDto,
  SeanceListItemDto,
  SeanceDetailDto,
  CreateSeanceInput,
  UpdateSeanceInput,
} from '@/lib/domain/dto';
import {
  toSeanceDto,
  toSeanceListItems,
  toSeanceDetail,
} from '@/server/mappers/seance.mapper';

const LIST_INCLUDE = {
  fiches: { include: { items: { select: { duree: true } } } },
} as const;

const DETAIL_INCLUDE = {
  fiches: {
    orderBy: { ordre: 'asc' as const },
    include: { items: { orderBy: { ordre: 'asc' as const } } },
  },
} as const;

export class SeanceService {
  constructor(private readonly db: PrismaClient) {}

  async list(sequenceId: string, userId: string): Promise<SeanceListItemDto[]> {
    const seq = await this.db.sequence.findFirst({
      where: { id: sequenceId, matiere: { classeur: { userId } } },
    });
    if (!seq) throw new DomainError('Séquence non trouvée', 'NOT_FOUND');

    const rows = await this.db.seance.findMany({
      where: { sequenceId },
      orderBy: { ordre: 'asc' },
      include: LIST_INCLUDE,
    });
    return toSeanceListItems(rows);
  }

  async getById(id: string, userId: string): Promise<SeanceDetailDto> {
    const row = await this.db.seance.findFirst({
      where: { id, sequence: { matiere: { classeur: { userId } } } },
      include: DETAIL_INCLUDE,
    });
    if (!row) throw new DomainError('Séance non trouvée', 'NOT_FOUND');
    return toSeanceDetail(row);
  }

  async create(input: CreateSeanceInput, userId: string): Promise<SeanceDto> {
    const seq = await this.db.sequence.findFirst({
      where: { id: input.sequenceId, matiere: { classeur: { userId } } },
    });
    if (!seq) throw new DomainError('Séquence non trouvée', 'NOT_FOUND');

    const count = await this.db.seance.count({ where: { sequenceId: input.sequenceId } });
    const row = await this.db.seance.create({
      data: {
        titre: input.titre,
        sequenceId: input.sequenceId,
        date: input.date ? new Date(input.date) : undefined,
        ordre: count + 1,
      },
    });
    return toSeanceDto(row);
  }

  async update(id: string, input: UpdateSeanceInput, userId: string): Promise<SeanceDto> {
    await this.assertOwner(id, userId);
    const row = await this.db.seance.update({
      where: { id },
      data: {
        titre: input.titre,
        ...(input.date !== undefined ? { date: input.date ? new Date(input.date) : null } : {}),
      },
    });
    return toSeanceDto(row);
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.assertOwner(id, userId);
    await this.db.seance.delete({ where: { id } });
  }

  async reorder(ids: string[], userId: string): Promise<void> {
    await Promise.all(
      ids.map((id, ordre) =>
        this.db.seance.updateMany({
          where: { id, sequence: { matiere: { classeur: { userId } } } },
          data: { ordre: ordre + 1 },
        }),
      ),
    );
  }

  private async assertOwner(id: string, userId: string) {
    const row = await this.db.seance.findFirst({
      where: { id, sequence: { matiere: { classeur: { userId } } } },
    });
    if (!row) throw new DomainError('Séance non trouvée', 'NOT_FOUND');
    return row;
  }
}

export const seanceService = (db: PrismaClient) => new SeanceService(db);
