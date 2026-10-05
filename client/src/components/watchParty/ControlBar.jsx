import React from "react";
import {
  MessageCircleIcon,
  UsersIcon,
  LogOutIcon,
  SmileIcon,
} from "lucide-react";

const ControlBar = ({
  onChat,
  onParticipants,
  onReaction,
  onLeave,
  participantCount = 0,
  unreadMessages = 0,
}) => {
  return (
    <div className="bg-white/95 backdrop-blur-xl border border-slate-200 shadow-lg rounded-xl px-2 py-1.5 flex items-center gap-1">
      {/* Chat */}
      <button
        type="button"
        onClick={onChat}
        className="relative h-8 px-2.5 rounded-lg hover:bg-slate-100 text-slate-700 flex items-center gap-1.5 transition cursor-pointer"
        title="Chat"
      >
        <MessageCircleIcon className="w-4 h-4" />

        <span className="hidden sm:block text-xs font-medium">Chat</span>

        {unreadMessages > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-semibold flex items-center justify-center">
            {unreadMessages > 99 ? "99+" : unreadMessages}
          </span>
        )}
      </button>

      {/* Participants */}
      <button
        type="button"
        onClick={onParticipants}
        className="h-8 px-2.5 rounded-lg hover:bg-slate-100 text-slate-700 flex items-center gap-1.5 transition cursor-pointer"
        title="Participants"
      >
        <UsersIcon className="w-4 h-4" />

        <span className="text-xs font-medium">{participantCount}</span>
      </button>

      {/* Reaction */}
      <button
        type="button"
        onClick={onReaction}
        className="h-8 px-2.5 rounded-lg hover:bg-slate-100 text-slate-700 flex items-center gap-1.5 transition cursor-pointer"
        title="Reaction"
      >
        <SmileIcon className="w-4 h-4" />

        <span className="hidden sm:block text-xs font-medium">React</span>
      </button>

      {/* Leave */}
      <button
        type="button"
        onClick={onLeave}
        className="h-8 px-2.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center gap-1.5 transition cursor-pointer"
        title="Leave meeting"
      >
        <LogOutIcon className="w-4 h-4" />

        <span className="hidden sm:block text-xs font-medium">Leave</span>
      </button>
    </div>
  );
};

export default ControlBar;
