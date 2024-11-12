import userService from '../services/userService.js';
import { CreateUserDTO, LoginUserDTO } from '../dtos/user/index.js';

export class UserController {
  async registerUser(req, res, next) {
    try {
      const userData = await CreateUserDTO.validate(req.body);
      const result = await userService.createUser(userData);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async loginUser(req, res, next) {
    try {
      const loginData = await LoginUserDTO.validate(req.body);
      const result = await userService.loginUser(loginData);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getUser(req, res, next) {
    const { userId } = req.params;
    try {
      const result = await userService.getUserById(userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
