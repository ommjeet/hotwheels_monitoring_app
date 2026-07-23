import { Request, Response, NextFunction } from 'express';
import { schedulerEngineService } from '../services/schedulerEngine.service';
import { 
  schedulerConfigSchema, 
  updateSchedulerConfigSchema, 
  createScheduledJobSchema, 
  updateScheduledJobSchema 
} from '../models/scheduler.model';
import { ZodError } from 'zod';

export class SchedulerController {
  // GET /api/scheduler/config
  async getConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('[SchedulerController] GET /api/scheduler/config');
      const config = await schedulerEngineService.getConfig();
      res.status(200).json({ success: true, data: config });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/scheduler/config
  async updateConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('[SchedulerController] PUT /api/scheduler/config', req.body);
      const validated = updateSchedulerConfigSchema.parse(req.body);
      const updatedConfig = await schedulerEngineService.updateConfig(validated as any);
      res.status(200).json({
        success: true,
        message: 'Scheduler configuration updated successfully',
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

  // GET /api/scheduler/jobs
  async getAllJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('[SchedulerController] GET /api/scheduler/jobs');
      const jobs = await schedulerEngineService.getAllJobs();
      res.status(200).json({ success: true, data: jobs });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/scheduler/jobs/:id
  async getJobById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id;
      console.log(`[SchedulerController] GET /api/scheduler/jobs/${id}`);
      const job = await schedulerEngineService.getJobById(id);
      if (!job) {
        res.status(404).json({ success: false, error: `Scheduled job with ID ${id} not found` });
        return;
      }
      res.status(200).json({ success: true, data: job });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/scheduler/jobs
  async createJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('[SchedulerController] POST /api/scheduler/jobs', req.body);
      const validated = createScheduledJobSchema.parse(req.body);
      const newJob = await schedulerEngineService.createJob(validated);
      res.status(201).json({
        success: true,
        message: 'Scheduled job created successfully',
        data: newJob
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

  // PUT /api/scheduler/jobs/:id
  async updateJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id;
      console.log(`[SchedulerController] PUT /api/scheduler/jobs/${id}`, req.body);
      const validated = updateScheduledJobSchema.parse(req.body);
      const updatedJob = await schedulerEngineService.updateJob(id, validated);
      res.status(200).json({
        success: true,
        message: 'Scheduled job updated successfully',
        data: updatedJob
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
      if ((error as any).statusCode) {
        res.status((error as any).statusCode).json({ success: false, error: (error as Error).message });
        return;
      }
      next(error);
    }
  }

  // POST /api/scheduler/jobs/:id/pause
  async pauseJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id;
      console.log(`[SchedulerController] POST /api/scheduler/jobs/${id}/pause`);
      const pausedJob = await schedulerEngineService.pauseJob(id);
      res.status(200).json({
        success: true,
        message: 'Scheduled job paused',
        data: pausedJob
      });
    } catch (error) {
      if ((error as any).statusCode) {
        res.status((error as any).statusCode).json({ success: false, error: (error as Error).message });
        return;
      }
      next(error);
    }
  }

  // POST /api/scheduler/jobs/:id/resume
  async resumeJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id;
      console.log(`[SchedulerController] POST /api/scheduler/jobs/${id}/resume`);
      const resumedJob = await schedulerEngineService.resumeJob(id);
      res.status(200).json({
        success: true,
        message: 'Scheduled job resumed',
        data: resumedJob
      });
    } catch (error) {
      if ((error as any).statusCode) {
        res.status((error as any).statusCode).json({ success: false, error: (error as Error).message });
        return;
      }
      next(error);
    }
  }

  // DELETE /api/scheduler/jobs/:id
  async deleteJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id;
      console.log(`[SchedulerController] DELETE /api/scheduler/jobs/${id}`);
      const removed = await schedulerEngineService.deleteJob(id);
      res.status(200).json({
        success: true,
        message: 'Scheduled job deleted',
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

  // POST /api/scheduler/jobs/:id/run
  async triggerJobNow(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id;
      console.log(`[SchedulerController] POST /api/scheduler/jobs/${id}/run`);
      const record = await schedulerEngineService.triggerJobNow(id);
      res.status(200).json({
        success: true,
        message: 'Scheduled job executed on demand',
        data: record
      });
    } catch (error) {
      if ((error as any).statusCode) {
        res.status((error as any).statusCode).json({ success: false, error: (error as Error).message });
        return;
      }
      next(error);
    }
  }

  // GET /api/scheduler/history
  async getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      console.log(`[SchedulerController] GET /api/scheduler/history (limit=${limit})`);
      const history = await schedulerEngineService.getExecutionHistory(limit);
      res.status(200).json({ success: true, data: history });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/scheduler/health
  async getHealth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('[SchedulerController] GET /api/scheduler/health');
      const health = await schedulerEngineService.getHealthAndStatus();
      res.status(200).json({ success: true, data: health });
    } catch (error) {
      next(error);
    }
  }
}

export const schedulerController = new SchedulerController();
