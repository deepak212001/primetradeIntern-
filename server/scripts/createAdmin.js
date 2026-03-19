/**
 * Script to promote a user to admin role.
 * Usage: node scripts/createAdmin.js <email>
 * Example: node scripts/createAdmin.js admin@example.com
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

import User from "../api/models/user.model.js";

const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/createAdmin.js <email>");
  process.exit(1);
}

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { role: "admin" },
    { new: true }
  );
  if (!user) {
    console.error(`User with email ${email} not found.`);
    process.exit(1);
  }
  console.log(`User ${user.email} is now an admin.`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
