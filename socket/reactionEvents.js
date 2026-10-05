const { getParticipant } = require("./helpers");

const registerReactionEvents = (io, socket, rooms) => {
  socket.on("reaction", ({ roomId, username, reaction }) => {
    const user = getParticipant(rooms, roomId, socket.id);

    if (!user) return;

    if (!reaction) return;

    io.to(roomId).emit("reaction", {
      id: Date.now() + Math.random(),
      username: username || user.name,
      reaction,
    });
  });
};

module.exports = registerReactionEvents;
