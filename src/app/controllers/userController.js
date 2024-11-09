import { userService } from '../services/userService.js';

const registerUser = async (req, res) => {
  const { name, username, password } = req.body;
  try {
    const result = await userService.createUser(name, username, password);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await userService.loginUser(username, password);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await userService.getUserById(userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const userController = {
  registerUser,
  loginUser,
  getUser,
};
export { userController };
