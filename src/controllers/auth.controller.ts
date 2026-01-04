import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/user.model';
import { AppError } from '../utils/AppError';
import { config } from '../config/env';

const signAccessToken = (userId: string) => {
    return jwt.sign({ id: userId }, config.jwt.accessSecret, {
        expiresIn: config.jwt.accessExpiresIn as jwt.SignOptions['expiresIn'],
    });
};

const signRefreshToken = (userId: string) => {
    return jwt.sign({ id: userId }, config.jwt.refreshSecret, {
        expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'],
    });
};

const sendToken = (user: IUser, statusCode: number, res: Response) => {
    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);

    // Store refresh token validation if needed (simple implementation saves to array)
    // In a real app with strict revocation, we might strict match.
    // Here we just push to list for simple statefulness or we could minimalistically just rely on cookie.
    // The requirement says "Logout with refresh-token revocation". So we need to store it.
    user.refreshTokens.push(refreshToken);
    user.save({ validateBeforeSave: false }).catch(() => { }); // Optimistic save

    // Cookie options
    const cookieOptions = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days (sync with 7d)
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: config.nodeEnv === 'production' ? 'none' as const : 'lax' as const // Adjust based on frontend domain
    };

    res.cookie('refreshToken', refreshToken, cookieOptions);

    res.status(statusCode).json({
        status: 'success',
        data: {
            accessToken,
            user: {
                id: user.id,
                email: user.email,
            },
        },
    });
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return next(new AppError('Please provide email and password', 400));
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return next(new AppError('Email already in use', 400));
        }

        const newUser = await User.create({ email, password });

        // We don't auto-login on register to force login flow check or we can. 
        // Let's just return success msg.
        res.status(201).json({
            status: 'success',
            message: 'User registered successfully. Please login.',
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new AppError('Please provide email and password', 400));
        }

        let user = await User.findOne({ email }).select('+password +refreshTokens');

        if (!user) {
            // HACKATHON MODE: Auto-register if not found
            user = await User.create({ email, password });
            // Re-fetch to get default fields properly if needed
            user = await User.findById(user._id).select('+password +refreshTokens');
        } else {
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return next(new AppError('Incorrect email or password', 401));
            }
        }

        if (user) {
            sendToken(user, 200, res);
        }
    } catch (error) {
        next(error);
    }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refreshToken = req.cookies.refreshToken || req.body.refreshToken; // Body support for tests

        if (!refreshToken) {
            return next(new AppError('No refresh token provided', 401));
        }

        // Verify token
        const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as { id: string };

        const user = await User.findById(decoded.id).select('+refreshTokens');
        if (!user) {
            return next(new AppError('User not found', 401));
        }

        // Check if token is in user's list
        if (!user.refreshTokens.includes(refreshToken)) {
            // Reuse detection logic could go here (delete all tokens)
            user.refreshTokens = [];
            await user.save({ validateBeforeSave: false });
            return next(new AppError('Invalid refresh token. Please login again.', 401));
        }

        // Rotate tokens
        const newAccessToken = signAccessToken(user.id);
        const newRefreshToken = signRefreshToken(user.id);

        // Remove old, add new
        user.refreshTokens = user.refreshTokens.filter(rt => rt !== refreshToken);
        user.refreshTokens.push(newRefreshToken);
        await user.save({ validateBeforeSave: false });

        // Send new cookie
        res.cookie('refreshToken', newRefreshToken, {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: config.nodeEnv === 'production',
        });

        res.status(200).json({
            status: 'success',
            data: {
                accessToken: newAccessToken,
            },
        });

    } catch (error) {
        return next(new AppError('Invalid refresh token', 401));
    }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            const user = await User.findOne({ refreshTokens: refreshToken });
            if (user) {
                user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
                await user.save({ validateBeforeSave: false });
            }
        }

        res.cookie('refreshToken', 'loggedout', {
            expires: new Date(Date.now() + 10 * 1000),
            httpOnly: true,
        });

        res.status(200).json({ status: 'success', message: 'Logged out successfully' });
    } catch (error) {
        next(error);
    }
};
