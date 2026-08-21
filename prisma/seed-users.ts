import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
console.log(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

async function main() {
  
  const adminPassword = await bcrypt.hash('admin1234', 12);
  await prisma.user.upsert({
    where: {email:'admin@cmlm.com'},
    update: {},
    create: {
      email: 'admin@cmlm.com',
      name: 'Administrateur',
      password: adminPassword,
      role: 'ADMIN',
      isActive: true
    }
  })

  console.log('Seed terminé.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
