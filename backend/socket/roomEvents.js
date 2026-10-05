const Room = require("../models/Room");

const { saveRoom, removeUserFromRoom } = require("./helpers");

const ROOM_EXPIRY = 2 * 60 * 60 * 1000;

const registerRoomEvents = (io, socket, rooms) => {
  socket.on("join_room", async ({ roomId, username, userId }) => {
    try {
      if (!roomId) return;

      let room = rooms[roomId];

      if (room) {
        const createdAt = new Date(room.createdAt).getTime();

        if (!createdAt || Date.now() - createdAt >= ROOM_EXPIRY) {
          delete rooms[roomId];

          socket.emit("room_expired", {
            message: "Room expired.",
          });

          return;
        }
      }

      if (!room) {
        const dbRoom = await Room.findOne({ roomId });

        if (dbRoom) {
          const createdAt = new Date(dbRoom.createdAt).getTime();

          if (!createdAt || Date.now() - createdAt >= ROOM_EXPIRY) {
            socket.emit("room_expired", {
              message: "Room expired.",
            });

            return;
          }

          room = dbRoom.toObject();

          room.participants = room.participants.filter((participant) =>
            io.sockets.sockets.has(participant.id),
          );

          rooms[roomId] = room;
        }
      }

      if (!room) {
        room = {
          roomId,
          createdBy: userId || "",
          hostId: socket.id,
          videoId: "",
          currentTime: 0,
          playState: "paused",
          participants: [],
          createdAt: new Date(),
        };

        rooms[roomId] = room;
      }

      socket.join(roomId);

      socket.data.roomId = roomId;
      socket.data.username = username || "User";
      socket.data.userId = userId || "";

      room.participants = room.participants.filter((participant) =>
        io.sockets.sockets.has(participant.id),
      );

      const existingParticipant = room.participants.find(
        (participant) =>
          participant.userId && userId && participant.userId === userId,
      );

      if (existingParticipant) {
        existingParticipant.id = socket.id;
        existingParticipant.name = username || "User";

        if (existingParticipant.userId === room.createdBy) {
          existingParticipant.role = "Host";
          room.hostId = socket.id;
        }

        await saveRoom(rooms, room);

        socket.emit("participants", room.participants);

        socket.emit("sync_state", {
          videoId: room.videoId,
          currentTime: room.currentTime,
          playState: room.playState,
        });

        io.to(roomId).emit("participants", room.participants);

        return;
      }

      let role = "Participant";

      const creatorParticipant = room.participants.find(
        (participant) => participant.userId === room.createdBy,
      );

      if (creatorParticipant) {
        creatorParticipant.role = "Host";
        room.hostId = creatorParticipant.id;
        role = "Participant";
      } else if (room.participants.length === 0) {
        role = "Host";
        room.hostId = socket.id;

        if (!room.createdBy) {
          room.createdBy = userId || "";
        }
      }

      const participant = {
        id: socket.id,
        userId: userId || "",
        name: username || "User",
        role,
      };

      room.participants.push(participant);

      await saveRoom(rooms, room);

      console.log(`${participant.name} joined room ${roomId} as ${role}`);

      console.log("Room created by:", room.createdBy);
      console.log("Current host:", room.hostId);

      socket.emit("sync_state", {
        videoId: room.videoId,
        currentTime: room.currentTime,
        playState: room.playState,
      });

      socket.to(roomId).emit("user_joined", {
        username: participant.name,
        userId: participant.id,
        role: participant.role,
        participants: room.participants,
      });

      io.to(roomId).emit("participants", room.participants);
    } catch (error) {
      console.error("Join room error:", error.message);
    }
  });

  socket.on("leave_room", async ({ roomId }) => {
    try {
      if (!roomId) return;

      await removeUserFromRoom(io, rooms, roomId, socket.id);

      socket.leave(roomId);

      socket.data.roomId = null;
    } catch (error) {
      console.error("Leave room error:", error.message);
    }
  });

  socket.on("remove_participant", async ({ roomId, participantId }) => {
    try {
      if (!roomId || !participantId) return;

      const room = rooms[roomId];

      if (!room) return;

      const remover = room.participants.find(
        (participant) => participant.id === socket.id,
      );

      if (!remover) return;

      if (remover.role !== "Host" && remover.role !== "Moderator") {
        return;
      }

      const removedUser = room.participants.find(
        (participant) => participant.id === participantId,
      );

      if (!removedUser) return;

      if (removedUser.role === "Host") {
        return;
      }

      room.participants = room.participants.filter(
        (participant) => participant.id !== participantId,
      );

      await saveRoom(rooms, room);

      io.to(participantId).emit("participant_removed", {
        message: "You were removed from the room.",
      });

      io.to(roomId).emit("user_removed", {
        username: removedUser.name,
        userId: removedUser.id,
        participants: room.participants,
      });

      io.to(roomId).emit("participants", room.participants);

      const removedSocket = io.sockets.sockets.get(participantId);

      if (removedSocket) {
        removedSocket.leave(roomId);
        removedSocket.data.roomId = null;
      }

      console.log(`${removedUser.name} was removed from room ${roomId}`);
    } catch (error) {
      console.error("Remove participant error:", error.message);
    }
  });

  socket.on("disconnect", async () => {
    console.log("User disconnected:", socket.id);

    for (const roomId in rooms) {
      const user = getParticipantFromRoom(rooms, roomId, socket.id);

      if (user) {
        await removeUserFromRoom(io, rooms, roomId, socket.id);
      }
    }
  });
};

function getParticipantFromRoom(rooms, roomId, socketId) {
  return rooms[roomId]?.participants.find(
    (participant) => participant.id === socketId,
  );
}

module.exports = registerRoomEvents;
