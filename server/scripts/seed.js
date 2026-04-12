/**
 * Seed Script — Creates admin account + sample courses + demo lectures
 * Usage: node scripts/seed.js
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

dotenv.config({ path: "../.env" });

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/lms";

// Minimal schemas for seeding (avoid circular import issues)
const userSchema = new mongoose.Schema({
    name: String, email: { type: String, unique: true }, password: String,
    role: String, avatar: String, bio: String,
    enrolledCourses: [], createdCourses: [],
    isEmailVerified: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });
const User = mongoose.model("User", userSchema);

const courseSchema = new mongoose.Schema({
    title: String, subtitle: String, description: String, category: String,
    level: String, price: Number, thumbnail: String,
    instructor: mongoose.Schema.Types.ObjectId,
    isPublished: { type: Boolean, default: true },
    lectures: [], enrolledStudents: [],
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });
const Course = mongoose.model("Course", courseSchema);

const lectureSchema = new mongoose.Schema({
    title: String, videoUrl: String, publicId: String,
    duration: Number, order: Number, isPreview: Boolean,
}, { timestamps: true });
const Lecture = mongoose.model("Lecture", lectureSchema);

const seed = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // ── Admin User ─────────────────────────────────────────────────────────
        const existingAdmin = await User.findOne({ email: "admin@learnhub.com" });
        let admin;

        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash("Admin@1234", 12);
            admin = await User.create({
                name: "Admin User",
                email: "admin@learnhub.com",
                password: hashedPassword,
                role: "admin",
                bio: "Platform administrator",
                avatar: "https://ui-avatars.com/api/?name=Admin+User&background=6366f1&color=fff",
            });
            console.log("✅ Admin created: admin@learnhub.com / Admin@1234");
        } else {
            admin = existingAdmin;
            console.log("ℹ️  Admin already exists, skipping.");
        }

        // ── Instructor User ────────────────────────────────────────────────────
        const existingInstructor = await User.findOne({ email: "instructor@learnhub.com" });
        let instructor;

        if (!existingInstructor) {
            const hashedPassword = await bcrypt.hash("Instructor@1234", 12);
            instructor = await User.create({
                name: "John Instructor",
                email: "instructor@learnhub.com",
                password: hashedPassword,
                role: "instructor",
                bio: "Full-stack developer with 10 years of experience.",
                avatar: "https://ui-avatars.com/api/?name=John+Instructor&background=10b981&color=fff",
            });
            console.log("✅ Instructor created: instructor@learnhub.com / Instructor@1234");
        } else {
            instructor = existingInstructor;
            console.log("ℹ️  Instructor already exists, skipping.");
        }

        // ── Sample Courses ─────────────────────────────────────────────────────
        const coursesData = [
            {
                title: "Complete React & TypeScript Masterclass",
                subtitle: "Build production-ready apps with React 19 and TypeScript",
                description: "Learn React from fundamentals to advanced patterns including hooks, context, Redux, and TypeScript integration.",
                category: "Web Development",
                level: "intermediate",
                price: 1999,
                thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80",
            },
            {
                title: "Node.js Backend Engineering",
                subtitle: "Build scalable APIs with Node.js, Express, and MongoDB",
                description: "Master server-side JavaScript with a focus on building real-world REST APIs, authentication systems, and deployment.",
                category: "Backend Development",
                level: "advanced",
                price: 2499,
                thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
            },
            {
                title: "Python for Beginners",
                subtitle: "Learn Python programming from scratch",
                description: "Start your programming journey with Python. Cover data types, functions, OOP, and build practical projects.",
                category: "Programming",
                level: "beginner",
                price: 999,
                thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&q=80",
            },
        ];

        for (const courseData of coursesData) {
            const exists = await Course.findOne({ title: courseData.title });
            if (exists) {
                console.log(`ℹ️  Course "${courseData.title}" exists, skipping.`);
                continue;
            }

            // Create sample lecture
            const lecture = await Lecture.create({
                title: "Welcome & Course Overview",
                videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
                publicId: "sample_lecture",
                duration: 120,
                order: 1,
                isPreview: true,
            });

            const course = await Course.create({
                ...courseData,
                instructor: instructor._id,
                lectures: [lecture._id],
            });

            // Add to instructor's createdCourses
            await User.findByIdAndUpdate(instructor._id, { $addToSet: { createdCourses: course._id } });

            console.log(`✅ Course created: "${course.title}"`);
        }

        console.log("\n🎉 Seeding complete!");
        console.log("\n📋 Credentials:");
        console.log("   Admin    → admin@learnhub.com / Admin@1234");
        console.log("   Instructor → instructor@learnhub.com / Instructor@1234\n");

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error("❌ Seed error:", err.message);
        await mongoose.disconnect();
        process.exit(1);
    }
};

seed();
