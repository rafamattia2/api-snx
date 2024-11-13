import { UserService } from '../services/userService.js';
import {
  CreateUserDTO,
  LoginUserDTO,
  UpdateUserDTO,
} from '../dtos/user/index.js';
import pagination from '../utils/pagination.js';

export class UserController {
  constructor() {
    this.userService = new UserService();
  }

  registerUser = async (req, res, next) => {
    try {
      const userData = await CreateUserDTO.validate(req.body);
      const result = await this.userService.createUser(userData);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  loginUser = async (req, res, next) => {
    try {
      const loginData = await LoginUserDTO.validate(req.body);
      const result = await this.userService.loginUser(loginData);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getUser = async (req, res, next) => {
    const { userId } = req.params;
    try {
      const result = await this.userService.getUserById(userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  updateUser = async (req, res, next) => {
    const { userId } = req.params;
    try {
      const userService = new UserService(req.user);
      const userData = await UpdateUserDTO.validate(req.body);
      const result = await userService.updateUser(userId, userData);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  deleteUser = async (req, res, next) => {
    const { userId } = req.params;
    try {
      const result = await this.userService.deleteUser(userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  listUsers = async (req, res, next) => {
    try {
      const { page, limit } = pagination.getPagination(req);
      const { users, total } = await this.userService.listUsers(page, limit);
      const response = pagination.createPaginatedResponse(
        users,
        total,
        page,
        limit
      );
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
