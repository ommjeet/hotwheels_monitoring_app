import { getDatabase } from '../db/database';
import { 
  ScreenshotMetadata, 
  ScreenshotConfig, 
  ScreenshotQueryInput 
} from '../models/screenshot.model';
import { activityService } from './activity.service';

export class ScreenshotService {
  /**
   * Get screenshot capture configuration status
   */
  public async getCaptureStatus(): Promise<{
    isCaptureEnabled: boolean;
    totalScreenshots: number;
    maxStorageCount: number;
    capturesDirectory: string;
  }> {
    const db = await getDatabase();
    await db.read();

    const config = db.data.screenshotConfig || {
      isCaptureEnabled: true,
      maxStorageCount: 100,
      capturesDirectory: 'C:\\Users\\LocalCollector\\HotWheelsMonitor\\captures\\'
    };

    return {
      isCaptureEnabled: config.isCaptureEnabled ?? true,
      totalScreenshots: (db.data.screenshots || []).length,
      maxStorageCount: config.maxStorageCount ?? 100,
      capturesDirectory: config.capturesDirectory || 'C:\\Users\\LocalCollector\\HotWheelsMonitor\\captures\\'
    };
  }

  /**
   * Set screenshot capture status (Enable or Disable)
   */
  public async setCaptureStatus(enabled: boolean): Promise<ScreenshotConfig> {
    const db = await getDatabase();
    await db.read();

    if (!db.data.screenshotConfig) {
      db.data.screenshotConfig = {
        isCaptureEnabled: true,
        maxStorageCount: 100,
        capturesDirectory: 'C:\\Users\\LocalCollector\\HotWheelsMonitor\\captures\\'
      };
    }

    const previousStatus = db.data.screenshotConfig.isCaptureEnabled;
    db.data.screenshotConfig.isCaptureEnabled = enabled;
    await db.write();

    if (previousStatus !== enabled) {
      const message = enabled 
        ? 'Screenshot Capture Engine ENABLED: High-resolution listing captures active.'
        : 'Screenshot Capture Engine DISABLED: Automatic capture suspended. Existing shelf images preserved.';
      if (enabled) {
        await activityService.logSuccess(message, `Capture state toggled to: ACTIVE`, 'screenshot');
      } else {
        await activityService.logWarning(message, `Capture state toggled to: SUSPENDED`, 'screenshot');
      }
    }

    return db.data.screenshotConfig;
  }

  /**
   * Get list of stored screenshots with optional filtering
   */
  public async getScreenshots(query?: ScreenshotQueryInput): Promise<{
    items: ScreenshotMetadata[];
    total: number;
    isCaptureEnabled: boolean;
  }> {
    const db = await getDatabase();
    await db.read();

    let list = db.data.screenshots || [];
    const search = query?.search?.toLowerCase();
    const collectorType = query?.collectorType;
    const limit = query?.limit || 100;

    if (search) {
      list = list.filter(item => item.title.toLowerCase().includes(search));
    }

    if (collectorType && collectorType !== 'all') {
      list = list.filter(item => item.collectorType === collectorType);
    }

    const total = list.length;
    const items = list.slice(0, limit);

    return {
      items,
      total,
      isCaptureEnabled: db.data.screenshotConfig?.isCaptureEnabled ?? true
    };
  }

  /**
   * Get a single screenshot by ID
   */
  public async getScreenshotById(id: string): Promise<ScreenshotMetadata | null> {
    const db = await getDatabase();
    await db.read();

    const shot = (db.data.screenshots || []).find(s => s.id === id);
    return shot || null;
  }

  /**
   * Capture a new screenshot if capture engine is enabled
   */
  public async captureScreenshot(itemData: Partial<ScreenshotMetadata>): Promise<ScreenshotMetadata | null> {
    const db = await getDatabase();
    await db.read();

    const config = db.data.screenshotConfig;
    if (config && !config.isCaptureEnabled) {
      console.log('[ScreenshotService] Capture requested but engine is DISABLED. Skipping capture.');
      return null;
    }

    const id = itemData.id || `shot-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const timestamp = itemData.timestamp || new Date().toISOString();
    const fileLocation = itemData.fileLocation || `${config?.capturesDirectory || 'captures\\'}${id}.jpg`;

    const newShot: ScreenshotMetadata = {
      id,
      title: itemData.title || 'Swiggy Instamart Item Listing',
      price: itemData.price || 149,
      imageUrl: itemData.imageUrl || 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&q=80&w=800',
      collectorType: itemData.collectorType || 'Mainline Match',
      timestamp,
      stock: itemData.stock || 1,
      inStock: itemData.inStock !== undefined ? itemData.inStock : true,
      storeName: itemData.storeName || 'Instamart Hub #402',
      matchedRuleId: itemData.matchedRuleId,
      fileLocation
    };

    if (!db.data.screenshots) {
      db.data.screenshots = [];
    }

    db.data.screenshots.unshift(newShot);

    // Limit maximum storage count
    const maxCount = config?.maxStorageCount || 100;
    if (db.data.screenshots.length > maxCount) {
      db.data.screenshots = db.data.screenshots.slice(0, maxCount);
    }

    await db.write();

    await activityService.logDetection(
      `Screenshot captured: "${newShot.title}" saved to local shelf.`,
      `File location: ${fileLocation}`,
      'screenshot'
    ).catch(() => {});

    return newShot;
  }

  /**
   * Delete a single screenshot by ID
   */
  public async deleteScreenshot(id: string): Promise<boolean> {
    const db = await getDatabase();
    await db.read();

    const initialLength = (db.data.screenshots || []).length;
    db.data.screenshots = (db.data.screenshots || []).filter(s => s.id !== id);

    if (db.data.screenshots.length < initialLength) {
      await db.write();
      await activityService.logWarning(`Screenshot purge: Item #${id} removed from disk gallery.`, undefined, 'screenshot');
      return true;
    }

    return false;
  }

  /**
   * Flush/Clear all screenshots
   */
  public async clearGallery(): Promise<number> {
    const db = await getDatabase();
    await db.read();

    const count = (db.data.screenshots || []).length;
    db.data.screenshots = [];
    await db.write();

    await activityService.logWarning(`Screenshot gallery flushed: ${count} captures purged from disk memory.`, undefined, 'screenshot');
    return count;
  }
}

export const screenshotService = new ScreenshotService();
