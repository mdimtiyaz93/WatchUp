import React from "react";
import { CopyIcon } from "lucide-react";

const MeetingIdPanel = ({ meetingId, copyMeetingCode }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg px-2 sm:px-2.5 py-1.5 shadow-sm flex items-center gap-1.5 sm:gap-2">
      <div className="min-w-0">
        <p className="text-[8px] text-slate-500 uppercase">Meeting ID</p>

        <p className="text-[9px] sm:text-[10px] font-medium truncate max-w-[110px] sm:max-w-none">
          {meetingId}
        </p>
      </div>

      <button
        type="button"
        onClick={copyMeetingCode}
        className="w-6 h-6 sm:w-7 sm:h-7 shrink-0 rounded-md bg-slate-100 flex items-center justify-center cursor-pointer"
      >
        <CopyIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-600" />
      </button>
    </div>
  );
};

export default MeetingIdPanel;
