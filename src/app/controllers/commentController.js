import commentService from '../services/commentService.js';
import pagination from '../utils/pagination.js';

const commentController = {
  async create(req, res) {
    try {
      const postId = parseInt(req.params.postId);
      const { content } = req.body;
      const userId = req.userId;

      if (!content) {
        return res.status(400).json({ error: 'Content is required' });
      }

      if (!postId || isNaN(postId)) {
        return res.status(400).json({ error: 'Invalid PostId' });
      }

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const comment = await commentService.createComment({
        content,
        postId,
        userId,
      });

      return res.status(201).json(comment);
    } catch (error) {
      if (error.message.includes('Post not found')) {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes('User not found')) {
        return res.status(404).json({ error: error.message });
      }

      return res.status(500).json({
        error: 'Error creating comment',
        details: error.message,
      });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.userId;

      await commentService.deleteComment(id, userId);
      return res.status(204).send();
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  async list(req, res) {
    try {
      const { postId } = req.params;
      const { page, limit } = pagination.getPagination(req);

      if (!postId || isNaN(postId)) {
        return res.status(400).json({ error: 'Invalid PostId' });
      }

      const result = await commentService.listComments(postId, page, limit);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        error: 'Error listing comments',
        details: error.message,
      });
    }
  },
};

export default commentController;
