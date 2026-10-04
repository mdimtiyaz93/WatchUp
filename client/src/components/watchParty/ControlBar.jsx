import React from "react";
import { MessageCircleIcon, UsersIcon, PhoneOffIcon } from "lucide-react";

const ControlBar = ({
  onChat,
  onParticipants,
  onLeave,
  participantCount = 1,
}) => {
  return (
    <div className="bg-white/95 backdrop-blur-xl border border-slate-200 shadow-xl rounded-2xl px-2 py-2 flex items-center gap-1.5">
      <button
        type="button"
        onClick={onChat}
        className="h-10 px-3 rounded-xl hover:bg-slate-100 text-slate-700 flex items-center gap-2 transition cursor-pointer"
        title="Chat"
      >
        <MessageCircleIcon className="w-5 h-5" />
        <span className="hidden sm:block text-sm font-medium">Chat</span>
      </button>

      <button
        type="button"
        onClick={onParticipants}
        className="h-10 px-3 rounded-xl hover:bg-slate-100 text-slate-700 flex items-center gap-2 transition cursor-pointer"
        title="Participants"
      >
        <UsersIcon className="w-5 h-5" />

        <span className="text-sm font-medium">{participantCount}</span>

        <span className="hidden sm:block text-sm font-medium">People</span>
      </button>

      <div className="w-px h-7 bg-slate-200 mx-1" />

      <button
        type="button"
        onClick={onLeave}
        className="h-10 px-3 rounded-xl bg-red-500 hover:bg-red-600 text-white flex items-center gap-2 transition cursor-pointer"
        title="Leave meeting"
      >
        <PhoneOffIcon className="w-5 h-5" />

        <span className="hidden sm:block text-sm font-medium">Leave</span>
      </button>
    </div>
  );
};

export default ControlBar;
