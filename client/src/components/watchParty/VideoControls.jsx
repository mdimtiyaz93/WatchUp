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
      <div className="flex items-center justify-between gap-2 w-full">
        <button
          type="button"
          onClick={isPlaying ? onPause : onPlay}
          disabled={!videoId}
          className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          title={isPlaying ? "Request Pause" : "Request Play"}
        >
          {isPlaying ? (
            <PauseIcon className="w-3.5 h-3.5" />
          ) : (
            <PlayIcon className="w-3.5 h-3.5" />
          )}
        </button>

        <button
          type="button"
          onClick={onSync}
          disabled={!videoId}
          className="h-8 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-medium flex items-center gap-1.5 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
        >
          <RotateCcwIcon className="w-3.5 h-3.5" />
          Sync
        </button>

        <form onSubmit={handleChange} className="flex gap-1">
          <SearchIcon className="w-4 h-4 text-slate-400 mt-2 hidden sm:block" />

          <input
            value={newVideoId}
            onChange={(e) => setNewVideoId(e.target.value)}
            placeholder="Paste YouTube URL"
            className="w-40 h-8 border border-slate-200 rounded-lg px-2 text-xs outline-none"
          />

          <button
            type="submit"
            disabled={!newVideoId.trim()}
            className="h-8 px-3 rounded-lg bg-primary text-white text-xs disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            Change
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="border border-slate-200 rounded-xl p-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={isPlaying ? onPause : onPlay}
          disabled={!videoId}
          className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <PauseIcon className="w-3.5 h-3.5" />
          ) : (
            <PlayIcon className="w-3.5 h-3.5" />
          )}
        </button>

        <button
          type="button"
          onClick={onSync}
          disabled={!videoId}
          className="h-8 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-medium flex items-center gap-1 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
        >
          <RotateCcwIcon className="w-3.5 h-3.5" />
          Sync
        </button>

        <form onSubmit={handleSeek} className="flex gap-1 flex-1 min-w-32">
          <input
            type="number"
            min="0"
            value={seekTime}
            onChange={(e) => setSeekTime(e.target.value)}
            placeholder="Seconds"
            className="w-full h-8 border border-slate-200 rounded-lg px-2 text-xs outline-none"
          />

          <button
            type="submit"
            disabled={!seekTime || !videoId}
            className="h-8 px-2.5 rounded-lg bg-slate-900 text-white text-xs disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            Seek
          </button>
        </form>

        <form onSubmit={handleChange} className="flex gap-1 flex-1 min-w-40">
          <SearchIcon className="w-4 h-4 text-slate-400 mt-2 hidden sm:block" />

          <input
            value={newVideoId}
            onChange={(e) => setNewVideoId(e.target.value)}
            placeholder="YouTube Video ID"
            className="flex-1 min-w-0 h-8 border border-slate-200 rounded-lg px-2 text-xs outline-none"
          />

          <button
            type="submit"
            disabled={!newVideoId.trim()}
            className="h-8 px-2.5 rounded-lg bg-primary text-white text-xs disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            Change
          </button>
        </form>
      </div>
    </div>
  );
};

export default VideoControls;
