"use client";

import React, { useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Volume2, SkipForward } from "lucide-react";

interface MediaPlayerProps {
  currentTime: number; // in seconds
  duration: number; // in seconds
  isPlaying: boolean;
  onTimeChange: (time: number) => void;
  onPlayToggle: (playing: boolean) => void;
}

export default function MediaPlayer({
  currentTime,
  duration,
  isPlaying,
  onTimeChange,
  onPlayToggle,
}: MediaPlayerProps) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        onTimeChange(Math.min(currentTime + 1, duration));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, currentTime, duration, onTimeChange]);

  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    const minStr = String(minutes).padStart(2, "0");
    const secStr = String(seconds).padStart(2, "0");
    return `${minStr}:${secStr}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    onTimeChange(Number(e.target.value));
  };

  const handlePlayPause = () => {
    if (currentTime >= duration) {
      onTimeChange(0);
      onPlayToggle(true);
    } else {
      onPlayToggle(!isPlaying);
    }
  };

  const handleRewind = () => {
    onTimeChange(Math.max(0, currentTime - 5));
  };

  const handleForward = () => {
    onTimeChange(Math.min(duration, currentTime + 5));
  };

  const percent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-gray-950 border border-gray-900 rounded-xl p-4 flex flex-col gap-3 text-white shadow-lg w-full font-sans select-none">
      {/* Upper Area: Controls & Timer */}
      <div className="flex items-center justify-between gap-4">
        {/* Playback Controls */}
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRewind}
            className="p-1.5 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
            title="Rewind 5s"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          
          <button
            onClick={handlePlayPause}
            className="w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-500 flex items-center justify-center text-white transition-all shadow-md active:scale-95 cursor-pointer"
          >
            {isPlaying && currentTime < duration ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={handleForward}
            className="p-1.5 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
            title="Forward 5s"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Meeting Status text */}
        <div className="flex-1 text-center hidden md:block">
          <span className="text-[10px] font-bold text-purple-400 bg-purple-950/40 border border-purple-900/30 px-3 py-1 rounded-full uppercase tracking-widest">
            {isPlaying && currentTime < duration ? "Playing Audio" : "Paused"}
          </span>
        </div>

        {/* Audio Volume indicator placeholder */}
        <div className="flex items-center gap-2 text-gray-400">
          <Volume2 className="w-4 h-4" />
          <span className="text-xs font-semibold">100%</span>
        </div>
      </div>

      {/* Seek Track Bar */}
      <div className="flex items-center gap-3 w-full mt-1">
        <span className="text-xs font-mono text-gray-400 w-10 shrink-0 text-right">
          {formatTime(currentTime)}
        </span>

        <div className="relative flex-1 flex items-center">
          <input
            type="range"
            min={0}
            max={duration}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-gray-800 accent-purple-500 focus:outline-none"
            style={{
              background: `linear-gradient(to right, #9333ea 0%, #9333ea ${percent}%, #1f2937 ${percent}%, #1f2937 100%)`
            }}
          />
        </div>

        <span className="text-xs font-mono text-gray-400 w-10 shrink-0">
          {formatTime(duration)}
        </span>
      </div>
    </div>
  );
}
