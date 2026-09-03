import { Router } from 'express';
import { prisma } from '../db';
import { AppError } from '../errors';
import { asyncHandler } from '../middleware/async';
import { generateWellnessTips } from '../tips';

export const tipsRouter = Router();

tipsRouter.get('/:petId', asyncHandler(async (req, res) => {
  const pet = await prisma.pet.findFirst({
    where: { id: req.params.petId, ownerId: req.userId! },
    include: { wellness: { orderBy: { recordedAt: 'asc' } }, vaccinations: true }
  });
  if (!pet) throw new AppError(404, 'Pet not found');
  res.json(generateWellnessTips({ wellness: pet.wellness, vaccinations: pet.vaccinations }));
}));
