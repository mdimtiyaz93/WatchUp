const { getParticipant, canControlVideo, saveRoom } = require("./helpers");

const registerVideoEvents = (io, socket, rooms) => {
  socket.on("play", async ({ roomId, currentTime }) => {
    try {
      const user = getParticipant(rooms, roomId, socket.id);

      if (!canControlVideo(user)) {
        console.log(`PLAY BLOCKED: ${socket.id}`);
        return;
      }

      const room = rooms[roomId];

      if (!room) return;

      room.playState = "playing";

      const time = Number(currentTime);

      if (!Number.isNaN(time) && time >= 0) {
        room.currentTime = time;
      }

      await saveRoom(rooms, room);

      console.log(`PLAY: ${user.name} in ${roomId}`);

      io.to(roomId).emit("play", {
        currentTime: room.currentTime,
      });
    } catch (error) {
      console.error("Play error:", error.message);
    }
  });

  socket.on("pause", async ({ roomId, currentTime }) => {
    try {
      const user = getParticipant(rooms, roomId, socket.id);

      if (!canControlVideo(user)) {
        console.log(`PAUSE BLOCKED: ${socket.id}`);
        return;
      }

      const room = rooms[roomId];

      if (!room) return;

      room.playState = "paused";

      const time = Number(currentTime);

      if (!Number.isNaN(time) && time >= 0) {
        room.currentTime = time;
      }

      await saveRoom(rooms, room);

      console.log(`PAUSE: ${user.name} in ${roomId}`);

      io.to(roomId).emit("pause", {
        currentTime: room.currentTime,
      });
    } catch (error) {
      console.error("Pause error:", error.message);
    }
  });

  socket.on("seek", async ({ roomId, time }) => {
    try {
      const user = getParticipant(rooms, roomId, socket.id);

      if (!canControlVideo(user)) {
        return;
      }

      const room = rooms[roomId];

      if (!room) return;

      const newTime = Number(time);

      if (Number.isNaN(newTime) || newTime < 0) {
        return;
      }

      room.currentTime = newTime;

      await saveRoom(rooms, room);

      io.to(roomId).emit("seek", {
        time: newTime,
      });
    } catch (error) {
      console.error("Seek error:", error.message);
    }
  });

  socket.on("change_video", async ({ roomId, videoId }) => {
    try {
      const user = getParticipant(rooms, roomId, socket.id);

      if (!canControlVideo(user)) {
        return;
      }

      if (typeof videoId !== "string" || !videoId.trim()) {
        return;
      }

      const room = rooms[roomId];

      if (!room) return;

      room.videoId = videoId.trim();
      room.currentTime = 0;
      room.playState = "paused";

      await saveRoom(rooms, room);

      console.log(`VIDEO CHANGE: ${user.name} -> ${room.videoId}`);

      io.to(roomId).emit("change_video", {
        videoId: room.videoId,
      });
    } catch (error) {
      console.error("Change video error:", error.message);
    }
  });

  socket.on("sync_request", ({ roomId }) => {
    const user = getParticipant(rooms, roomId, socket.id);

    if (!user) return;

    const room = rooms[roomId];

    if (!room) return;

    const host = room.participants.find(
      (participant) => participant.role === "Host",
    );

    if (!host) return;

    io.to(host.id).emit("sync_request", {
      requesterId: socket.id,
    });
  });

  socket.on(
    "sync_response",
    ({ roomId, requesterId, videoId, currentTime, playState }) => {
      const sender = getParticipant(rooms, roomId, socket.id);

      if (!sender || sender.role !== "Host") {
        return;
      }

      const target = getParticipant(rooms, roomId, requesterId);

      if (!target) return;

      io.to(requesterId).emit("sync_state", {
        videoId,
        currentTime,
        playState,
      });
    },
  );
};

module.exports = registerVideoEvents;
