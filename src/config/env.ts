import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
    PORT: z.string().default('3000'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
    REDIS_URL: z.string().optional(),
    JWT_ACCESS_SECRET: z.string().min(1, 'JWT_ACCESS_SECRET is required'),
    JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET is required'),
    JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
    GOOGLE_AI_API_KEY: z.string().optional(),
});

const envVars = envSchema.parse(process.env);

export const config = {
    port: parseInt(envVars.PORT, 10),
    nodeEnv: envVars.NODE_ENV,
    mongoUri: envVars.MONGO_URI,
    redisUrl: envVars.REDIS_URL,
    jwt: {
        accessSecret: envVars.JWT_ACCESS_SECRET,
        refreshSecret: envVars.JWT_REFRESH_SECRET,
        accessExpiresIn: envVars.JWT_ACCESS_EXPIRES_IN,
        refreshExpiresIn: envVars.JWT_REFRESH_EXPIRES_IN,
    },
    googleAiApiKey: envVars.GOOGLE_AI_API_KEY,
};
