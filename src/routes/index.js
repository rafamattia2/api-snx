import express from 'express';
import healthRoutes from './health.js';
import userRoutes from './userRoutes.js';

const routes = express.Router();

routes.use('/health', healthRoutes);
routes.use('/user', userRoutes);

export default routes;
