import type { PrismaClient } from '@/generated/prisma';
import path from 'path';
import fs from 'fs';
import { DomainError } from '@/lib/errors/domain-error';
import type { FichierAttacheDto } from '@/lib/domain/dto';
import { getAbsolutePath } from '@/lib/upload';

function toDto(row: {
  id: string;
  nom: string;
  chemin: string;
  taille: number;
  ficheId: string;
  createdAt: Date;
}): FichierAttacheDto {
  return {
    id: row.id,
    nom: row.nom,
    taille: row.taille,
    ficheId: row.ficheId,
    createdAt: row.createdAt,
    url: `/api/files/${row.chemin}`,
  };
}

export class FichierService {
  constructor(private readonly db: PrismaClient) {}

  async list(ficheId: string, userId: string): Promise<FichierAttacheDto[]> {
    await this.assertFicheOwner(ficheId, userId);
    const rows = await this.db.fichierAttache.findMany({
      where: { ficheId },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map(toDto);
  }

  async delete(id: string, userId: string): Promise<void> {
    const row = await this.db.fichierAttache.findUnique({ where: { id } });
    if (!row) throw new DomainError('Fichier non trouvé', 'NOT_FOUND');
    await this.assertFicheOwner(row.ficheId, userId);

    const absPath = getAbsolutePath(row.chemin);
    await this.db.fichierAttache.delete({ where: { id } });
    try {
      fs.unlinkSync(absPath);
    } catch {
      // fichier déjà supprimé — pas une erreur bloquante
    }
  }

  private async assertFicheOwner(ficheId: string, userId: string) {
    const fiche = await this.db.fiche.findUnique({
      where: { id: ficheId },
      include: {
        sequence: { include: { matiere: { include: { classeur: true } } } },
        classeur: true,
      },
    });
    if (!fiche) throw new DomainError('Fiche non trouvée', 'NOT_FOUND');
    const owned =
      fiche.sequence?.matiere.classeur.userId === userId ||
      fiche.classeur?.userId === userId;
    if (!owned) throw new DomainError('Fiche non trouvée', 'NOT_FOUND');
  }
}

export const fichierService = (db: PrismaClient) => new FichierService(db);
