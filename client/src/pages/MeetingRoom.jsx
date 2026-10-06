import React, { useEffect, useRef, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { useUser, useClerk } from "@clerk/react";

import toast from "react-hot-toast";

import MeetingHeader from "../components/watchParty/MeetingHeader";

import MeetingVideo from "../components/watchParty/MeetingVideo";

import MeetingIdPanel from "../components/watchParty/MeetingIdPanel";

import ActionRequests from "../components/watchParty/ActionRequests";

import ReactionMenu from "../components/watchParty/ReactionMenu";

import ChatPanel from "../components/watchParty/ChatPanel";

import ParticipantsPanel from "../components/watchParty/ParticipantsPanel";

import ControlBar from "../components/watchParty/ControlBar";

import VideoControls from "../components/watchParty/VideoControls";

import {
  createMeetingConnection,
  joinMeeting,
} from "../services/meetingConnection";

import { createMeetingActions } from "../services/meetingActions";

import { registerMeetingEvents } from "../services/meetingEvents";

import { createMeetingRoomActions } from "../services/meetingRoomActions";

const MeetingRoom = () => {
  const { meetingId } = useParams();

  const navigate = useNavigate();

  const { user } = useUser();

  const { signOut } = useClerk();

  const playerRef = useRef(null);

  const socketRef = useRef(null);

  const videoIdRef = useRef("");

  const isPlayingRef = useRef(false);

  const remoteActionRef = useRef(false);

  const chatRef = useRef(false);

  const [videoId, setVideoId] = useState("");

  const [videoUrl, setVideoUrl] = useState("");

  const [isPlaying, setIsPlaying] = useState(false);

  const [chat, setChat] = useState(false);

  const [people, setPeople] = useState(false);

  const [reactionMenu, setReactionMenu] = useState(false);

  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([]);

  const [participants, setParticipants] = useState([]);

  const [socketConnected, setSocketConnected] = useState(false);

  const [actionRequests, setActionRequests] = useState([]);

  const [unreadMessages, setUnreadMessages] = useState(0);

  const [reactions, setReactions] = useState([]);

  const userName =
    user?.fullName ||
    user?.firstName ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "User";

  const makeParticipants = (list, socketId) => {
    const uniqueParticipants = list.filter(
      (participant, index, self) =>
        index === self.findIndex((p) => p.id === participant.id),
    );

    return uniqueParticipants.map((participant) => ({
      ...participant,
      isYou: participant.id === socketId,
    }));
  };

  const me = participants.find((p) => p.isYou);

  const isHost = me?.role === "Host";

  const isModerator = me?.role === "Moderator";

  const canControl = isHost || isModerator;

  useEffect(() => {
    videoIdRef.current = videoId;
  }, [videoId]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    chatRef.current = chat;
  }, [chat]);

  /*
   * SOCKET CONNECTION + EVENTS
   */

  useEffect(() => {
    if (!meetingId) return;

    const socket = createMeetingConnection();

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);

      setSocketConnected(true);

      console.log("CURRENT USER:", user?.id, userName);

      joinMeeting(socket, meetingId, userName, user?.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");

      setSocketConnected(false);
    });

    const cleanupEvents = registerMeetingEvents({
      socket,
      meetingId,
      navigate,
      userName,
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
    });

    return () => {
      cleanupEvents?.();

      socket.disconnect();

      socketRef.current = null;
    };
  }, [meetingId, userName, navigate, user?.id]);

  /*
   * YOUTUBE URL ID
   */

  const extractId = (url) => {
    const value = url.trim();

    const match = value.match(
      /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([^&?/\s]+)/,
    );

    return match ? match[1] : null;
  };

  /*
   * MEETING ACTIONS
   */

  const {
    loadVideo: loadVideoAction,
    play,
    pause,
    seek,
    changeVideo,
    sync,
  } = createMeetingActions({
    socket: socketRef.current,
    meetingId,
    playerRef,
    videoId,
    videoIdRef,
    setVideoId,
    setIsPlaying,
    remoteActionRef,
    canControl,
    requestAction: () => {},
  });

  /*
   * ROOM ACTIONS
   */

  const {
    requestAction,
    approveRequest,
    rejectRequest,
    sendMessage: sendMessageAction,
    sendReaction,
    changeRole,
    removeParticipant,
    transferHost,
    leaveRoom,
    toggleChat,
    togglePeople,
    toggleReaction,
  } = createMeetingRoomActions({
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
  });

  /*
   * VIDEO LOAD
   */

  const loadVideo = (e) => {
    e.preventDefault();

    const id = extractId(videoUrl);

    if (!id) {
      toast.error("Invalid YouTube URL");

      return;
    }

    if (!canControl) {
      requestAction("change_video", {
        videoId: id,
      });

      return;
    }

    loadVideoAction(id);

    setVideoUrl("");
  };

  /*
   * VIDEO ACTIONS NEED REQUEST ACTION
   */

  const handlePlay = () => {
    if (!videoIdRef.current) return;

    if (!canControl) {
      requestAction("play", {
        currentTime: playerRef.current?.getCurrentTime?.() || 0,
      });

      return;
    }

    play();
  };

  const handlePause = () => {
    if (!videoIdRef.current) return;

    if (!canControl) {
      requestAction("pause", {
        currentTime: playerRef.current?.getCurrentTime?.() || 0,
      });

      return;
    }

    pause();
  };

  const handleSeek = (time) => {
    if (!videoIdRef.current) return;

    if (!canControl) {
      requestAction("seek", {
        time,
      });

      return;
    }

    seek(time);
  };

  const handleChangeVideo = (url) => {
    const id = extractId(url);

    if (!id) {
      toast.error("Invalid YouTube URL");

      return;
    }

    if (!canControl) {
      requestAction("change_video", {
        videoId: id,
      });

      return;
    }

    changeVideo(id);
  };

  /*
   * COPY MEETING ID
   */

  const copyMeetingCode = async () => {
    try {
      await navigator.clipboard.writeText(meetingId);

      toast.success("Meeting ID copied");
    } catch (error) {
      console.error(error);

      toast.error("Failed to copy");
    }
  };

  /*
   * CHAT
   */

  const sendMessage = (e) => {
    sendMessageAction(e, message);

    setMessage("");
  };

  /*
   * SOCKET ROOM ACTIONS
   */

  const handleChangeRole = (participantId, role) => {
    changeRole(participantId, role);
  };

  const handleRemoveParticipant = (participantId) => {
    removeParticipant(participantId);
  };

  const handleTransferHost = (participantId) => {
    transferHost(participantId);
  };

  return (
    <div className="h-screen w-screen bg-slate-100 text-slate-900 flex flex-col overflow-hidden relative">
      <MeetingHeader />

      <main className="flex-1 flex items-center justify-center px-2 sm:px-3 md:px-4 pt-14 sm:pt-16 pb-20 sm:pb-24 overflow-y-auto">
        <div className="w-full max-w-3xl">
          <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-2.5 shadow-sm border border-slate-200">
            {!chat && !people && !reactionMenu && (
              <form
                onSubmit={loadVideo}
                className="relative z-[100] flex gap-1.5 mb-2"
              >
                <input
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Paste YouTube URL"
                  disabled={!canControl}
                  className="relative z-[100] flex-1 min-w-0 border border-slate-200 rounded-lg px-2 sm:px-2.5 py-1.5 text-[11px] sm:text-xs outline-none focus:border-primary disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                />

                <button
                  type="submit"
                  disabled={!canControl}
                  className="relative z-[100] bg-primary text-white px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-medium cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed shrink-0"
                >
                  Load
                </button>
              </form>
            )}

            <MeetingVideo
              playerRef={playerRef}
              videoId={videoId}
              canControl={canControl}
              meetingId={meetingId}
              remoteActionRef={remoteActionRef}
              videoIdRef={videoIdRef}
              socketRef={socketRef}
              setIsPlaying={setIsPlaying}
            />

            <div className="mt-2">
              <VideoControls
                isHost={isHost}
                isModerator={isModerator}
                isPlaying={isPlaying}
                videoId={videoId}
                onPlay={handlePlay}
                onPause={handlePause}
                onSeek={handleSeek}
                onChangeVideo={handleChangeVideo}
                onSync={sync}
              />
            </div>
          </div>
        </div>
      </main>

      {/* FLOATING REACTIONS */}

      <div className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        <div className="relative w-48 h-56">
          {reactions.map((item, index) => (
            <div
              key={item.id}
              className="absolute bottom-0 left-1/2 flex flex-col items-center animate-reaction"
              style={{
                "--reaction-x": `${((index % 5) - 2) * 18}px`,
              }}
            >
              <span className="bg-white/90 text-slate-700 text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-md shadow-sm whitespace-nowrap">
                {item.username}
              </span>

              <span className="text-3xl sm:text-4xl leading-none">
                {item.reaction}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* MEETING ID + CONTROL BAR */}

      <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3 z-30 flex items-center justify-between gap-3">
        <div className="shrink-0">
          <MeetingIdPanel
            meetingId={meetingId}
            copyMeetingCode={copyMeetingCode}
          />

          <ActionRequests
            isHost={isHost}
            actionRequests={actionRequests}
            approveRequest={approveRequest}
            rejectRequest={rejectRequest}
          />
        </div>

        <div className="shrink-0">
          <ControlBar
            onChat={toggleChat}
            onParticipants={togglePeople}
            onReaction={toggleReaction}
            onLeave={leaveRoom}
            participantCount={participants.length}
            unreadMessages={unreadMessages}
          />
        </div>
      </div>

      {/* REACTION MENU */}

      <ReactionMenu reactionMenu={reactionMenu} sendReaction={sendReaction} />

      {/* CHAT */}

      <ChatPanel
        chat={chat}
        setChat={setChat}
        setUnreadMessages={setUnreadMessages}
        messages={messages}
        message={message}
        setMessage={setMessage}
        sendMessage={sendMessage}
      />

      {/* PARTICIPANTS */}

      <ParticipantsPanel
        people={people}
        setPeople={setPeople}
        participants={participants}
        isHost={isHost}
        changeRole={handleChangeRole}
        transferHost={handleTransferHost}
        removeParticipant={handleRemoveParticipant}
      />
    </div>
  );
};

export default MeetingRoom;
