import express from 'express';
import { Router } from 'express';
import { HealthController } from '../app/controllers/healthController.js';

const router = Router();
const healthController = new HealthController();

router.get('/health', healthController.checkHealth);

export default router;
