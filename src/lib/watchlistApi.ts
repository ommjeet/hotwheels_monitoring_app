import { WatchlistItem } from '../types';

export interface WatchlistQueryParams {
  search?: string;
  priority?: 'all' | 'high' | 'medium' | 'low';
  status?: 'all' | 'active' | 'inactive';
  sortBy?: 'name' | 'priority' | 'price' | 'detections';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export async function fetchWatchlist(params?: WatchlistQueryParams): Promise<{ items: WatchlistItem[]; totalCount: number }> {
  const urlParams = new URLSearchParams();
  if (params?.search) urlParams.append('search', params.search);
  if (params?.priority && params.priority !== 'all') urlParams.append('priority', params.priority);
  if (params?.status && params.status !== 'all') urlParams.append('status', params.status);
  if (params?.sortBy) urlParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) urlParams.append('sortOrder', params.sortOrder);
  if (params?.page) urlParams.append('page', params.page.toString());
  if (params?.limit) urlParams.append('limit', params.limit.toString());

  const queryString = urlParams.toString();
  const endpoint = `/api/watchlist${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`Failed to fetch watchlist: ${response.statusText}`);
  }
  const result = await response.json();
  return {
    items: result.data,
    totalCount: result.meta?.totalCount ?? result.data.length
  };
}

export async function createWatchlistItem(ruleData: Omit<WatchlistItem, 'id' | 'detectionCount'>): Promise<WatchlistItem> {
  const response = await fetch('/api/watchlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ruleData)
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Failed to create watchlist item: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data;
}

export async function updateWatchlistItem(id: string, updatedFields: Partial<WatchlistItem>): Promise<WatchlistItem> {
  const response = await fetch(`/api/watchlist/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedFields)
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Failed to update watchlist item: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data;
}

export async function deleteWatchlistItem(id: string): Promise<WatchlistItem> {
  const response = await fetch(`/api/watchlist/${id}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Failed to delete watchlist item: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data;
}

export async function duplicateWatchlistItem(id: string): Promise<WatchlistItem> {
  const response = await fetch(`/api/watchlist/duplicate/${id}`, {
    method: 'POST'
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Failed to duplicate watchlist item: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data;
}

export async function bulkDeleteWatchlistItems(ids: string[]): Promise<{ deletedCount: number }> {
  const response = await fetch('/api/watchlist/bulk/items', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids })
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Failed to bulk delete items: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data;
}

export async function bulkUpdateWatchlistStatus(ids: string[], active: boolean): Promise<{ updatedCount: number }> {
  const response = await fetch('/api/watchlist/bulk/status', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids, active })
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Failed to bulk update status: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data;
}
