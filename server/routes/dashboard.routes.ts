import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';

const router = Router();

// GET /api/dashboard/summary - Comprehensive dashboard overview data
router.get('/summary', (req, res, next) => dashboardController.getSummary(req, res, next));

// POST /api/dashboard/engine/toggle - Start / pause scanning engine
router.post('/engine/toggle', (req, res, next) => dashboardController.toggleScan(req, res, next));

// POST /api/dashboard/engine/manual-scan - Execute instant manual query cycle
router.post('/engine/manual-scan', (req, res, next) => dashboardController.manualScan(req, res, next));

// POST /api/dashboard/engine/panic-stop - Master safety panic stop override
router.post('/engine/panic-stop', (req, res, next) => dashboardController.panicStop(req, res, next));

// POST /api/dashboard/engine/simulate-outage - Simulate store offline outage
router.post('/engine/simulate-outage', (req, res, next) => dashboardController.simulateOutage(req, res, next));

// POST /api/dashboard/engine/restore-online - Restore store status to online
router.post('/engine/restore-online', (req, res, next) => dashboardController.restoreOnline(req, res, next));

// POST /api/dashboard/engine/toggle-fast-sim - Toggle fast simulation evaluation mode
router.post('/engine/toggle-fast-sim', (req, res, next) => dashboardController.toggleFastSim(req, res, next));

// POST /api/dashboard/activities - Record new activity event log
router.post('/activities', (req, res, next) => dashboardController.postActivity(req, res, next));

export default router;
