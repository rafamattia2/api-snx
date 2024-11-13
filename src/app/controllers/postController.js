import {
  CreatePostDTO,
  UpdatePostDTO,
  DeletePostDTO,
  ListPostsDTO,
} from '../dtos/post/index.js';
import { PostService } from '../services/postService.js';

export class PostController {
  constructor() {
    this.postService = new PostService();
  }

  create = async (req, res, next) => {
    try {
      const postData = await CreatePostDTO.validate({
        ...req.body,
        userId: req.userId,
      });

      const post = await this.postService.createPost(postData);
      return res.status(201).json(post);
    } catch (error) {
      next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const updateData = await UpdatePostDTO.validate({
        id: parseInt(req.params.id),
        ...req.body,
        userId: req.userId,
      });

      const post = await this.postService.updatePost(
        updateData.id,
        updateData,
        updateData.userId
      );
      return res.status(200).json(post);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req, res, next) => {
    try {
      const deleteData = await DeletePostDTO.validate({
        id: parseInt(req.params.id),
        userId: req.userId,
      });

      await this.postService.deletePost(deleteData.id, deleteData.userId);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  list = async (req, res, next) => {
    try {
      const { page, limit } = await ListPostsDTO.validate(req.query);
      const posts = await this.postService.listPosts(page, limit);
      return res.status(200).json(posts);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid post ID' });
      }

      const post = await this.postService.getById(id);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      return res.status(200).json(post);
    } catch (error) {
      next(error);
    }
  };
}
