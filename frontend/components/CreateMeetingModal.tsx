"use client";

import React, { useState } from "react";
import { X, Calendar, Clock, Users, FileText } from "lucide-react";

interface CreateMeetingModalProps {
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    date: string;
    duration: number; // in seconds
    participants: string[];
    transcript_text: string;
  }) => Promise<void>;
}

export default function CreateMeetingModal({ onClose, onSubmit }: CreateMeetingModalProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16)); // YYYY-MM-DDTHH:MM
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [participantsText, setParticipantsText] = useState("");
  const [transcriptText, setTranscriptText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);

    try {
      const participants = participantsText
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      await onSubmit({
        title: title.trim(),
        date: new Date(date).toISOString(),
        duration: durationMinutes * 60, // minutes to seconds
        participants,
        transcript_text: transcriptText.trim()
      });
      onClose();
    } catch (err) {
      console.error("Error creating meeting:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs font-sans p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-base font-bold text-gray-900">Upload / Paste Transcript</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-550 uppercase tracking-widest text-gray-450">Meeting Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Q3 Sales Alignment"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm border border-gray-250 rounded-xl p-2.5 outline-none focus:border-purple-500 text-gray-800 transition-colors"
            />
          </div>

          {/* Date & Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-550 uppercase tracking-widest text-gray-455 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span>Date & Time</span>
              </label>
              <input
                type="datetime-local"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-sm border border-gray-250 rounded-xl p-2.5 outline-none focus:border-purple-500 text-gray-800 transition-colors cursor-pointer"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-555 uppercase tracking-widest text-gray-455 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span>Duration (Minutes)</span>
              </label>
              <input
                type="number"
                min={1}
                required
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full text-sm border border-gray-255 rounded-xl p-2.5 outline-none focus:border-purple-500 text-gray-800 transition-colors"
              />
            </div>
          </div>

          {/* Participants */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-555 uppercase tracking-widest text-gray-455 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-gray-400" />
              <span>Participants (comma-separated)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Alice Smith, Bob Jones, Charlie Brown"
              value={participantsText}
              onChange={(e) => setParticipantsText(e.target.value)}
              className="w-full text-sm border border-gray-255 rounded-xl p-2.5 outline-none focus:border-purple-500 text-gray-800 transition-colors"
            />
          </div>

          {/* Transcript text */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-555 uppercase tracking-widest text-gray-455 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-gray-400" />
              <span>Paste Raw Transcription Text</span>
            </label>
            <textarea
              required
              rows={6}
              placeholder="Paste transcript here. Example format:&#10;Alice (00:05): Hello Bob, how are you?&#10;Bob (00:08): I am good! We should start the review."
              value={transcriptText}
              onChange={(e) => setTranscriptText(e.target.value)}
              className="w-full text-sm border border-gray-255 rounded-xl p-3 outline-none focus:border-purple-500 text-gray-800 font-mono h-40 resize-none transition-colors"
            />
            <span className="text-[10px] text-gray-400 leading-normal block">
              Fireflies will automatically structure the timestamps, speaker avatars, overview, and extract key action items dynamically from this pasted text!
            </span>
          </div>

          {/* Footer actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold shadow-xs transition-colors cursor-pointer disabled:bg-purple-400"
            >
              {isLoading ? "Analyzing..." : "Create Meeting"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
