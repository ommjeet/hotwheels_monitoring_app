import { getDatabase } from '../db/database';
import { SAMPLE_CATALOG } from '../config/defaults';
import { PostActivityInput } from '../models/dashboard.model';

export class DashboardService {
  async getSummary() {
    const db = await getDatabase();
    await db.read();

    const engineState = db.data.engineState;
    const sysParams = db.data.systemParameters;
    const watchlist = db.data.watchlist || [];
    const screenshots = db.data.screenshots || [];
    const activityEvents = db.data.activityEvents || [];
    const recentItems = db.data.recentItems || [];

    // Calculate dynamic uptime in seconds
    const uptimeStart = new Date(engineState.uptimeStart).getTime();
    const nowMs = Date.now();
    const uptimeSeconds = Math.max(0, Math.floor((nowMs - uptimeStart) / 1000));

    // Calculate active watchlist rules count
    const activeWatchlistCount = watchlist.filter((item: any) => item.active !== false).length;

    const stats = {
      status: engineState.status,
      uptimeSeconds,
      totalScans: engineState.totalScans,
      totalMatches: screenshots.length || engineState.totalMatches,
      ordersCompleted: engineState.ordersCompleted,
      failures: engineState.failures,
      retries: engineState.retries,
      averageScanTimeMs: engineState.averageScanTimeMs,
      averageDetectionTimeMs: engineState.averageDetectionTimeMs,
      chromeStatus: engineState.chromeStatus,
      localPort: sysParams.localChromePort || 9222,
      storeStatus: engineState.storeStatus,
      offlineCountdown: engineState.offlineCountdown,
      reopenTimeStr: engineState.reopenTimeStr,
      isFastSimulation: engineState.isFastSimulation
    };

    return {
      stats,
      isScanning: engineState.isScanning,
      scanInterval: sysParams.scanIntervalSeconds,
      location: sysParams.userLocation,
      watchlistCount: activeWatchlistCount,
      countdown: engineState.countdown,
      cooldownRemainingSeconds: engineState.cooldownRemainingSeconds,
      enableJitter: sysParams.enableJitter,
      recentItems,
      recentEvents: activityEvents
    };
  }

  async toggleScan(isScanning: boolean) {
    const db = await getDatabase();
    await db.read();

    db.data.engineState.isScanning = isScanning;
    db.data.engineState.status = isScanning ? 'scanning' : 'paused';

    const eventMessage = isScanning 
      ? 'Automation Engine started. Resuming active watchlist polling.'
      : 'Automation Engine paused by operator request.';

    db.data.activityEvents.push({
      id: `ev-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      message: eventMessage,
      category: isScanning ? 'automation' : 'warning'
    });

    await db.write();
    return this.getSummary();
  }

  async triggerManualScan() {
    const db = await getDatabase();
    await db.read();

    // Increment scan count
    db.data.engineState.totalScans += 1;

    // Select or generate a polled item from sample catalog with small random variations
    const randomIndex = Math.floor(Math.random() * SAMPLE_CATALOG.length);
    const baseItem = SAMPLE_CATALOG[randomIndex];
    
    const scannedItem = {
      ...baseItem,
      id: `polled-${Date.now()}`,
      timestamp: new Date().toISOString()
    };

    // Check against active watchlist rules
    const activeRules = (db.data.watchlist || []).filter((r: any) => r.active !== false);
    const matchedRule = activeRules.find((rule: any) => {
      const keyword = rule.keyword.toLowerCase();
      const titleMatches = scannedItem.title.toLowerCase().includes(keyword);
      const priceMatches = !rule.maxPrice || scannedItem.price <= rule.maxPrice;
      return titleMatches && priceMatches;
    });

    if (matchedRule) {
      scannedItem.isCollectorPiece = true;
      scannedItem.collectorType = (matchedRule.name.includes('Super Treasure') ? 'Super TH' : 'Premium Car Culture') as any;
      
      // Save to screenshots gallery
      db.data.screenshots.unshift(scannedItem);
      if (db.data.screenshots.length > 50) {
        db.data.screenshots = db.data.screenshots.slice(0, 50);
      }

      db.data.engineState.totalMatches += 1;

      db.data.activityEvents.push({
        id: `ev-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        message: `MATCH DETECTED: "${scannedItem.title}" matched rule "${matchedRule.name}" (Price: ₹${scannedItem.price})`,
        category: 'detection',
        details: `Rule ID: ${matchedRule.id}\nKeyword: ${matchedRule.keyword}\nAuto-Purchase: ${matchedRule.autoPurchase ? 'ENABLED' : 'DISABLED'}`
      });
    } else {
      db.data.activityEvents.push({
        id: `ev-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        message: `Polled item "${scannedItem.title.substring(0, 45)}..." — No active watchlist rule match.`,
        category: 'automation'
      });
    }

    // Add to recentItems (keep last 20)
    db.data.recentItems.unshift(scannedItem);
    if (db.data.recentItems.length > 20) {
      db.data.recentItems = db.data.recentItems.slice(0, 20);
    }

    await db.write();

    return {
      scannedItem,
      summary: await this.getSummary()
    };
  }

  async triggerPanicStop() {
    const db = await getDatabase();
    await db.read();

    db.data.engineState.isScanning = false;
    db.data.engineState.status = 'paused';
    db.data.engineState.storeStatus = 'online';

    db.data.activityEvents.push({
      id: `ev-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      message: 'PANIC STOP TRIGGERED: Engine Master Safety Override activated. All scan workers halted immediately.',
      category: 'error',
      details: 'Emergency stop commanded via master UI override.\nAll active Chromium DevTools sessions suspended.'
    });

    await db.write();
    return this.getSummary();
  }

  async simulateOutage(reopenTime: string | null) {
    const db = await getDatabase();
    await db.read();

    if (reopenTime) {
      db.data.engineState.storeStatus = 'offline_reopen';
      db.data.engineState.status = 'offline_reopen';
      db.data.engineState.reopenTimeStr = reopenTime;
      db.data.engineState.offlineCountdown = db.data.engineState.isFastSimulation ? 15 : 300;

      db.data.activityEvents.push({
        id: `ev-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        message: `Outage Simulated: Store reported offline with reopening time (${reopenTime}).`,
        category: 'warning'
      });
    } else {
      db.data.engineState.storeStatus = 'offline_retry';
      db.data.engineState.status = 'offline_retry';
      db.data.engineState.reopenTimeStr = '';
      db.data.engineState.offlineCountdown = db.data.engineState.isFastSimulation ? 15 : 900;

      db.data.activityEvents.push({
        id: `ev-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        message: 'Outage Simulated: Store temporarily unavailable without reopen info. 15-minute retry scheduled.',
        category: 'warning'
      });
    }

    await db.write();
    return this.getSummary();
  }

  async restoreOnline() {
    const db = await getDatabase();
    await db.read();

    db.data.engineState.storeStatus = 'online';
    db.data.engineState.status = db.data.engineState.isScanning ? 'scanning' : 'paused';
    db.data.engineState.reopenTimeStr = '';
    db.data.engineState.offlineCountdown = 0;

    db.data.activityEvents.push({
      id: `ev-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      message: 'Store status restored to ONLINE. Live inventory stream resumed.',
      category: 'success'
    });

    await db.write();
    return this.getSummary();
  }

  async toggleFastSimulation(enabled: boolean) {
    const db = await getDatabase();
    await db.read();

    db.data.engineState.isFastSimulation = enabled;

    db.data.activityEvents.push({
      id: `ev-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      message: `Fast Evaluation Simulation Mode ${enabled ? 'ENABLED (15s evaluation cycles)' : 'DISABLED (standard intervals)'}.`,
      category: 'info'
    });

    await db.write();
    return this.getSummary();
  }

  async addActivityEvent(input: PostActivityInput) {
    const db = await getDatabase();
    await db.read();

    const newEvent = {
      id: `ev-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      message: input.message,
      category: input.category,
      details: input.details
    };

    db.data.activityEvents.push(newEvent);
    if (db.data.activityEvents.length > 200) {
      db.data.activityEvents = db.data.activityEvents.slice(db.data.activityEvents.length - 200);
    }

    await db.write();
    return newEvent;
  }
}

export const dashboardService = new DashboardService();
