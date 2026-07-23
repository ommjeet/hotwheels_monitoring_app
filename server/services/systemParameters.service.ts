import { getDatabase } from '../db/database';
import { SystemParameters, DEFAULT_SYSTEM_PARAMETERS } from '../config/defaults';
import { UpdateSystemParametersInput } from '../models/systemParameters.model';
import { activityService } from './activity.service';

export class SystemParametersService {
  async getSystemParameters(): Promise<SystemParameters> {
    const db = await getDatabase();
    await db.read();
    return db.data.systemParameters;
  }

  async updateSystemParameters(input: UpdateSystemParametersInput): Promise<SystemParameters> {
    const db = await getDatabase();
    await db.read();

    const currentParams = db.data.systemParameters;
    const updatedParams: SystemParameters = {
      ...currentParams,
      ...input,
      updatedAt: new Date().toISOString()
    };

    db.data.systemParameters = updatedParams;
    await db.write();

    await activityService.logInfo(
      'System Parameters configuration updated.',
      `Scan interval: ${updatedParams.scanIntervalSeconds}s | Location: ${updatedParams.userLocation} | Jitter: ${updatedParams.enableJitter ? 'ENABLED' : 'DISABLED'}`,
      'config'
    );

    return updatedParams;
  }

  async resetToDefaults(): Promise<SystemParameters> {
    const db = await getDatabase();
    const resetParams: SystemParameters = {
      ...DEFAULT_SYSTEM_PARAMETERS,
      updatedAt: new Date().toISOString()
    };

    db.data.systemParameters = resetParams;
    await db.write();

    await activityService.logWarning(
      'System Parameters reset to factory default values.',
      `Scan interval reset to ${resetParams.scanIntervalSeconds}s.`,
      'config'
    );

    return resetParams;
  }
}

export const systemParametersService = new SystemParametersService();
