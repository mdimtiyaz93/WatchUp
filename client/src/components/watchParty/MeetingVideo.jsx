import React from "react";
import YoutubePlayer from "../YouTubePlayer";

const MeetingVideo = ({
  playerRef,
  videoId,
  canControl,
  meetingId,
  remoteActionRef,
  videoIdRef,
  socketRef,
  setIsPlaying,
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <YoutubePlayer
        ref={playerRef}
        videoId={videoId}
        canControl={canControl}
        onStateChange={(state) => {
          setIsPlaying(state === "playing");

          if (remoteActionRef.current) return;

          if (!canControl) return;

          if (!videoIdRef.current) return;

          const currentTime = playerRef.current?.getCurrentTime?.() || 0;

          if (state === "playing") {
            socketRef.current?.emit("play", {
              roomId: meetingId,
              currentTime,
            });
          }

          if (state === "paused") {
            socketRef.current?.emit("pause", {
              roomId: meetingId,
              currentTime,
            });
          }
        }}
      />
    </div>
  );
};

export default MeetingVideo;
