import { Router } from 'express';
import { screenshotController } from '../controllers/screenshot.controller';

const router = Router();

// Capture Status Endpoints
router.get('/status', (req, res, next) => screenshotController.getCaptureStatus(req, res, next));
router.put('/status', (req, res, next) => screenshotController.updateCaptureStatus(req, res, next));
router.post('/status', (req, res, next) => screenshotController.updateCaptureStatus(req, res, next));
router.post('/enable', (req, res, next) => screenshotController.enableCapture(req, res, next));
router.post('/disable', (req, res, next) => screenshotController.disableCapture(req, res, next));
router.post('/clear', (req, res, next) => screenshotController.clearGallery(req, res, next));

// Screenshot List & Operations
router.get('/', (req, res, next) => screenshotController.getScreenshots(req, res, next));
router.delete('/', (req, res, next) => screenshotController.clearGallery(req, res, next));
router.get('/:id', (req, res, next) => screenshotController.getScreenshotById(req, res, next));
router.delete('/:id', (req, res, next) => screenshotController.deleteScreenshot(req, res, next));

export default router;
