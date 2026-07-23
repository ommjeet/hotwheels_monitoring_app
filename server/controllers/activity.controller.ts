import { Request, Response, NextFunction } from 'express';
import { activityService } from '../services/activity.service';
import { createActivitySchema, activityQuerySchema } from '../models/activity.model';
import { ZodError } from 'zod';

export class ActivityController {
  // GET /api/activity
  async getActivities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('[ActivityController] GET /api/activity', req.query);
      const query = activityQuerySchema.parse(req.query);
      const result = await activityService.getActivities(query);
      res.status(200).json({
        success: true,
        data: result.items,
        meta: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages
        }
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

  // GET /api/activity/stats
  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('[ActivityController] GET /api/activity/stats');
      const stats = await activityService.getActivityStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/activity/export
  async exportActivities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('[ActivityController] GET /api/activity/export', req.query);
      const format = (req.query.format as 'txt' | 'csv' | 'json') || 'txt';
      const query = activityQuerySchema.parse(req.query);
      
      const exported = await activityService.exportActivities(query, format);
      
      res.setHeader('Content-Type', exported.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${exported.filename}"`);
      res.status(200).send(exported.content);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ success: false, error: 'Invalid Parameters', details: error.issues });
        return;
      }
      next(error);
    }
  }

  // GET /api/activity/:id
  async getActivityById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id;
      console.log(`[ActivityController] GET /api/activity/${id}`);
      const event = await activityService.getActivityById(id);
      if (!event) {
        res.status(404).json({ success: false, error: `Activity log entry with ID "${id}" not found.` });
        return;
      }
      res.status(200).json({ success: true, data: event });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/activity
  async createActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('[ActivityController] POST /api/activity', req.body);
      const validated = createActivitySchema.parse(req.body);
      const newEvent = await activityService.createActivity(validated);
      res.status(201).json({
        success: true,
        message: 'Activity event logged successfully',
        data: newEvent
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

  // DELETE /api/activity
  async clearActivities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('[ActivityController] DELETE /api/activity');
      const result = await activityService.clearActivities();
      res.status(200).json({
        success: true,
        message: `Activity stream console cleared (${result.clearedCount} events removed)`,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/activity/:id
  async deleteActivityById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id;
      console.log(`[ActivityController] DELETE /api/activity/${id}`);
      const removed = await activityService.deleteActivityById(id);
      res.status(200).json({
        success: true,
        message: 'Activity log entry removed',
        data: removed
      });
    } catch (error) {
      if ((error as any).statusCode) {
        res.status((error as any).statusCode).json({ success: false, error: (error as Error).message });
        return;
      }
      next(error);
    }
  }
}

export const activityController = new ActivityController();
