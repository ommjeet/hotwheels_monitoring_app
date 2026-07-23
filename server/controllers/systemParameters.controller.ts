import { Request, Response, NextFunction } from 'express';
import { systemParametersService } from '../services/systemParameters.service';
import { systemParametersSchema } from '../models/systemParameters.model';
import { ZodError } from 'zod';

export class SystemParametersController {
  async getParameters(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('[SystemParametersController] GET /api/system-parameters');
      const parameters = await systemParametersService.getSystemParameters();
      res.status(200).json({
        success: true,
        data: parameters
      });
    } catch (error) {
      next(error);
    }
  }

  async updateParameters(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('[SystemParametersController] PUT /api/system-parameters', req.body);
      const validatedData = systemParametersSchema.parse(req.body);
      const updated = await systemParametersService.updateSystemParameters(validatedData);
      res.status(200).json({
        success: true,
        message: 'System parameters updated successfully',
        data: updated
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          details: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        });
        return;
      }
      next(error);
    }
  }

  async resetParameters(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('[SystemParametersController] POST /api/system-parameters/reset');
      const resetParams = await systemParametersService.resetToDefaults();
      res.status(200).json({
        success: true,
        message: 'System parameters reset to default configuration',
        data: resetParams
      });
    } catch (error) {
      next(error);
    }
  }
}

export const systemParametersController = new SystemParametersController();
