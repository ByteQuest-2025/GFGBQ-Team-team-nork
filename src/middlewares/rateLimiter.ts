import rateLimit from 'express-rate-limit';
// import RedisStore from 'rate-limit-redis';
// import { redisClient } from '../config/db';
import { config } from '../config/env';
import { AppError } from '../utils/AppError';

export const createRateLimiter = (options: {
    windowMs: number;
    max: number;
    message?: string;
    keyPrefix?: string;
}) => {
    return rateLimit({
        windowMs: options.windowMs,
        max: options.max,
        standardHeaders: true,
        legacyHeaders: false,
        // Store: RedisStore removed for compatibility. Using logic default (MemoryStore)
        handler: (req, res, next) => {
            next(new AppError(options.message || 'Too many requests, please try again later.', 429));
        },
    });
};
