import { Router } from 'express';
import postController from '../app/controllers/postController.js';
import { authMiddleware } from '../app/middlewares/authMiddleware.js';

const router = Router();

router.post('/posts', authMiddleware, postController.create);
router.get('/posts', authMiddleware, postController.list);
router.put('/posts/:id', authMiddleware, postController.update);
router.delete('/posts/:id', authMiddleware, postController.delete);

export default router;
