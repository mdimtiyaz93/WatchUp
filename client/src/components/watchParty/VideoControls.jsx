import React, { useEffect, useState } from "react";
import { PlayIcon, PauseIcon, RotateCcwIcon, SearchIcon } from "lucide-react";

const VideoControls = ({
  isHost,
  isModerator,
  isPlaying,
  videoId,
  onPlay,
  onPause,
  onSeek,
  onChangeVideo,
  onSync,
}) => {
  const [newVideoId, setNewVideoId] = useState(videoId || "");
  const [seekTime, setSeekTime] = useState("");

  const canControl = isHost || isModerator;

  useEffect(() => {
    setNewVideoId(videoId || "");
  }, [videoId]);

  const handleSeek = (e) => {
    e.preventDefault();

    const time = Number(seekTime);

    if (Number.isNaN(time) || time < 0) return;

    onSeek?.(time);
    setSeekTime("");
  };

  const handleChange = (e) => {
    e.preventDefault();

    if (!newVideoId.trim()) return;

    onChangeVideo?.(newVideoId.trim());
  };

  if (!canControl) {
    return (
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-1.5 w-full">
        <button
          type="button"
          onClick={isPlaying ? onPause : onPlay}
          disabled={!videoId}
          className="w-7 h-7 shrink-0 rounded-md bg-primary text-white flex items-center justify-center disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          title={isPlaying ? "Request Pause" : "Request Play"}
        >
          {isPlaying ? (
            <PauseIcon className="w-3 h-3" />
          ) : (
            <PlayIcon className="w-3 h-3" />
          )}
        </button>

        <button
          type="button"
          onClick={onSync}
          disabled={!videoId}
          className="h-7 px-2 sm:px-2.5 shrink-0 rounded-md bg-slate-100 hover:bg-slate-200 text-[10px] sm:text-[11px] font-medium flex items-center gap-1 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
        >
          <RotateCcwIcon className="w-3 h-3" />
          Sync
        </button>

        <form
          onSubmit={handleChange}
          className="flex gap-1 w-full sm:w-auto sm:flex-1 min-w-0"
        >
          <SearchIcon className="w-3.5 h-3.5 text-slate-400 mt-1.5 hidden sm:block shrink-0" />

          <input
            value={newVideoId}
            onChange={(e) => setNewVideoId(e.target.value)}
            placeholder="Paste YouTube URL"
            className="flex-1 min-w-0 h-7 border border-slate-200 rounded-md px-2 text-[10px] sm:text-[11px] outline-none"
          />

          <button
            type="submit"
            disabled={!newVideoId.trim()}
            className="h-7 px-2 sm:px-2.5 shrink-0 rounded-md bg-primary text-white text-[10px] sm:text-[11px] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            Change
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="border border-slate-200 rounded-lg p-1.5 w-full">
      <div className="flex flex-wrap items-center gap-1">
        <button
          type="button"
          onClick={isPlaying ? onPause : onPlay}
          disabled={!videoId}
          className="w-7 h-7 shrink-0 rounded-md bg-primary text-white flex items-center justify-center disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <PauseIcon className="w-3 h-3" />
          ) : (
            <PlayIcon className="w-3 h-3" />
          )}
        </button>

        <button
          type="button"
          onClick={onSync}
          disabled={!videoId}
          className="h-7 px-2 shrink-0 rounded-md bg-slate-100 hover:bg-slate-200 text-[10px] sm:text-[11px] font-medium flex items-center gap-1 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
        >
          <RotateCcwIcon className="w-3 h-3" />
          Sync
        </button>

        <form onSubmit={handleSeek} className="flex gap-1 flex-1 min-w-[120px]">
          <input
            type="number"
            min="0"
            value={seekTime}
            onChange={(e) => setSeekTime(e.target.value)}
            placeholder="Seconds"
            className="w-full min-w-0 h-7 border border-slate-200 rounded-md px-2 text-[10px] sm:text-[11px] outline-none"
          />

          <button
            type="submit"
            disabled={!seekTime || !videoId}
            className="h-7 px-2 shrink-0 rounded-md bg-slate-900 text-white text-[10px] sm:text-[11px] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            Seek
          </button>
        </form>

        <form
          onSubmit={handleChange}
          className="flex gap-1 flex-[1.2] min-w-[150px]"
        >
          <SearchIcon className="w-3.5 h-3.5 text-slate-400 mt-1.5 hidden sm:block shrink-0" />

          <input
            value={newVideoId}
            onChange={(e) => setNewVideoId(e.target.value)}
            placeholder="YouTube Video ID"
            className="flex-1 min-w-0 h-7 border border-slate-200 rounded-md px-2 text-[10px] sm:text-[11px] outline-none"
          />

          <button
            type="submit"
            disabled={!newVideoId.trim()}
            className="h-7 px-2 shrink-0 rounded-md bg-primary text-white text-[10px] sm:text-[11px] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            Change
          </button>
        </form>
      </div>
    </div>
  );
};

export default VideoControls;
