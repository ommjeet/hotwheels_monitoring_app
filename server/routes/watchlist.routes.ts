import { Router } from 'express';
import { watchlistController } from '../controllers/watchlist.controller';

const router = Router();

// GET /api/watchlist - Retrieve all watchlist items with optional search/filter/sort
router.get('/', (req, res, next) => watchlistController.getAllItems(req, res, next));

// GET /api/watchlist/:id - Retrieve single watchlist item
router.get('/:id', (req, res, next) => watchlistController.getItemById(req, res, next));

// POST /api/watchlist - Add new watchlist item
router.post('/', (req, res, next) => watchlistController.addItem(req, res, next));

// PUT /api/watchlist/:id - Update existing watchlist item
router.put('/:id', (req, res, next) => watchlistController.updateItem(req, res, next));

// DELETE /api/watchlist/:id - Remove watchlist item
router.delete('/:id', (req, res, next) => watchlistController.removeItem(req, res, next));

// POST /api/watchlist/duplicate/:id - Duplicate watchlist item
router.post('/duplicate/:id', (req, res, next) => watchlistController.duplicateItem(req, res, next));

// DELETE /api/watchlist/bulk - Bulk delete watchlist items
router.delete('/bulk/items', (req, res, next) => watchlistController.bulkDelete(req, res, next));

// PUT /api/watchlist/bulk/status - Bulk update status
router.put('/bulk/status', (req, res, next) => watchlistController.bulkUpdateStatus(req, res, next));

export default router;
