import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './user.model';

export interface IPost extends Document {
    title: string;
    content: string;
    author: IUser['_id'];
    createdAt: Date;
    updatedAt: Date;
}

const postSchema = new Schema(
    {
        title: { type: String, required: true, trim: true },
        content: { type: String, required: true },
        author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true }
);

export const Post = mongoose.model<IPost>('Post', postSchema);
