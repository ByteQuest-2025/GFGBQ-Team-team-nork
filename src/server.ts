import app from './app';
import { connectDB, connectRedis } from './config/db';
import { config } from './config/env';
import { logger } from './config/logger';

// Handle Uncaught Exception
process.on('uncaughtException', (err) => {
    logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    logger.error(err.name, err.message);
    process.exit(1);
});

const startServer = async () => {
    await connectDB();
    await connectRedis();

    const server = app.listen(config.port, () => {
        logger.info(`App running on port ${config.port} in ${config.nodeEnv} mode`);
    });

    // Handle Unhandled Rejection
    process.on('unhandledRejection', (err: any) => {
        logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
        logger.error(err.name, err.message);
        server.close(() => {
            process.exit(1);
        });
    });

    // SIGTERM for Docker/K8s
    process.on('SIGTERM', () => {
        logger.info('👋 SIGTERM RECEIVED. Shutting down gracefully');
        server.close(() => {
            logger.info('💥 Process terminated!');
        });
    });
};

startServer();
