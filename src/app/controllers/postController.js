import postService from '../services/postService.js';

const postController = {
  async create(req, res) {
    try {
      const { title, content } = req.body;
      const userId = req.userId; // Obtém o ID do usuário do middleware de autenticação

      const post = await postService.createPost({ title, content, userId });
      return res.status(201).json(post);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  async list(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await postService.listPosts(page, limit);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { title, content } = req.body;
      const userId = req.userId; // Alterado de req.user.id para req.userId

      const post = await postService.updatePost(id, { title, content }, userId);
      return res.status(200).json(post);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.userId; // Alterado de req.user.id para req.userId

      await postService.deletePost(id, userId);
      return res.status(204).send();
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },
};

export default postController;
