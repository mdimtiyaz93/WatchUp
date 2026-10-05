export const createMeetingActions = ({
  socket,
  meetingId,
  playerRef,
  videoId,
  videoIdRef,
  setVideoId,
  setIsPlaying,
  remoteActionRef,
  canControl,
  requestAction,
}) => {
  const loadVideo = (videoId) => {
    if (!videoId) return;

    if (!canControl) {
      requestAction("change_video", {
        videoId,
      });
      return;
    }

    remoteActionRef.current = true;

    setVideoId(videoId);
    videoIdRef.current = videoId;
    setIsPlaying(false);

    socket?.emit("change_video", {
      roomId: meetingId,
      videoId,
    });

    setTimeout(() => {
      remoteActionRef.current = false;
    }, 1500);
  };

  const play = () => {
    if (!videoId) return;

    if (!canControl) {
      requestAction("play", {
        currentTime: playerRef.current?.getCurrentTime?.() || 0,
      });
      return;
    }

    const currentTime = playerRef.current?.getCurrentTime?.() || 0;

    remoteActionRef.current = true;

    playerRef.current?.play();

    setIsPlaying(true);

    socket?.emit("play", {
      roomId: meetingId,
      currentTime,
    });

    setTimeout(() => {
      remoteActionRef.current = false;
    }, 1500);
  };

  const pause = () => {
    if (!videoId) return;

    if (!canControl) {
      requestAction("pause", {
        currentTime: playerRef.current?.getCurrentTime?.() || 0,
      });
      return;
    }

    const currentTime = playerRef.current?.getCurrentTime?.() || 0;

    remoteActionRef.current = true;

    playerRef.current?.pause();

    setIsPlaying(false);

    socket?.emit("pause", {
      roomId: meetingId,
      currentTime,
    });

    setTimeout(() => {
      remoteActionRef.current = false;
    }, 1500);
  };

  const seek = (time) => {
    if (!videoId) return;

    if (!canControl) {
      requestAction("seek", {
        time,
      });
      return;
    }

    remoteActionRef.current = true;

    playerRef.current?.seek(time);

    socket?.emit("seek", {
      roomId: meetingId,
      time,
    });

    setTimeout(() => {
      remoteActionRef.current = false;
    }, 1000);
  };

  const changeVideo = (newVideoId) => {
    if (!newVideoId) return;

    if (!canControl) {
      requestAction("change_video", {
        videoId: newVideoId,
      });
      return;
    }

    remoteActionRef.current = true;

    setVideoId(newVideoId);
    videoIdRef.current = newVideoId;
    setIsPlaying(false);

    socket?.emit("change_video", {
      roomId: meetingId,
      videoId: newVideoId,
    });

    setTimeout(() => {
      remoteActionRef.current = false;
    }, 1500);
  };

  const sync = () => {
    if (!socket) return;

    socket.emit("sync_request", {
      roomId: meetingId,
    });
  };

  return {
    loadVideo,
    play,
    pause,
    seek,
    changeVideo,
    sync,
  };
};
