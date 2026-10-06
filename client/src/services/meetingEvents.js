export const registerMeetingEvents = ({
  socket,
  meetingId,
  navigate,
  playerRef,
  videoIdRef,
  isPlayingRef,
  remoteActionRef,
  chatRef,
  makeParticipants,
  setParticipants,
  setVideoId,
  setVideoUrl,
  setIsPlaying,
  setMessages,
  setUnreadMessages,
  setReactions,
  setActionRequests,
}) => {
  const removedUserIds = new Set();

  const handleParticipants = (list) => {
    setParticipants(makeParticipants(list, socket.id));
  };

  const handleSyncState = ({ playState, currentTime, videoId }) => {
    if (videoId) {
      setVideoId(videoId);
      videoIdRef.current = videoId;
    }

    setIsPlaying(playState === "playing");

    const applySync = () => {
      if (!playerRef.current) {
        setTimeout(applySync, 100);
        return;
      }

      remoteActionRef.current = true;

      if (typeof currentTime === "number") {
        playerRef.current.seek(currentTime);
      }

      if (playState === "playing") {
        playerRef.current.play();
      } else {
        playerRef.current.pause();
      }

      setTimeout(() => {
        remoteActionRef.current = false;
      }, 1500);
    };

    setTimeout(applySync, 700);
  };

  const handleSyncRequest = ({ requesterId }) => {
    const time = playerRef.current?.getCurrentTime?.() || 0;

    socket.emit("sync_response", {
      roomId: meetingId,
      requesterId,
      videoId: videoIdRef.current,
      currentTime: time,
      playState: isPlayingRef.current ? "playing" : "paused",
    });
  };

  const handleSyncResponse = (data) => {
    if (!data) return;

    const { videoId, currentTime, playState } = data;

    remoteActionRef.current = true;

    if (videoId) {
      setVideoId(videoId);
      videoIdRef.current = videoId;
    }

    setIsPlaying(playState === "playing");

    const applySync = () => {
      if (!playerRef.current) {
        setTimeout(applySync, 100);
        return;
      }

      if (typeof currentTime === "number") {
        playerRef.current.seek(currentTime);
      }

      if (playState === "playing") {
        playerRef.current.play();
      } else {
        playerRef.current.pause();
      }

      setTimeout(() => {
        remoteActionRef.current = false;
      }, 1500);
    };

    setTimeout(applySync, 700);
  };

  const handleUserJoined = (data) => {
    if (data?.participants) {
      setParticipants(makeParticipants(data.participants, socket.id));
    }

    if (data?.username && data?.userId !== socket.id) {
      import("react-hot-toast").then(({ default: toast }) => {
        toast.success(`${data.username} Joined`);
      });
    }
  };

  const handleUserLeft = (data) => {
    if (!data?.userId) return;

    if (removedUserIds.has(data.userId)) {
      removedUserIds.delete(data.userId);
      return;
    }

    if (data?.participants) {
      setParticipants(makeParticipants(data.participants, socket.id));
    }

    if (data?.username && data?.userId !== socket.id) {
      import("react-hot-toast").then(({ default: toast }) => {
        toast.error(`${data.username} Left`);
      });
    }
  };

  const handleRoleAssigned = (data) => {
    if (data?.participants) {
      setParticipants(makeParticipants(data.participants, socket.id));
    }
  };

  const handleParticipantRemoved = (data) => {
    if (!data?.userId) return;

    removedUserIds.add(data.userId);

    if (data.userId === socket.id) {
      import("react-hot-toast").then(({ default: toast }) => {
        toast.error("You were removed from the meeting.");
      });

      socket.disconnect();

      navigate("/dashboard", {
        replace: true,
      });

      return;
    }

    if (data.participants) {
      setParticipants(makeParticipants(data.participants, socket.id));
    }

    import("react-hot-toast").then(({ default: toast }) => {
      toast.error(`${data.username || "User"} was removed from the meeting.`);
    });
  };

  const handlePlay = ({ currentTime } = {}) => {
    remoteActionRef.current = true;

    if (typeof currentTime === "number") {
      playerRef.current?.seek(currentTime);
    }

    setTimeout(() => {
      playerRef.current?.play();
    }, 100);

    setIsPlaying(true);

    setTimeout(() => {
      remoteActionRef.current = false;
    }, 1500);
  };

  const handlePause = ({ currentTime } = {}) => {
    remoteActionRef.current = true;

    if (typeof currentTime === "number") {
      playerRef.current?.seek(currentTime);
    }

    setTimeout(() => {
      playerRef.current?.pause();
    }, 100);

    setIsPlaying(false);

    setTimeout(() => {
      remoteActionRef.current = false;
    }, 1500);
  };

  const handleSeek = ({ time } = {}) => {
    if (typeof time !== "number") return;

    remoteActionRef.current = true;

    playerRef.current?.seek(time);

    setTimeout(() => {
      remoteActionRef.current = false;
    }, 1000);
  };

  const handleChangeVideo = ({ videoId } = {}) => {
    if (!videoId) return;

    remoteActionRef.current = true;

    setVideoId(videoId);
    videoIdRef.current = videoId;
    setVideoUrl("");
    setIsPlaying(false);

    setTimeout(() => {
      remoteActionRef.current = false;
    }, 1500);
  };

  const handleChatMessage = (data) => {
    setMessages((prev) => [...prev, data]);

    if (!chatRef.current) {
      setUnreadMessages((prev) => prev + 1);
    }
  };

  const handleReaction = (data) => {
    setReactions((prev) => [...prev, data]);

    setTimeout(() => {
      setReactions((prev) =>
        prev.filter((reaction) => reaction.id !== data.id),
      );
    }, 3000);
  };

  const handleActionRequest = (data) => {
    setActionRequests((prev) => {
      const exists = prev.some((item) => item.requestId === data.requestId);

      if (exists) return prev;

      return [...prev, data];
    });
  };

  const handleRequestApproved = (data) => {
    let actionName = data.action;

    if (data.action === "change_video") {
      actionName = "video change";
    }

    import("react-hot-toast").then(({ default: toast }) => {
      toast.success(
        `${
          actionName.charAt(0).toUpperCase() + actionName.slice(1)
        } request approved`,
      );
    });
  };

  const handleRequestRejected = (data) => {
    let actionName = data.action;

    if (data.action === "change_video") {
      actionName = "video change";
    }

    import("react-hot-toast").then(({ default: toast }) => {
      toast.error(
        `${
          actionName.charAt(0).toUpperCase() + actionName.slice(1)
        } request rejected`,
      );
    });
  };

  socket.on("participants", handleParticipants);
  socket.on("sync_state", handleSyncState);
  socket.on("sync_request", handleSyncRequest);
  socket.on("sync_response", handleSyncResponse);

  socket.on("user_joined", handleUserJoined);
  socket.on("user_left", handleUserLeft);
  socket.on("role_assigned", handleRoleAssigned);
  socket.on("participant_removed", handleParticipantRemoved);

  socket.on("play", handlePlay);
  socket.on("pause", handlePause);
  socket.on("seek", handleSeek);
  socket.on("change_video", handleChangeVideo);

  socket.on("chat-message", handleChatMessage);
  socket.on("reaction", handleReaction);

  socket.on("action_request", handleActionRequest);
  socket.on("request_approved", handleRequestApproved);
  socket.on("request_rejected", handleRequestRejected);

  return () => {
    socket.off("participants", handleParticipants);
    socket.off("sync_state", handleSyncState);
    socket.off("sync_request", handleSyncRequest);
    socket.off("sync_response", handleSyncResponse);

    socket.off("user_joined", handleUserJoined);
    socket.off("user_left", handleUserLeft);
    socket.off("role_assigned", handleRoleAssigned);
    socket.off("participant_removed", handleParticipantRemoved);

    socket.off("play", handlePlay);
    socket.off("pause", handlePause);
    socket.off("seek", handleSeek);
    socket.off("change_video", handleChangeVideo);

    socket.off("chat-message", handleChatMessage);
    socket.off("reaction", handleReaction);

    socket.off("action_request", handleActionRequest);
    socket.off("request_approved", handleRequestApproved);
    socket.off("request_rejected", handleRequestRejected);
  };
};
