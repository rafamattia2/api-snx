import express from 'express';
import healthRoutes from './health.js';
import userRoutes from './userRoutes.js';
import postRoutes from './postRoutes.js';
import commentRoutes from './commentRoutes.js';

const routes = express.Router();

routes.use('/', healthRoutes);
routes.use('/', userRoutes);
routes.use('/', postRoutes);
routes.use('/', commentRoutes);

export default routes;
