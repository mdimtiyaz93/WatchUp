import { io } from "socket.io-client";

const SOCKET_URL = "https://watchup-rs17.onrender.com";
export const createMeetingConnection = () => {
  return io(SOCKET_URL);
};

export const joinMeeting = (socket, meetingId, userName, userId) => {
  socket.emit("join_room", {
    roomId: meetingId,
    username: userName,
    userId,
  });
};

export const leaveMeeting = (socket, meetingId) => {
  socket.emit("leave_room", {
    roomId: meetingId,
  });

  socket.disconnect();
};
