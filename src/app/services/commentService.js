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

  async listComments(postId, page = 1, limit = 10) {
    const { Comment } = getModels();
    const offset = (page - 1) * limit;

    const { count, rows: comments } = await Comment.findAndCountAll({
      where: { postId },
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });

    // Buscar informações dos usuários
    const commentsWithUsers = await Promise.all(
      comments.map(async (comment) => {
        const { User } = getModels();
        const user = await User.findById(comment.userId);

        return {
          ...comment.toJSON(),
          User: user
            ? {
                id: user._id,
                name: user.name,
                username: user.username,
              }
            : null,
        };
      })
    );

    return {
      comments: commentsWithUsers,
      pagination: {
        total: count,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        hasMore: page * limit < count,
      },
    };
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
