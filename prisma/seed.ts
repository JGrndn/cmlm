import { PrismaClient } from '../src/generated/prisma/client';

const prisma = new PrismaClient();

async function main() {
  // TODO: ajouter les seeds ici
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
