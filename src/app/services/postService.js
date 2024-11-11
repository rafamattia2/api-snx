import { getModels } from '../models/index.js';

const postService = {
  async createPost(data) {
    const { Post } = getModels();
    const post = await Post.create(data);
    return post;
  },

  async listPosts() {
    const { Post, Comment } = getModels();
    const posts = await Post.findAll({
      include: [
        {
          model: Comment,
          include: [], // Removemos o include do User aqui
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    // Buscamos os usuários do MongoDB separadamente
    const postsWithUsers = await Promise.all(
      posts.map(async (post) => {
        const { User } = getModels();
        const user = await User.findById(post.userId);

        // Transformamos os comentários também
        const commentsWithUsers = await Promise.all(
          post.Comments.map(async (comment) => {
            const commentUser = await User.findById(comment.userId);
            return {
              ...comment.toJSON(),
              User: commentUser
                ? {
                    id: commentUser._id,
                    name: commentUser.name,
                    username: commentUser.username,
                  }
                : null,
            };
          })
        );

        return {
          ...post.toJSON(),
          User: user
            ? {
                id: user._id,
                name: user.name,
                username: user.username,
              }
            : null,
          Comments: commentsWithUsers,
        };
      })
    );

    return postsWithUsers;
  },

  async updatePost(id, data, userId) {
    const { Post } = getModels();
    const post = await Post.findOne({ where: { id } });

    if (!post) {
      throw new Error('Post não encontrado');
    }

    // Convertemos ambos para string para comparação
    if (post.userId.toString() !== userId.toString()) {
      throw new Error('Não autorizado a atualizar este post');
    }

    const updatedPost = await post.update(data);

    // Buscamos o usuário para retornar junto com o post
    const { User } = getModels();
    const user = await User.findById(post.userId);

    return {
      ...updatedPost.toJSON(),
      User: user
        ? {
            id: user._id,
            name: user.name,
            username: user.username,
          }
        : null,
    };
  },

  async deletePost(id, userId) {
    const { Post } = getModels();
    const post = await Post.findOne({ where: { id } });

    if (!post) {
      throw new Error('Post não encontrado');
    }

    // Convertemos ambos para string para comparação
    if (post.userId.toString() !== userId.toString()) {
      throw new Error('Não autorizado a deletar este post');
    }

    await post.destroy();
  },

  async getPostComments(postId) {
    const { Comment, Post } = getModels();
    return await Comment.findAll({
      where: { postId },
      include: [
        {
          model: Post,
          attributes: ['id', 'title'],
        },
      ],
    });
  },
};

export default postService;
