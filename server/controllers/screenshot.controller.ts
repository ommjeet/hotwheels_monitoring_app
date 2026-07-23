import { Request, Response, NextFunction } from 'express';
import { screenshotService } from '../services/screenshot.service';
import { screenshotQuerySchema, updateCaptureStatusSchema } from '../models/screenshot.model';
import { ZodError } from 'zod';

export class ScreenshotController {
  // GET /api/screenshots
  async getScreenshots(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('[ScreenshotController] GET /api/screenshots', req.query);
      const query = screenshotQuerySchema.parse(req.query);
      const result = await screenshotService.getScreenshots(query);
      res.status(200).json({
        success: true,
        data: result.items,
        total: result.total,
        isCaptureEnabled: result.isCaptureEnabled
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: 'Invalid Query Parameters',
          details: error.issues.map(i => ({ field: i.path.join('.'), message: i.message }))
        });
        return;
      }
      next(error);
    }
  }

  // GET /api/screenshots/status
  async getCaptureStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('[ScreenshotController] GET /api/screenshots/status');
      const status = await screenshotService.getCaptureStatus();
      res.status(200).json({
        success: true,
        data: status
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/screenshots/status or POST /api/screenshots/status
  async updateCaptureStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('[ScreenshotController] UPDATE capture status', req.body);
      const { enabled } = updateCaptureStatusSchema.parse(req.body);
      const updatedConfig = await screenshotService.setCaptureStatus(enabled);
      res.status(200).json({
        success: true,
        message: `Screenshot capture engine ${enabled ? 'ENABLED' : 'DISABLED'}`,
        data: updatedConfig
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          details: error.issues.map(i => ({ field: i.path.join('.'), message: i.message }))
        });
        return;
      }
      next(error);
    }
  }

  // POST /api/screenshots/enable
  async enableCapture(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('[ScreenshotController] POST /api/screenshots/enable');
      const updatedConfig = await screenshotService.setCaptureStatus(true);
      res.status(200).json({
        success: true,
        message: 'Screenshot capture engine ENABLED',
        data: updatedConfig
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/screenshots/disable
  async disableCapture(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('[ScreenshotController] POST /api/screenshots/disable');
      const updatedConfig = await screenshotService.setCaptureStatus(false);
      res.status(200).json({
        success: true,
        message: 'Screenshot capture engine DISABLED',
        data: updatedConfig
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/screenshots/:id
  async getScreenshotById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      console.log(`[ScreenshotController] GET /api/screenshots/${id}`);
      const item = await screenshotService.getScreenshotById(id);
      if (!item) {
        res.status(404).json({
          success: false,
          error: `Screenshot with ID ${id} not found`
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: item
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/screenshots/:id
  async deleteScreenshot(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      console.log(`[ScreenshotController] DELETE /api/screenshots/${id}`);
      const deleted = await screenshotService.deleteScreenshot(id);
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: `Screenshot with ID ${id} not found`
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: `Screenshot ${id} removed successfully`
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/screenshots or POST /api/screenshots/clear
  async clearGallery(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('[ScreenshotController] DELETE /api/screenshots (clear all)');
      const clearedCount = await screenshotService.clearGallery();
      res.status(200).json({
        success: true,
        message: `Flushed ${clearedCount} screenshots from local shelf`,
        clearedCount
      });
    } catch (error) {
      next(error);
    }
  }
}

export const screenshotController = new ScreenshotController();
