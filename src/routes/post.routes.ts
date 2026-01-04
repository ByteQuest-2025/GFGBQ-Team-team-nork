import express from 'express';
import * as postController from '../controllers/post.controller';
import { protect } from '../middlewares/auth.middleware';

const router = express.Router();

router.route('/')
    .get(protect, postController.getAllPosts)
    .post(protect, postController.createPost);

router.route('/:id')
    .get(protect, postController.getPost)
    .patch(protect, postController.updatePost)
    .delete(protect, postController.deletePost);

export default router;
