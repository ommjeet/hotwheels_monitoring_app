import { z } from 'zod';

export const activityCategoryEnum = z.enum([
  'info',
  'success',
  'warning',
  'error',
  'automation',
  'detection'
]);

export const activitySeverityEnum = z.enum([
  'info',
  'low',
  'medium',
  'high',
  'critical'
]);

export const activityModuleEnum = z.string();

export const createActivitySchema = z.object({
  message: z.string().min(1, 'Message is required').max(500, 'Message is too long'),
  category: activityCategoryEnum.default('info'),
  severity: activitySeverityEnum.optional().default('info'),
  module: activityModuleEnum.optional().default('system'),
  details: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional()
});

export const activityQuerySchema = z.object({
  category: z.union([activityCategoryEnum, z.literal('all')]).optional().default('all'),
  module: z.string().optional().default('all'),
  severity: z.union([activitySeverityEnum, z.literal('all')]).optional().default('all'),
  search: z.string().optional().default(''),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(500).optional().default(100),
  sort: z.enum(['asc', 'desc']).optional().default('desc')
});

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type ActivityQueryInput = z.infer<typeof activityQuerySchema>;
