import React from "react";
import { useParams } from "react-router-dom";

const MeetingHeader = () => {
  const { meetingId } = useParams();

  return (
    <header className="absolute top-0 left-0 right-0 z-30 px-3 sm:px-5 py-3">
      <div className="flex items-center">
        <div className="bg-white/90 backdrop-blur-md rounded-lg px-3 py-2 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2.5">
            <h2 className="text-xs sm:text-sm font-semibold text-slate-900">
              Instant Meeting
            </h2>

            <span className="text-slate-300">|</span>

            <span className="text-[10px] sm:text-xs font-medium text-slate-600">
              {meetingId || "No ID"}
            </span>

            <div className="flex items-center gap-1 text-[10px] sm:text-xs text-emerald-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Active
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default MeetingHeader;
