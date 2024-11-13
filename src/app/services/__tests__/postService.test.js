import { describe, it, expect, beforeEach, vi } from 'vitest';
import postService from '../postService.js';
import { getModels } from '../../models/index.js';
import { NotFoundError, UnauthorizedError } from '../../errors/appError.js';
import pagination from '../../utils/pagination.js';

vi.mock('../../models/index.js');
vi.mock('../../utils/pagination.js');

describe('PostService', () => {
  let mockPost, mockUser, mockComment;

  beforeEach(() => {
    vi.clearAllMocks();

    mockUser = {
      _id: 'userId123',
      name: 'Test User',
      username: 'testuser',
    };

    mockComment = {
      id: 1,
      content: 'Test Comment',
      userId: 'userId123',
      toJSON: () => ({
        id: 1,
        content: 'Test Comment',
        userId: 'userId123',
      }),
    };

    mockPost = {
      id: 1,
      title: 'Test Post',
      content: 'Test Content',
      userId: 'userId123',
      Comments: [mockComment],
      toJSON: () => ({
        id: 1,
        title: 'Test Post',
        content: 'Test Content',
        userId: 'userId123',
        Comments: [mockComment],
      }),
    };
  });

  describe('createPost', () => {
    it('should create a post successfully', async () => {
      const postData = {
        title: 'Test Post',
        content: 'Test Content',
        userId: 'userId123',
      };

      getModels.mockReturnValue({
        Post: {
          create: vi.fn().mockResolvedValue(mockPost),
        },
      });

      const result = await postService.createPost(postData);

      expect(result).toEqual(mockPost);
    });
  });

  describe('listPosts', () => {
    it('should list posts with pagination', async () => {
      const page = 1;
      const limit = 10;
      const mockPosts = [mockPost];
      const mockCount = 1;

      getModels.mockReturnValue({
        Post: {
          findAndCountAll: vi.fn().mockResolvedValue({
            count: mockCount,
            rows: mockPosts,
          }),
        },
        User: {
          findById: vi.fn().mockResolvedValue(mockUser),
        },
        Comment: {},
      });

      pagination.createPaginatedResponse.mockReturnValue({
        data: mockPosts,
        pagination: {
          total: mockCount,
          currentPage: page,
          totalPages: 1,
        },
      });

      const result = await postService.listPosts(page, limit);

      expect(result.data).toBeDefined();
      expect(result.pagination).toBeDefined();
    });
  });

  describe('updatePost', () => {
    it('should update post successfully', async () => {
      const updateData = {
        title: 'Updated Title',
        content: 'Updated Content',
      };

      const mockPostToUpdate = {
        ...mockPost,
        update: vi.fn().mockResolvedValue({
          ...mockPost,
          ...updateData,
          toJSON: () => ({
            ...mockPost.toJSON(),
            ...updateData,
          }),
        }),
      };

      getModels.mockReturnValue({
        Post: {
          findOne: vi.fn().mockResolvedValue(mockPostToUpdate),
        },
        User: {
          findById: vi.fn().mockResolvedValue(mockUser),
        },
      });

      const result = await postService.updatePost(1, updateData, 'userId123');

      expect(result.title).toBe(updateData.title);
      expect(result.content).toBe(updateData.content);
      expect(result.user).toBeDefined();
    });

    it('should throw NotFoundError when post does not exist', async () => {
      getModels.mockReturnValue({
        Post: {
          findOne: vi.fn().mockResolvedValue(null),
        },
      });

      await expect(
        postService.updatePost(999, { title: 'New Title' }, 'userId123')
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw UnauthorizedError when user is not the post owner', async () => {
      const mockPostToUpdate = {
        ...mockPost,
        userId: 'differentUserId',
      };

      getModels.mockReturnValue({
        Post: {
          findOne: vi.fn().mockResolvedValue(mockPostToUpdate),
        },
      });

      await expect(
        postService.updatePost(1, { title: 'New Title' }, 'userId123')
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('deletePost', () => {
    it('should delete post successfully', async () => {
      const mockPostToDelete = {
        id: 1,
        userId: 'userId123',
        destroy: vi.fn().mockResolvedValue(undefined),
      };

      getModels.mockReturnValue({
        Post: {
          findOne: vi.fn().mockResolvedValue(mockPostToDelete),
        },
      });

      await postService.deletePost(1, 'userId123');

      expect(mockPostToDelete.destroy).toHaveBeenCalled();
    });

    it('should throw NotFoundError when post does not exist', async () => {
      getModels.mockReturnValue({
        Post: {
          findOne: vi.fn().mockResolvedValue(null),
        },
      });

      await expect(postService.deletePost(999, 'userId123')).rejects.toThrow(
        NotFoundError
      );
    });

    it('should throw UnauthorizedError when user is not the post owner', async () => {
      const mockPostToDelete = {
        id: 1,
        userId: 'differentUserId',
      };

      getModels.mockReturnValue({
        Post: {
          findOne: vi.fn().mockResolvedValue(mockPostToDelete),
        },
      });

      await expect(postService.deletePost(1, 'userId123')).rejects.toThrow(
        UnauthorizedError
      );
    });
  });
});
