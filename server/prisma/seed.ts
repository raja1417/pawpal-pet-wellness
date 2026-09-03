import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('PawPal123!', 12);
  const user = await prisma.user.upsert({
    where: { email: 'demo@pawpal.local' },
    update: {},
    create: { name: 'Demo Owner', email: 'demo@pawpal.local', passwordHash }
  });
  const existing = await prisma.pet.findFirst({ where: { ownerId: user.id, name: 'Maple' } });
  if (existing) return;
  await prisma.pet.create({
    data: {
      ownerId: user.id,
      name: 'Maple',
      species: 'Dog',
      breed: 'Golden Retriever',
      birthdate: new Date('2021-04-12'),
      weight: 27.4,
      photoUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80',
      wellness: {
        create: [
          { weight: 26.8, activityMinutes: 55, mood: 'Happy', notes: 'Long park walk', recordedAt: new Date(Date.now() - 14 * 86400000) },
          { weight: 27.1, activityMinutes: 42, mood: 'Playful', recordedAt: new Date(Date.now() - 7 * 86400000) },
          { weight: 27.4, activityMinutes: 48, mood: 'Happy', notes: 'Good appetite' }
        ]
      },
      vaccinations: {
        create: [
          { name: 'Rabies booster', administeredAt: new Date('2025-10-01'), dueDate: new Date(Date.now() + 21 * 86400000) },
          { name: 'Bordetella', dueDate: new Date(Date.now() - 5 * 86400000), notes: 'Book with regular clinic' }
        ]
      },
      vetVisits: {
        create: [{ reason: 'Annual wellness exam', visitDate: new Date(Date.now() + 35 * 86400000) }]
      }
    }
  });
}

main().finally(() => prisma.$disconnect());
