import fs from 'fs';
import path from 'path';
import { JSONFilePreset } from 'lowdb/node';
import { 
  SystemParameters, 
  EngineState,
  SchedulerConfig,
  ScheduledJob,
  JobExecutionRecord,
  DEFAULT_SYSTEM_PARAMETERS, 
  DEFAULT_ENGINE_STATE, 
  DEFAULT_INITIAL_ACTIVITIES, 
  SAMPLE_CATALOG, 
  DEFAULT_INITIAL_WATCHLIST,
  DEFAULT_SCHEDULER_CONFIG,
  DEFAULT_SCHEDULED_JOBS,
  DEFAULT_JOB_HISTORY
} from '../config/defaults';

import { AnalyticsMetricSnapshot } from '../models/analytics.model';
import { ScreenshotMetadata, ScreenshotConfig } from '../models/screenshot.model';

export interface DatabaseSchema {
  systemParameters: SystemParameters;
  engineState: EngineState;
  schedulerConfig: SchedulerConfig;
  scheduledJobs: ScheduledJob[];
  jobExecutionHistory: JobExecutionRecord[];
  activityEvents: any[];
  recentItems: any[];
  watchlist: any[];
  screenshots: ScreenshotMetadata[];
  screenshotConfig: ScreenshotConfig;
  analyticsSnapshots: AnalyticsMetricSnapshot[];
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

let dbInstance: Awaited<ReturnType<typeof JSONFilePreset<DatabaseSchema>>> | null = null;

export async function getDatabase() {
  if (dbInstance) {
    return dbInstance;
  }

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  const defaultData: DatabaseSchema = {
    systemParameters: { ...DEFAULT_SYSTEM_PARAMETERS },
    engineState: { ...DEFAULT_ENGINE_STATE },
    schedulerConfig: { ...DEFAULT_SCHEDULER_CONFIG },
    scheduledJobs: [...DEFAULT_SCHEDULED_JOBS],
    jobExecutionHistory: [...DEFAULT_JOB_HISTORY],
    activityEvents: [...DEFAULT_INITIAL_ACTIVITIES],
    recentItems: [...SAMPLE_CATALOG],
    watchlist: [...DEFAULT_INITIAL_WATCHLIST],
    screenshots: [SAMPLE_CATALOG[0], SAMPLE_CATALOG[1]],
    screenshotConfig: {
      isCaptureEnabled: true,
      maxStorageCount: 100,
      capturesDirectory: 'C:\\Users\\LocalCollector\\HotWheelsMonitor\\captures\\'
    },
    analyticsSnapshots: []
  };

  dbInstance = await JSONFilePreset<DatabaseSchema>(DB_FILE, defaultData);

  // Migration check for existing db.json files created prior to scheduler/analytics addition
  await dbInstance.read();
  let needsWrite = false;

  if (!dbInstance.data.schedulerConfig) {
    dbInstance.data.schedulerConfig = { ...DEFAULT_SCHEDULER_CONFIG };
    needsWrite = true;
  }
  if (!dbInstance.data.scheduledJobs) {
    dbInstance.data.scheduledJobs = [...DEFAULT_SCHEDULED_JOBS];
    needsWrite = true;
  }
  if (!dbInstance.data.jobExecutionHistory) {
    dbInstance.data.jobExecutionHistory = [...DEFAULT_JOB_HISTORY];
    needsWrite = true;
  }
  if (!dbInstance.data.analyticsSnapshots) {
    dbInstance.data.analyticsSnapshots = [];
    needsWrite = true;
  }
  if (!dbInstance.data.screenshotConfig) {
    dbInstance.data.screenshotConfig = {
      isCaptureEnabled: true,
      maxStorageCount: 100,
      capturesDirectory: 'C:\\Users\\LocalCollector\\HotWheelsMonitor\\captures\\'
    };
    needsWrite = true;
  }

  if (needsWrite) {
    await dbInstance.write();
  }

  return dbInstance;
}


