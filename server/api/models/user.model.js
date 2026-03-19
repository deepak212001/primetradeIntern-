import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateToken = function () {
  const secret = process.env.JWT_SECRET || process.env.TOKEN_SECRET;
  const expiresIn = process.env.JWT_EXPIRY || process.env.TOKEN_EXPIRY || "1d";
  return jwt.sign({ _id: this._id, role: this.role }, secret, { expiresIn });
};

userSchema.methods.generateRefreshToken = function () {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || process.env.TOKEN_SECRET;
  return jwt.sign({ _id: this._id }, secret, { expiresIn: "7d" });
};

const User = mongoose.model("User", userSchema);
export default User;
