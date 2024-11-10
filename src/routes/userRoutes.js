import express from 'express';
import { userController } from '../app/controllers/userController.js';
import { authMiddleware } from '../app/middlewares/authMiddleware.js';
const router = express.Router();

router.post('/register', userController.registerUser);

router.post('/login', userController.loginUser);

router.get('/:userId', authMiddleware, userController.getUser);

export default router;
