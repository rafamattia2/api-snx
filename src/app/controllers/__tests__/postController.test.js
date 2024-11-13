import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PostController } from '../postController.js';
import { PostService } from '../../services/postService.js';
import {
  CreatePostDTO,
  UpdatePostDTO,
  DeletePostDTO,
  ListPostsDTO,
} from '../../dtos/post/index.js';

vi.mock('../../services/postService.js');
vi.mock('../../dtos/post/index.js', () => ({
  CreatePostDTO: { validate: vi.fn() },
  UpdatePostDTO: { validate: vi.fn() },
  DeletePostDTO: { validate: vi.fn() },
  ListPostsDTO: { validate: vi.fn() },
}));

describe('PostController', () => {
  let controller;
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    const mockPostService = {
      createPost: vi.fn(),
      updatePost: vi.fn(),
      deletePost: vi.fn(),
      listPosts: vi.fn(),
      getById: vi.fn(),
    };
    controller = new PostController();
    controller.postService = mockPostService;

    mockNext = vi.fn();
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      send: vi.fn(),
    };
  });

  describe('create', () => {
    beforeEach(() => {
      mockReq = {
        body: { title: 'Test Post', content: 'Test Content' },
        userId: 'user123',
      };
    });

    it('should create a post successfully', async () => {
      const validatedData = {
        title: 'Test Post',
        content: 'Test Content',
        userId: 'user123',
      };
      const serviceResponse = {
        id: 1,
        ...validatedData,
      };

      CreatePostDTO.validate.mockResolvedValue(validatedData);
      controller.postService.createPost.mockResolvedValue(serviceResponse);

      await controller.create(mockReq, mockRes, mockNext);

      expect(CreatePostDTO.validate).toHaveBeenCalledWith({
        ...mockReq.body,
        userId: mockReq.userId,
      });
      expect(controller.postService.createPost).toHaveBeenCalledWith(
        validatedData
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(serviceResponse);
    });

    it('should handle errors through next middleware', async () => {
      const error = new Error('Validation error');
      CreatePostDTO.validate.mockRejectedValue(error);

      await controller.create(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('update', () => {
    beforeEach(() => {
      mockReq = {
        params: { id: '1' },
        body: {
          title: 'Updated Post',
          content: 'Updated Content',
        },
        userId: 'user123',
      };
    });

    it('should update a post successfully', async () => {
      const validatedData = {
        id: 1,
        ...mockReq.body,
        userId: mockReq.userId,
      };
      const serviceResponse = {
        id: 1,
        ...validatedData,
        updatedAt: new Date(),
      };

      UpdatePostDTO.validate.mockResolvedValue(validatedData);
      controller.postService.updatePost.mockResolvedValue(serviceResponse);

      await controller.update(mockReq, mockRes, mockNext);

      expect(UpdatePostDTO.validate).toHaveBeenCalledWith({
        id: parseInt(mockReq.params.id),
        ...mockReq.body,
        userId: mockReq.userId,
      });
      expect(controller.postService.updatePost).toHaveBeenCalledWith(
        validatedData.id,
        validatedData,
        validatedData.userId
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(serviceResponse);
    });

    it('should handle errors through next middleware', async () => {
      const error = new Error('Post not found');
      UpdatePostDTO.validate.mockRejectedValue(error);

      await controller.update(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('delete', () => {
    beforeEach(() => {
      mockReq = {
        params: { id: '1' },
        userId: 'user123',
      };
    });

    it('should delete a post successfully', async () => {
      const validatedData = {
        id: 1,
        userId: mockReq.userId,
      };

      DeletePostDTO.validate.mockResolvedValue(validatedData);

      await controller.delete(mockReq, mockRes, mockNext);

      expect(DeletePostDTO.validate).toHaveBeenCalledWith({
        id: parseInt(mockReq.params.id),
        userId: mockReq.userId,
      });
      expect(controller.postService.deletePost).toHaveBeenCalledWith(
        validatedData.id,
        validatedData.userId
      );
      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.send).toHaveBeenCalled();
    });

    it('should handle errors through next middleware', async () => {
      const error = new Error('Post not found');
      DeletePostDTO.validate.mockRejectedValue(error);

      await controller.delete(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('list', () => {
    beforeEach(() => {
      mockReq = {
        query: { page: '1', limit: '10' },
      };
    });

    it('should list posts successfully', async () => {
      const validatedData = {
        page: 1,
        limit: 10,
      };
      const serviceResponse = {
        data: [],
        pagination: {
          total: 0,
          currentPage: 1,
          totalPages: 1,
        },
      };

      ListPostsDTO.validate.mockResolvedValue(validatedData);
      controller.postService.listPosts.mockResolvedValue(serviceResponse);

      await controller.list(mockReq, mockRes, mockNext);

      expect(ListPostsDTO.validate).toHaveBeenCalledWith(mockReq.query);
      expect(controller.postService.listPosts).toHaveBeenCalledWith(
        validatedData.page,
        validatedData.limit
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(serviceResponse);
    });

    it('should handle errors through next middleware', async () => {
      const error = new Error('Invalid pagination');
      ListPostsDTO.validate.mockRejectedValue(error);

      await controller.list(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getById', () => {
    beforeEach(() => {
      mockReq = {
        params: { id: '1' },
      };
    });

    it('should get post by id successfully', async () => {
      const serviceResponse = {
        id: 1,
        title: 'Test Post',
        content: 'Test Content',
      };

      controller.postService.getById.mockResolvedValue(serviceResponse);

      await controller.getById(mockReq, mockRes, mockNext);

      expect(controller.postService.getById).toHaveBeenCalledWith(1);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(serviceResponse);
    });

    it('should return 400 for invalid post ID', async () => {
      mockReq.params.id = 'invalid';

      await controller.getById(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid post ID' });
    });

    it('should return 404 when post is not found', async () => {
      controller.postService.getById.mockResolvedValue(null);

      await controller.getById(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Post not found' });
    });

    it('should handle errors through next middleware', async () => {
      const error = new Error('Database error');
      controller.postService.getById.mockRejectedValue(error);

      await controller.getById(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
