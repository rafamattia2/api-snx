import { userService } from '../services/userService.js';

const registerUser = async (req, res, next) => {
  const { name, username, password } = req.body;
  try {
    const result = await userService.createUser(name, username, password);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const result = await userService.loginUser(username, password);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getUser = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const result = await userService.getUserById(userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const userController = {
  registerUser,
  loginUser,
  getUser,
};
export { userController };
