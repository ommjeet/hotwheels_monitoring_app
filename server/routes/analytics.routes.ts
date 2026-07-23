import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';

const router = Router();

// Specialized endpoints
router.get('/dashboard', (req, res, next) => analyticsController.getDashboardAnalytics(req, res, next));
router.get('/kpis', (req, res, next) => analyticsController.getKpis(req, res, next));
router.get('/export', (req, res, next) => analyticsController.exportAnalytics(req, res, next));
router.post('/record', (req, res, next) => analyticsController.recordEvent(req, res, next));

// Main route
router.get('/', (req, res, next) => analyticsController.getDashboardAnalytics(req, res, next));

export default router;
