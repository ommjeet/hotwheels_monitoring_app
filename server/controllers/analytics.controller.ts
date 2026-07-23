import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analytics.service';
import { analyticsQuerySchema, recordEventSchema } from '../models/analytics.model';
import { ZodError } from 'zod';

export class AnalyticsController {
  // GET /api/analytics or /api/analytics/dashboard
  async getDashboardAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('[AnalyticsController] GET /api/analytics/dashboard', req.query);
      const query = analyticsQuerySchema.parse(req.query);
      const analytics = await analyticsService.getDashboardAnalytics(query);
      res.status(200).json({
        success: true,
        data: analytics
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: 'Invalid Analytics Query Parameters',
          details: error.issues.map(i => ({ field: i.path.join('.'), message: i.message }))
        });
        return;
      }
      next(error);
    }
  }

  // GET /api/analytics/kpis
  async getKpis(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('[AnalyticsController] GET /api/analytics/kpis', req.query);
      const query = analyticsQuerySchema.parse(req.query);
      const analytics = await analyticsService.getDashboardAnalytics(query);
      res.status(200).json({
        success: true,
        data: analytics.kpis
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/analytics/export
  async exportAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('[AnalyticsController] GET /api/analytics/export', req.query);
      const format = (req.query.format as 'txt' | 'csv' | 'json') || 'csv';
      const query = analyticsQuerySchema.parse(req.query);

      const exported = await analyticsService.exportAnalytics(query, format);

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

  // POST /api/analytics/record
  async recordEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('[AnalyticsController] POST /api/analytics/record', req.body);
      const validated = recordEventSchema.parse(req.body);
      await analyticsService.recordEvent(validated);
      res.status(201).json({
        success: true,
        message: 'Telemetry event recorded successfully'
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
}

export const analyticsController = new AnalyticsController();
