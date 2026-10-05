const registerRoomEvents = require("./roomEvents");
const registerVideoEvents = require("./videoEvents");
const registerRequestEvents = require("./requestEvents");
const registerParticipantEvents = require("./participantEvents");
const registerChatEvents = require("./chatEvents");
const registerReactionEvents = require("./reactionEvents");

const registerSocketHandlers = (io, rooms) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    registerRoomEvents(io, socket, rooms);
    registerVideoEvents(io, socket, rooms);
    registerRequestEvents(io, socket, rooms);
    registerParticipantEvents(io, socket, rooms);
    registerChatEvents(io, socket, rooms);
    registerReactionEvents(io, socket, rooms);
  });
};

module.exports = registerSocketHandlers;
