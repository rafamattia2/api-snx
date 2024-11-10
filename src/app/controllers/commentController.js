import commentService from '../services/commentService.js';

const commentController = {
  async create(req, res) {
    try {
      const { postId } = req.params;
      const { content } = req.body;
      const userId = req.user.id;

      const comment = await commentService.createComment({
        content,
        postId,
        userId,
      });
      return res.status(201).json(comment);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      await commentService.deleteComment(id, userId);
      return res.status(204).send();
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },
};

export default commentController;
