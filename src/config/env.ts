import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
    PORT: z.string().default('3000'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    MONGO_URI: z.string().default(''),
    REDIS_URL: z.string().optional(),
    JWT_ACCESS_SECRET: z.string().default('dev-access-secret-change-in-production'),
    JWT_REFRESH_SECRET: z.string().default('dev-refresh-secret-change-in-production'),
    JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
    GOOGLE_AI_API_KEY: z.string().optional(),
    FRONTEND_URL: z.string().optional(),
});

const envVars = envSchema.parse(process.env);

// Validate required production variables
if (!envVars.MONGO_URI) {
    console.error('❌ FATAL: MONGO_URI environment variable is required!');
    console.error('   Set it in your Render dashboard under Environment Variables.');
    console.error('   Example: mongodb+srv://user:pass@cluster.mongodb.net/dbname');
    process.exit(1);
}

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
    frontendUrl: envVars.FRONTEND_URL,
};
