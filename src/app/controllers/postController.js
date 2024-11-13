import {
  CreatePostDTO,
  UpdatePostDTO,
  DeletePostDTO,
  ListPostsDTO,
} from '../dtos/post/index.js';
import postService from '../services/postService.js';

export class PostController {
  async create(req, res, next) {
    try {
      const postData = await CreatePostDTO.validate({
        ...req.body,
        userId: req.userId,
      });

      const post = await postService.createPost(postData);
      return res.status(201).json(post);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const updateData = await UpdatePostDTO.validate({
        id: parseInt(req.params.id),
        ...req.body,
        userId: req.userId,
      });

      const post = await postService.updatePost(
        updateData.id,
        updateData,
        updateData.userId
      );
      return res.status(200).json(post);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const deleteData = await DeletePostDTO.validate({
        id: parseInt(req.params.id),
        userId: req.userId,
      });

      await postService.deletePost(deleteData.id, deleteData.userId);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async list(req, res, next) {
    try {
      const { page, limit } = await ListPostsDTO.validate(req.query);
      const posts = await postService.listPosts(page, limit);
      return res.status(200).json(posts);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid post ID' });
      }

      const post = await postService.getById(id);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      return res.status(200).json(post);
    } catch (error) {
      next(error);
    }
  }
}
