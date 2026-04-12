/**
 * CLI Script — Creates an admin user
 * Usage: node scripts/create-admin.js
 * Or:    ADMIN_EMAIL=foo@bar.com ADMIN_PASS=secret node scripts/create-admin.js
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import readline from "readline";

dotenv.config({ path: "../.env" });

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/lms";

const ask = (prompt) =>
    new Promise((resolve) => {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        rl.question(prompt, (answer) => { rl.close(); resolve(answer.trim()); });
    });

const run = async () => {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    const userSchema = new mongoose.Schema({
        name: String, email: { type: String, unique: true }, password: String,
        role: String, isEmailVerified: Boolean, isDeleted: Boolean,
    }, { timestamps: true });
    const User = mongoose.models.User || mongoose.model("User", userSchema);

    const name = process.env.ADMIN_NAME || await ask("Admin name:   ");
    const email = process.env.ADMIN_EMAIL || await ask("Admin email:  ");
    const pass = process.env.ADMIN_PASS || await ask("Admin password: ");

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
        if (existing.role !== "admin") {
            await User.findOneAndUpdate({ email }, { role: "admin" });
            console.log(`✅ User ${email} promoted to admin.`);
        } else {
            console.log(`ℹ️  ${email} is already an admin.`);
        }
    } else {
        const hashed = await bcrypt.hash(pass, 12);
        await User.create({
            name, email: email.toLowerCase(), password: hashed,
            role: "admin", isEmailVerified: true, isDeleted: false,
        });
        console.log(`\n✅ Admin created: ${email}`);
    }

    await mongoose.disconnect();
    process.exit(0);
};

run().catch((err) => {
    console.error("❌ Error:", err.message);
    process.exit(1);
});
