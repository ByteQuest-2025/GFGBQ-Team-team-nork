import express from 'express';
import * as authController from '../controllers/auth.controller';
import { createRateLimiter } from '../middlewares/rateLimiter';

const router = express.Router();

// Rate limit for login: 5 req/min/IP
const loginLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 5,
    message: 'Too many login attempts, please try again after a minute',
    keyPrefix: 'login' // Global login limit per IP
});

router.post('/register', authController.register);
router.post('/login', loginLimiter, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

export default router;
