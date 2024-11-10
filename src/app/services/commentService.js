import { getModels } from '../models/index.js';

const commentService = {
  async createComment(data) {
    const { Comment } = getModels();
    const comment = await Comment.create(data);
    return comment;
  },

  async deleteComment(id, userId) {
    const { Comment } = getModels();
    const comment = await Comment.findOne({ where: { id } });

    if (!comment) {
      throw new Error('Comentário não encontrado');
    }

    if (comment.userId !== userId) {
      throw new Error('Não autorizado a deletar este comentário');
    }

    await comment.destroy();
  },
};

export default commentService;
