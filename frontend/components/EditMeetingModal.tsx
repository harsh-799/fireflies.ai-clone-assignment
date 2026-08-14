"use client";

import React, { useState } from "react";
import { X, Calendar, Clock, Users } from "lucide-react";
import { MeetingDetail } from "../app/types";

interface EditMeetingModalProps {
  meeting: MeetingDetail;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    date: string;
    duration: number; // in seconds
    participants: string[];
  }) => Promise<void>;
}

export default function EditMeetingModal({ meeting, onClose, onSubmit }: EditMeetingModalProps) {
  const [title, setTitle] = useState(meeting.title);
  
  const initialDate = meeting.date 
    ? new Date(meeting.date).toISOString().slice(0, 16) 
    : new Date().toISOString().slice(0, 16);
    
  const [date, setDate] = useState(initialDate);
  const [durationMinutes, setDurationMinutes] = useState(Math.floor(meeting.duration / 60));
  
  const initialParticipants = meeting.participants
    ? meeting.participants.map(p => p.name).join(", ")
    : "";
  const [participantsText, setParticipantsText] = useState(initialParticipants);
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
        duration: durationMinutes * 60,
        participants,
      });
      onClose();
    } catch (err) {
      console.error("Error updating meeting:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs font-sans p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-base font-bold text-gray-900">Edit Meeting Details</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest text-gray-450">Meeting Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm border border-gray-250 rounded-xl p-2.5 outline-none focus:border-purple-500 text-gray-800 transition-colors"
            />
          </div>

          {/* Date & Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-550 uppercase tracking-widest flex items-center gap-1.5 text-gray-455">
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
              <label className="text-xs font-bold text-gray-555 uppercase tracking-widest flex items-center gap-1.5 text-gray-455">
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
            <label className="text-xs font-bold text-gray-555 uppercase tracking-widest flex items-center gap-1.5 text-gray-455">
              <Users className="w-3.5 h-3.5 text-gray-400" />
              <span>Participants (comma-separated)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Alice Smith, Bob Jones"
              value={participantsText}
              onChange={(e) => setParticipantsText(e.target.value)}
              className="w-full text-sm border border-gray-255 rounded-xl p-2.5 outline-none focus:border-purple-500 text-gray-800 transition-colors"
            />
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
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
