const { getParticipant, saveRoom } = require("./helpers");

const registerRequestEvents = (io, socket, rooms) => {
  socket.on("request_action", ({ roomId, action, data }) => {
    try {
      const user = getParticipant(rooms, roomId, socket.id);

      if (!user) return;

      if (user.role !== "Participant" && user.role !== "Viewer") {
        return;
      }

      const room = rooms[roomId];

      if (!room) return;

      const host = room.participants.find(
        (participant) => participant.role === "Host",
      );

      if (!host) return;

      const allowedActions = ["play", "pause", "seek", "change_video"];

      if (!allowedActions.includes(action)) {
        return;
      }

      const requestId = `${socket.id}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;

      console.log(`REQUEST: ${user.name} -> Host | ${action}`);

      io.to(host.id).emit("action_request", {
        requestId,
        userId: socket.id,
        username: user.name,
        action,
        data: data || {},
      });
    } catch (error) {
      console.error("Request action error:", error.message);
    }
  });

  socket.on(
    "approve_request",
    async ({ roomId, requestId, userId, action, data, approved = true }) => {
      try {
        const host = getParticipant(rooms, roomId, socket.id);

        if (!host || host.role !== "Host") {
          return;
        }

        const room = rooms[roomId];

        if (!room) return;

        const target = getParticipant(rooms, roomId, userId);

        if (!target) return;

        if (target.role !== "Participant" && target.role !== "Viewer") {
          return;
        }

        if (approved === false) {
          io.to(userId).emit("request_rejected", {
            requestId,
            action,
          });

          console.log(`Request rejected: ${action}`);

          return;
        }

        const allowedActions = ["play", "pause", "seek", "change_video"];

        if (!allowedActions.includes(action)) {
          return;
        }

        if (action === "change_video") {
          const requestedVideoId = data?.videoId;

          if (
            typeof requestedVideoId !== "string" ||
            !requestedVideoId.trim()
          ) {
            return;
          }

          room.videoId = requestedVideoId.trim();
          room.currentTime = 0;
          room.playState = "paused";

          await saveRoom(rooms, room);

          io.to(roomId).emit("change_video", {
            videoId: room.videoId,
          });
        }

        if (action === "play") {
          room.playState = "playing";

          const currentTime = Number(data?.currentTime);

          if (!Number.isNaN(currentTime) && currentTime >= 0) {
            room.currentTime = currentTime;
          }

          await saveRoom(rooms, room);

          io.to(roomId).emit("play", {
            currentTime: room.currentTime,
          });
        }

        if (action === "pause") {
          room.playState = "paused";

          const currentTime = Number(data?.currentTime);

          if (!Number.isNaN(currentTime) && currentTime >= 0) {
            room.currentTime = currentTime;
          }

          await saveRoom(rooms, room);

          io.to(roomId).emit("pause", {
            currentTime: room.currentTime,
          });
        }

        if (action === "seek") {
          const time = Number(data?.time);

          if (Number.isNaN(time) || time < 0) {
            return;
          }

          room.currentTime = time;

          await saveRoom(rooms, room);

          io.to(roomId).emit("seek", {
            time,
          });
        }

        io.to(userId).emit("request_approved", {
          requestId,
          action,
        });

        console.log(`Request approved: ${action}`);
      } catch (error) {
        console.error("Approve request error:", error.message);
      }
    },
  );
};

module.exports = registerRequestEvents;
