import { z } from 'zod';

export const wordbookSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
    totalDays: z.number().int().positive('Total days must be a positive integer'),
    description: z.string().optional(),
});