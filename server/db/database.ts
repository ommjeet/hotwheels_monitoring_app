import fs from 'fs';
import path from 'path';
import { JSONFilePreset } from 'lowdb/node';
import { 
  SystemParameters, 
  EngineState, 
  DEFAULT_SYSTEM_PARAMETERS, 
  DEFAULT_ENGINE_STATE, 
  DEFAULT_INITIAL_ACTIVITIES, 
  SAMPLE_CATALOG, 
  DEFAULT_INITIAL_WATCHLIST 
} from '../config/defaults';

export interface DatabaseSchema {
  systemParameters: SystemParameters;
  engineState: EngineState;
  activityEvents: any[];
  recentItems: any[];
  watchlist: any[];
  screenshots: any[];
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
    activityEvents: [...DEFAULT_INITIAL_ACTIVITIES],
    recentItems: [...SAMPLE_CATALOG],
    watchlist: [...DEFAULT_INITIAL_WATCHLIST],
    screenshots: [SAMPLE_CATALOG[0], SAMPLE_CATALOG[1]]
  };

  dbInstance = await JSONFilePreset<DatabaseSchema>(DB_FILE, defaultData);
  return dbInstance;
}

