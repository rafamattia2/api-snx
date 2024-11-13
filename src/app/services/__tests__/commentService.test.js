import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AppError,
  NotFoundError,
  UnauthorizedError,
} from '../../errors/appError.js';
import { getModels } from '../../models/index.js';
import pagination from '../../utils/pagination.js';
import { CommentService } from '../commentService.js';

vi.mock('../../models/index.js');
vi.mock('../../utils/pagination.js');

describe('CommentService', () => {
  let commentService;
  let mockComment, mockPost, mockUser;

  beforeEach(() => {
    vi.clearAllMocks();

    commentService = new CommentService();

    mockUser = {
      _id: 'userId123',
      name: 'Test User',
      username: 'testuser',
    };

    mockPost = {
      id: 1,
      title: 'Test Post',
      content: 'Test Content',
    };

    mockComment = {
      id: 1,
      content: 'Test Comment',
      postId: 1,
      userId: 'userId123',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  describe('createComment', () => {
    it('should create a comment successfully', async () => {
      const commentData = {
        content: 'Test Comment',
        postId: 1,
        userId: 'userId123',
      };

      getModels.mockReturnValue({
        Comment: {
          create: vi.fn().mockResolvedValue(mockComment),
          findByPk: vi.fn().mockResolvedValue(mockComment),
        },
        Post: {
          findByPk: vi.fn().mockResolvedValue(mockPost),
        },
        User: {
          findById: vi.fn().mockResolvedValue(mockUser),
        },
      });

      const result = await commentService.createComment(commentData);

      expect(result).toEqual({
        id: mockComment.id,
        content: mockComment.content,
        postId: mockComment.postId,
        userId: mockComment.userId,
        createdAt: mockComment.createdAt,
        updatedAt: mockComment.updatedAt,
        User: {
          id: mockUser._id,
          name: mockUser.name,
          username: mockUser.username,
        },
      });
    });

    it('should throw NotFoundError when post is not found', async () => {
      const commentData = {
        content: 'Test Comment',
        postId: 999,
        userId: 'userId123',
      };

      getModels.mockReturnValue({
        Post: {
          findByPk: vi.fn().mockResolvedValue(null),
        },
      });

      await expect(commentService.createComment(commentData)).rejects.toThrow(
        NotFoundError
      );
    });

    it('should throw NotFoundError when user is not found', async () => {
      const commentData = {
        content: 'Test Comment',
        postId: 1,
        userId: 'nonexistentUser',
      };

      getModels.mockReturnValue({
        Post: {
          findByPk: vi.fn().mockResolvedValue(mockPost),
        },
        User: {
          findById: vi.fn().mockResolvedValue(null),
        },
      });

      await expect(commentService.createComment(commentData)).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe('listComments', () => {
    it('should list comments with pagination', async () => {
      const page = 1;
      const limit = 10;
      const mockCount = 1;
      const mockComments = [
        {
          id: 1,
          content: 'Test Comment',
          postId: 1,
          userId: 'userId123',
          createdAt: new Date(),
          updatedAt: new Date(),
          toJSON: () => ({
            id: 1,
            content: 'Test Comment',
            postId: 1,
            userId: 'userId123',
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        },
      ];

      getModels.mockReturnValue({
        Comment: {
          findAndCountAll: vi.fn().mockResolvedValue({
            count: mockCount,
            rows: mockComments,
          }),
        },
        Post: {
          findByPk: vi.fn().mockResolvedValue({
            id: 1,
            title: 'Test Post',
            content: 'Test Content',
          }),
        },
        User: {
          findById: vi.fn().mockResolvedValue(mockUser),
        },
      });

      pagination.createPaginatedResponse.mockReturnValue({
        comments: mockComments.map((comment) => ({
          id: comment.id,
          content: comment.content,
          postId: comment.postId,
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt,
          user: {
            id: mockUser._id,
            name: mockUser.name,
            username: mockUser.username,
          },
        })),
        total: mockCount,
        currentPage: page,
        totalPages: Math.ceil(mockCount / limit),
      });

      const result = await commentService.listComments(1, page, limit);

      expect(result.comments).toBeDefined();
      expect(result.total).toBe(mockCount);
      expect(result.currentPage).toBe(page);
      expect(result.totalPages).toBe(Math.ceil(mockCount / limit));

      expect(getModels().Post.findByPk).toHaveBeenCalledWith(1);
      expect(getModels().Comment.findAndCountAll).toHaveBeenCalled();
      expect(getModels().User.findById).toHaveBeenCalled();
      expect(pagination.createPaginatedResponse).toHaveBeenCalled();
    });

    it('should handle errors when fetching comments', async () => {
      const error = new Error('Database error');

      getModels.mockReturnValue({
        Comment: {
          findAndCountAll: vi.fn().mockRejectedValue(error),
        },
        Post: {
          findByPk: vi.fn().mockResolvedValue({
            id: 1,
            title: 'Test Post',
            content: 'Test Content',
          }),
        },
      });

      await expect(commentService.listComments(1, 1, 10)).rejects.toThrow(
        AppError
      );
    });
  });

  describe('deleteComment', () => {
    it('should delete comment successfully', async () => {
      const mockCommentToDelete = {
        id: 1,
        userId: 'userId123',
        destroy: vi.fn().mockResolvedValue(undefined),
      };

      getModels.mockReturnValue({
        Comment: {
          findOne: vi.fn().mockResolvedValue(mockCommentToDelete),
        },
      });

      await commentService.deleteComment(1, 'userId123');

      expect(mockCommentToDelete.destroy).toHaveBeenCalled();
    });

    it('should throw NotFoundError when comment does not exist', async () => {
      getModels.mockReturnValue({
        Comment: {
          findOne: vi.fn().mockResolvedValue(null),
        },
      });

      await expect(
        commentService.deleteComment(999, 'userId123')
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw UnauthorizedError when user is not the comment owner', async () => {
      const mockCommentToDelete = {
        id: 1,
        userId: 'differentUserId',
      };

      getModels.mockReturnValue({
        Comment: {
          findOne: vi.fn().mockResolvedValue(mockCommentToDelete),
        },
      });

      await expect(
        commentService.deleteComment(1, 'userId123')
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('updateComment', () => {
    it('deve atualizar o comentário com sucesso', async () => {
      const mockUpdatedComment = {
        id: 1,
        content: 'Comentário Atualizado',
        postId: 1,
        userId: 'userId123',
        createdAt: new Date(),
        updatedAt: new Date(),
        update: vi.fn(),
      };

      getModels.mockReturnValue({
        Comment: {
          findByPk: vi.fn().mockResolvedValue(mockUpdatedComment),
        },
        User: {
          findById: vi.fn().mockResolvedValue(mockUser),
        },
      });

      const result = await commentService.updateComment(
        1,
        'Comentário Atualizado',
        'userId123'
      );

      expect(result).toEqual({
        id: mockUpdatedComment.id,
        content: mockUpdatedComment.content,
        postId: mockUpdatedComment.postId,
        createdAt: mockUpdatedComment.createdAt,
        updatedAt: mockUpdatedComment.updatedAt,
        user: {
          id: mockUser._id,
          name: mockUser.name,
          username: mockUser.username,
        },
      });
    });

    it('deve lançar NotFoundError quando o comentário não existe', async () => {
      getModels.mockReturnValue({
        Comment: {
          findByPk: vi.fn().mockResolvedValue(null),
        },
      });

      await expect(
        commentService.updateComment(999, 'Comentário Atualizado', 'userId123')
      ).rejects.toThrow(NotFoundError);
    });

    it('deve lançar UnauthorizedError quando o usuário não é o dono do comentário', async () => {
      const mockComment = {
        id: 1,
        userId: 'differentUserId',
      };

      getModels.mockReturnValue({
        Comment: {
          findByPk: vi.fn().mockResolvedValue(mockComment),
        },
      });

      await expect(
        commentService.updateComment(1, 'Comentário Atualizado', 'userId123')
      ).rejects.toThrow(UnauthorizedError);
    });
  });
});
