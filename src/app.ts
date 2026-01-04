import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { redisClient } from './config/db';
import { v4 as uuidv4 } from 'uuid';
import morgan from 'morgan';
import { config } from './config/env';
import { errorHandler } from './middlewares/errorHandler';
import { createRateLimiter } from './middlewares/rateLimiter';
import authRoutes from './routes/auth.routes';
import postRoutes from './routes/post.routes';
import scraperRoutes from './routes/scraper.routes';
import { AppError } from './utils/AppError';
import { logger } from './config/logger';

const app = express();

// Security Headers
app.use(helmet());

// CORS - Allow frontend origins
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://10.103.126.102:5173'],
    credentials: true
}));

// Body & Cookie Parsers
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Request ID
app.use((req: Request, res: Response, next: NextFunction) => {
    const requestId = uuidv4();
    (req as any).requestId = requestId;
    res.setHeader('X-Request-Id', requestId);
    next();
});

// Logging
app.use(morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) }
}));

// Global Rate Limiter: 100 req/min/IP
const globalLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', globalLimiter);

// Routes
app.use('/auth', authRoutes);
app.use('/posts', postRoutes);
app.use('/api/scrape', scraperRoutes); // /api prefix usage varies, sticking to req spec

// Health Checks
app.get('/health', async (req, res) => {
    const mongoStatus = mongoose.connection.readyState === 1 ? 'up' : 'down';
    const redisStatus = redisClient && redisClient.isOpen ? 'up' : 'down';

    res.status(200).json({
        status: 'ok',
        uptime: process.uptime(),
        services: {
            database: mongoStatus,
            cache: redisStatus
        }
    });
});

app.get('/metrics', (req, res) => {
    res.status(200).json({
        status: 'ok',
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        nodeVersion: process.version
    });
});

// 404
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Error Handler
app.use(errorHandler);

export default app;
