import type { PrismaClient } from '@/generated/prisma';
import { DomainError } from '@/lib/errors/domain-error';
import type {
  MatiereDto,
  MatiereListItemDto,
  CreateMatiereInput,
  UpdateMatiereInput,
} from '@/lib/domain/dto';
import { toMatiereDto, toMatiereListItems } from '@/server/mappers/matiere.mapper';

const LIST_INCLUDE = {
  sousDomaine: { include: { domaine: true } },
  _count: { select: { sequences: true } },
} as const;

export class MatiereService {
  constructor(private readonly db: PrismaClient) {}

  async list(classeurId: string, userId: string): Promise<MatiereListItemDto[]> {
    const classeur = await this.db.classeur.findFirst({ where: { id: classeurId, userId } });
    if (!classeur) throw new DomainError('Classeur non trouvé', 'NOT_FOUND');

    const rows = await this.db.matiere.findMany({
      where: { classeurId },
      orderBy: { ordre: 'asc' },
      include: LIST_INCLUDE,
    });
    return toMatiereListItems(rows);
  }

  async create(input: CreateMatiereInput, userId: string): Promise<MatiereDto> {
    const classeur = await this.db.classeur.findFirst({
      where: { id: input.classeurId, userId },
    });
    if (!classeur) throw new DomainError('Classeur non trouvé', 'NOT_FOUND');

    const count = await this.db.matiere.count({ where: { classeurId: input.classeurId } });
    const row = await this.db.matiere.create({ data: { ...input, ordre: count + 1 } });
    return toMatiereDto(row);
  }

  async update(id: string, input: UpdateMatiereInput, userId: string): Promise<MatiereDto> {
    await this.assertOwner(id, userId);
    const row = await this.db.matiere.update({ where: { id }, data: input });
    return toMatiereDto(row);
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.assertOwner(id, userId);
    await this.db.matiere.delete({ where: { id } });
  }

  async reorder(ids: string[], userId: string): Promise<void> {
    await Promise.all(
      ids.map((id, ordre) =>
        this.db.matiere.updateMany({
          where: { id, classeur: { userId } },
          data: { ordre: ordre + 1 },
        }),
      ),
    );
  }

  private async assertOwner(id: string, userId: string) {
    const row = await this.db.matiere.findFirst({
      where: { id, classeur: { userId } },
    });
    if (!row) throw new DomainError('Matière non trouvée', 'NOT_FOUND');
    return row;
  }
}

export const matiereService = (db: PrismaClient) => new MatiereService(db);
