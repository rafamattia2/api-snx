import express from 'express';
import healthRoute from './healthRoute.js';
import userRoutes from './userRoutes.js';
import postRoutes from './postRoutes.js';
import commentRoutes from './commentRoutes.js';

const routes = express.Router();

routes.use(healthRoute);
routes.use(userRoutes);
routes.use(postRoutes);
routes.use(commentRoutes);

export default routes;
