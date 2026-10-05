import React from "react";

const ReactionMenu = ({ reactionMenu, sendReaction }) => {
  if (!reactionMenu) return null;

  return (
    <div className="absolute bottom-12 sm:bottom-14 left-1/2 -translate-x-1/2 z-40 max-w-[calc(100vw-1rem)]">
      <div className="bg-white border border-slate-200 shadow-lg rounded-xl px-1.5 sm:px-2 py-1 sm:py-1.5 flex items-center gap-0.5 sm:gap-1">
        {["❤️", "😂", "👍", "😮", "😢", "👏"].map((reaction) => (
          <button
            key={reaction}
            type="button"
            onClick={() => sendReaction(reaction)}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-base sm:text-lg transition cursor-pointer"
          >
            {reaction}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ReactionMenu;
