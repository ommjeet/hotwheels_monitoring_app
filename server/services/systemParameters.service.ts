import { getDatabase } from '../db/database';
import { SystemParameters, DEFAULT_SYSTEM_PARAMETERS } from '../config/defaults';
import { UpdateSystemParametersInput } from '../models/systemParameters.model';

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

    return resetParams;
  }
}

export const systemParametersService = new SystemParametersService();
