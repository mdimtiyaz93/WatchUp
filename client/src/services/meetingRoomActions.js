export const createMeetingRoomActions = ({
  socketRef,
  meetingId,
  userName,
  isHost,
  setActionRequests,
  setReactionMenu,
  setChat,
  setPeople,
  setUnreadMessages,
  signOut,
  navigate,
}) => {
  const requestAction = (action, data = {}) => {
    socketRef.current?.emit("request_action", {
      roomId: meetingId,
      action,
      data,
    });
  };

  const approveRequest = (request) => {
    if (!isHost) return;

    socketRef.current?.emit("approve_request", {
      roomId: meetingId,
      requestId: request.requestId,
      userId: request.userId,
      action: request.action,
      data: request.data,
      approved: true,
    });

    setActionRequests((prev) =>
      prev.filter((item) => item.requestId !== request.requestId),
    );
  };

  const rejectRequest = (request) => {
    if (!isHost) return;

    socketRef.current?.emit("approve_request", {
      roomId: meetingId,
      requestId: request.requestId,
      userId: request.userId,
      action: request.action,
      data: request.data,
      approved: false,
    });

    setActionRequests((prev) =>
      prev.filter((item) => item.requestId !== request.requestId),
    );
  };

  const sendMessage = (e, message) => {
    e.preventDefault();

    if (!message.trim()) return;

    socketRef.current?.emit("chat-message", {
      roomId: meetingId,
      username: userName,
      message: message.trim(),
    });
  };

  const sendReaction = (reaction) => {
    if (!reaction) return;

    socketRef.current?.emit("reaction", {
      roomId: meetingId,
      username: userName,
      reaction,
    });

    setReactionMenu(false);
  };

  const changeRole = (participantId, role) => {
    if (!isHost) return;

    socketRef.current?.emit("assign_role", {
      roomId: meetingId,
      userId: participantId,
      role,
    });
  };

  const removeParticipant = (participantId) => {
    if (!isHost) return;

    socketRef.current?.emit("remove_participant", {
      roomId: meetingId,
      userId: participantId,
    });
  };

  const transferHost = (participantId) => {
    if (!isHost) return;

    socketRef.current?.emit("transfer_host", {
      roomId: meetingId,
      userId: participantId,
    });
  };

  const leaveRoom = async () => {
    socketRef.current?.emit("leave_room", {
      roomId: meetingId,
    });

    socketRef.current?.disconnect();

    await signOut();

    navigate("/login");
  };

  const toggleChat = () => {
    setChat((prev) => {
      const next = !prev;

      if (next) {
        setUnreadMessages(0);
      }

      return next;
    });

    setPeople(false);
    setReactionMenu(false);
  };

  const togglePeople = () => {
    setPeople((prev) => !prev);

    setChat(false);
    setReactionMenu(false);
  };

  const toggleReaction = () => {
    setReactionMenu((prev) => !prev);

    setChat(false);
    setPeople(false);
  };

  return {
    requestAction,
    approveRequest,
    rejectRequest,
    sendMessage,
    sendReaction,
    changeRole,
    removeParticipant,
    transferHost,
    leaveRoom,
    toggleChat,
    togglePeople,
    toggleReaction,
  };
};
