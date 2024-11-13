import jwt from 'jsonwebtoken';
import authConfig from '../../configs/auth.js';
import { UnauthorizedError } from '../errors/appError.js';

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedError('No token provided');
    }

    const [, token] = authHeader.split(' ');

    if (!token) {
      throw new UnauthorizedError('Token malformatted');
    }

    const decoded = jwt.verify(token, authConfig.jwt.secret);

    // Adiciona o usuário decodificado à requisição
    req.user = {
      id: decoded.id,
      username: decoded.username,
    };

    return next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid token');
    }
    throw error;
  }
};
