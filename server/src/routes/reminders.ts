import { Router } from 'express';
import { prisma } from '../db';
import { asyncHandler } from '../middleware/async';

export const remindersRouter = Router();

remindersRouter.get('/', asyncHandler(async (req, res) => {
  const through = new Date(Date.now() + 60 * 86400000);
  const [vaccinations, vetVisits] = await Promise.all([
    prisma.vaccination.findMany({
      where: { completedAt: null, dueDate: { lte: through }, pet: { ownerId: req.userId! } },
      include: { pet: { select: { id: true, name: true } } },
      orderBy: { dueDate: 'asc' }
    }),
    prisma.vetVisit.findMany({
      where: { completed: false, visitDate: { lte: through }, pet: { ownerId: req.userId! } },
      include: { pet: { select: { id: true, name: true } } },
      orderBy: { visitDate: 'asc' }
    })
  ]);
  res.json({
    vaccinations: vaccinations.map((item) => ({ ...item, overdue: item.dueDate < new Date() })),
    vetVisits: vetVisits.map((item) => ({ ...item, overdue: item.visitDate < new Date() }))
  });
}));
