import { AnalyticsSummary } from '../../server/models/analytics.model';

export interface AnalyticsQueryOptions {
  range?: 'today' | 'yesterday' | '7d' | '30d' | 'custom';
  startDate?: string;
  endDate?: string;
  compare?: boolean;
  groupBy?: 'hour' | 'day';
}

export const analyticsApi = {
  async fetchAnalyticsDashboard(options: AnalyticsQueryOptions = {}): Promise<AnalyticsSummary> {
    const query = new URLSearchParams();
    if (options.range) query.append('range', options.range);
    if (options.startDate) query.append('startDate', options.startDate);
    if (options.endDate) query.append('endDate', options.endDate);
    if (options.compare !== undefined) query.append('compare', options.compare.toString());
    if (options.groupBy) query.append('groupBy', options.groupBy);

    const queryString = query.toString();
    const response = await fetch(`/api/analytics/dashboard${queryString ? `?${queryString}` : ''}`);
    
    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Failed to fetch analytics metrics' }));
      throw new Error(err.error || 'Failed to fetch analytics metrics');
    }

    const result = await response.json();
    return result.data;
  },

  async recordTelemetryEvent(event: {
    type: 'scan' | 'match' | 'order' | 'failure' | 'retry';
    scanTimeMs?: number;
    detectionTimeMs?: number;
    category?: string;
    ruleId?: string;
    details?: string;
  }): Promise<void> {
    const response = await fetch('/api/analytics/record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    });

    if (!response.ok) {
      console.warn('Failed to record telemetry event to backend analytics engine');
    }
  },

  getExportUrl(options: AnalyticsQueryOptions = {}, format: 'txt' | 'csv' | 'json' = 'csv'): string {
    const query = new URLSearchParams();
    query.append('format', format);
    if (options.range) query.append('range', options.range);
    if (options.startDate) query.append('startDate', options.startDate);
    if (options.endDate) query.append('endDate', options.endDate);

    return `/api/analytics/export?${query.toString()}`;
  }
};
