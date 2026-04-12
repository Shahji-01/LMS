import mongoose from "mongoose";

const payoutSchema = new mongoose.Schema({
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 1
    },
    paymentEmail: {
        type: String, // PayPal email or similar
        required: true,
        trim: true,
        lowercase: true
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'rejected'],
        default: 'pending'
    },
    processedDate: {
        type: Date
    },
    notes: {
        type: String
    }
}, { timestamps: true });

export const Payout = mongoose.model('Payout', payoutSchema);
