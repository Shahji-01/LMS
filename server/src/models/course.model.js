import mongoose from "mongoose"

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Course title is required'],
        trim: true,
        maxLength: [100, 'Course title cannot exceed 100 characters']
    },
    subtitle: {
        type: String,
        trim: true,
        maxLength: [200, 'Course subtitle cannot exceed 200 characters']
    },
    description: {
        type: String,
        trim: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Course category is required']
    },
    level: {
        type: String,
        enum: {
            values: ['beginner', 'intermediate', 'advanced'],
            message: 'Please select a valid course level'
        },
        default: 'beginner'
    },
    price: {
        type: Number,
        required: [true, 'Course price is required'],
        min: [0, 'Course price must be non-negative']
    },
    thumbnail: {
        type: String,
        required: [true, 'Course thumbnail is required']
    },
    enrolledStudents: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    lectures: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lecture"
        }
    ],
    quizzes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Quiz"
        }
    ],
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Course instructor is required']
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    totalDuration: {
        type: Number,
        default: 0
    },
    totalLectures: {
        type: Number,
        default: 0
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Text index for full-text search
courseSchema.index({ title: 'text', description: 'text' });
// Performance indexes
courseSchema.index({ instructor: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ isPublished: 1 });

// Automatically exclude soft-deleted courses
courseSchema.pre(/^find/, function () {
    if (!this.getOptions()._includeSoftDeleted) {
        this.where({ isDeleted: { $ne: true } });
    }
});

// Virtual field for average rating
courseSchema.virtual('averageRating').get(function () {
    return this.rating || 0;
});

// Update total lectures count when lectures are modified
courseSchema.pre('save', function () {
    if (this.lectures) {
        this.totalLectures = this.lectures.length;
    }
});

export const Course = mongoose.model("Course", courseSchema);