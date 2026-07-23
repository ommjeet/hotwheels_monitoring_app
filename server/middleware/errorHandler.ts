import { Request, Response, NextFunction } from 'express';
import { activityService } from '../services/activity.service';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('[Global Error Handler]', err);
  const statusCode = err.statusCode || err.status || 500;
  
  // Asynchronously log to Activity Stream
  activityService.logError(
    `API Error [${req.method} ${req.path}]: ${err.message || 'Internal Server Error'}`,
    `Status Code: ${statusCode} | IP: ${req.ip || '127.0.0.1'} | Stack: ${(err.stack || '').substring(0, 150)}`,
    'api'
  ).catch(e => console.error('Failed to log error event:', e));

  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
}
