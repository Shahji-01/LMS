import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
        maxLength: 20
    },
    discountPercentage: {
        type: Number,
        required: true,
        min: 1,
        max: 100
    },
    expirationDate: {
        type: Date,
        required: true
    },
    maxUses: {
        type: Number,
        default: 100, // 0 = unlimited
        min: 0
    },
    currentUses: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export const Coupon = mongoose.model("Coupon", couponSchema);
