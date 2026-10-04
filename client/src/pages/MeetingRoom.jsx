import React, { useEffect, useRef, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { useUser } from "@clerk/react";

import { CheckIcon, CopyIcon, SendIcon, XIcon } from "lucide-react";

import { io } from "socket.io-client";

import toast from "react-hot-toast";

import MeetingHeader from "../components/watchParty/MeetingHeader";

import YouTubePlayer from "../components/YouTubePlayer";

import VideoControls from "../components/watchParty/VideoControls";

import ControlBar from "../components/watchParty/ControlBar";

const MeetingRoom = () => {
  const { meetingId } = useParams();

  const navigate = useNavigate();

  const { user } = useUser();

  const playerRef = useRef(null);

  const socketRef = useRef(null);

  const videoIdRef = useRef("");

  const isPlayingRef = useRef(false);

  const remoteActionRef = useRef(false);

  const [videoId, setVideoId] = useState("");

  const [videoUrl, setVideoUrl] = useState("");

  const [isPlaying, setIsPlaying] = useState(false);

  const [copied, setCopied] = useState(false);

  const [chat, setChat] = useState(false);

  const [people, setPeople] = useState(false);

  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([]);

  const [participants, setParticipants] = useState([]);

  const [socketConnected, setSocketConnected] = useState(false);

  const [actionRequests, setActionRequests] = useState([]);

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
    if (!meetingId) return;

    const socket = io("https://watchup-rs17.onrender.com");

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);

      setSocketConnected(true);

      socket.emit("join_room", {
        roomId: meetingId,
        username: userName,
      });
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");

      setSocketConnected(false);
    });

    socket.on("participants", (list) => {
      console.log("Participants:", list);

      setParticipants(makeParticipants(list, socket.id));
    });

    socket.on("sync_state", (data) => {
      console.log("SYNC STATE:", data);

      const { playState, currentTime, videoId: syncedVideoId } = data;

      if (syncedVideoId) {
        setVideoId(syncedVideoId);

        videoIdRef.current = syncedVideoId;
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
    });

    socket.on("sync_request", ({ requesterId }) => {
      console.log("Sync request from:", requesterId);

      const time = playerRef.current?.getCurrentTime?.() || 0;

      socket.emit("sync_response", {
        roomId: meetingId,

        requesterId,

        videoId: videoIdRef.current,

        currentTime: time,

        playState: isPlayingRef.current ? "playing" : "paused",
      });
    });

    socket.on("sync_response", (data) => {
      console.log("SYNC RESPONSE:", data);

      if (!data) return;

      const { videoId: syncedVideoId, currentTime, playState } = data;

      remoteActionRef.current = true;

      if (syncedVideoId) {
        setVideoId(syncedVideoId);

        videoIdRef.current = syncedVideoId;
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
    });

    socket.on("user_joined", (data) => {
      console.log("User joined:", data);

      if (data?.participants) {
        setParticipants(makeParticipants(data.participants, socket.id));
      }

      if (data?.username && data?.userId !== socket.id) {
        toast.success(`${data.username} Added`);
      }
    });

    socket.on("user_left", (data) => {
      console.log("User left:", data);

      if (data?.participants) {
        setParticipants(makeParticipants(data.participants, socket.id));
      }
    });

    socket.on("role_assigned", (data) => {
      console.log("Role assigned:", data);

      if (data?.participants) {
        setParticipants(makeParticipants(data.participants, socket.id));
      }
    });

    socket.on("participant_removed", (data) => {
      console.log("Participant removed:", data);

      if (data.userId === socket.id) {
        toast.error("You were removed from the meeting.");

        socket.disconnect();

        navigate("/dashboard");

        return;
      }

      if (data.participants) {
        setParticipants(makeParticipants(data.participants, socket.id));
      }
    });

    socket.on("play", ({ currentTime } = {}) => {
      console.log("PLAY RECEIVED:", currentTime);

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
    });

    socket.on("pause", ({ currentTime } = {}) => {
      console.log("PAUSE RECEIVED:", currentTime);

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
    });

    socket.on("seek", ({ time } = {}) => {
      if (typeof time !== "number") return;

      console.log("SEEK RECEIVED:", time);

      remoteActionRef.current = true;

      playerRef.current?.seek(time);

      setTimeout(() => {
        remoteActionRef.current = false;
      }, 1000);
    });

    socket.on("change_video", ({ videoId }) => {
      if (!videoId) return;

      console.log("Video changed:", videoId);

      remoteActionRef.current = true;

      setVideoId(videoId);

      videoIdRef.current = videoId;

      setVideoUrl("");

      setIsPlaying(false);

      setTimeout(() => {
        remoteActionRef.current = false;
      }, 1500);
    });

    socket.on("chat-message", (data) => {
      console.log("Received chat:", data);

      setMessages((prev) => [...prev, data]);
    });

    socket.on("action_request", (data) => {
      console.log("Action request:", data);

      setActionRequests((prev) => {
        const exists = prev.some((item) => item.requestId === data.requestId);

        if (exists) return prev;

        return [...prev, data];
      });
    });

    socket.on("request_approved", (data) => {
      console.log("Request approved:", data);

      let actionName = data.action;

      if (data.action === "change_video") {
        actionName = "video change";
      }

      toast.success(
        `${
          actionName.charAt(0).toUpperCase() + actionName.slice(1)
        } request approved`,
      );
    });

    socket.on("request_rejected", (data) => {
      console.log("Request rejected:", data);

      let actionName = data.action;

      if (data.action === "change_video") {
        actionName = "video change";
      }

      toast.error(
        `${
          actionName.charAt(0).toUpperCase() + actionName.slice(1)
        } request rejected`,
      );
    });

    return () => {
      socket.disconnect();

      socketRef.current = null;
    };
  }, [meetingId, userName, navigate]);

  const extractId = (url) => {
    const value = url.trim();

    const match = value.match(
      /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([^&?/\s]+)/,
    );

    return match ? match[1] : null;
  };

  const requestAction = (action, data = {}) => {
    if (!videoId && action !== "change_video") {
      return;
    }

    console.log("REQUEST ACTION:", {
      action,

      data,

      myRole: me?.role,

      canControl,
    });

    socketRef.current?.emit("request_action", {
      roomId: meetingId,

      action,

      data,
    });

    let actionName = action;

    if (action === "change_video") {
      actionName = "video change";
    }

    toast.success(
      `${
        actionName.charAt(0).toUpperCase() + actionName.slice(1)
      } request sent to Host`,
    );
  };

  const approveRequest = (request) => {
    if (!isHost) return;

    console.log("APPROVING REQUEST:", request);

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

    console.log("REJECTING REQUEST:", request);

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

  const loadVideo = (e) => {
    e.preventDefault();

    const id = extractId(videoUrl);

    if (!id) {
      toast.error("Please enter a valid YouTube URL");

      return;
    }

    if (!canControl) {
      requestAction("change_video", {
        videoId: id,
      });

      return;
    }

    remoteActionRef.current = true;

    setVideoId(id);

    videoIdRef.current = id;

    setIsPlaying(false);

    socketRef.current?.emit("change_video", {
      roomId: meetingId,

      videoId: id,
    });

    setVideoUrl("");

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

    socketRef.current?.emit("play", {
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

    socketRef.current?.emit("pause", {
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

    socketRef.current?.emit("seek", {
      roomId: meetingId,

      time,
    });

    setTimeout(() => {
      remoteActionRef.current = false;
    }, 1000);
  };

  const changeVideo = (url) => {
    if (!url) return;

    const id = extractId(url);

    if (!id) {
      toast.error("Please enter a valid YouTube URL");

      return;
    }

    if (!canControl) {
      requestAction("change_video", {
        videoId: id,
      });

      return;
    }

    remoteActionRef.current = true;

    setVideoId(id);

    videoIdRef.current = id;

    setIsPlaying(false);

    socketRef.current?.emit("change_video", {
      roomId: meetingId,

      videoId: id,
    });

    setTimeout(() => {
      remoteActionRef.current = false;
    }, 1500);
  };

  const sync = () => {
    if (!socketRef.current) return;

    socketRef.current.emit("sync_request", {
      roomId: meetingId,
    });
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/meeting/${meetingId}`,
      );

      setCopied(true);

      toast.success("Meeting link copied");

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      toast.error("Unable to copy meeting link");
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    socketRef.current?.emit("chat-message", {
      roomId: meetingId,

      username: userName,

      message: message.trim(),
    });

    setMessage("");
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

  const leaveRoom = () => {
    socketRef.current?.emit("leave_room", {
      roomId: meetingId,
    });

    socketRef.current?.disconnect();

    navigate("/dashboard");
  };

  const toggleChat = () => {
    setChat(true);

    setPeople(false);
  };

  const togglePeople = () => {
    setPeople(true);

    setChat(false);
  };

  return (
    <div className="h-screen w-screen bg-slate-100 text-slate-900 flex flex-col overflow-hidden relative">
      <MeetingHeader />

      <main className="flex-1 flex items-center justify-center px-4 pt-16 pb-24 overflow-y-auto">
        <div className="w-full max-w-4xl">
          <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200">
            <form
              onSubmit={loadVideo}
              className="relative z-[100] flex gap-2 mb-3"
            >
              <input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Paste YouTube URL"
                disabled={!canControl}
                className="relative z-[100] flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
              />

              <button
                type="submit"
                disabled={!canControl}
                className="relative z-[100] bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Load
              </button>
            </form>

            <div className="w-full max-w-3xl mx-auto">
              <YouTubePlayer
                ref={playerRef}
                videoId={videoId}
                canControl={canControl}
                onStateChange={(state) => {
                  setIsPlaying(state === "playing");

                  if (remoteActionRef.current) {
                    return;
                  }

                  if (!canControl) {
                    return;
                  }

                  if (!videoIdRef.current) {
                    return;
                  }

                  const currentTime =
                    playerRef.current?.getCurrentTime?.() || 0;

                  if (state === "playing") {
                    console.log("HOST NATIVE PLAY:", currentTime);

                    socketRef.current?.emit("play", {
                      roomId: meetingId,

                      currentTime,
                    });
                  }

                  if (state === "paused") {
                    console.log("HOST NATIVE PAUSE:", currentTime);

                    socketRef.current?.emit("pause", {
                      roomId: meetingId,

                      currentTime,
                    });
                  }
                }}
              />
            </div>

            <div className="mt-3">
              <VideoControls
                isHost={isHost}
                isModerator={isModerator}
                isPlaying={isPlaying}
                videoId={videoId}
                onPlay={play}
                onPause={pause}
                onSeek={seek}
                onChangeVideo={changeVideo}
                onSync={sync}
              />
            </div>
          </div>
        </div>
      </main>

      <div className="absolute bottom-4 left-4 z-30">
        <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm flex items-center gap-3">
          <div>
            <p className="text-[10px] text-slate-500 uppercase">Meeting ID</p>

            <p className="text-xs font-medium">{meetingId}</p>
          </div>

          <button
            onClick={copyLink}
            className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center cursor-pointer"
          >
            {copied ? (
              <CheckIcon className="w-4 h-4 text-emerald-600" />
            ) : (
              <CopyIcon className="w-4 h-4 text-slate-600" />
            )}
          </button>
        </div>

        {isHost && actionRequests.length > 0 && (
          <div className="mt-3 w-80 bg-white border border-slate-200 rounded-xl shadow-xl p-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Action Requests</h3>

              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                {actionRequests.length}
              </span>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {actionRequests.map((request) => (
                <div key={request.requestId} className="border rounded-lg p-3">
                  <p className="text-sm font-medium">{request.username}</p>

                  <p className="text-xs text-slate-500 mt-1">
                    Requested:{" "}
                    <span className="font-medium">
                      {request.action.replace("_", " ")}
                    </span>
                  </p>

                  {request.action === "change_video" &&
                    request.data?.videoId && (
                      <p className="text-xs text-slate-500 mt-1 break-all">
                        Video ID: {request.data.videoId}
                      </p>
                    )}

                  <div className="flex gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => approveRequest(request)}
                      className="flex-1 bg-emerald-50 text-emerald-600 px-2 py-1.5 rounded-lg text-xs font-medium cursor-pointer hover:bg-emerald-100"
                    >
                      Approve
                    </button>

                    <button
                      type="button"
                      onClick={() => rejectRequest(request)}
                      className="flex-1 bg-red-50 text-red-500 px-2 py-1.5 rounded-lg text-xs font-medium cursor-pointer hover:bg-red-100"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30">
        <ControlBar
          onChat={toggleChat}
          onParticipants={togglePeople}
          onCopy={copyLink}
          onLeave={leaveRoom}
          participantCount={participants.length}
        />
      </div>

      {chat && (
        <div className="absolute top-0 right-0 h-full w-full sm:w-96 bg-white z-50 shadow-2xl border-l flex flex-col">
          <div className="flex justify-between items-center px-5 py-4 border-b">
            <h2 className="font-semibold">Chat</h2>

            <button onClick={() => setChat(false)} className="cursor-pointer">
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length ? (
              messages.map((m, index) => (
                <div key={m.id || index} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs font-semibold">{m.username}</p>

                  <p className="text-sm text-slate-600 mt-1">{m.message}</p>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-slate-400 mt-10">
                No messages yet
              </p>
            )}
          </div>

          <form onSubmit={sendMessage} className="p-4 border-t flex gap-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 border rounded-xl px-3 py-2 text-sm outline-none"
            />

            <button
              type="submit"
              disabled={!message.trim()}
              className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center disabled:opacity-40 cursor-pointer"
            >
              <SendIcon className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {people && (
        <div className="absolute top-0 right-0 h-full w-full sm:w-[420px] bg-white z-50 shadow-2xl border-l flex flex-col">
          <div className="flex justify-between items-center px-5 py-4 border-b">
            <div>
              <h2 className="font-semibold">Participants</h2>

              <p className="text-xs text-slate-500">
                {participants.length} people
              </p>
            </div>

            <button onClick={() => setPeople(false)} className="cursor-pointer">
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {participants.map((p) => (
              <div
                key={p.id}
                className="border rounded-xl p-3 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                  {p.name?.charAt(0)?.toUpperCase() || "U"}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {p.name || "User"}{" "}
                    {p.isYou && <span className="text-primary">(You)</span>}
                  </p>

                  <span className="text-[10px] bg-slate-100 px-2 py-1 rounded-full">
                    {p.role || "Participant"}
                  </span>
                </div>

                {!p.isYou && isHost && p.role !== "Host" && (
                  <div className="flex gap-1 flex-wrap justify-end">
                    <select
                      value={p.role || "Participant"}
                      onChange={(e) => changeRole(p.id, e.target.value)}
                      className="text-xs border rounded-lg px-1.5 py-1"
                    >
                      <option value="Participant">Participant</option>

                      <option value="Moderator">Moderator</option>

                      <option value="Viewer">Viewer</option>
                    </select>

                    <button
                      onClick={() => transferHost(p.id)}
                      className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg cursor-pointer"
                    >
                      Make Host
                    </button>

                    <button
                      onClick={() => removeParticipant(p.id)}
                      className="text-xs bg-red-50 text-red-500 px-2 py-1 rounded-lg cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingRoom;
