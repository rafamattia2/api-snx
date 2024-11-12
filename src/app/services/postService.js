import { getModels } from '../models/index.js';

const postService = {
  async createPost(data) {
    const { Post } = getModels();
    const post = await Post.create(data);
    return post;
  },

  async listPosts(page = 1, limit = 10) {
    const { Post, Comment } = getModels();
    const offset = (page - 1) * limit;

    const { count, rows: posts } = await Post.findAndCountAll({
      include: [
        {
          model: Comment,
          include: [],
        },
      ],
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });

    const postsWithUsers = await Promise.all(
      posts.map(async (post) => {
        const { User } = getModels();
        const user = await User.findById(post.userId);

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

    return {
      posts: postsWithUsers,
      pagination: {
        total: count,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        hasMore: page * limit < count,
      },
    };
  },

  async updatePost(id, data, userId) {
    const { Post } = getModels();
    const post = await Post.findOne({ where: { id } });

    if (!post) {
      throw new Error('Post not found');
    }

    if (post.userId.toString() !== userId.toString()) {
      throw new Error('Not authorized to delete this post');
    }

    const updatedPost = await post.update(data);

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
      throw new Error('Post not found');
    }

    if (post.userId.toString() !== userId.toString()) {
      throw new Error('Not authorized to delete this post');
    }

    await post.destroy();
  },
};

export default postService;
