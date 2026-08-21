import { PrismaClient } from '../src/generated/prisma/client';

const prisma = new PrismaClient();

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

  // Domaines et sous-domaines — Cycle 1
  const domainesC1 = [
    {
      label: 'Mobiliser le langage dans toutes ses dimensions',
      sousDomaines: ["L'oral", "L'écrit"],
    },
    {
      label: "Agir, s'exprimer, comprendre à travers l'activité physique",
      sousDomaines: [],
    },
    {
      label: 'Explorer le monde',
      sousDomaines: [
        'Se repérer dans le temps et dans l\'espace',
        'Explorer le monde du vivant, des objets et de la matière',
      ],
    },
    {
      label: 'Construire les premiers outils pour structurer sa pensée',
      sousDomaines: [],
    },
    {
      label: "S'approprier le langage artistique",
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
