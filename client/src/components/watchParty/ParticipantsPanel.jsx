import React from "react";
import { XIcon } from "lucide-react";

const ParticipantsPanel = ({
  people,
  setPeople,
  participants,
  isHost,
  changeRole,
  transferHost,
  removeParticipant,
}) => {
  if (!people) return null;

  return (
    <div className="absolute inset-0 sm:top-0 sm:right-0 sm:left-auto sm:bottom-auto sm:h-full w-full sm:w-96 bg-white z-50 shadow-2xl border-l flex flex-col">
      {/* HEADER */}
      <div className="flex justify-between items-center px-3 sm:px-4 py-3 border-b">
        <div>
          <h2 className="font-semibold text-sm">Participants</h2>

          <p className="text-[10px] text-slate-500">
            {participants.length} people
          </p>
        </div>

        <button
          type="button"
          onClick={() => setPeople(false)}
          className="w-7 h-7 rounded-md hover:bg-slate-100 flex items-center justify-center cursor-pointer"
        >
          <XIcon className="w-4 h-4" />
        </button>
      </div>

      {/* PARTICIPANTS LIST */}
      <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 space-y-2">
        {participants.length ? (
          participants.map((p) => (
            <div
              key={p.id}
              className="border rounded-lg p-2.5 flex items-start gap-2"
            >
              {/* AVATAR */}
              <div className="w-8 h-8 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                {p.name?.charAt(0)?.toUpperCase() || "U"}
              </div>

              {/* USER INFO */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">
                  {p.name || "User"}{" "}
                  {p.isYou && <span className="text-primary">(You)</span>}
                </p>

                <span className="inline-block text-[9px] bg-slate-100 px-1.5 py-0.5 rounded-full mt-1">
                  {p.role || "Participant"}
                </span>
              </div>

              {/* HOST CONTROLS */}
              {!p.isYou && isHost && p.role !== "Host" && (
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={p.role || "Participant"}
                    onChange={(e) => changeRole(p.id, e.target.value)}
                    className="text-[9px] border rounded-md px-1 py-1"
                  >
                    <option value="Participant">Participant</option>
                    <option value="Moderator">Moderator</option>
                    <option value="Viewer">Viewer</option>
                  </select>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => transferHost(p.id)}
                      className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-1 rounded-md cursor-pointer"
                    >
                      Host
                    </button>

                    <button
                      type="button"
                      onClick={() => removeParticipant(p.id)}
                      className="text-[9px] bg-red-50 text-red-500 px-1.5 py-1 rounded-md cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-xs text-slate-400 mt-10">
            No participants yet
          </p>
        )}
      </div>
    </div>
  );
};
export default ParticipantsPanel;
