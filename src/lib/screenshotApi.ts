import { InstamartItem } from '../types';

export interface ScreenshotStatusResponse {
  isCaptureEnabled: boolean;
  totalScreenshots: number;
  maxStorageCount: number;
  capturesDirectory: string;
}

export const screenshotApi = {
  async fetchScreenshots(options?: { search?: string; collectorType?: string }): Promise<{
    items: InstamartItem[];
    total: number;
    isCaptureEnabled: boolean;
  }> {
    const params = new URLSearchParams();
    if (options?.search) params.append('search', options.search);
    if (options?.collectorType) params.append('collectorType', options.collectorType);

    const res = await fetch(`/api/screenshots?${params.toString()}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch screenshots: ${res.statusText}`);
    }
    const json = await res.json();
    return {
      items: json.data || [],
      total: json.total || 0,
      isCaptureEnabled: json.isCaptureEnabled ?? true
    };
  },

  async getCaptureStatus(): Promise<ScreenshotStatusResponse> {
    const res = await fetch('/api/screenshots/status');
    if (!res.ok) {
      throw new Error(`Failed to fetch capture status: ${res.statusText}`);
    }
    const json = await res.json();
    return json.data;
  },

  async setCaptureStatus(enabled: boolean): Promise<ScreenshotStatusResponse> {
    const endpoint = enabled ? '/api/screenshots/enable' : '/api/screenshots/disable';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) {
      throw new Error(`Failed to set capture status: ${res.statusText}`);
    }
    const json = await res.json();
    return json.data;
  },

  async deleteScreenshot(id: string): Promise<boolean> {
    const res = await fetch(`/api/screenshots/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      throw new Error(`Failed to delete screenshot ${id}: ${res.statusText}`);
    }
    const json = await res.json();
    return json.success;
  },

  async clearGallery(): Promise<number> {
    const res = await fetch('/api/screenshots', {
      method: 'DELETE'
    });
    if (!res.ok) {
      throw new Error(`Failed to clear screenshot gallery: ${res.statusText}`);
    }
    const json = await res.json();
    return json.clearedCount || 0;
  }
};
