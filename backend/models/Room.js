const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },

    userId: {
      type: String,
      default: "",
    },

    name: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["Host", "Moderator", "Participant", "Viewer"],
      default: "Participant",
    },
  },
  {
    _id: false,
  },
);

const roomSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
    },

    createdBy: {
      type: String,
      default: "",
    },

    hostId: {
      type: String,
      default: "",
    },

    videoId: {
      type: String,
      default: "",
    },

    currentTime: {
      type: Number,
      default: 0,
    },

    playState: {
      type: String,
      enum: ["playing", "paused"],
      default: "paused",
    },

    participants: {
      type: [participantSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Room", roomSchema);
