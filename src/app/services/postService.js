import { NotFoundError, UnauthorizedError } from '../errors/appError.js';
import { getModels } from '../models/index.js';
import pagination from '../utils/pagination.js';

export class PostService {
  constructor() {}

  async createPost(data) {
    const { Post } = getModels();
    const post = await Post.create(data);
    return post;
  }

  async listPosts(page = 1, limit = 10) {
    const { Post, Comment, User } = getModels();
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
        const user = await User.findById(post.userId);

        const commentsWithUsers = await Promise.all(
          post.Comments.map(async (comment) => {
            const commentUser = await User.findById(comment.userId);
            return {
              ...comment.toJSON(),
              user: commentUser
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
          user: user
            ? {
                id: user._id,
                name: user.name,
                username: user.username,
              }
            : null,
          comments: commentsWithUsers,
        };
      })
    );

    return pagination.createPaginatedResponse(
      postsWithUsers,
      count,
      page,
      limit
    );
  }

  async updatePost(id, data, userId) {
    const { User, Post } = getModels();
    const post = await Post.findOne({ where: { id } });

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    if (post.userId.toString() !== userId.toString()) {
      throw new UnauthorizedError('Not authorized to update this post');
    }

    const user = await User.findById(post.userId);
    if (!user) {
      throw new NotFoundError('Post author not found');
    }

    const updatedPost = await post.update(data);

    return {
      ...updatedPost.toJSON(),
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
      },
    };
  }

  async deletePost(id, userId) {
    const { Post } = getModels();
    const post = await Post.findOne({ where: { id } });

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    if (post.userId.toString() !== userId.toString()) {
      throw new UnauthorizedError('Not authorized to delete this post');
    }

    await post.destroy();
  }
}
