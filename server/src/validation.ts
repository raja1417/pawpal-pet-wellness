import { z } from 'zod';

const optionalDate = z.string().date().optional().nullable().transform((value) => value ? new Date(value) : null);
const optionalUrl = z.union([z.string().url(), z.literal('')]).optional().nullable().transform((value) => value || null);

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(100)
});
export const loginSchema = z.object({ email: z.string().email().transform((value) => value.toLowerCase()), password: z.string().min(1) });
export const petSchema = z.object({
  name: z.string().trim().min(1).max(80),
  species: z.string().trim().min(1).max(40),
  breed: z.string().trim().max(80).optional().nullable(),
  birthdate: optionalDate,
  weight: z.number().positive().max(1000).optional().nullable(),
  photoUrl: optionalUrl
});
export const petUpdateSchema = petSchema.partial();
export const wellnessSchema = z.object({
  weight: z.number().positive().max(1000).optional().nullable(),
  activityMinutes: z.number().int().min(0).max(1440).optional().nullable(),
  mood: z.string().trim().max(40).optional().nullable(),
  notes: z.string().trim().max(1000).optional().nullable(),
  recordedAt: z.string().datetime().optional().transform((value) => value ? new Date(value) : new Date())
}).refine((value) => value.weight != null || value.activityMinutes != null || value.mood || value.notes, 'Add at least one observation');
export const vaccinationSchema = z.object({
  name: z.string().trim().min(1).max(120),
  dueDate: z.string().date().transform((value) => new Date(value)),
  administeredAt: optionalDate,
  completedAt: optionalDate,
  notes: z.string().trim().max(500).optional().nullable()
});
export const vaccinationUpdateSchema = vaccinationSchema.partial();
export const vetVisitSchema = z.object({
  reason: z.string().trim().min(1).max(160),
  visitDate: z.string().datetime().transform((value) => new Date(value)),
  notes: z.string().trim().max(1000).optional().nullable(),
  completed: z.boolean().optional().default(false)
});
export const vetVisitUpdateSchema = vetVisitSchema.partial();
