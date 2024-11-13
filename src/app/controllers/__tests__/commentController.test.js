import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CommentController } from '../commentController.js';
import {
  CreateCommentDTO,
  DeleteCommentDTO,
  ListCommentsDTO,
  UpdateCommentDTO,
} from '../../dtos/comment/index.js';

vi.mock('../../dtos/comment/index.js', () => ({
  CreateCommentDTO: {
    validate: vi.fn(),
  },
  DeleteCommentDTO: {
    validate: vi.fn(),
  },
  ListCommentsDTO: {
    validate: vi.fn(),
  },
  UpdateCommentDTO: {
    validate: vi.fn(),
  },
}));

describe('CommentController', () => {
  let commentController;
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    vi.clearAllMocks();

    const mockCommentService = {
      createComment: vi.fn(),
      deleteComment: vi.fn(),
      listComments: vi.fn(),
      updateComment: vi.fn(),
    };

    commentController = new CommentController();
    commentController.commentService = mockCommentService;

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
        user: { id: 'user123' },
      };
    });

    it('should create a comment successfully', async () => {
      const validatedData = {
        content: 'Test comment',
        postId: 1,
        userId: 'user123',
      };

      CreateCommentDTO.validate.mockResolvedValue(validatedData);
      commentController.commentService.createComment.mockResolvedValue({
        id: 1,
        ...validatedData,
      });

      await commentController.create(mockReq, mockRes, mockNext);

      expect(CreateCommentDTO.validate).toHaveBeenCalledWith({
        content: mockReq.body.content,
        postId: parseInt(mockReq.params.postId),
        userId: mockReq.user.id,
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });
  });

  describe('delete', () => {
    beforeEach(() => {
      mockReq = {
        params: { id: '1' },
        user: { id: 'user123' },
      };
    });

    it('should delete a comment successfully', async () => {
      const validatedData = {
        id: 1,
        userId: 'user123',
      };

      DeleteCommentDTO.validate.mockResolvedValue(validatedData);

      await commentController.delete(mockReq, mockRes, mockNext);

      expect(DeleteCommentDTO.validate).toHaveBeenCalledWith({
        id: parseInt(mockReq.params.id),
        userId: mockReq.user.id,
      });
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
      commentController.commentService.listComments.mockResolvedValue(
        serviceResponse
      );

      await commentController.list(mockReq, mockRes, mockNext);

      expect(ListCommentsDTO.validate).toHaveBeenCalledWith({
        postId: parseInt(mockReq.params.postId),
        page: mockReq.query.page,
        limit: mockReq.query.limit,
      });
      expect(
        commentController.commentService.listComments
      ).toHaveBeenCalledWith(
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

  describe('update', () => {
    beforeEach(() => {
      mockReq = {
        params: { id: '1' },
        body: { content: 'Updated comment' },
        user: { id: 'user123' },
      };
    });

    it('should update a comment successfully', async () => {
      const validatedData = {
        id: 1,
        content: 'Updated comment',
        userId: 'user123',
      };

      const serviceResponse = {
        id: 1,
        content: 'Updated comment',
        userId: 'user123',
        updatedAt: new Date(),
      };

      UpdateCommentDTO.validate.mockResolvedValue(validatedData);
      commentController.commentService.updateComment.mockResolvedValue(
        serviceResponse
      );

      await commentController.update(mockReq, mockRes, mockNext);

      expect(UpdateCommentDTO.validate).toHaveBeenCalledWith({
        id: parseInt(mockReq.params.id),
        content: mockReq.body.content,
        userId: mockReq.user.id,
      });
      expect(
        commentController.commentService.updateComment
      ).toHaveBeenCalledWith(
        validatedData.id,
        validatedData.content,
        validatedData.userId
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(serviceResponse);
    });

    it('should handle errors through next middleware', async () => {
      const error = new Error('Comment not found');
      UpdateCommentDTO.validate.mockRejectedValue(error);

      await commentController.update(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
