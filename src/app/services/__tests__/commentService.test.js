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
      const mockComments = [mockComment];
      const mockCount = 1;

      getModels.mockReturnValue({
        Comment: {
          findAndCountAll: vi.fn().mockResolvedValue({
            count: mockCount,
            rows: mockComments,
          }),
        },
        User: {
          findById: vi.fn().mockResolvedValue(mockUser),
        },
      });

      pagination.createPaginatedResponse.mockReturnValue({
        data: mockComments,
        pagination: {
          total: mockCount,
          currentPage: page,
          totalPages: 1,
        },
      });

      const result = await commentService.listComments(1, page, limit);

      expect(result.data).toBeDefined();
      expect(result.pagination).toBeDefined();
    });

    it('should handle errors when fetching comments', async () => {
      getModels.mockReturnValue({
        Comment: {
          findAndCountAll: vi
            .fn()
            .mockRejectedValue(new Error('Database error')),
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
});
