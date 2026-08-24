import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

async function main() {
  // Cycles
  const cycle1 = await prisma.cycle.upsert({
    where: { code: 'cycle1' },
    update: {},
    create: { code: 'cycle1', label: 'Cycle 1' },
  });
  const cycle2 = await prisma.cycle.upsert({
    where: { code: 'cycle2' },
    update: {},
    create: { code: 'cycle2', label: 'Cycle 2' },
  });
  const cycle3 = await prisma.cycle.upsert({
    where: { code: 'cycle3' },
    update: {},
    create: { code: 'cycle3', label: 'Cycle 3' },
  });

  // Niveaux scolaires
  const niveaux = [
    { code: 'PS',  label: 'Petite Section',        ordre: 1, cycleId: cycle1.id },
    { code: 'MS',  label: 'Moyenne Section',        ordre: 2, cycleId: cycle1.id },
    { code: 'GS',  label: 'Grande Section',         ordre: 3, cycleId: cycle1.id },
    { code: 'CP',  label: 'Cours Préparatoire',     ordre: 4, cycleId: cycle2.id },
    { code: 'CE1', label: 'Cours Élémentaire 1',    ordre: 5, cycleId: cycle2.id },
    { code: 'CE2', label: 'Cours Élémentaire 2',    ordre: 6, cycleId: cycle2.id },
    { code: 'CM1', label: 'Cours Moyen 1',          ordre: 7, cycleId: cycle3.id },
    { code: 'CM2', label: 'Cours Moyen 2',          ordre: 8, cycleId: cycle3.id },
  ];
  for (const n of niveaux) {
    await prisma.niveauScolaire.upsert({
      where: { code: n.code },
      update: {},
      create: n,
    });
  }

  // Années scolaires
  const annees = [
    { label: '2024-2025', debut: 2024, fin: 2025 },
    { label: '2025-2026', debut: 2025, fin: 2026 },
    { label: '2026-2027', debut: 2026, fin: 2027 },
  ];
  for (const a of annees) {
    await prisma.anneeScolaire.upsert({
      where: { label: a.label },
      update: {},
      create: a,
    });
  }

  // Périodes par année scolaire (dates académiques françaises approximatives)
  const periodeDates: Record<string, { label: string; dateDebut: Date; dateFin: Date }[]> = {
    '2024-2025': [
      { label: 'P1', dateDebut: new Date('2024-09-02'), dateFin: new Date('2024-10-18') },
      { label: 'P2', dateDebut: new Date('2024-11-04'), dateFin: new Date('2024-12-20') },
      { label: 'P3', dateDebut: new Date('2025-01-06'), dateFin: new Date('2025-02-14') },
      { label: 'P4', dateDebut: new Date('2025-03-03'), dateFin: new Date('2025-04-18') },
      { label: 'P5', dateDebut: new Date('2025-04-28'), dateFin: new Date('2025-07-04') },
    ],
    '2025-2026': [
      { label: 'P1', dateDebut: new Date('2025-09-02'), dateFin: new Date('2025-10-17') },
      { label: 'P2', dateDebut: new Date('2025-11-03'), dateFin: new Date('2025-12-19') },
      { label: 'P3', dateDebut: new Date('2026-01-05'), dateFin: new Date('2026-02-13') },
      { label: 'P4', dateDebut: new Date('2026-03-02'), dateFin: new Date('2026-04-17') },
      { label: 'P5', dateDebut: new Date('2026-04-27'), dateFin: new Date('2026-07-03') },
    ],
    '2026-2027': [
      { label: 'P1', dateDebut: new Date('2026-09-01'), dateFin: new Date('2026-10-23') },
      { label: 'P2', dateDebut: new Date('2026-11-09'), dateFin: new Date('2026-12-18') },
      { label: 'P3', dateDebut: new Date('2027-01-04'), dateFin: new Date('2027-02-12') },
      { label: 'P4', dateDebut: new Date('2027-03-01'), dateFin: new Date('2027-04-16') },
      { label: 'P5', dateDebut: new Date('2027-04-26'), dateFin: new Date('2027-07-02') },
    ],
  };

  for (const [anneeLabel, periodes] of Object.entries(periodeDates)) {
    const annee = await prisma.anneeScolaire.findUnique({ where: { label: anneeLabel } });
    if (!annee) continue;
    for (const p of periodes) {
      await db.periode.upsert({
        where: { id: `${anneeLabel}-${p.label}` },
        update: {},
        create: { id: `${anneeLabel}-${p.label}`, ...p, anneeScolaireId: annee.id },
      });
    }
  }

  // Migration : periodesVisibles stockait des labels enum ("P1"…), on les remplace par les IDs déterministes
  const OLD_LABELS = ['P1', 'P2', 'P3', 'P4', 'P5'];
  const matieres = await db.matiere.findMany({
    where: { periodesVisibles: { isEmpty: false } },
    include: { classeur: { include: { anneeScolaire: true } } },
  });
  for (const m of matieres) {
    if (!m.periodesVisibles.every((v: string) => OLD_LABELS.includes(v))) continue;
    const anneeLabel = m.classeur.anneeScolaire.label;
    await db.matiere.update({
      where: { id: m.id },
      data: { periodesVisibles: m.periodesVisibles.map((v: string) => `${anneeLabel}-${v}`) },
    });
  }

  // Domaines et sous-domaines — Cycle 1 (BO n°41 du 31 octobre 2024, applicable rentrée 2025)
  const domainesC1 = [
    {
      label: 'Le développement et la structuration du langage oral et écrit',
      sousDomaines: ["L'oral", "L'écrit"],
    },
    {
      label: "Agir, s'exprimer, comprendre à travers les activités physiques",
      sousDomaines: [
        'Se déplacer',
        'Construire des équilibres',
        "S'exprimer avec son corps",
        "Coopérer et s'opposer",
      ],
    },
    {
      label: "Agir, s'exprimer, comprendre à travers les activités artistiques",
      sousDomaines: [],
    },
    {
      label: "L'acquisition des premiers outils mathématiques",
      sousDomaines: [
        'Découvrir les nombres',
        'Utiliser les nombres',
        'Explorer les solides et formes planes',
        'Explorer les grandeurs',
        'Se familiariser avec les motifs organisés',
      ],
    },
    {
      label: "Se repérer dans le temps et l'espace",
      sousDomaines: [],
    },
    {
      label: 'Découvrir le monde du vivant, de la matière et des objets',
      sousDomaines: [],
    },
  ];

  // Domaines et sous-domaines — Cycle 2
  const domainesC2 = [
    {
      label: 'Français',
      sousDomaines: [
        'Langage oral',
        'Lecture et compréhension de l\'écrit',
        'Écriture',
        'Étude de la langue',
        'Littérature',
      ],
    },
    {
      label: 'Mathématiques',
      sousDomaines: [
        'Nombres et calculs',
        'Grandeurs et mesures',
        'Espace et géométrie',
      ],
    },
    { label: 'Enseignement moral et civique', sousDomaines: [] },
    { label: 'Histoire-géographie', sousDomaines: ['Histoire', 'Géographie'] },
    { label: 'Sciences et technologie', sousDomaines: [] },
    { label: 'Arts plastiques', sousDomaines: [] },
    { label: 'Éducation musicale', sousDomaines: [] },
    { label: 'Éducation physique et sportive', sousDomaines: [] },
    { label: 'Enseignements à dominante langagière', sousDomaines: [] },
  ];

  // Domaines et sous-domaines — Cycle 3 (même structure + approfondissement)
  const domainesC3 = [
    {
      label: 'Français',
      sousDomaines: [
        'Langage oral',
        'Lecture et compréhension de l\'écrit',
        'Écriture',
        'Étude de la langue',
        'Littérature',
      ],
    },
    {
      label: 'Mathématiques',
      sousDomaines: [
        'Nombres et calculs',
        'Grandeurs et mesures',
        'Espace et géométrie',
      ],
    },
    { label: 'Enseignement moral et civique', sousDomaines: [] },
    { label: 'Histoire-géographie', sousDomaines: ['Histoire', 'Géographie'] },
    {
      label: 'Sciences et technologie',
      sousDomaines: [
        'Matière, mouvement, énergie, information',
        'Le vivant, sa diversité et les fonctions qui le caractérisent',
        'Matériaux et objets techniques',
        'La planète Terre, les êtres vivants dans leur environnement',
      ],
    },
    { label: 'Arts plastiques', sousDomaines: [] },
    { label: 'Éducation musicale', sousDomaines: [] },
    { label: 'Éducation physique et sportive', sousDomaines: [] },
    { label: 'Langue vivante étrangère ou régionale', sousDomaines: [] },
  ];

  const seedDomaines = async (cycleId: string, domaines: typeof domainesC1) => {
    for (const d of domaines) {
      const domaine = await prisma.domaine.upsert({
        where: { id: `${cycleId}-${d.label}` },
        update: {},
        create: { id: `${cycleId}-${d.label}`, label: d.label, cycleId },
      });
      for (const sdLabel of d.sousDomaines) {
        await prisma.sousDomaine.upsert({
          where: { id: `${domaine.id}-${sdLabel}` },
          update: {},
          create: { id: `${domaine.id}-${sdLabel}`, label: sdLabel, domaineId: domaine.id },
        });
      }
    }
  };

  await seedDomaines(cycle1.id, domainesC1);
  await seedDomaines(cycle2.id, domainesC2);
  await seedDomaines(cycle3.id, domainesC3);

  console.log('Seed terminé.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
