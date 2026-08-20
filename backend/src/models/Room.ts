import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  description: {
    type: String,
    default: "",
    trim: true,
  },

  theme: {
    type: String,
    default: "General",
  },

  languages: {
    type: [String],
    default: ["es"],
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  isPrivate: {
    type: Boolean,
    default: false,
  },

  inviteCode: {
    type: String,
    unique: true,
    sparse: true,
    uppercase: true,
    trim: true,
  },

  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  expiresAt: {
    type: Date,
  },
});

export default mongoose.model("Room", roomSchema);
