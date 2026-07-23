import { z } from 'zod';

export const watchlistItemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(150, 'Name is too long'),
  keyword: z.string().min(1, 'Scrape keyword phrase is required').max(150, 'Keyword is too long'),
  matchType: z.enum(['contains', 'exact']),
  excludeKeywords: z.array(z.string()).default([]),
  autoPurchase: z.boolean().default(false),
  active: z.boolean().default(true),
  priority: z.enum(['low', 'medium', 'high']).default('high'),
  similarityThreshold: z.number().min(10).max(100).default(85),
  maxPrice: z.number().min(1).default(499),
  quantity: z.number().min(1).max(10).default(1),
  codToggle: z.boolean().default(true),
  notes: z.string().max(500).default('')
});

export const updateWatchlistItemSchema = watchlistItemSchema.partial();

export const bulkDeleteSchema = z.object({
  ids: z.array(z.string()).min(1, 'At least one ID must be provided')
});

export const bulkStatusSchema = z.object({
  ids: z.array(z.string()).min(1, 'At least one ID must be provided'),
  active: z.boolean()
});

export type CreateWatchlistItemInput = z.infer<typeof watchlistItemSchema>;
export type UpdateWatchlistItemInput = z.infer<typeof updateWatchlistItemSchema>;
