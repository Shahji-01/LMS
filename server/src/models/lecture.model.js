import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Lecture title is required"],
      trim: true,
      maxLength: [100, "Lecture title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxLength: [500, "Lecture description cannot exceed 500 characters"],
    },
    videoUrl: {
      type: String,
      required: [true, "Video URL is required"],
    },
    duration: {
      type: Number,
      default: 0,
    },
    publicId: {
      type: String,
      required: [true, "Public ID is required for video management"],
    },
    isPreview: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      required: [true, "Lecture order is required"],
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    // Soft delete flag
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
// 🔒 Indexes for performance
//
lectureSchema.index({ course: 1, order: 1 });
lectureSchema.index({ title: "text" });

// 🧠 Query helpers (clean API usage)
//
lectureSchema.query.notDeleted = function () {
  return this.where({ isDeleted: false });
};

lectureSchema.query.published = function () {
  return this.where({ status: "published" });
};
// Format duration before saving
lectureSchema.pre("save", function (next) {
  if (this.duration) {
    // Round duration to 2 decimal places
    this.duration = Math.round(this.duration * 100) / 100;
  }
  next();
});

export const Lecture = mongoose.model("Lecture", lectureSchema);
