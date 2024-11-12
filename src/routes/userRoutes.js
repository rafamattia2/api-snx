import express from 'express';
import { userController } from '../app/controllers/userController.js';
import { authMiddleware } from '../app/middlewares/authMiddleware.js';

const router = express.Router();

router.post('/users/', userController.registerUser);
router.post('/users/login', userController.loginUser);
router.get('/users/:userId', authMiddleware, userController.getUser);

export default router;
