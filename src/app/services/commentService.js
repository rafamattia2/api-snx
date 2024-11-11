import { getModels } from '../models/index.js';

const commentService = {
  async createComment(data) {
    try {
      const { Comment, Post, User } = getModels();

      const post = await Post.findByPk(data.postId);
      if (!post) {
        throw new Error('Post não encontrado');
      }

      const user = await User.findById(data.userId);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      const comment = await Comment.create({
        content: data.content,
        postId: data.postId,
        userId: data.userId.toString(),
      });

      const createdComment = await Comment.findByPk(comment.id);
      if (!createdComment) {
        throw new Error('Erro ao recuperar o comentário criado');
      }

      const response = {
        id: createdComment.id,
        content: createdComment.content,
        postId: createdComment.postId,
        userId: createdComment.userId,
        createdAt: createdComment.createdAt,
        updatedAt: createdComment.updatedAt,
        User: {
          id: user._id,
          name: user.name,
          username: user.username,
        },
      };

      return response;
    } catch (error) {
      console.error('Erro detalhado ao criar comentário:', error);
      throw new Error(`Erro ao criar comentário: ${error.message}`);
    }
  },

  async deleteComment(id, userId) {
    const { Comment } = getModels();
    const comment = await Comment.findOne({ where: { id } });

    if (!comment) {
      throw new Error('Comentário não encontrado');
    }

    if (comment.userId.toString() !== userId.toString()) {
      throw new Error('Não autorizado a deletar este comentário');
    }

    await comment.destroy();
  },
};

export default commentService;
