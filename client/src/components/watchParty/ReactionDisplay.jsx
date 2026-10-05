import React from "react";

const ReactionDisplay = ({ reactions }) => {
  if (!reactions.length) return null;

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 pointer-events-none">
      {reactions.map((item) => (
        <div
          key={item.id}
          className="bg-white/95 border border-slate-200 shadow-lg rounded-xl px-3 py-2 flex items-center gap-2"
        >
          <span className="text-xs font-semibold text-slate-700">
            {item.username}
          </span>

          <span className="text-xl">{item.reaction}</span>
        </div>
      ))}
    </div>
  );
};

export default ReactionDisplay;
