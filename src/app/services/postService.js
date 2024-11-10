import { getModels } from '../models/index.js';

const postService = {
  async createPost(data) {
    const { Post } = getModels();
    const post = await Post.create(data);
    return post;
  },

  async listPosts() {
    const { Post, User, Comment } = getModels();
    const posts = await Post.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'username'],
        },
        {
          model: Comment,
          include: [
            {
              model: User,
              attributes: ['id', 'name', 'username'],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    return posts;
  },

  async updatePost(id, data, userId) {
    const { Post } = getModels();
    const post = await Post.findOne({ where: { id } });

    if (!post) {
      throw new Error('Post não encontrado');
    }

    if (post.userId !== userId) {
      throw new Error('Não autorizado a atualizar este post');
    }

    await post.update(data);
    return post;
  },

  async deletePost(id, userId) {
    const { Post } = getModels();
    const post = await Post.findOne({ where: { id } });

    if (!post) {
      throw new Error('Post não encontrado');
    }

    if (post.userId !== userId) {
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
