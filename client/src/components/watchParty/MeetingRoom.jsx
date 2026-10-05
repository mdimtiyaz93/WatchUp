import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MeetingHeader from "../components/meeting/MeetingHeader";
import MeetingInfo from "../components/meeting/MeetingInfo";
import WatchPartyContent from "../components/meeting/WatchPartyContent";
import ControlBar from "../components/meeting/ControlBar";
const MeetingRoom = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const handleAudioToggle = () => {
    setAudioEnabled((prev) => !prev);
  };
  const handleVideoToggle = () => {
    setVideoEnabled((prev) => !prev);
  };
  const handleChat = () => {
    console.log("Chat clicked");
  };
  const handleParticipants = () => {
    console.log("Participants clicked");
  };
  const handleLeave = () => {
    navigate("/dashboard");
  };
  const extractVideoId = (url) => {
    try {
      const parsedUrl = new URL(url);

      if (parsedUrl.hostname.includes("youtu.be")) {
        return parsedUrl.pathname.slice(1);
      }

      if (parsedUrl.hostname.includes("youtube.com")) {
        if (parsedUrl.pathname === "/watch") {
          return parsedUrl.searchParams.get("v");
        }

        if (parsedUrl.pathname.startsWith("/shorts/")) {
          return parsedUrl.pathname.split("/")[2];
        }

        if (parsedUrl.pathname.startsWith("/embed/")) {
          return parsedUrl.pathname.split("/")[2];
        }
      }

      return null;
    } catch {
      return null;
    }
  };

  const handleLoadVideo = (e) => {
    e.preventDefault();

    const id = extractVideoId(videoUrl.trim());

    if (!id) {
      alert("Please enter a valid YouTube URL");
      return;
    }

    setVideoId(id);
    setIsPlaying(false);
  };
  return (
    <div className="h-screen w-screen bg-slate-100 text-slate-900 flex flex-col overflow-hidden relative font-sans">
      {" "}
      <MeetingHeader /> <WatchPartyContent videoId={null} />{" "}
      <MeetingInfo meetingId={meetingId} />{" "}
      <div className="absolute bottom-0 left-0 right-0 z-30 flex justify-center px-3 pb-3">
        {" "}
        <ControlBar
          audioEnabled={audioEnabled}
          videoEnabled={videoEnabled}
          onAudioToggle={handleAudioToggle}
          onVideoToggle={handleVideoToggle}
          onChat={handleChat}
          onParticipants={handleParticipants}
          onLeave={handleLeave}
        />{" "}
      </div>{" "}
    </div>
  );
};
export default MeetingRoom;
