const { getParticipant, saveRoom } = require("./helpers");

const registerParticipantEvents = (io, socket, rooms) => {
  // =========================
  // ASSIGN ROLE
  // =========================
  socket.on("assign_role", async ({ roomId, userId, role }) => {
    try {
      if (!roomId || !userId || !role) return;

      const room = rooms[roomId];

      if (!room) return;

      const sender = getParticipant(rooms, roomId, socket.id);

      // Only Host can assign roles
      if (!sender || sender.role !== "Host") {
        return;
      }

      if (role !== "Moderator" && role !== "Participant" && role !== "Viewer") {
        return;
      }

      const target = getParticipant(rooms, roomId, userId);

      if (!target) return;

      // Host cannot change his own role
      if (target.id === sender.id) {
        return;
      }

      // Host role cannot be assigned manually
      if (target.role === "Host") {
        return;
      }

      target.role = role;

      await saveRoom(rooms, room);

      io.to(roomId).emit("role_assigned", {
        userId: target.id,
        username: target.name,
        role: target.role,
        participants: room.participants,
      });

      io.to(roomId).emit("participants", room.participants);

      console.log(`${target.name} is now ${role}`);
    } catch (error) {
      console.error("Assign role error:", error.message);
    }
  });

  // =========================
  // REMOVE PARTICIPANT
  // =========================
  socket.on("remove_participant", async ({ roomId, userId }) => {
    try {
      if (!roomId || !userId) return;

      const room = rooms[roomId];

      if (!room) return;

      const sender = getParticipant(rooms, roomId, socket.id);

      // Only Host can remove
      if (!sender || sender.role !== "Host") {
        return;
      }

      const target = getParticipant(rooms, roomId, userId);

      if (!target) return;

      // Host cannot remove himself
      if (target.role === "Host") {
        return;
      }

      // Remove participant from room
      room.participants = room.participants.filter(
        (participant) => participant.id !== userId,
      );

      await saveRoom(rooms, room);

      const targetSocket = io.sockets.sockets.get(userId);

      // Send removal event ONLY to removed user
      if (targetSocket) {
        targetSocket.emit("participant_removed", {
          userId: userId,
          username: target.name,
        });

        targetSocket.leave(roomId);

        targetSocket.data.roomId = null;
      }

      // Update remaining participants
      io.to(roomId).emit("participants", room.participants);

      // IMPORTANT:
      // Removed user is NOT a user who left.
      // Therefore use user_removed, NOT user_left.
      io.to(roomId).emit("user_removed", {
        username: target.name,
        userId: target.id,
        participants: room.participants,
      });

      console.log(`${target.name} was removed from room ${roomId}`);
    } catch (error) {
      console.error("Remove participant error:", error.message);
    }
  });

  // =========================
  // TRANSFER HOST
  // =========================
  socket.on("transfer_host", async ({ roomId, userId }) => {
    try {
      if (!roomId || !userId) return;

      const room = rooms[roomId];

      if (!room) return;

      const sender = getParticipant(rooms, roomId, socket.id);

      // Only current Host can transfer
      if (!sender || sender.role !== "Host") {
        return;
      }

      const target = getParticipant(rooms, roomId, userId);

      if (!target) return;

      if (target.id === sender.id) {
        return;
      }

      // Old host becomes Participant
      sender.role = "Participant";

      // New user becomes Host
      target.role = "Host";

      room.hostId = target.id;

      await saveRoom(rooms, room);

      io.to(roomId).emit("role_assigned", {
        userId: sender.id,
        username: sender.name,
        role: sender.role,
        participants: room.participants,
      });

      io.to(roomId).emit("role_assigned", {
        userId: target.id,
        username: target.name,
        role: target.role,
        participants: room.participants,
      });

      io.to(roomId).emit("participants", room.participants);

      console.log(`Host transferred from ${sender.name} to ${target.name}`);
    } catch (error) {
      console.error("Transfer host error:", error.message);
    }
  });
};

module.exports = registerParticipantEvents;
