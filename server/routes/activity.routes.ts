import { Router } from 'express';
import { activityController } from '../controllers/activity.controller';

const router = Router();

// Stats and Export endpoints (must come before /:id)
router.get('/stats', (req, res, next) => activityController.getStats(req, res, next));
router.get('/export', (req, res, next) => activityController.exportActivities(req, res, next));

// Collection endpoints
router.get('/', (req, res, next) => activityController.getActivities(req, res, next));
router.post('/', (req, res, next) => activityController.createActivity(req, res, next));
router.delete('/', (req, res, next) => activityController.clearActivities(req, res, next));

// Item endpoints
router.get('/:id', (req, res, next) => activityController.getActivityById(req, res, next));
router.delete('/:id', (req, res, next) => activityController.deleteActivityById(req, res, next));

export default router;
