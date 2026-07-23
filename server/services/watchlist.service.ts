import { getDatabase } from '../db/database';
import { CreateWatchlistItemInput, UpdateWatchlistItemInput } from '../models/watchlist.model';

export interface WatchlistQueryParams {
  search?: string;
  priority?: 'all' | 'high' | 'medium' | 'low';
  status?: 'all' | 'active' | 'inactive';
  sortBy?: 'name' | 'priority' | 'price' | 'detections';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export class WatchlistService {
  async getAllItems(params: WatchlistQueryParams = {}) {
    const db = await getDatabase();
    await db.read();

    let items = db.data.watchlist || [];

    // Filter by search query
    if (params.search) {
      const query = params.search.toLowerCase();
      items = items.filter(
        item =>
          item.name.toLowerCase().includes(query) ||
          item.keyword.toLowerCase().includes(query)
      );
    }

    // Filter by priority
    if (params.priority && params.priority !== 'all') {
      items = items.filter(item => item.priority === params.priority);
    }

    // Filter by status
    if (params.status && params.status !== 'all') {
      const isActive = params.status === 'active';
      items = items.filter(item => item.active === isActive);
    }

    // Sort items
    const sortBy = params.sortBy || 'name';
    const sortOrder = params.sortOrder || 'asc';

    items.sort((a, b) => {
      let comp = 0;
      if (sortBy === 'name') {
        comp = a.name.localeCompare(b.name);
      } else if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        comp = (priorityOrder[a.priority as 'high' | 'medium' | 'low'] || 0) - 
               (priorityOrder[b.priority as 'high' | 'medium' | 'low'] || 0);
      } else if (sortBy === 'price') {
        comp = a.maxPrice - b.maxPrice;
      } else if (sortBy === 'detections') {
        comp = (a.detectionCount || 0) - (b.detectionCount || 0);
      }
      return sortOrder === 'asc' ? comp : -comp;
    });

    const totalCount = items.length;

    // Optional pagination
    if (params.page && params.limit) {
      const startIndex = (params.page - 1) * params.limit;
      items = items.slice(startIndex, startIndex + params.limit);
    }

    return {
      items,
      totalCount
    };
  }

  async getItemById(id: string) {
    const db = await getDatabase();
    await db.read();
    return (db.data.watchlist || []).find(item => item.id === id) || null;
  }

  async addItem(input: CreateWatchlistItemInput) {
    const db = await getDatabase();
    await db.read();

    if (!db.data.watchlist) {
      db.data.watchlist = [];
    }

    // Duplicate check on keyword or name
    const existing = db.data.watchlist.find(
      item => item.keyword.toLowerCase() === input.keyword.toLowerCase() && item.name.toLowerCase() === input.name.toLowerCase()
    );

    if (existing) {
      const error: any = new Error(`A monitored rule with name "${input.name}" and keyword "${input.keyword}" already exists.`);
      error.statusCode = 409;
      throw error;
    }

    const newItem = {
      id: `rule-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: input.name,
      keyword: input.keyword,
      matchType: input.matchType,
      excludeKeywords: input.excludeKeywords || [],
      autoPurchase: input.autoPurchase ?? false,
      active: input.active ?? true,
      priority: input.priority || 'high',
      similarityThreshold: input.similarityThreshold ?? 85,
      maxPrice: input.maxPrice ?? 499,
      quantity: input.quantity ?? 1,
      codToggle: input.codToggle ?? true,
      notes: input.notes || '',
      detectionCount: 0,
      createdAt: new Date().toISOString()
    };

    db.data.watchlist.unshift(newItem);

    // Record activity event
    db.data.activityEvents.push({
      id: `ev-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      message: `New Watchlist Rule registered: "${newItem.name}" (Keyword: "${newItem.keyword}")`,
      category: 'info'
    });

    await db.write();
    return newItem;
  }

  async updateItem(id: string, input: UpdateWatchlistItemInput) {
    const db = await getDatabase();
    await db.read();

    const index = (db.data.watchlist || []).findIndex(item => item.id === id);
    if (index === -1) {
      const error: any = new Error(`Watchlist rule with ID "${id}" not found.`);
      error.statusCode = 404;
      throw error;
    }

    const currentItem = db.data.watchlist[index];
    const updatedItem = {
      ...currentItem,
      ...input,
      updatedAt: new Date().toISOString()
    };

    db.data.watchlist[index] = updatedItem;

    db.data.activityEvents.push({
      id: `ev-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      message: `Watchlist Rule "${updatedItem.name}" parameters updated.`,
      category: 'info'
    });

    await db.write();
    return updatedItem;
  }

  async removeItem(id: string) {
    const db = await getDatabase();
    await db.read();

    const index = (db.data.watchlist || []).findIndex(item => item.id === id);
    if (index === -1) {
      const error: any = new Error(`Watchlist rule with ID "${id}" not found.`);
      error.statusCode = 404;
      throw error;
    }

    const removed = db.data.watchlist[index];
    db.data.watchlist.splice(index, 1);

    db.data.activityEvents.push({
      id: `ev-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      message: `Watchlist Rule "${removed.name}" removed from database.`,
      category: 'warning'
    });

    await db.write();
    return removed;
  }

  async duplicateItem(id: string) {
    const db = await getDatabase();
    await db.read();

    const original = (db.data.watchlist || []).find(item => item.id === id);
    if (!original) {
      const error: any = new Error(`Watchlist rule with ID "${id}" not found.`);
      error.statusCode = 404;
      throw error;
    }

    const duplicatedItem = {
      ...original,
      id: `rule-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: `${original.name} (Copy)`,
      detectionCount: 0,
      lastDetected: undefined,
      createdAt: new Date().toISOString()
    };

    db.data.watchlist.unshift(duplicatedItem);

    db.data.activityEvents.push({
      id: `ev-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      message: `Watchlist Rule duplicated: "${duplicatedItem.name}"`,
      category: 'info'
    });

    await db.write();
    return duplicatedItem;
  }

  async bulkDelete(ids: string[]) {
    const db = await getDatabase();
    await db.read();

    const initialLength = db.data.watchlist.length;
    db.data.watchlist = db.data.watchlist.filter(item => !ids.includes(item.id));
    const deletedCount = initialLength - db.data.watchlist.length;

    db.data.activityEvents.push({
      id: `ev-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      message: `Bulk delete executed: ${deletedCount} watchlist rules removed.`,
      category: 'warning'
    });

    await db.write();
    return { deletedCount };
  }

  async bulkUpdateStatus(ids: string[], active: boolean) {
    const db = await getDatabase();
    await db.read();

    let updatedCount = 0;
    db.data.watchlist = db.data.watchlist.map(item => {
      if (ids.includes(item.id)) {
        updatedCount++;
        return { ...item, active };
      }
      return item;
    });

    db.data.activityEvents.push({
      id: `ev-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      message: `Bulk status update executed: ${updatedCount} rules set to ${active ? 'ACTIVE' : 'INACTIVE'}.`,
      category: 'info'
    });

    await db.write();
    return { updatedCount };
  }
}

export const watchlistService = new WatchlistService();
