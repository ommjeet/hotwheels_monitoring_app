import { Router } from 'express';
import { schedulerController } from '../controllers/scheduler.controller';

const router = Router();

// Scheduler Configuration
router.get('/config', (req, res, next) => schedulerController.getConfig(req, res, next));
router.put('/config', (req, res, next) => schedulerController.updateConfig(req, res, next));

// Scheduled Jobs CRUD & Controls
router.get('/jobs', (req, res, next) => schedulerController.getAllJobs(req, res, next));
router.post('/jobs', (req, res, next) => schedulerController.createJob(req, res, next));
router.get('/jobs/:id', (req, res, next) => schedulerController.getJobById(req, res, next));
router.put('/jobs/:id', (req, res, next) => schedulerController.updateJob(req, res, next));
router.post('/jobs/:id/pause', (req, res, next) => schedulerController.pauseJob(req, res, next));
router.post('/jobs/:id/resume', (req, res, next) => schedulerController.resumeJob(req, res, next));
router.delete('/jobs/:id', (req, res, next) => schedulerController.deleteJob(req, res, next));
router.post('/jobs/:id/run', (req, res, next) => schedulerController.triggerJobNow(req, res, next));

// History & Health
router.get('/history', (req, res, next) => schedulerController.getHistory(req, res, next));
router.get('/health', (req, res, next) => schedulerController.getHealth(req, res, next));
router.get('/status', (req, res, next) => schedulerController.getHealth(req, res, next));

export default router;
