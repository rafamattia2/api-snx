import commentService from '../services/commentService.js';
import {
  CreateCommentDTO,
  DeleteCommentDTO,
  ListCommentsDTO,
} from '../dtos/comment/index.js';

export class CommentController {
  async create(req, res, next) {
    try {
      const commentData = await CreateCommentDTO.validate({
        content: req.body.content,
        postId: parseInt(req.params.postId),
        userId: req.userId,
      });

      const comment = await commentService.createComment(commentData);
      return res.status(201).json(comment);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const deleteData = await DeleteCommentDTO.validate({
        id: parseInt(req.params.id),
        userId: req.userId,
      });

      await commentService.deleteComment(deleteData.id, deleteData.userId);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async list(req, res, next) {
    try {
      const listData = await ListCommentsDTO.validate({
        postId: parseInt(req.params.postId),
        page: req.query.page,
        limit: req.query.limit,
      });

      const result = await commentService.listComments(
        listData.postId,
        listData.page,
        listData.limit
      );
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
