import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard.service';
import { 
  toggleEngineSchema, 
  simulateOutageSchema, 
  toggleFastSimSchema, 
  postActivitySchema 
} from '../models/dashboard.model';
import { ZodError } from 'zod';

export class DashboardController {
  async getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('[DashboardController] GET /api/dashboard/summary');
      const summary = await dashboardService.getSummary();
      res.status(200).json({
        success: true,
        data: summary
      });
    } catch (error) {
      next(error);
    }
  }

  async toggleScan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('[DashboardController] POST /api/dashboard/engine/toggle', req.body);
      const validated = toggleEngineSchema.parse(req.body);
      const summary = await dashboardService.toggleScan(validated.isScanning);
      res.status(200).json({
        success: true,
        message: `Engine ${validated.isScanning ? 'started' : 'paused'} successfully`,
        data: summary
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

  async manualScan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('[DashboardController] POST /api/dashboard/engine/manual-scan');
      const result = await dashboardService.triggerManualScan();
      res.status(200).json({
        success: true,
        message: 'Manual scan cycle executed successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async panicStop(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('[DashboardController] POST /api/dashboard/engine/panic-stop');
      const summary = await dashboardService.triggerPanicStop();
      res.status(200).json({
        success: true,
        message: 'PANIC STOP EXECUTED: All background workers halted',
        data: summary
      });
    } catch (error) {
      next(error);
    }
  }

  async simulateOutage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('[DashboardController] POST /api/dashboard/engine/simulate-outage', req.body);
      const validated = simulateOutageSchema.parse(req.body);
      const summary = await dashboardService.simulateOutage(validated.reopenTime || null);
      res.status(200).json({
        success: true,
        message: 'Store outage simulated successfully',
        data: summary
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ success: false, error: 'Validation Error', details: error.issues });
        return;
      }
      next(error);
    }
  }

  async restoreOnline(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('[DashboardController] POST /api/dashboard/engine/restore-online');
      const summary = await dashboardService.restoreOnline();
      res.status(200).json({
        success: true,
        message: 'Store status restored to online',
        data: summary
      });
    } catch (error) {
      next(error);
    }
  }

  async toggleFastSim(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('[DashboardController] POST /api/dashboard/engine/toggle-fast-sim', req.body);
      const validated = toggleFastSimSchema.parse(req.body);
      const summary = await dashboardService.toggleFastSimulation(validated.enabled);
      res.status(200).json({
        success: true,
        message: `Fast simulation mode ${validated.enabled ? 'enabled' : 'disabled'}`,
        data: summary
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ success: false, error: 'Validation Error', details: error.issues });
        return;
      }
      next(error);
    }
  }

  async postActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('[DashboardController] POST /api/dashboard/activities', req.body);
      const validated = postActivitySchema.parse(req.body);
      const newEvent = await dashboardService.addActivityEvent(validated);
      res.status(201).json({
        success: true,
        message: 'Activity log posted successfully',
        data: newEvent
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ success: false, error: 'Validation Error', details: error.issues });
        return;
      }
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
