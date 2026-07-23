import { z } from 'zod';

export const toggleEngineSchema = z.object({
  isScanning: z.boolean()
});

export const simulateOutageSchema = z.object({
  reopenTime: z.string().nullable().optional()
});

export const toggleFastSimSchema = z.object({
  enabled: z.boolean()
});

export const postActivitySchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(500, 'Message too long'),
  category: z.enum(['info', 'success', 'warning', 'error', 'automation', 'detection']),
  details: z.string().max(2000).optional()
});

export type ToggleEngineInput = z.infer<typeof toggleEngineSchema>;
export type SimulateOutageInput = z.infer<typeof simulateOutageSchema>;
export type ToggleFastSimInput = z.infer<typeof toggleFastSimSchema>;
export type PostActivityInput = z.infer<typeof postActivitySchema>;
