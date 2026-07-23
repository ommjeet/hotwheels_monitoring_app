import fs from 'fs';
import path from 'path';
import { JSONFilePreset } from 'lowdb/node';
import { SystemParameters, DEFAULT_SYSTEM_PARAMETERS } from '../config/defaults';

export interface DatabaseSchema {
  systemParameters: SystemParameters;
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
    systemParameters: { ...DEFAULT_SYSTEM_PARAMETERS }
  };

  dbInstance = await JSONFilePreset<DatabaseSchema>(DB_FILE, defaultData);
  return dbInstance;
}
