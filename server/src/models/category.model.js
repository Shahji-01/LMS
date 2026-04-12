import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        maxLength: 100
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true
    },
    description: {
        type: String,
        trim: true,
        maxLength: 300
    }
}, { timestamps: true });

// Pre-save hook to generate slug if not provided
categorySchema.pre("validate", function(next) {
    if (this.name && !this.slug) {
        this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    next();
});

export const Category = mongoose.model("Category", categorySchema);
