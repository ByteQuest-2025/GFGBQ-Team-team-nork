import { Request, Response, NextFunction } from 'express';
import { Post } from '../models/post.model';
import { AppError } from '../utils/AppError';
import { AuthRequest } from '../middlewares/auth.middleware';

// Create Post
export const createPost = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { title, content } = req.body;
        if (!title || !content) {
            return next(new AppError('Title and content are required', 400));
        }

        const post = await Post.create({
            title,
            content,
            author: req.user.id,
        });

        res.status(201).json({
            status: 'success',
            data: { post },
        });
    } catch (error) {
        next(error);
    }
};

// Get All Posts (Pagination ready)
export const getAllPosts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const posts = await Post.find()
            .populate('author', 'email')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Post.countDocuments();

        res.status(200).json({
            status: 'success',
            results: posts.length,
            data: {
                posts,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            },
        });
    } catch (error) {
        next(error);
    }
};

// Get Single Post
export const getPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const post = await Post.findById(req.params.id).populate('author', 'email');
        if (!post) {
            return next(new AppError('No post found with that ID', 404));
        }
        res.status(200).json({
            status: 'success',
            data: { post },
        });
    } catch (error) {
        next(error);
    }
};

// Update Post (Owner only)
export const updatePost = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return next(new AppError('No post found with that ID', 404));
        }

        if (post.author.toString() !== req.user.id) {
            return next(new AppError('You are not authorized to update this post', 403));
        }

        post.title = req.body.title || post.title;
        post.content = req.body.content || post.content;
        await post.save();

        res.status(200).json({
            status: 'success',
            data: { post },
        });
    } catch (error) {
        next(error);
    }
};

// Delete Post (Owner only)
export const deletePost = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return next(new AppError('No post found with that ID', 404));
        }

        if (post.author.toString() !== req.user.id) {
            return next(new AppError('You are not authorized to delete this post', 403));
        }

        await post.deleteOne();

        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (error) {
        next(error);
    }
};
