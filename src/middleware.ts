import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { log } from './services/log.service'

export const isAuth = {
  async isAuthenticated(req: Request, res: Response, next: NextFunction) {
    const requestId = req?.requestId || 'no-request-id';
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      await log({
        requestId,
        level: 'warn',
        message: 'auth_failed_no_token',
        metadata: {
          path: req.originalUrl,
          method: req.method,
        },
      });

      return res.status(401).json({
        error: 'Unauthorized',
        message: '🚫 Un-Authorized 🚫.',
      });
    }

    try {
      const token = authHeader.split(' ')[1];
      const payload = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET as string
      );

      
      req.body.payload = payload;

      await log({
        requestId,
        level: 'info',
        message: 'auth_success',
        metadata: {
          user_id: (payload as any).userId,
        },
      });

      return next();
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        await log({
          requestId,
          level: 'warn',
          message: 'auth_failed_token_expired',
        });

        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Token Expired Error',
        });
      }

      await log({
        requestId,
        level: 'warn',
        message: 'auth_failed_invalid_token',
      });

      return res.status(401).json({
        error: 'Unauthorized',
        message: '🚫 Un-Authorized 🚫.',
      });
    }
  },
};

export default isAuth;
