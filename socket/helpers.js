const Room = require("../models/Room");

function getParticipant(rooms, roomId, socketId) {
  return rooms[roomId]?.participants.find(
    (participant) => participant.id === socketId,
  );
}

function canControlVideo(participant) {
  return (
    participant &&
    (participant.role === "Host" || participant.role === "Moderator")
  );
}

async function saveRoom(rooms, room) {
  try {
    rooms[room.roomId] = room;

    const savedRoom = await Room.findOneAndUpdate(
      {
        roomId: room.roomId,
      },
      {
        $set: {
          createdBy: room.createdBy || "",
          hostId: room.hostId || "",
          videoId: room.videoId,
          currentTime: room.currentTime,
          playState: room.playState,
          participants: room.participants,
        },
        $setOnInsert: {
          roomId: room.roomId,
          createdAt: room.createdAt || new Date(),
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    );

    if (savedRoom?.createdAt) {
      room.createdAt = savedRoom.createdAt;
    }

    if (savedRoom?.createdBy) {
      room.createdBy = savedRoom.createdBy;
    }

    rooms[room.roomId] = room;

    console.log("Room saved to MongoDB:", room.roomId);
    console.log("Room created by:", room.createdBy);
  } catch (error) {
    console.error("Save room error:", error);
    throw error;
  }
}

async function removeUserFromRoom(io, rooms, roomId, socketId) {
  const room = rooms[roomId];

  if (!room) return;

  const leavingUser = room.participants.find(
    (participant) => participant.id === socketId,
  );

  if (!leavingUser) return;

  room.participants = room.participants.filter(
    (participant) => participant.id !== socketId,
  );

  if (leavingUser.role === "Host") {
    if (room.participants.length > 0) {
      const newHost = room.participants[0];

      newHost.role = "Host";

      room.hostId = newHost.id;

      io.to(roomId).emit("role_assigned", {
        userId: newHost.id,
        username: newHost.name,
        role: "Host",
        participants: room.participants,
      });
    } else {
      room.hostId = "";
    }
  }

  await saveRoom(rooms, room);

  io.to(roomId).emit("user_left", {
    username: leavingUser.name,
    userId: leavingUser.id,
    participants: room.participants,
  });

  io.to(roomId).emit("participants", room.participants);

  console.log(`${leavingUser.name} left room: ${roomId}`);
}

module.exports = {
  getParticipant,
  canControlVideo,
  saveRoom,
  removeUserFromRoom,
};
