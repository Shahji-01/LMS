/**
 * LearnHub — Database Seed Script (Raw MongoDB, no middleware issues)
 * Run: node seed.js
 */
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UNSPLASH = [
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80",
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
    "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80",
    "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80",
    "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&q=80",
    "https://images.unsplash.com/photo-1550439062-609e1531270e?w=800&q=80",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
    "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&q=80",
];
const VIDEO = "https://www.w3schools.com/html/mov_bbb.mp4";
const id = () => new mongoose.Types.ObjectId();
const now = () => new Date();

async function seed() {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) { console.error("❌ MONGO_URI not set in .env"); process.exit(1); }

    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 15000, family: 4 });
    console.log("✅ Connected to:", MONGO_URI.split("@")[1]?.split("/")[0]);

    const db = mongoose.connection.db;
    const usersCol = db.collection("users");
    const coursesCol = db.collection("courses");
    const lecturesCol = db.collection("lectures");
    const purchasesCol = db.collection("coursepurchases");

    // Clean up seed data
    const SEED_EMAILS = [
        "raj@learnhub.dev", "priya@learnhub.dev", "arjun@learnhub.dev",
        "aisha@student.dev", "rohan@student.dev", "sneha@student.dev",
        "dev@student.dev", "meera@student.dev",
    ];
    const removed = await usersCol.deleteMany({ email: { $in: SEED_EMAILS } });
    console.log(`🗑️  Removed ${removed.deletedCount} old seed users`);

    // Hash password once — shared for all seed users
    const hashedPw = await bcrypt.hash("Password123!", 12);

    // ── Instructors ───────────────────────────────────────────────────────────
    const instructors = [
        { _id: id(), name: "Raj Patel", email: "raj@learnhub.dev", role: "instructor", bio: "Full-stack educator with 8 yrs at FAANG.", avatar: "https://ui-avatars.com/api/?name=Raj+Patel&background=6366f1&color=fff&size=128" },
        { _id: id(), name: "Priya Sharma", email: "priya@learnhub.dev", role: "instructor", bio: "Data scientist & ML researcher. IIT Bombay alum.", avatar: "https://ui-avatars.com/api/?name=Priya+Sharma&background=a855f7&color=fff&size=128" },
        { _id: id(), name: "Arjun Mehta", email: "arjun@learnhub.dev", role: "instructor", bio: "Cloud architect. AWS & GCP certified. 10+ yrs exp.", avatar: "https://ui-avatars.com/api/?name=Arjun+Mehta&background=06b6d4&color=fff&size=128" },
    ];
    const students = [
        { _id: id(), name: "Aisha Khan", email: "aisha@student.dev" },
        { _id: id(), name: "Rohan Verma", email: "rohan@student.dev" },
        { _id: id(), name: "Sneha Gupta", email: "sneha@student.dev" },
        { _id: id(), name: "Dev Joshi", email: "dev@student.dev" },
        { _id: id(), name: "Meera Pillai", email: "meera@student.dev" },
    ];

    const allUsers = [
        ...instructors.map(u => ({ ...u, password: hashedPw, isEmailVerified: true, createdCourses: [], enrolledCourses: [], createdAt: now(), updatedAt: now() })),
        ...students.map(u => ({ ...u, role: "student", password: hashedPw, isEmailVerified: true, createdCourses: [], enrolledCourses: [], createdAt: now(), updatedAt: now() })),
    ];
    await usersCol.insertMany(allUsers);
    console.log(`👨‍🏫 Created ${instructors.length} instructors, 🎓 ${students.length} students`);

    // ── Courses + Lectures ────────────────────────────────────────────────────
    const COURSES_DATA = [
        { title: "The Complete React Developer in 2024", subtitle: "Build powerful web apps with React 19, Redux Toolkit & more", desc: "Master React from scratch to advanced. Build 5 real-world projects.", category: "Web Development", level: "intermediate", price: 999, thumb: UNSPLASH[0], inst: instructors[0]._id },
        { title: "Node.js & Express: Backend Mastery", subtitle: "REST APIs, auth, databases, deployment — production-grade backend", desc: "Zero to hero backend dev with Express.js, JWT auth, MongoDB, Mongoose.", category: "Web Development", level: "intermediate", price: 799, thumb: UNSPLASH[1], inst: instructors[0]._id },
        { title: "Git & GitHub for Developers", subtitle: "Version control, branching, GitHub Actions CI/CD", desc: "Collaborate on pro software projects using Git and GitHub.", category: "DevOps", level: "beginner", price: 399, thumb: UNSPLASH[2], inst: instructors[0]._id },
        { title: "Python for Data Science & Machine Learning", subtitle: "NumPy, Pandas, Scikit-learn, TensorFlow — beginner to practitioner", desc: "Comprehensive Python for data science. Build & deploy real ML models.", category: "Data Science", level: "beginner", price: 1299, thumb: UNSPLASH[3], inst: instructors[1]._id },
        { title: "Deep Learning with PyTorch", subtitle: "Neural networks, CNNs, RNNs, transformers & LLMs from scratch", desc: "Build image classifiers, sequence models, and fine-tune LLMs.", category: "Data Science", level: "advanced", price: 1499, thumb: UNSPLASH[4], inst: instructors[1]._id },
        { title: "SQL & PostgreSQL: Zero to Hero", subtitle: "Relational databases, query optimization, database design", desc: "SQL fundamentals to advanced — indexing, stored procs, Node.js & Python.", category: "Database", level: "beginner", price: 599, thumb: UNSPLASH[5], inst: instructors[1]._id },
        { title: "AWS Cloud: Practitioner to Solutions Architect", subtitle: "EC2, S3, Lambda, RDS, VPC — pass the AWS exam & build cloud infra", desc: "From zero to AWS Solutions Architect. Covers core services to advanced.", category: "Cloud Computing", level: "intermediate", price: 1199, thumb: UNSPLASH[6], inst: instructors[2]._id },
        { title: "Docker & Kubernetes: Container Orchestration", subtitle: "Containerize apps, deploy on K8s, set up CI/CD pipelines", desc: "Docker to Kubernetes. Multi-container apps, Helm, GKE, EKS monitoring.", category: "DevOps", level: "advanced", price: 1099, thumb: UNSPLASH[7], inst: instructors[2]._id },
        { title: "Linux & Bash Scripting Mastery", subtitle: "Command line, shell scripting, system admin for developers", desc: "Master Linux CLI and bash. Automate tasks, manage servers, deploy scripts.", category: "DevOps", level: "beginner", price: 499, thumb: UNSPLASH[8], inst: instructors[2]._id },
    ];

    const courseDocs = [];
    const lectureDocs = [];
    const purchaseDocs = [];

    for (let ci = 0; ci < COURSES_DATA.length; ci++) {
        const c = COURSES_DATA[ci];
        const courseId = id();

        // 3 lectures per course
        const lecIds = [];
        const lecTitles = [
            `Introduction & Setup: ${c.title}`,
            `Core Concepts Deep Dive`,
            `Capstone Project: Build & Deploy`,
        ];
        const lecDurations = [850, 1240, 2100];
        for (let li = 0; li < 3; li++) {
            const lecId = id();
            lectureDocs.push({
                _id: lecId,
                title: lecTitles[li],
                description: li === 0 ? "Course overview, project structure, and environment setup." : li === 1 ? "Deep dive into the core concepts with hands-on exercises." : "Build the full project end-to-end applying everything you've learned.",
                videoUrl: VIDEO,
                publicId: `seed_${ci}_lec_${li}`,
                duration: lecDurations[li],
                isPreview: li === 0,
                order: li + 1,
                status: "published",
                isDeleted: false,
                createdAt: now(),
                updatedAt: now(),
            });
            lecIds.push(lecId);
        }

        // 3 random students enrolled
        const shuffled = [...students].sort(() => 0.5 - Math.random()).slice(0, 3);
        const enrolledIds = shuffled.map(s => s._id);

        courseDocs.push({
            _id: courseId,
            title: c.title,
            subtitle: c.subtitle,
            description: c.desc,
            category: c.category,
            level: c.level,
            price: c.price,
            thumbnail: c.thumb,
            instructor: c.inst,
            lectures: lecIds,
            enrolledStudents: enrolledIds,
            isPublished: true,
            totalLectures: 3,
            totalDuration: 4190,
            createdAt: now(),
            updatedAt: now(),
        });

        // Purchases + enrollments
        for (const stu of shuffled) {
            purchaseDocs.push({
                _id: id(),
                course: courseId,
                user: stu._id,
                amount: c.price,
                currency: "INR",
                status: "completed",
                paymentMethod: "stripe",
                paymentId: `seed_${ci}_${stu._id.toString().slice(-6)}`,
                createdAt: now(),
                updatedAt: now(),
            });
        }
    }

    // Delete old seed courses from these instructors
    const instIds = instructors.map(i => i._id);
    await coursesCol.deleteMany({ instructor: { $in: instIds } });

    await lecturesCol.insertMany(lectureDocs);
    await coursesCol.insertMany(courseDocs);
    await purchasesCol.insertMany(purchaseDocs);

    // Update instructor createdCourses
    for (const course of courseDocs) {
        await usersCol.updateOne({ _id: course.instructor }, { $push: { createdCourses: course._id } });
    }

    // Update student enrolledCourses
    for (const p of purchaseDocs) {
        await usersCol.updateOne({ _id: p.user }, { $addToSet: { enrolledCourses: { course: p.course, enrolledAt: now() } } });
    }

    console.log(`📚 Created ${courseDocs.length} courses, ${lectureDocs.length} lectures, ${purchaseDocs.length} purchases`);
    console.log("\n═══════════════════════════════════════════════");
    console.log("🌱 Seed complete! Test credentials (pw: Password123!):");
    console.log("  📖 raj@learnhub.dev    — Instructor (Web Dev)");
    console.log("  📖 priya@learnhub.dev  — Instructor (Data Science)");
    console.log("  📖 arjun@learnhub.dev  — Instructor (Cloud/DevOps)");
    console.log("  🎓 aisha@student.dev   — Student");
    console.log("═══════════════════════════════════════════════\n");

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch(err => { console.error("❌ Seed failed:", err); process.exit(1); });
