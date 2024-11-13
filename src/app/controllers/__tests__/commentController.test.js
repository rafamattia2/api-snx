import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CommentController } from '../commentController.js';
import commentService from '../../services/commentService.js';
import {
  CreateCommentDTO,
  DeleteCommentDTO,
  ListCommentsDTO,
} from '../../dtos/comment/index.js';

vi.mock('../../services/commentService.js');
vi.mock('../../dtos/comment/index.js');

describe('CommentController', () => {
  let commentController;
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    commentController = new CommentController();
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
        body: { content: 'Test comment' },
        params: { postId: '1' },
        userId: 'user123',
      };
    });

    it('should create a comment successfully', async () => {
      const validatedData = {
        content: 'Test comment',
        postId: 1,
        userId: 'user123',
      };
      const serviceResponse = {
        id: 1,
        content: 'Test comment',
        postId: 1,
        userId: 'user123',
      };

      CreateCommentDTO.validate.mockResolvedValue(validatedData);
      commentService.createComment.mockResolvedValue(serviceResponse);

      await commentController.create(mockReq, mockRes, mockNext);

      expect(CreateCommentDTO.validate).toHaveBeenCalledWith(validatedData);
      expect(commentService.createComment).toHaveBeenCalledWith(validatedData);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(serviceResponse);
    });

    it('should handle errors through next middleware', async () => {
      const error = new Error('Validation error');
      CreateCommentDTO.validate.mockRejectedValue(error);

      await commentController.create(mockReq, mockRes, mockNext);

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

    it('should delete a comment successfully', async () => {
      const validatedData = {
        id: 1,
        userId: 'user123',
      };

      DeleteCommentDTO.validate.mockResolvedValue(validatedData);

      await commentController.delete(mockReq, mockRes, mockNext);

      expect(DeleteCommentDTO.validate).toHaveBeenCalledWith(validatedData);
      expect(commentService.deleteComment).toHaveBeenCalledWith(1, 'user123');
      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.send).toHaveBeenCalled();
    });

    it('should handle errors through next middleware', async () => {
      const error = new Error('Comment not found');
      DeleteCommentDTO.validate.mockRejectedValue(error);

      await commentController.delete(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('list', () => {
    beforeEach(() => {
      mockReq = {
        params: { postId: '1' },
        query: { page: '1', limit: '10' },
      };
    });

    it('should list comments successfully', async () => {
      const validatedData = {
        postId: 1,
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

      ListCommentsDTO.validate.mockResolvedValue(validatedData);
      commentService.listComments.mockResolvedValue(serviceResponse);

      await commentController.list(mockReq, mockRes, mockNext);

      expect(ListCommentsDTO.validate).toHaveBeenCalledWith({
        postId: parseInt(mockReq.params.postId),
        page: mockReq.query.page,
        limit: mockReq.query.limit,
      });
      expect(commentService.listComments).toHaveBeenCalledWith(
        validatedData.postId,
        validatedData.page,
        validatedData.limit
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(serviceResponse);
    });

    it('should handle errors through next middleware', async () => {
      const error = new Error('Invalid pagination');
      ListCommentsDTO.validate.mockRejectedValue(error);

      await commentController.list(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});