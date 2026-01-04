import mongoose from 'mongoose';
import { createClient } from 'redis';
import { config } from './env';
import { logger } from './logger';

export const connectDB = async () => {
    try {
        await mongoose.connect(config.mongoUri);
        logger.info('MongoDB connected successfully');
    } catch (error) {
        logger.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

let redisClient: ReturnType<typeof createClient> | null = null;

export const connectRedis = async () => {
    if (!config.redisUrl) {
        logger.warn('Redis URL not provided, skipping Redis connection (using fallback if handled)');
        return;
    }

    redisClient = createClient({ url: config.redisUrl });

    redisClient.on('error', (err) => logger.debug('Redis Client Connection Status: Offline (Fallback enabled)'));
    redisClient.on('connect', () => logger.info('Redis Client Connected'));

    try {
        await redisClient.connect();
    } catch (error) {
        logger.warn('Redis connection failed. Performance may be degraded, but system is stable.');
    }
};

export { redisClient };
