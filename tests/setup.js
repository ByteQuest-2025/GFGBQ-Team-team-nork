"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_memory_server_1 = require("mongodb-memory-server");
const mongoose_1 = __importDefault(require("mongoose"));
const db_1 = require("../src/config/db");
let mongoServer;
beforeAll(async () => {
    mongoServer = await mongodb_memory_server_1.MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    // We need to disconnect existing connection from server.ts if it auto-runs?
    // But unit tests import app, which might not auto-run server unless separate file.
    // We separated server.ts and app.ts, so app doesn't connect DB. Good.
    await mongoose_1.default.connect(mongoUri);
});
afterAll(async () => {
    await mongoose_1.default.disconnect();
    await mongoServer.stop();
    if (db_1.redisClient && db_1.redisClient.isOpen) {
        await db_1.redisClient.quit();
    }
});
afterEach(async () => {
    const collections = mongoose_1.default.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
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
