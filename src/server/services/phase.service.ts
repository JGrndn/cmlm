import type { PrismaClient } from '@/generated/prisma';
import { DomainError } from '@/lib/errors/domain-error';
import type { PhaseDto } from '@/lib/domain/dto';
import { Prisma } from '@/generated/prisma';

const EMPTY_DOC = { type: 'doc', content: [{ type: 'paragraph' }] };

function toPhaseDto(raw: { id: string; ficheId: string; titre: string; duree: number | null; description: unknown; ordre: number; createdAt: Date; updatedAt: Date }): PhaseDto {
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

export class PhaseService {
  constructor(private readonly db: PrismaClient) {}

  async create(
    input: { ficheId: string; titre?: string; description?: Record<string, unknown>; duree?: number },
    userId: string,
  ): Promise<PhaseDto> {
    const fiche = await this.db.fiche.findFirst({
      where: {
        id: input.ficheId,
        sequence: { matiere: { classeur: { userId } } },
      },
    });
    if (!fiche) throw new DomainError('Fiche non trouvée', 'NOT_FOUND');

    const count = await this.db.phase.count({ where: { ficheId: input.ficheId } });
    const row = await this.db.phase.create({
      data: {
        ficheId: input.ficheId,
        titre: input.titre ?? '',
        description: (input.description ?? EMPTY_DOC) as Prisma.InputJsonValue,
        ordre: count + 1,
        ...(input.duree !== undefined ? { duree: input.duree } : {}),
      },
    });
    return toPhaseDto(row);
  }

  async update(
    id: string,
    input: { titre?: string; description?: Record<string, unknown>; duree?: number | null },
    userId: string,
  ): Promise<PhaseDto> {
    await this.assertOwner(id, userId);
    const { description, ...rest } = input;
    const row = await this.db.phase.update({
      where: { id },
      data: {
        ...rest,
        ...(description !== undefined ? { description: description as Prisma.InputJsonValue } : {}),
      },
    });
    return toPhaseDto(row);
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.assertOwner(id, userId);
    await this.db.phase.delete({ where: { id } });
  }

  async reorder(ids: string[], userId: string): Promise<void> {
    await Promise.all(
      ids.map((id, ordre) =>
        this.db.phase.updateMany({
          where: {
            id,
            fiche: { sequence: { matiere: { classeur: { userId } } } },
          },
          data: { ordre: ordre + 1 },
        }),
      ),
    );
  }

  private async assertOwner(id: string, userId: string) {
    const phase = await this.db.phase.findFirst({
      where: {
        id,
        fiche: { sequence: { matiere: { classeur: { userId } } } },
      },
    });
    if (!phase) throw new DomainError('Phase non trouvée', 'NOT_FOUND');
    return phase;
  }
}

export const phaseService = (db: PrismaClient) => new PhaseService(db);
