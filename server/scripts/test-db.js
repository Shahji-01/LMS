import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const MONGO_URI = process.env.MONGO_URI;

console.log("Testing connection to:", MONGO_URI.replace(/:([^@]+)@/, ":****@")); // Hide password

try {
  await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  });
  console.log("✅ Success! MongoDB is reachable.");
  await mongoose.disconnect();
  process.exit(0);
} catch (err) {
  console.error("❌ Connection failed!");
  console.error("Error Code:", err.code);
  console.error("Error Message:", err.message);
  process.exit(1);
}
