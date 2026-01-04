import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { redisClient } from '../src/config/db';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
    // Ensure we can have some timeout for download
    mongoServer = await MongoMemoryServer.create({
        instance: {
            dbTarget: 'truthlens-test'
        },
        binary: {
            version: '6.0.4'
        }
    });
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    if (redisClient && redisClient.isOpen) {
        await redisClient.quit();
    }
});

afterEach(async () => {
    if (mongoose.connection.readyState !== 0) {
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            const collection = collections[key];
            await collection.deleteMany({});
        }
    }
});

// Mock Redis Client for tests to avoid needing real Redis
jest.mock('redis', () => ({
    createClient: () => ({
        on: jest.fn(),
        connect: jest.fn(),
        get: jest.fn(),
        set: jest.fn(),
        sendCommand: jest.fn(),
        quit: jest.fn(),
        isOpen: false
    })
}));
