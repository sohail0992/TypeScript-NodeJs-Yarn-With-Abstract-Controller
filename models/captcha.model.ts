'use strict';
import mongoose, { Schema } from 'mongoose';

const CaptchaSchema = new Schema({
    image: {
        unique: true,
        type: String,
        index: true,
        background: true
    },
    taskId: {
        type: String,
        index: true,
        background: true
    },
    answer: {
        type: String,
    }
}, { timestamps: true, strict: false });

export default mongoose.model<any>('Captcha', CaptchaSchema);
