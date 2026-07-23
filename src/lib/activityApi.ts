import { ActivityEvent } from '../types';

export interface FetchActivitiesParams {
  category?: string;
  module?: string;
  severity?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: 'asc' | 'desc';
}

export interface ActivityApiResponse {
  success: boolean;
  data: ActivityEvent[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ActivityStatsResponse {
  success: boolean;
  data: {
    totalEvents: number;
    categoryCounts: Record<string, number>;
    severityCounts: Record<string, number>;
    moduleCounts: Record<string, number>;
    latestEventTimestamp: string | null;
  };
}

export const activityApi = {
  async fetchActivities(params: FetchActivitiesParams = {}): Promise<ActivityApiResponse> {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.module && params.module !== 'all') query.append('module', params.module);
    if (params.severity && params.severity !== 'all') query.append('severity', params.severity);
    if (params.search) query.append('search', params.search);
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.sort) query.append('sort', params.sort);

    const queryString = query.toString();
    const response = await fetch(`/api/activity${queryString ? `?${queryString}` : ''}`);
    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Failed to fetch activity logs' }));
      throw new Error(err.error || 'Failed to fetch activity logs');
    }
    return response.json();
  },

  async fetchStats(): Promise<ActivityStatsResponse> {
    const response = await fetch('/api/activity/stats');
    if (!response.ok) {
      throw new Error('Failed to fetch activity statistics');
    }
    return response.json();
  },

  async logActivity(data: {
    message: string;
    category?: 'info' | 'success' | 'warning' | 'error' | 'automation' | 'detection';
    details?: string;
    module?: string;
    severity?: string;
  }): Promise<ActivityEvent> {
    const response = await fetch('/api/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Failed to log activity event' }));
      throw new Error(err.error || 'Failed to log activity event');
    }

    const json = await response.json();
    return json.data;
  },

  async clearActivities(): Promise<{ clearedCount: number }> {
    const response = await fetch('/api/activity', {
      method: 'DELETE'
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Failed to clear activity stream' }));
      throw new Error(err.error || 'Failed to clear activity stream');
    }

    const json = await response.json();
    return json.data;
  },

  async deleteActivity(id: string): Promise<ActivityEvent> {
    const response = await fetch(`/api/activity/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Failed to delete activity log entry' }));
      throw new Error(err.error || 'Failed to delete activity log entry');
    }

    const json = await response.json();
    return json.data;
  },

  getExportUrl(params: FetchActivitiesParams = {}, format: 'txt' | 'csv' | 'json' = 'txt'): string {
    const query = new URLSearchParams();
    query.append('format', format);
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.module && params.module !== 'all') query.append('module', params.module);
    if (params.search) query.append('search', params.search);

    return `/api/activity/export?${query.toString()}`;
  }
};
