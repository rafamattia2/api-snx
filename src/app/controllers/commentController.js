import commentService from '../services/commentService.js';
import { getModels } from '../models/index.js';

const commentController = {
  async create(req, res) {
    try {
      const postId = parseInt(req.params.postId);
      const { content } = req.body;
      const userId = req.userId;

      if (!content) {
        return res.status(400).json({ error: 'Content é obrigatório' });
      }

      if (!postId || isNaN(postId)) {
        return res.status(400).json({ error: 'PostId inválido' });
      }

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const comment = await commentService.createComment({
        content,
        postId,
        userId,
      });

      return res.status(201).json(comment);
    } catch (error) {
      console.error('Erro completo no controller:', error);

      if (error.message.includes('Post não encontrado')) {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes('Usuário não encontrado')) {
        return res.status(404).json({ error: error.message });
      }

      return res.status(500).json({
        error: 'Erro ao criar comentário',
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
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      if (!postId || isNaN(postId)) {
        return res.status(400).json({ error: 'PostId inválido' });
      }

      const result = await commentService.listComments(postId, page, limit);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        error: 'Erro ao listar comentários',
        details: error.message,
      });
    }
  },
};

export default commentController;
