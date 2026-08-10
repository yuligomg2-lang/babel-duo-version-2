import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },

  password: {
    type: String,
  },

  firebaseUid: {
    type: String,
    unique: true,
    sparse: true,
  },

  photoURL: {
    type: String,
  },

  language: {
    type: String,
    default: "es",
  },

  interests: {
    type: [String],
    default: [],
  },

  isGuest: {
    type: Boolean,
    default: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  expiresAt: {
    type: Date,
  },
});

export default mongoose.model("User", userSchema);
