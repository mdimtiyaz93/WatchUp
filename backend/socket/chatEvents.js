const { getParticipant } = require("./helpers");

const registerChatEvents = (io, socket, rooms) => {
  socket.on("chat-message", ({ roomId, username, message }) => {
    const user = getParticipant(rooms, roomId, socket.id);

    if (!user) return;

    if (!message?.trim()) return;

    io.to(roomId).emit("chat-message", {
      id: Date.now() + Math.random(),
      username: username || user.name,
      message: message.trim(),
    });
  });
};

module.exports = registerChatEvents;
