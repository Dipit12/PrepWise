import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: [true, "Username already taken"],
  },
  email: {
    type: String,
    required: true,
    unique: [true, "Email already taken"],
  },
  password: {
    type: String,
    required: true,
  },
});

const User = mongoose.model("User", userSchema);

export default User;
