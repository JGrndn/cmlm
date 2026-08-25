import type { PrismaClient } from '@/generated/prisma';
import { DomainError } from '@/lib/errors/domain-error';
import type {
  PeriodeDto,
  DomaineDto,
  SequenceReferenceTreeDto,
} from '@/lib/domain/dto';

export class ReferenceService {
  constructor(private readonly db: PrismaClient) {}

  async listNiveaux() {
    return this.db.niveauScolaire.findMany({
      orderBy: { ordre: 'asc' },
      include: { cycle: true },
    });
  }

  async listAnneesScolaires() {
    return this.db.anneeScolaire.findMany({ orderBy: { debut: 'asc' } });
  }

  async listPeriodes(anneeScolaireId: string): Promise<PeriodeDto[]> {
    const rows = await this.db.periode.findMany({
      where: { anneeScolaireId },
      orderBy: { dateDebut: 'asc' },
    });
    return rows.map((p) => ({
      id: p.id,
      label: p.label,
      dateDebut: p.dateDebut,
      dateFin: p.dateFin,
      anneeScolaireId: p.anneeScolaireId,
    }));
  }

  async createAnneeScolaire(input: {
    label: string;
    debut: number;
    fin: number;
    periodes: { label: string; dateDebut: string; dateFin: string }[];
  }) {
    return this.db.$transaction(async (tx) => {
      const annee = await tx.anneeScolaire.create({
        data: { label: input.label, debut: input.debut, fin: input.fin },
      });
      await tx.periode.createMany({
        data: input.periodes.map((p) => ({
          label: p.label,
          dateDebut: new Date(p.dateDebut),
          dateFin: new Date(p.dateFin),
          anneeScolaireId: annee.id,
        })),
      });
      return annee;
    });
  }

  async listDisciplines(cycleId: string) {
    return this.db.discipline.findMany({
      where: { cycleId },
      include: { domaines: { include: { sousDomaines: true } } },
      orderBy: { label: 'asc' },
    });
  }

  async listDomainesForMatiere(disciplineId: string, matiereId: string): Promise<DomaineDto[]> {
    const rows = await this.db.domaine.findMany({
      where: {
        disciplineId,
        OR: [{ matiereId: null }, { matiereId }],
      },
      orderBy: { label: 'asc' },
      select: { id: true, label: true, disciplineId: true, matiereId: true },
    });
    return rows.map((d) => ({
      id: d.id,
      label: d.label,
      disciplineId: d.disciplineId,
      matiereId: d.matiereId,
    }));
  }

  async createDomaine(input: { disciplineId: string; label: string; matiereId: string }) {
    return this.db.domaine.create({
      data: { disciplineId: input.disciplineId, label: input.label, matiereId: input.matiereId },
    });
  }

  async deleteDomaine(id: string, userId: string) {
    const d = await this.db.domaine.findFirst({
      where: {
        id,
        matiereId: { not: null },
        matiere: { classeur: { userId } },
      },
    });
    if (!d) throw new DomainError('Domaine non trouvé', 'NOT_FOUND');
    return this.db.domaine.delete({ where: { id } });
  }

  async listSousDomaines(domaineId: string, userId: string) {
    return this.db.sousDomaine.findMany({
      where: {
        domaineId,
        OR: [
          { matiereId: null },
          { matiere: { classeur: { userId } } },
        ],
      },
      orderBy: { label: 'asc' },
    });
  }

  async createSousDomaine(input: { domaineId: string; label: string; matiereId: string }) {
    return this.db.sousDomaine.create({
      data: { domaineId: input.domaineId, label: input.label, matiereId: input.matiereId },
    });
  }

  async listObjectifs(sousDomainIds: string[]) {
    return this.db.objectif.findMany({
      where: { sousDomainId: { in: sousDomainIds } },
      orderBy: { label: 'asc' },
      select: { id: true, label: true, sousDomainId: true },
    });
  }

  async deleteSousDomaine(id: string, userId: string) {
    const sd = await this.db.sousDomaine.findFirst({
      where: {
        id,
        matiereId: { not: null },
        matiere: { classeur: { userId } },
      },
    });
    if (!sd) throw new DomainError('Sous-domaine non trouvé', 'NOT_FOUND');
    return this.db.sousDomaine.delete({ where: { id } });
  }

  async getSequenceReferenceTree(cycleId: string, matiereId: string): Promise<SequenceReferenceTreeDto> {
    const [cycles, disciplines] = await Promise.all([
      this.db.cycle.findMany({
        include: { niveaux: { orderBy: { ordre: 'asc' } } },
        orderBy: { code: 'asc' },
      }),
      this.db.discipline.findMany({
        where: { cycleId },
        include: {
          domaines: {
            where: { OR: [{ matiereId: null }, { matiereId }] },
            include: {
              sousDomaines: {
                where: { OR: [{ matiereId: null }, { matiereId }] },
                include: { objectifs: { orderBy: { label: 'asc' } } },
                orderBy: { label: 'asc' },
              },
            },
            orderBy: { label: 'asc' },
          },
        },
        orderBy: { label: 'asc' },
      }),
    ]);

    return {
      niveauxByCycle: cycles.map((c) => ({
        cycleId: c.id,
        cycleLabel: c.label,
        niveaux: c.niveaux.map((n) => ({ value: n.id, label: n.label, code: n.code })),
      })),
      disciplines: disciplines.map((d) => ({
        value: d.id,
        label: d.label,
        domaines: d.domaines.map((dom) => ({
          value: dom.id,
          label: dom.label,
          disciplineId: dom.disciplineId,
          sousDomaines: dom.sousDomaines.map((sd) => ({
            value: sd.id,
            label: sd.label,
            domaineId: sd.domaineId,
            objectifs: sd.objectifs.map((o) => ({
              value: o.id,
              label: o.label,
              sousDomainId: o.sousDomainId,
            })),
          })),
        })),
      })),
    };
  }
}

export const referenceService = (db: PrismaClient) => new ReferenceService(db);
