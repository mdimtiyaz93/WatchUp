import {
  ArrowRightIcon,
  KeyboardIcon,
  PlusIcon,
  ShieldCheckIcon,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/react";

const Dashboard = () => {
  const { user } = useUser();

  const userEmail = user?.primaryEmailAddress?.emailAddress || "";

  const navigate = useNavigate();

  const [isCreating, setIsCreating] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [joinId, setJoinId] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCreateWatchParty = () => {
    setIsCreating(true);

    const chars = "abcdefghijklmnopqrstuvwxyz";

    const seg = () => {
      let result = "";

      for (let i = 0; i < 3; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
      }

      return result;
    };

    const newRoomId = `${seg()}-${seg()}-${seg()}`;

    setTimeout(() => {
      setIsCreating(false);
      navigate(`/meeting/${newRoomId}`);
    }, 400);
  };

  const handleJoinWatchParty = (e) => {
    e.preventDefault();

    const cleanId = joinId.trim();

    if (!cleanId) return;

    navigate(`/meeting/${cleanId}`);
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-12 flex flex-col justify-center">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 pr-6 py-2 rounded-full bg-white/25 text-xs font-medium">
              <ShieldCheckIcon size={16} />
              Real-time YouTube Watch Party
              <span className="text-primary">Built for everyone</span>
            </div>

            <h1 className="text-4xl sm:text-5xl text-slate-800 leading-tight font-medium">
              Watch YouTube together.
              <br />
              <span className="text-primary">Built for everyone</span>
            </h1>

            <p className="text-slate-700 text-base sm:text-lg max-w-xl leading-relaxed">
              Connect, watch, and enjoy YouTube videos together with real-time
              video synchronization and chat.
            </p>

            {/* Create + Join */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              {/* Create Watch Party */}
              <button
                onClick={handleCreateWatchParty}
                disabled={isCreating}
                className="bg-primary hover:bg-primary-hover text-white font-medium px-6 py-3.5 rounded-full shadow-md shadow-primary/20 flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <PlusIcon className="w-5 h-5" />

                <span>{isCreating ? "Creating...." : "New Watch Party"}</span>
              </button>

              {/* Join Watch Party */}
              <form
                onSubmit={handleJoinWatchParty}
                className="flex-1 flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <KeyboardIcon className="w-5 h-5 text-primary/90 absolute left-4 top-1/2 -translate-y-1/2" />

                  <input
                    type="text"
                    placeholder="Enter room code"
                    value={joinId}
                    onChange={(e) => setJoinId(e.target.value)}
                    className="w-full bg-white/75 border border-primary-border/80 focus:border-primary/60 focus:ring-1 focus:ring-primary/60 rounded-full pl-12 pr-4 py-3.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!joinId.trim()}
                  className="bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-medium px-6 py-3.5 rounded-full transition-all flex items-center justify-center cursor-pointer shadow-xs"
                >
                  <span>Join</span>
                  <ArrowRightIcon className="w-4 h-4 ml-1.5" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="w-full bg-white/25 backdrop-blur rounded-4xl p-8 border">
            <h2 className="text-4xl xl:text-7xl my-4 text-slate-900 tracking-wide">
              {currentTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </h2>

            <p className="font-medium tracking-wider text-primary">
              {currentTime.toLocaleDateString(undefined, {
                weekday: "long",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>

            <div className="pt-6 mt-6 border-t border-white/30 text-sm text-slate-600">
              Logged in as:
              <span className="text-slate-900"> {userEmail}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
