import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { AppError } from '../utils/AppError';

export interface IUser extends Document {
    email: string;
    password: string;
    refreshTokens: string[];
    comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema(
    {
        email: { type: String, required: true, unique: true, trim: true, lowercase: true },
        password: { type: String, required: true, minlength: 8 },
        refreshTokens: { type: [String], select: false }, // Revocation/Management list
    },
    { timestamps: true }
);

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err: any) {
        next(err);
    }
});

userSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
    return await bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);
