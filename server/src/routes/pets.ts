import { Router } from 'express';
import { prisma } from '../db';
import { AppError } from '../errors';
import { asyncHandler } from '../middleware/async';
import { petSchema, petUpdateSchema, vaccinationSchema, vaccinationUpdateSchema, vetVisitSchema, vetVisitUpdateSchema, wellnessSchema } from '../validation';

export const petsRouter = Router();

async function ownedPet(id: string, ownerId: string) {
  const pet = await prisma.pet.findFirst({ where: { id, ownerId } });
  if (!pet) throw new AppError(404, 'Pet not found');
  return pet;
}

petsRouter.get('/', asyncHandler(async (req, res) => {
  const pets = await prisma.pet.findMany({
    where: { ownerId: req.userId! },
    include: { wellness: { orderBy: { recordedAt: 'desc' }, take: 8 }, _count: { select: { vaccinations: true, wellness: true } } },
    orderBy: { createdAt: 'desc' }
  });
  res.json(pets);
}));

petsRouter.post('/', asyncHandler(async (req, res) => {
  const data = petSchema.parse(req.body);
  const pet = await prisma.pet.create({ data: { ...data, ownerId: req.userId! } });
  res.status(201).json(pet);
}));

petsRouter.get('/:id', asyncHandler(async (req, res) => {
  await ownedPet(req.params.id, req.userId!);
  const pet = await prisma.pet.findUnique({
    where: { id: req.params.id },
    include: {
      wellness: { orderBy: { recordedAt: 'desc' } },
      vaccinations: { orderBy: { dueDate: 'asc' } },
      vetVisits: { orderBy: { visitDate: 'asc' } }
    }
  });
  res.json(pet);
}));

petsRouter.patch('/:id', asyncHandler(async (req, res) => {
  await ownedPet(req.params.id, req.userId!);
  const pet = await prisma.pet.update({ where: { id: req.params.id }, data: petUpdateSchema.parse(req.body) });
  res.json(pet);
}));

petsRouter.delete('/:id', asyncHandler(async (req, res) => {
  await ownedPet(req.params.id, req.userId!);
  await prisma.pet.delete({ where: { id: req.params.id } });
  res.status(204).end();
}));

petsRouter.get('/:id/wellness', asyncHandler(async (req, res) => {
  await ownedPet(req.params.id, req.userId!);
  res.json(await prisma.wellnessEntry.findMany({ where: { petId: req.params.id }, orderBy: { recordedAt: 'desc' } }));
}));

petsRouter.post('/:id/wellness', asyncHandler(async (req, res) => {
  await ownedPet(req.params.id, req.userId!);
  const data = wellnessSchema.parse(req.body);
  const entry = await prisma.$transaction(async (tx) => {
    const created = await tx.wellnessEntry.create({ data: { ...data, petId: req.params.id } });
    if (data.weight != null) await tx.pet.update({ where: { id: req.params.id }, data: { weight: data.weight } });
    return created;
  });
  res.status(201).json(entry);
}));

petsRouter.get('/:id/vaccinations', asyncHandler(async (req, res) => {
  await ownedPet(req.params.id, req.userId!);
  res.json(await prisma.vaccination.findMany({ where: { petId: req.params.id }, orderBy: { dueDate: 'asc' } }));
}));

petsRouter.post('/:id/vaccinations', asyncHandler(async (req, res) => {
  await ownedPet(req.params.id, req.userId!);
  const vaccination = await prisma.vaccination.create({ data: { ...vaccinationSchema.parse(req.body), petId: req.params.id } });
  res.status(201).json(vaccination);
}));

petsRouter.patch('/:id/vaccinations/:vaccinationId', asyncHandler(async (req, res) => {
  await ownedPet(req.params.id, req.userId!);
  const existing = await prisma.vaccination.findFirst({ where: { id: req.params.vaccinationId, petId: req.params.id } });
  if (!existing) throw new AppError(404, 'Vaccination not found');
  res.json(await prisma.vaccination.update({ where: { id: existing.id }, data: vaccinationUpdateSchema.parse(req.body) }));
}));

petsRouter.delete('/:id/vaccinations/:vaccinationId', asyncHandler(async (req, res) => {
  await ownedPet(req.params.id, req.userId!);
  const result = await prisma.vaccination.deleteMany({ where: { id: req.params.vaccinationId, petId: req.params.id } });
  if (!result.count) throw new AppError(404, 'Vaccination not found');
  res.status(204).end();
}));

petsRouter.get('/:id/vet-visits', asyncHandler(async (req, res) => {
  await ownedPet(req.params.id, req.userId!);
  res.json(await prisma.vetVisit.findMany({ where: { petId: req.params.id }, orderBy: { visitDate: 'asc' } }));
}));

petsRouter.post('/:id/vet-visits', asyncHandler(async (req, res) => {
  await ownedPet(req.params.id, req.userId!);
  const visit = await prisma.vetVisit.create({ data: { ...vetVisitSchema.parse(req.body), petId: req.params.id } });
  res.status(201).json(visit);
}));

petsRouter.patch('/:id/vet-visits/:visitId', asyncHandler(async (req, res) => {
  await ownedPet(req.params.id, req.userId!);
  const existing = await prisma.vetVisit.findFirst({ where: { id: req.params.visitId, petId: req.params.id } });
  if (!existing) throw new AppError(404, 'Vet visit not found');
  res.json(await prisma.vetVisit.update({ where: { id: existing.id }, data: vetVisitUpdateSchema.parse(req.body) }));
}));
