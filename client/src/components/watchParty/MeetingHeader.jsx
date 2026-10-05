import React from "react";
import { useParams } from "react-router-dom";

const MeetingHeader = () => {
  const { meetingId } = useParams();

  return (
    <header className="absolute top-0 left-0 right-0 z-30 px-2 sm:px-3 md:px-5 py-2.5 sm:py-3">
      <div className="flex items-center">
        <div className="bg-white/90 backdrop-blur-md rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 shadow-sm border border-slate-200 max-w-[calc(100vw-1rem)]">
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
            <h2 className="text-[10px] sm:text-xs md:text-sm font-semibold text-slate-900 whitespace-nowrap">
              Instant Meeting
            </h2>

            <span className="text-slate-300">|</span>

            <span className="text-[9px] sm:text-[10px] md:text-xs font-medium text-slate-600 truncate max-w-[120px] sm:max-w-none">
              {meetingId || "No ID"}
            </span>

            <div className="flex items-center gap-1 text-[9px] sm:text-[10px] md:text-xs text-emerald-600 font-medium whitespace-nowrap">
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
