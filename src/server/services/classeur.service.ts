import type { PrismaClient } from '@/generated/prisma';
import { DomainError } from '@/lib/errors/domain-error';
import type {
  ClasseurDto,
  ClasseurListItemDto,
  ClasseurDetailDto,
  CreateClasseurInput,
  UpdateClasseurInput,
} from '@/lib/domain/dto';
import {
  toClasseurDto,
  toClasseurListItem,
  toClasseurListItems,
  toClasseurDetail,
} from '@/server/mappers/classeur.mapper';

const LIST_INCLUDE = {
  niveau: { include: { cycle: true } },
  anneeScolaire: true,
  _count: { select: { matieres: true } },
} as const;

const DETAIL_INCLUDE = {
  niveau: { include: { cycle: true } },
  anneeScolaire: true,
  matieres: {
    orderBy: { ordre: 'asc' as const },
    include: { domaine: true },
  },
} as const;

export class ClasseurService {
  constructor(private readonly db: PrismaClient) {}

  async list(userId: string): Promise<ClasseurListItemDto[]> {
    const rows = await this.db.classeur.findMany({
      where: { userId },
      include: LIST_INCLUDE,
      orderBy: [{ anneeScolaire: { debut: 'desc' } }, { createdAt: 'desc' }],
    });
    return toClasseurListItems(rows);
  }

  async getById(id: string, userId: string): Promise<ClasseurDetailDto> {
    const row = await this.db.classeur.findFirst({
      where: { id, userId },
      include: DETAIL_INCLUDE,
    });
    if (!row) throw new DomainError('Classeur non trouvé', 'NOT_FOUND');
    return toClasseurDetail(row);
  }

  async create(input: CreateClasseurInput, userId: string): Promise<ClasseurDto> {
    const row = await this.db.classeur.create({
      data: { ...input, userId },
    });
    return toClasseurDto(row);
  }

  async update(id: string, input: UpdateClasseurInput, userId: string): Promise<ClasseurDto> {
    await this.assertOwner(id, userId);
    const row = await this.db.classeur.update({ where: { id }, data: input });
    return toClasseurDto(row);
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.assertOwner(id, userId);
    await this.db.classeur.delete({ where: { id } });
  }

  async duplicate(id: string, anneeScolaireId: string, userId: string): Promise<ClasseurDto> {
    const source = await this.db.classeur.findFirst({
      where: { id, userId },
      include: {
        matieres: {
          include: {
            sequences: {
              include: {
                seances: {
                  include: { fiches: { include: { items: true } } },
                },
              },
            },
          },
        },
      },
    });
    if (!source) throw new DomainError('Classeur non trouvé', 'NOT_FOUND');

    const row = await this.db.classeur.create({
      data: {
        titre: source.titre,
        userId,
        niveauId: source.niveauId,
        anneeScolaireId,
        matieres: {
          create: source.matieres.map((m) => ({
            titre: m.titre,
            ordre: m.ordre,
            domaineId: m.domaineId,
            sequences: {
              create: m.sequences.map((s) => ({
                titre: s.titre,
                ordre: s.ordre,
                periode: s.periode,
                objectifs: s.objectifs,
                seances: {
                  create: s.seances.map((se) => ({
                    titre: se.titre,
                    ordre: se.ordre,
                    date: se.date,
                    fiches: {
                      create: se.fiches.map((f) => ({
                        titre: f.titre,
                        ordre: f.ordre,
                        items: {
                          create: f.items.map((it) => ({
                            ordre: it.ordre,
                            duree: it.duree,
                            contenu: it.contenu as object,
                          })),
                        },
                      })),
                    },
                  })),
                },
              })),
            },
          })),
        },
      },
    });
    return toClasseurDto(row);
  }

  private async assertOwner(id: string, userId: string) {
    const row = await this.db.classeur.findFirst({ where: { id, userId } });
    if (!row) throw new DomainError('Classeur non trouvé', 'NOT_FOUND');
    return row;
  }
}

export const classeurService = (db: PrismaClient) => new ClasseurService(db);
