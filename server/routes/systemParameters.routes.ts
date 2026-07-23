import { Router } from 'express';
import { systemParametersController } from '../controllers/systemParameters.controller';

const router = Router();

// GET /api/system-parameters - Fetch current system parameters
router.get('/', (req, res, next) => systemParametersController.getParameters(req, res, next));

// PUT /api/system-parameters - Update system parameters
router.put('/', (req, res, next) => systemParametersController.updateParameters(req, res, next));

// POST /api/system-parameters/reset - Reset system parameters to defaults
router.post('/reset', (req, res, next) => systemParametersController.resetParameters(req, res, next));

export default router;
