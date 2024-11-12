import postService from '../services/postService.js';
import pagination from '../utils/pagination.js';

const postController = {
  async create(req, res, next) {
    try {
      const { title, content } = req.body;
      const userId = req.userId;

      const post = await postService.createPost({ title, content, userId });
      return res.status(201).json(post);
    } catch (error) {
      next(error);
    }
  },

  async list(req, res, next) {
    try {
      const { page, limit } = pagination.getPagination(req);
      const result = await postService.listPosts(page, limit);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { title, content } = req.body;
      const userId = req.userId;

      const post = await postService.updatePost(id, { title, content }, userId);
      return res.status(200).json(post);
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.userId;

      await postService.deletePost(id, userId);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};

export default postController;
