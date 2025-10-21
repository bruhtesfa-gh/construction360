import { z } from 'zod';

export const quoteSearchSchema = z.object({
  builderId: z.string().uuid(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

export type QuoteSearchInput = z.infer<typeof quoteSearchSchema>;
