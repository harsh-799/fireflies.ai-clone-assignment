"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Highlighter, MessageSquare, Save, X, Edit2 } from "lucide-react";
import { TranscriptSegment } from "../app/types";

interface TranscriptProps {
  segments: TranscriptSegment[];
  currentTime: number;
  isPlaying: boolean;
  onSegmentClick: (time: number) => void;
  onUpdateSegment: (segmentId: number, isHighlighted: boolean, comment: string | null) => Promise<void>;
  searchQuery?: string;
}

export default function Transcript({
  segments,
  currentTime,
  isPlaying,
  onSegmentClick,
  onUpdateSegment,
  searchQuery: searchQueryProp,
}: TranscriptProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const activeSearchQuery = searchQueryProp !== undefined ? searchQueryProp : localSearchQuery;
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [currentCommentText, setCurrentCommentText] = useState("");
  const transcriptContainerRef = useRef<HTMLDivElement>(null);

  // 1. Locate the active segment based on current time
  let activeIndex = -1;
  for (let i = 0; i < segments.length; i++) {
    if (currentTime >= segments[i].timestamp_seconds) {
      activeIndex = i;
    } else {
      break;
    }
  }
  const activeSegmentId = activeIndex !== -1 ? segments[activeIndex].id : null;

  // 2. Auto-scroll active segment into view when player ticks
  useEffect(() => {
    if (activeSegmentId && isPlaying) {
      const activeEl = document.getElementById(`segment-${activeSegmentId}`);
      if (activeEl && transcriptContainerRef.current) {
        activeEl.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }
  }, [activeSegmentId, isPlaying]);

  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    const minStr = String(minutes).padStart(2, "0");
    const secStr = String(seconds).padStart(2, "0");
    return `${minStr}:${secStr}`;
  };

  const getInitials = (name: string) => {
    return name ? name.substring(0, 2).toUpperCase() : "?";
  };

  // Get avatar color based on name
  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-purple-500 text-white",
      "bg-rose-500 text-white",
      "bg-emerald-500 text-white",
      "bg-amber-500 text-white",
      "bg-sky-500 text-white",
      "bg-fuchsia-500 text-white",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const highlightMatches = (text: string, search: string) => {
    if (!search) return text;
    const regex = new RegExp(`(${search})`, "gi");
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, index) => 
          part.toLowerCase() === search.toLowerCase() ? (
            <mark key={index} className="bg-yellow-200 text-gray-900 font-semibold px-0.5 rounded">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const handleToggleHighlight = async (e: React.MouseEvent, seg: TranscriptSegment) => {
    e.stopPropagation();
    await onUpdateSegment(seg.id, !seg.is_highlighted, seg.comment);
  };

  const handleStartComment = (e: React.MouseEvent, seg: TranscriptSegment) => {
    e.stopPropagation();
    setEditingCommentId(seg.id);
    setCurrentCommentText(seg.comment || "");
  };

  const handleSaveComment = async (segId: number, isHighlighted: boolean) => {
    const text = currentCommentText.trim() === "" ? null : currentCommentText.trim();
    await onUpdateSegment(segId, isHighlighted, text);
    setEditingCommentId(null);
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden font-sans">
      {/* Search Header */}
      {searchQueryProp === undefined && (
        <div className="p-3 border-b border-gray-150 flex items-center gap-2 bg-gray-50/50 select-none">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search within transcript..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
          />
          {localSearchQuery && (
            <button 
              onClick={() => setLocalSearchQuery("")}
              className="text-xs text-gray-400 hover:text-gray-600 font-bold"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Transcript Scroll Container */}
      <div 
        ref={transcriptContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[500px] scrollbar-thin"
      >
        {segments.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-gray-400 text-sm">
            <span>No transcript segments available.</span>
          </div>
        ) : (
          segments.map((seg) => {
            const isActive = activeSegmentId === seg.id;
            const hasMatch = activeSearchQuery && seg.text.toLowerCase().includes(activeSearchQuery.toLowerCase());
            
            return (
              <div
                key={seg.id}
                id={`segment-${seg.id}`}
                onClick={() => onSegmentClick(seg.timestamp_seconds)}
                className={`group flex items-start gap-4 p-3 rounded-xl transition-all cursor-pointer border ${
                  isActive 
                    ? "bg-purple-50/60 border-purple-200 shadow-xs" 
                    : hasMatch 
                      ? "bg-yellow-50/50 border-yellow-250" 
                      : "bg-transparent border-transparent hover:bg-gray-50/80"
                }`}
              >
                {/* Speaker Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-xs ${getAvatarColor(seg.speaker_name)}`}>
                  {getInitials(seg.speaker_name)}
                </div>

                {/* Content Block */}
                <div className="flex-1 min-w-0">
                  {/* Speaker Details */}
                  <div className="flex items-center justify-between mb-1 select-none">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">
                        {seg.speaker_name}
                      </span>
                      <span className="text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded font-semibold">
                        {formatTime(seg.timestamp_seconds)}
                      </span>
                    </div>

                    {/* Toolbar Actions */}
                    <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex items-center gap-1.5 bg-white border border-gray-200 rounded-md p-1 shadow-xs">
                      <button
                        onClick={(e) => handleToggleHighlight(e, seg)}
                        className={`p-1 rounded hover:bg-gray-100 transition-colors ${seg.is_highlighted ? "text-amber-500" : "text-gray-400"}`}
                        title={seg.is_highlighted ? "Remove Highlight" : "Highlight segment"}
                      >
                        <Highlighter className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleStartComment(e, seg)}
                        className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Add Comment/Note"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Transcript Text */}
                  <p className="text-sm leading-relaxed text-gray-700 select-text">
                    {highlightMatches(seg.text, activeSearchQuery)}
                  </p>

                  {/* Note display */}
                  {seg.comment && editingCommentId !== seg.id && (
                    <div className="mt-2 bg-amber-50/70 border border-amber-200/50 rounded-lg p-2 flex items-start gap-2 text-xs text-amber-800">
                      <div className="flex-1">
                        <span className="font-bold text-amber-900">Note: </span>
                        <span>{seg.comment}</span>
                      </div>
                      <button
                        onClick={(e) => handleStartComment(e, seg)}
                        className="text-amber-600 hover:text-amber-800 p-0.5 rounded transition-colors shrink-0"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Comment editor */}
                  {editingCommentId === seg.id && (
                    <div 
                      className="mt-2 bg-gray-50 border border-gray-200 rounded-lg p-2 space-y-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <textarea
                        value={currentCommentText}
                        onChange={(e) => setCurrentCommentText(e.target.value)}
                        placeholder="Write a comment or note about this segment..."
                        className="w-full text-xs bg-white border border-gray-200 rounded-md p-1.5 outline-none focus:border-purple-500 text-gray-800 h-14 resize-none"
                      />
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setEditingCommentId(null)}
                          className="px-2.5 py-1 border border-gray-200 rounded-md text-[10px] text-gray-500 bg-white hover:bg-gray-50 flex items-center gap-1 transition-colors font-semibold"
                        >
                          <X className="w-3 h-3" />
                          <span>Cancel</span>
                        </button>
                        <button
                          onClick={() => handleSaveComment(seg.id, seg.is_highlighted)}
                          className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-[10px] flex items-center gap-1 transition-colors font-bold shadow-xs cursor-pointer"
                        >
                          <Save className="w-3 h-3" />
                          <span>Save Note</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
