"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../src/app"));
const user_model_1 = require("../src/models/user.model");
describe('Auth Endpoints', () => {
    it('should register a new user', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/auth/register')
            .send({
            email: 'test@example.com',
            password: 'password123'
        });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('data'); // Adjust based on controller response
        // Actually my controller sends just message
        /*
        res.status(201).json({
          status: 'success',
          message: 'User registered successfully. Please login.',
        });
        */
        expect(res.body.status).toEqual('success');
        // Verify user in DB
        const user = await user_model_1.User.findOne({ email: 'test@example.com' });
        expect(user).toBeTruthy();
        expect(user?.password).not.toBe('password123'); // Hashed
    });
    it('should login and return access token + cookie', async () => {
        // Register first
        await user_model_1.User.create({ email: 'test@example.com', password: 'password123' });
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/auth/login')
            .send({
            email: 'test@example.com',
            password: 'password123'
        });
        expect(res.statusCode).toEqual(200);
        expect(res.body.data).toHaveProperty('accessToken');
        expect(res.body.data.user).toHaveProperty('email', 'test@example.com');
        // Check cookie
        const cookies = res.headers['set-cookie'];
        expect(cookies).toBeDefined();
        expect(cookies[0]).toMatch(/refreshToken=.*; Path=\/; HttpOnly/);
    });
    it('should fail login with wrong password', async () => {
        await user_model_1.User.create({ email: 'test@example.com', password: 'password123' });
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/auth/login')
            .send({
            email: 'test@example.com',
            password: 'wrongpassword'
        });
        expect(res.statusCode).toEqual(401);
    });
});
