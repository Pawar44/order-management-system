import { z } from 'zod';

// No body needed for archive-old-orders by default, but this lets us
// optionally accept a custom "days" threshold in the future.
export const archiveOldOrdersSchema = z.object({
  days: z.number().int().positive().optional().default(30),
});