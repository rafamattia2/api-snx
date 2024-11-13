import { Router } from 'express';
import { CommentController } from '../app/controllers/commentController.js';
import { authMiddleware } from '../app/middlewares/authMiddleware.js';

const router = Router();
const commentController = new CommentController();

router.post(
  '/posts/:postId/comments',
  authMiddleware,
  commentController.create
);
router.get('/posts/:postId/comments', authMiddleware, commentController.list);
router.put('/comments/:id', authMiddleware, commentController.update);
router.delete('/comments/:id', authMiddleware, commentController.delete);

export default router;
