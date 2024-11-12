import { Router } from 'express';
import { PostController } from '../app/controllers/postController.js';
import { authMiddleware } from '../app/middlewares/authMiddleware.js';

const router = Router();
const postController = new PostController();

router.post('/posts', authMiddleware, postController.create);
router.get('/posts', authMiddleware, postController.list);
router.put('/posts/:id', authMiddleware, postController.update);
router.delete('/posts/:id', authMiddleware, postController.delete);

export default router;
