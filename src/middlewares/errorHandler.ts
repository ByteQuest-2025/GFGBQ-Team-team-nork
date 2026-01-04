import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { logger } from '../config/logger';
import { config } from '../config/env';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    let statusCode = 500;
    let message = 'Internal Server Error';

    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    }

    // Log error with requestId
    logger.error(message, {
        requestId: (req as any).requestId,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });

    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message,
        ...(config.nodeEnv === 'development' && { stack: err.stack }),
    });
};
