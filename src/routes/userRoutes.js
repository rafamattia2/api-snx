import express from 'express';
import { UserController } from '../app/controllers/userController.js';
import { authMiddleware } from '../app/middlewares/authMiddleware.js';

const router = express.Router();
const userController = new UserController();

router.post('/users', userController.registerUser);
router.post('/users/login', userController.loginUser);
router.get('/users/:userId', authMiddleware, userController.getUser);
router.get('/users', authMiddleware, userController.listUsers);
router.put('/users/:userId', authMiddleware, userController.updateUser);
router.delete('/users/:userId', authMiddleware, userController.deleteUser);

export default router;
