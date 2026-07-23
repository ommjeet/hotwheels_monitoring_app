import { z } from 'zod';

export const analyticsQuerySchema = z.object({
  range: z.enum(['today', 'yesterday', '7d', '30d', 'custom']).optional().default('today'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  compare: z.union([z.boolean(), z.string().transform(v => v === 'true')]).optional().default(true),
  groupBy: z.enum(['hour', 'day']).optional().default('hour'),
  category: z.string().optional(),
  ruleId: z.string().optional()
});

export const recordEventSchema = z.object({
  type: z.enum(['scan', 'match', 'order', 'failure', 'retry']),
  scanTimeMs: z.number().optional(),
  detectionTimeMs: z.number().optional(),
  category: z.string().optional(),
  ruleId: z.string().optional(),
  details: z.string().optional()
});

export type AnalyticsQueryInput = z.infer<typeof analyticsQuerySchema>;
export type RecordEventInput = z.infer<typeof recordEventSchema>;

export interface AnalyticsMetricSnapshot {
  id: string;
  isoTimestamp: string;
  date: string;         // YYYY-MM-DD
  hour: number;         // 0 - 23
  scansCount: number;
  matchesCount: number;
  ordersCompletedCount: number;
  failuresCount: number;
  retriesCount: number;
  avgScanTimeMs: number;
  avgDetectionTimeMs: number;
  categoryBreakdown: Record<string, number>;
  ruleHits: Record<string, number>;
}

export interface KpiMetricWithTrend {
  value: number;
  formattedValue: string;
  previousValue: number;
  changeAmount: number;
  changePercentage: number; // e.g. +14.2%
  trend: 'up' | 'down' | 'stable';
  isPositive: boolean;      // Whether 'up' is considered good for this KPI
}

export interface AnalyticsSummary {
  timeRange: {
    range: string;
    startDate: string;
    endDate: string;
    comparisonStartDate?: string;
    comparisonEndDate?: string;
  };
  kpis: {
    totalScans: KpiMetricWithTrend;
    totalMatches: KpiMetricWithTrend;
    ordersCompleted: KpiMetricWithTrend;
    averageScanTimeMs: KpiMetricWithTrend;
    averageDetectionTimeMs: KpiMetricWithTrend;
    conversionRatePercentage: KpiMetricWithTrend;
    orderSuccessRatePercentage: KpiMetricWithTrend;
    systemReliabilityPercentage: KpiMetricWithTrend;
    failuresCount: KpiMetricWithTrend;
    retriesCount: KpiMetricWithTrend;
  };
  timeSeries: Array<{
    timestamp: string;
    label: string;
    scans: number;
    matches: number;
    orders: number;
    avgScanLatency: number;
    avgDetectionLatency: number;
  }>;
  categoryDistribution: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  collectorDistribution: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  topPerformingRules: Array<{
    ruleId: string;
    ruleName: string;
    hits: number;
    orders: number;
    conversionRate: number;
  }>;
  recentTrends: {
    hourlyScansAverage: number;
    peakScanHour: string;
    fastestScanLatencyMs: number;
    slowestScanLatencyMs: number;
  };
}
