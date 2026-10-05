import React, { useEffect, useState } from "react";
import { CalendarDaysIcon, ClockIcon, VideoIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/react";
const API_URL = "https://watchup-rs17.onrender.com";

const ROOM_EXPIRY = 2 * 60 * 60 * 1000;

const Sessions = () => {
  const { user } = useUser();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchSessions = async () => {
      try {
        const response = await fetch(`${API_URL}/api/rooms?userId=${user.id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch sessions");
        }

        const data = await response.json();

        setSessions(data);
      } catch (error) {
        console.error("Sessions error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [user?.id]);

  const isExpired = (createdAt) => {
    if (!createdAt) return false;

    return Date.now() - new Date(createdAt).getTime() >= ROOM_EXPIRY;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900">Sessions</h1>

          <p className="text-sm text-slate-500 mt-1">
            Your watch party sessions
          </p>
        </div>

        {loading ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
            <p className="text-sm text-slate-500">Loading sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
            <VideoIcon className="w-10 h-10 mx-auto text-slate-300" />

            <p className="text-sm text-slate-500 mt-3">No sessions found</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sessions.map((session) => {
              const expired = isExpired(session.createdAt);

              return (
                <div
                  key={session.roomId}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <VideoIcon className="w-5 h-5" />
                    </div>

                    <span
                      className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${
                        expired
                          ? "bg-red-50 text-red-600"
                          : "bg-emerald-50 text-emerald-600"
                      }`}
                    >
                      {expired ? "Expired" : "Active"}
                    </span>
                  </div>

                  <h2 className="font-semibold text-slate-900 mt-4">
                    YouTube Watch Party
                  </h2>

                  <p className="text-xs text-slate-500 mt-1">
                    Room: {session.roomId}
                  </p>

                  <div className="flex flex-col gap-2 mt-4 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <CalendarDaysIcon className="w-4 h-4" />
                      {formatDate(session.createdAt)}
                    </div>

                    <div className="flex items-center gap-2">
                      <ClockIcon className="w-4 h-4" />
                      {formatTime(session.createdAt)}
                    </div>

                    <div className="text-xs">
                      Role:{" "}
                      <span className="font-medium text-slate-700">
                        {session.createdBy === user?.id
                          ? "Host"
                          : "Participant"}
                      </span>
                    </div>
                  </div>

                  {expired ? (
                    <button
                      type="button"
                      disabled
                      className="block w-full text-center mt-5 bg-slate-200 text-slate-400 text-xs font-medium py-2.5 rounded-lg cursor-not-allowed"
                    >
                      Room Expired
                    </button>
                  ) : (
                    <Link
                      to={`/meeting/${session.roomId}`}
                      className="block text-center mt-5 bg-primary text-white text-xs font-medium py-2.5 rounded-lg hover:opacity-90"
                    >
                      Join Again
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Sessions;
