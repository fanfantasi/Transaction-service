import { Request, Response, NextFunction } from 'express';
import { log } from './services/log.service';

export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const start = Date.now();

  res.on('finish', async () => {
    await log({
      requestId: req.requestId,
      level: res.statusCode >= 500 ? 'error' : 'info',
      message: `${req.method} ${req.originalUrl}`,
      metadata: {
        statusCode: res.statusCode,
        data: req.body,
        duration_ms: Date.now() - start,
      },
    });
  });

  next();
}
