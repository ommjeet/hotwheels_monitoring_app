import { z } from 'zod';

export const systemParametersSchema = z.object({
  scanIntervalSeconds: z.number().min(1, 'Scan interval must be at least 1 second').max(300, 'Scan interval cannot exceed 300 seconds').optional(),
  userLocation: z.string().min(1, 'User location cannot be empty').max(250, 'Location string too long').optional(),
  autoCheckoutSimulated: z.boolean().optional(),
  autoCheckoutPaymentMethod: z.string().min(1).max(50).optional(),
  localChromePort: z.number().int().min(1024, 'Port must be between 1024 and 65535').max(65535, 'Port must be between 1024 and 65535').optional(),
  rememberSession: z.boolean().optional(),
  headlessMode: z.boolean().optional(),
  toastAlertsEnabled: z.boolean().optional(),
  storageCleanTriggerCount: z.number().int().min(10, 'Gallery ceiling size must be at least 10').max(500, 'Gallery ceiling size cannot exceed 500').optional(),
  enableJitter: z.boolean().optional(),
  jitterRangeSeconds: z.number().min(1, 'Jitter range must be at least 1 second').max(10, 'Jitter range cannot exceed 10 seconds').optional(),
  emulateMouseMovement: z.boolean().optional(),
  rotateUserAgent: z.boolean().optional(),
  coolDownAfterScans: z.number().int().min(5, 'Cool-down scan count must be at least 5').max(500, 'Cool-down scan count cannot exceed 500').optional(),
  coolDownDurationMinutes: z.number().int().min(1, 'Cool-down duration must be at least 1 minute').max(60, 'Cool-down duration cannot exceed 60 minutes').optional()
});

export type UpdateSystemParametersInput = z.infer<typeof systemParametersSchema>;
