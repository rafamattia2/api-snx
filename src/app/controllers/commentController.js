import commentService from '../services/commentService.js';
import pagination from '../utils/pagination.js';
import { ValidationError, UnauthorizedError } from '../errors/appError.js';

const commentController = {
  async create(req, res, next) {
    try {
      const postId = parseInt(req.params.postId);
      const { content } = req.body;
      const userId = req.userId;

      if (!content) {
        throw new ValidationError('Content is required');
      }

      if (!postId || isNaN(postId)) {
        throw new ValidationError('Invalid PostId');
      }

      if (!userId) {
        throw new UnauthorizedError('User not authenticated');
      }

      const comment = await commentService.createComment({
        content,
        postId,
        userId,
      });

      return res.status(201).json(comment);
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.userId;

      await commentService.deleteComment(id, userId);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async list(req, res, next) {
    try {
      const { postId } = req.params;
      const { page, limit } = pagination.getPagination(req);

      if (!postId || isNaN(postId)) {
        throw new ValidationError('Invalid PostId');
      }

      const result = await commentService.listComments(postId, page, limit);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};

export default commentController;
