'use strict';
import mongoose, { Schema } from 'mongoose';
import { UserDTO } from '../dto/user.dto';

const UserSchema = new Schema({
    fullName: String,
    phone: {
        type: String,
        index: true,
        background: true
    },
    email: {
        unique: true,
        type: String,
        index: true,
        background: true
    },
    subscription: {
		months: [String],
		centers: [String],
        startDate: {
            type: Date,
            default: Date.now
        },
        endDate: Date,
        type: {
            type: String,
            enum: ['Trail', 'Regular'],
            default: 'Regular'
        },
	},
    isPaid: {
        type: Boolean,
        default: false,
        index: true,
        background: true
     },
     isTrail: {
        type: Boolean,
        default: false,
        index: true,
        background: true
    },
	slotAvailibityAlertOnly: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true, strict: false });

export default mongoose.model<UserDTO>('User', UserSchema);
