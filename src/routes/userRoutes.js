import express from 'express';
import { userController } from '../app/controllers/userController.js';
const router = express.Router();

router.post('/register', userController.registerUser);

router.post('/login', userController.loginUser);

router.get('/:userId', userController.getUser);

export default router;
