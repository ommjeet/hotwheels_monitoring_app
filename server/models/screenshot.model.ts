import { z } from 'zod';

export const screenshotMetadataSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  price: z.number().min(0, 'Price must be non-negative'),
  imageUrl: z.string(),
  collectorType: z.string().optional().default('Mainline Match'),
  timestamp: z.string(),
  stock: z.number().optional().default(1),
  inStock: z.boolean().optional(),
  storeName: z.string().optional(),
  matchedRuleId: z.string().optional(),
  fileLocation: z.string().optional(),
  category: z.string().optional(),
  isCollectorPiece: z.boolean().optional(),
  originalPrice: z.number().optional()
});

export const screenshotConfigSchema = z.object({
  isCaptureEnabled: z.boolean().default(true),
  maxStorageCount: z.number().min(1).max(500).default(100),
  capturesDirectory: z.string().default('C:\\Users\\LocalCollector\\HotWheelsMonitor\\captures\\')
});

export const updateCaptureStatusSchema = z.object({
  enabled: z.boolean()
});

export const screenshotQuerySchema = z.object({
  search: z.string().optional().default(''),
  collectorType: z.string().optional().default('all'),
  limit: z.coerce.number().optional().default(100)
});

export type ScreenshotMetadata = z.infer<typeof screenshotMetadataSchema>;
export type ScreenshotConfig = z.infer<typeof screenshotConfigSchema>;
export type UpdateCaptureStatusInput = z.infer<typeof updateCaptureStatusSchema>;
export type ScreenshotQueryInput = z.infer<typeof screenshotQuerySchema>;
