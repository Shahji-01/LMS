import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Review must belong to a user"],
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: [true, "Review must belong to a course"],
        },
        rating: {
            type: Number,
            required: [true, "Rating is required"],
            min: [1, "Rating must be at least 1"],
            max: [5, "Rating cannot exceed 5"],
        },
        comment: {
            type: String,
            required: [true, "Review comment is required"],
            trim: true,
            maxLength: [500, "Review comment cannot exceed 500 characters"],
        },
        isDeleted: { type: Boolean, default: false, index: true },
        deletedAt: { type: Date, default: null }
    },
    {
        timestamps: true,
    }
);

// Ensure one review per user per course
reviewSchema.index({ course: 1, user: 1 }, { unique: true });

// Static method to calculate average rating
reviewSchema.statics.calcAverageRating = async function (courseId) {
    const stats = await this.aggregate([
        {
            $match: { course: new mongoose.Types.ObjectId(courseId), isDeleted: { $ne: true } },
        },
        {
            $group: {
                _id: "$course",
                numRatings: { $sum: 1 },
                avgRating: { $avg: "$rating" },
            },
        },
    ]);

    const Course = mongoose.model("Course");
    if (stats.length > 0) {
        await Course.findByIdAndUpdate(courseId, {
            rating: Math.round(stats[0].avgRating * 10) / 10,
        });
    } else {
        await Course.findByIdAndUpdate(courseId, {
            rating: 0,
        });
    }
};

// Call calcAverageRating when a review is saved/updated/deleted
reviewSchema.post("save", async function () {
    await this.constructor.calcAverageRating(this.course);
});

reviewSchema.post(/^findOneAnd/, async function (doc) {
    if (doc) {
        await doc.constructor.calcAverageRating(doc.course);
    }
});

export const Review = mongoose.model("Review", reviewSchema);
