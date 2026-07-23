import { getDatabase } from '../db/database';
import { CreateActivityInput, ActivityQueryInput } from '../models/activity.model';

export interface ActivityEventRecord {
  id: string;
  timestamp: string;          // Formatted time (e.g. "10:15:32 AM")
  isoTimestamp: string;       // Standard ISO string
  message: string;
  category: 'info' | 'success' | 'warning' | 'error' | 'automation' | 'detection';
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  module: string;
  details?: string;
  metadata?: Record<string, any>;
}

export class ActivityService {
  private readonly MAX_EVENTS_BUFFER = 500;

  public async getActivities(query: ActivityQueryInput) {
    const db = await getDatabase();
    await db.read();

    let events: ActivityEventRecord[] = (db.data.activityEvents || []).map(this.normalizeRecord);

    // Filter by Category
    if (query.category && query.category !== 'all') {
      events = events.filter(e => e.category === query.category);
    }

    // Filter by Module
    if (query.module && query.module !== 'all') {
      events = events.filter(e => e.module.toLowerCase() === query.module!.toLowerCase());
    }

    // Filter by Severity
    if (query.severity && query.severity !== 'all') {
      events = events.filter(e => e.severity === query.severity);
    }

    // Search query in message, details, or module
    if (query.search && query.search.trim()) {
      const q = query.search.trim().toLowerCase();
      events = events.filter(e => 
        e.message.toLowerCase().includes(q) ||
        (e.details && e.details.toLowerCase().includes(q)) ||
        e.module.toLowerCase().includes(q)
      );
    }

    // Filter by Date Range
    if (query.startDate) {
      const startMs = new Date(query.startDate).getTime();
      events = events.filter(e => new Date(e.isoTimestamp).getTime() >= startMs);
    }
    if (query.endDate) {
      const endMs = new Date(query.endDate).getTime();
      events = events.filter(e => new Date(e.isoTimestamp).getTime() <= endMs);
    }

    // Sort order (default desc = newest first)
    events.sort((a, b) => {
      const timeA = new Date(a.isoTimestamp).getTime();
      const timeB = new Date(b.isoTimestamp).getTime();
      return query.sort === 'asc' ? timeA - timeB : timeB - timeA;
    });

    // Pagination
    const total = events.length;
    const page = query.page || 1;
    const limit = query.limit || 100;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedItems = events.slice(startIndex, startIndex + limit);

    return {
      items: paginatedItems,
      total,
      page,
      limit,
      totalPages
    };
  }

  public async getActivityById(id: string): Promise<ActivityEventRecord | null> {
    const db = await getDatabase();
    await db.read();

    const raw = (db.data.activityEvents || []).find((e: any) => e.id === id);
    return raw ? this.normalizeRecord(raw) : null;
  }

  public async createActivity(input: CreateActivityInput): Promise<ActivityEventRecord> {
    const db = await getDatabase();
    await db.read();

    const now = new Date();
    const newRecord: ActivityEventRecord = {
      id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: now.toLocaleTimeString(),
      isoTimestamp: now.toISOString(),
      message: input.message,
      category: input.category,
      severity: input.severity || (input.category === 'error' ? 'high' : 'info'),
      module: input.module || 'system',
      details: input.details,
      metadata: input.metadata
    };

    if (!db.data.activityEvents) {
      db.data.activityEvents = [];
    }

    db.data.activityEvents.unshift(newRecord);

    // Buffer limit check
    if (db.data.activityEvents.length > this.MAX_EVENTS_BUFFER) {
      db.data.activityEvents = db.data.activityEvents.slice(0, this.MAX_EVENTS_BUFFER);
    }

    await db.write();
    return newRecord;
  }

  public async clearActivities(): Promise<{ clearedCount: number }> {
    const db = await getDatabase();
    await db.read();

    const clearedCount = (db.data.activityEvents || []).length;
    db.data.activityEvents = [];

    await db.write();
    return { clearedCount };
  }

  public async deleteActivityById(id: string): Promise<ActivityEventRecord> {
    const db = await getDatabase();
    await db.read();

    const index = (db.data.activityEvents || []).findIndex((e: any) => e.id === id);
    if (index === -1) {
      const error: any = new Error(`Activity log with ID "${id}" not found.`);
      error.statusCode = 404;
      throw error;
    }

    const removed = db.data.activityEvents[index];
    db.data.activityEvents.splice(index, 1);

    await db.write();
    return this.normalizeRecord(removed);
  }

  public async getActivityStats() {
    const db = await getDatabase();
    await db.read();

    const events: ActivityEventRecord[] = (db.data.activityEvents || []).map(this.normalizeRecord);

    const stats = {
      totalEvents: events.length,
      categoryCounts: {
        info: 0,
        success: 0,
        warning: 0,
        error: 0,
        automation: 0,
        detection: 0
      },
      severityCounts: {
        info: 0,
        low: 0,
        medium: 0,
        high: 0,
        critical: 0
      },
      moduleCounts: {} as Record<string, number>,
      latestEventTimestamp: events[0]?.isoTimestamp || null
    };

    for (const e of events) {
      if (stats.categoryCounts[e.category] !== undefined) {
        stats.categoryCounts[e.category]++;
      }
      if (stats.severityCounts[e.severity] !== undefined) {
        stats.severityCounts[e.severity]++;
      }
      const mod = e.module || 'system';
      stats.moduleCounts[mod] = (stats.moduleCounts[mod] || 0) + 1;
    }

    return stats;
  }

  public async exportActivities(query: ActivityQueryInput, format: 'txt' | 'csv' | 'json' = 'txt'): Promise<{ filename: string; content: string; contentType: string }> {
    const result = await this.getActivities({ ...query, limit: 500, page: 1 });
    const events = result.items;
    const dateStr = new Date().toISOString().slice(0, 10);

    if (format === 'json') {
      return {
        filename: `hotwheels_activity_logs_${dateStr}.json`,
        content: JSON.stringify(events, null, 2),
        contentType: 'application/json'
      };
    }

    if (format === 'csv') {
      const headers = ['ID', 'Timestamp', 'Category', 'Severity', 'Module', 'Message', 'Details'];
      const rows = events.map(e => [
        `"${e.id}"`,
        `"${e.timestamp}"`,
        `"${e.category}"`,
        `"${e.severity}"`,
        `"${e.module}"`,
        `"${(e.message || '').replace(/"/g, '""')}"`,
        `"${(e.details || '').replace(/"/g, '""')}"`
      ]);
      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      return {
        filename: `hotwheels_activity_logs_${dateStr}.csv`,
        content: csvContent,
        contentType: 'text/csv'
      };
    }

    // Default TXT format
    const lines = events.map(e => 
      `[${e.timestamp}] [${e.category.toUpperCase()}] [${e.module.toUpperCase()}] ${e.message}${e.details ? ` | Details: ${e.details}` : ''}`
    );
    return {
      filename: `hotwheels_activity_logs_${dateStr}.txt`,
      content: lines.join('\n'),
      contentType: 'text/plain'
    };
  }

  // --- Convenience Helper Logging Functions ---
  public async logInfo(message: string, details?: string, module = 'system', metadata?: Record<string, any>) {
    return this.createActivity({ message, category: 'info', severity: 'info', module, details, metadata });
  }

  public async logSuccess(message: string, details?: string, module = 'system', metadata?: Record<string, any>) {
    return this.createActivity({ message, category: 'success', severity: 'info', module, details, metadata });
  }

  public async logWarning(message: string, details?: string, module = 'system', metadata?: Record<string, any>) {
    return this.createActivity({ message, category: 'warning', severity: 'medium', module, details, metadata });
  }

  public async logError(message: string, details?: string, module = 'system', metadata?: Record<string, any>) {
    return this.createActivity({ message, category: 'error', severity: 'high', module, details, metadata });
  }

  public async logAutomation(message: string, details?: string, module = 'engine', metadata?: Record<string, any>) {
    return this.createActivity({ message, category: 'automation', severity: 'info', module, details, metadata });
  }

  public async logDetection(message: string, details?: string, module = 'watchlist', metadata?: Record<string, any>) {
    return this.createActivity({ message, category: 'detection', severity: 'high', module, details, metadata });
  }

  // Helper to ensure consistent shape when reading existing lowdb records
  private normalizeRecord(raw: any): ActivityEventRecord {
    return {
      id: raw.id || `ev-${Date.now()}`,
      timestamp: raw.timestamp || new Date().toLocaleTimeString(),
      isoTimestamp: raw.isoTimestamp || new Date().toISOString(),
      message: raw.message || '',
      category: raw.category || 'info',
      severity: raw.severity || (raw.category === 'error' ? 'high' : 'info'),
      module: raw.module || 'system',
      details: raw.details || undefined,
      metadata: raw.metadata || undefined
    };
  }
}

export const activityService = new ActivityService();
