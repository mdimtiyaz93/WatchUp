const express = require("express");
const Room = require("../models/Room");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const userId = req.query.userId;

    if (!userId) {
      return res.json([]);
    }

    const rooms = await Room.find({
      createdBy: userId,
    })
      .sort({ createdAt: -1 })
      .select(
        "roomId createdBy hostId participants createdAt updatedAt videoId currentTime playState",
      );

    res.json(rooms);
  } catch (error) {
    console.error("Get rooms error:", error.message);

    res.status(500).json({
      message: "Failed to fetch sessions",
    });
  }
});

module.exports = router;
