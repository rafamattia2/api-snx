import { Router } from 'express';
import commentController from '../app/controllers/commentController.js';
import { authMiddleware } from '../app/middlewares/authMiddleware.js';

const router = Router();

router.post(
  '/posts/:postId/comments',
  authMiddleware,
  commentController.create
);
router.delete('/comments/:id', authMiddleware, commentController.delete);

export default router;
