import express from 'express';
import { checkHealth } from '../app/controllers/healthController.js';

const router = express.Router();

router.get('/health', checkHealth);

export default router;
