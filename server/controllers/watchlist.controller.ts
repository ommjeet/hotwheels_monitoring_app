import { Request, Response, NextFunction } from 'express';
import { watchlistService } from '../services/watchlist.service';
import { 
  watchlistItemSchema, 
  updateWatchlistItemSchema, 
  bulkDeleteSchema, 
  bulkStatusSchema 
} from '../models/watchlist.model';
import { ZodError } from 'zod';

export class WatchlistController {
  async getAllItems(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('[WatchlistController] GET /api/watchlist', req.query);
      const search = req.query.search as string | undefined;
      const priority = req.query.priority as 'all' | 'high' | 'medium' | 'low' | undefined;
      const status = req.query.status as 'all' | 'active' | 'inactive' | undefined;
      const sortBy = req.query.sortBy as 'name' | 'priority' | 'price' | 'detections' | undefined;
      const sortOrder = req.query.sortOrder as 'asc' | 'desc' | undefined;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;

      const result = await watchlistService.getAllItems({
        search,
        priority,
        status,
        sortBy,
        sortOrder,
        page,
        limit
      });

      res.status(200).json({
        success: true,
        data: result.items,
        meta: {
          totalCount: result.totalCount,
          page,
          limit
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getItemById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id;
      console.log(`[WatchlistController] GET /api/watchlist/${id}`);
      const item = await watchlistService.getItemById(id);
      if (!item) {
        res.status(404).json({ success: false, error: `Watchlist item with ID ${id} not found` });
        return;
      }
      res.status(200).json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  }

  async addItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('[WatchlistController] POST /api/watchlist', req.body);
      const validated = watchlistItemSchema.parse(req.body);
      const newItem = await watchlistService.addItem(validated);
      res.status(201).json({
        success: true,
        message: 'Watchlist rule created successfully',
        data: newItem
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
        res.status((error as any).statusCode).json({
          success: false,
          error: (error as Error).message
        });
        return;
      }
      next(error);
    }
  }

  async updateItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id;
      console.log(`[WatchlistController] PUT /api/watchlist/${id}`, req.body);
      const validated = updateWatchlistItemSchema.parse(req.body);
      const updatedItem = await watchlistService.updateItem(id, validated);
      res.status(200).json({
        success: true,
        message: 'Watchlist rule updated successfully',
        data: updatedItem
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
        res.status((error as any).statusCode).json({
          success: false,
          error: (error as Error).message
        });
        return;
      }
      next(error);
    }
  }

  async removeItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id;
      console.log(`[WatchlistController] DELETE /api/watchlist/${id}`);
      const removed = await watchlistService.removeItem(id);
      res.status(200).json({
        success: true,
        message: 'Watchlist rule deleted successfully',
        data: removed
      });
    } catch (error) {
      if ((error as any).statusCode) {
        res.status((error as any).statusCode).json({
          success: false,
          error: (error as Error).message
        });
        return;
      }
      next(error);
    }
  }

  async duplicateItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id;
      console.log(`[WatchlistController] POST /api/watchlist/duplicate/${id}`);
      const duplicated = await watchlistService.duplicateItem(id);
      res.status(201).json({
        success: true,
        message: 'Watchlist rule duplicated successfully',
        data: duplicated
      });
    } catch (error) {
      if ((error as any).statusCode) {
        res.status((error as any).statusCode).json({
          success: false,
          error: (error as Error).message
        });
        return;
      }
      next(error);
    }
  }

  async bulkDelete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('[WatchlistController] DELETE /api/watchlist/bulk', req.body);
      const validated = bulkDeleteSchema.parse(req.body);
      const result = await watchlistService.bulkDelete(validated.ids);
      res.status(200).json({
        success: true,
        message: `Successfully deleted ${result.deletedCount} items`,
        data: result
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ success: false, error: 'Validation Error', details: error.issues });
        return;
      }
      next(error);
    }
  }

  async bulkUpdateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('[WatchlistController] PUT /api/watchlist/bulk/status', req.body);
      const validated = bulkStatusSchema.parse(req.body);
      const result = await watchlistService.bulkUpdateStatus(validated.ids, validated.active);
      res.status(200).json({
        success: true,
        message: `Successfully updated ${result.updatedCount} items to active=${validated.active}`,
        data: result
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

export const watchlistController = new WatchlistController();
