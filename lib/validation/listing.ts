import { z } from 'zod';

export const listingSchema = z.object({
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.coerce.number().int().min(1980).max(new Date().getFullYear() + 1),
  mileageKm: z.coerce.number().int().min(0),
  price: z.coerce.number().min(100),
  currency: z.string().length(3).default('EUR'),
  locationCity: z.string().min(1).optional(),
  locationRegion: z.string().min(1),
  status: z.enum(['draft', 'active', 'paused', 'flagged']).default('draft'),
  description: z.string().min(150).max(4000),
  title: z.string().min(10).max(80),
  fuelType: z.string().optional(),
  transmission: z.string().optional(),
  bodyType: z.string().optional(),
  drivetrain: z.string().optional(),
  engineSizeL: z.coerce.number().optional(),
  powerHp: z.coerce.number().optional(),
  ownersCount: z.coerce.number().int().min(0).optional(),
  accidentHistory: z.string().optional(),
  serviceHistory: z.string().optional(),
  vin: z.string().optional(),
  extras: z.array(z.string()).optional()
});

export type ListingInput = z.infer<typeof listingSchema>;
