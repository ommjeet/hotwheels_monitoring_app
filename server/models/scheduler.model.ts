import { z } from 'zod';

export const schedulerConfigSchema = z.object({
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid start time format (HH:MM)'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid end time format (HH:MM)'),
  refreshInterval: z.number().min(1, 'Refresh interval must be at least 1s').max(300, 'Refresh interval too high'),
  workingDays: z.array(z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])).min(1, 'At least one working day must be selected'),
  autoStart: z.boolean(),
  autoStop: z.boolean(),
  orderLimit: z.number().min(1, 'Order limit must be at least 1').max(100, 'Order limit max 100')
});

export const updateSchedulerConfigSchema = schedulerConfigSchema.partial();

export const createScheduledJobSchema = z.object({
  name: z.string().min(1, 'Job name is required').max(150, 'Job name is too long'),
  targetRuleId: z.string().default('all'),
  scheduleType: z.enum(['recurring', 'one-time']).default('recurring'),
  intervalSeconds: z.number().min(1, 'Interval must be at least 1 second').default(4),
  cronExpression: z.string().optional(),
  oneTimeTime: z.string().optional(),
  enabled: z.boolean().default(true),
  maxRetries: z.number().min(0).max(10).default(3),
  retryDelaySeconds: z.number().min(1).max(300).default(5)
});

export const updateScheduledJobSchema = createScheduledJobSchema.partial();

export type SchedulerConfigInput = z.infer<typeof schedulerConfigSchema>;
export type CreateScheduledJobInput = z.infer<typeof createScheduledJobSchema>;
export type UpdateScheduledJobInput = z.infer<typeof updateScheduledJobSchema>;
