import { getModels } from '../models/index.js';
import pagination from '../utils/pagination.js';
import {
  UnauthorizedError,
  NotFoundError,
  AppError,
} from '../errors/appError.js';

const commentService = {
  async createComment(data) {
    try {
      const { Comment, Post, User } = getModels();

      const post = await Post.findByPk(data.postId);
      if (!post) {
        throw new NotFoundError('Post not found');
      }

      const user = await User.findById(data.userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      const comment = await Comment.create({
        content: data.content,
        postId: data.postId,
        userId: data.userId.toString(),
      });

      const createdComment = await Comment.findByPk(comment.id);
      if (!createdComment) {
        throw new AppError('Error retrieving the created comment.');
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
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Error creating comment: ${error.message}`);
    }
  },

  async listComments(postId, page, limit) {
    try {
      const { Comment, User } = getModels();
      const offset = (page - 1) * limit;

      const { count, rows } = await Comment.findAndCountAll({
        where: { postId },
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      }).catch((error) => {
        throw new AppError('Error fetching comments', 500);
      });

      const commentsWithUser = await Promise.all(
        rows.map(async (comment) => {
          const user = await User.findById(comment.userId);
          return {
            id: comment.id,
            content: comment.content,
            postId: comment.postId,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
            user: user
              ? {
                  id: user._id,
                  name: user.name,
                  username: user.username,
                }
              : null,
          };
        })
      ).catch((error) => {
        throw new AppError('Error fetching user information', 500);
      });

      return pagination.createPaginatedResponse(
        commentsWithUser,
        count,
        page,
        limit
      );
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Error listing comments: ${error.message}`, 500);
    }
  },

  async deleteComment(id, userId) {
    const { Comment } = getModels();
    const comment = await Comment.findOne({ where: { id } });

    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    if (comment.userId.toString() !== userId.toString()) {
      throw new UnauthorizedError('Not authorized to delete this comment');
    }

    await comment.destroy();
  },
};

export default commentService;
