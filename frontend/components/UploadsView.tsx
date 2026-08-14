"use client";

import React, { useState, useRef } from "react";
import { 
  Search, 
  Upload,
  FileText,
  ChevronRight,
  Sparkles,
  Calendar,
  X
} from "lucide-react";
import { Meeting } from "../app/types";

interface UploadsViewProps {
  meetings: Meeting[];
  onTriggerCreate: () => void;
  onCreateMeeting?: (data: any) => Promise<void>;
  onSelectMeeting?: (id: number) => void;
  onTriggerToast: (msg: string, type?: "success" | "error") => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export default function UploadsView({
  meetings,
  onTriggerCreate,
  onCreateMeeting,
  onSelectMeeting,
  onTriggerToast,
  searchQuery,
  setSearchQuery
}: UploadsViewProps) {
  const [selectedFileForUpload, setSelectedFileForUpload] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDate, setUploadDate] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // File input ref for real file selection
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.name.endsWith(".txt")) {
      onTriggerToast("Only .txt transcript files are supported.", "error");
      return;
    }

    setSelectedFileForUpload(file);
    const baseName = file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
    setUploadTitle(baseName);
    setUploadDate(new Date().toISOString().slice(0, 16)); // Format: YYYY-MM-DDTHH:MM
  };

  // Submit file upload to API
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFileForUpload || isUploading) return;
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("title", uploadTitle.trim());
      formData.append("date", new Date(uploadDate).toISOString());
      formData.append("file", selectedFileForUpload);

      const res = await fetch(`/api/meetings/from-transcript-file`, {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to upload transcript file.");
      }

      const newMeeting = await res.json();
      onTriggerToast("Transcript uploaded and meeting created successfully!", "success");
      setSelectedFileForUpload(null);
      if (onSelectMeeting) {
        onSelectMeeting(newMeeting.id);
      }
    } catch (err: any) {
      console.error(err);
      onTriggerToast(err.message || "An error occurred during upload.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.round(seconds / 60);
    return `${mins} min`;
  };

  // Filter meetings list by search query
  const filteredMeetings = meetings.filter(m => 
    !searchQuery || m.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white font-sans">
      
      {/* Header Toolbar */}
      <header className="px-6 py-3 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white select-none">
        <h1 className="text-[15px] font-bold text-gray-900">Uploads</h1>
        
        {/* Center Search Bar */}
        <div className="max-w-[440px] w-full relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title or keyword"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-[13px] bg-[#F8FAFC] border border-gray-200 focus:border-[#6E2CF4] focus:bg-white rounded-xl py-2 pl-10 pr-14 outline-none text-gray-800 transition-all placeholder-gray-400"
          />
        </div>

        {/* Action button slots placeholder */}
        <div className="w-20"></div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50/30">
        <div className="max-w-4xl mx-auto px-8 py-8 space-y-8">
          
          {/* Hidden HTML File Input for real file selection */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange}
            accept=".txt" 
            className="hidden" 
          />

          {/* Drag & Drop Upload Dropzone matching Image 2 */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#C4B5FD] rounded-2xl py-14 px-8 flex flex-col items-center justify-center text-center gap-4 bg-white hover:border-[#8B5CF6] hover:bg-[#F9F5FF]/50 transition-all cursor-pointer group shadow-2xs"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Upload className="w-6 h-6" strokeWidth={2} />
            </div>
            
            <div className="space-y-1.5 max-w-md">
              <h3 className="text-[16px] font-bold text-gray-900">
                Upload a transcript to create a meeting
              </h3>
              <p className="text-[12.5px] text-gray-500 leading-relaxed font-normal">
                Upload a .txt transcript file or paste transcript text to create a meeting with speakers, timestamps, and meeting notes.
              </p>
              <p className="text-[11px] text-gray-400 font-semibold mt-1">
                Browse or drag and drop a TXT transcript file.
              </p>
            </div>

            <div className="flex items-center gap-3 mt-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="bg-[#6E2CF4] hover:bg-[#5B21D6] text-white font-medium py-2.5 px-6 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Browse Files
              </button>
              
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTriggerCreate();
                }}
                className="border border-purple-200 bg-purple-50 hover:bg-purple-100 text-[#6E2CF4] font-medium py-2.5 px-5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Paste Text Transcript</span>
              </button>
            </div>
          </div>

          {/* Uploaded Files Section */}
          {filteredMeetings.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-[13px] font-bold text-gray-900 select-none">Recent Transcript Uploads</h4>

              {filteredMeetings.map((meeting) => (
                <div 
                  key={meeting.id}
                  className="bg-[#F8FAFC] border border-gray-200/80 rounded-xl p-4 flex items-center justify-between hover:border-purple-200 transition-all shadow-2xs"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Format Badge */}
                    <div className="w-10 h-10 rounded-lg bg-[#38BDF8] flex items-center justify-center text-white font-extrabold text-[11px] shrink-0 shadow-2xs uppercase">
                      TXT
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-[13px] font-semibold text-gray-900 truncate">
                        {meeting.title}
                      </h4>
                      <span className="text-[11px] text-gray-400 font-medium block mt-0.5">
                        {new Date(meeting.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · {formatDuration(meeting.duration || 0)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-4 select-none">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          if (onSelectMeeting) {
                            onSelectMeeting(meeting.id);
                          }
                        }}
                        className="bg-purple-50 border border-purple-200 hover:bg-purple-100 text-[#6E2CF4] font-semibold py-1.5 px-3 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#6E2CF4]" />
                        <span>View Transcript & Summary</span>
                      </button>

                      <button 
                        onClick={() => {
                          if (onSelectMeeting) {
                            onSelectMeeting(meeting.id);
                          }
                        }}
                        className="border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-1.5 px-3 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Upload Details Modal Overlay */}
      {selectedFileForUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50 select-none">
              <h2 className="text-sm font-bold text-gray-900">Upload Transcript Details</h2>
              <button 
                onClick={() => setSelectedFileForUpload(null)}
                className="p-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleUploadSubmit} className="p-5 space-y-4">
              <div className="text-xs text-gray-500 font-medium bg-gray-50 border border-gray-200/50 rounded-xl p-3">
                <span className="font-bold text-gray-700 block mb-0.5">Selected File:</span>
                <span className="font-mono break-all">{selectedFileForUpload.name}</span>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-550 uppercase tracking-wider">Meeting Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q3 Sales Alignment"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full text-xs border border-gray-250 rounded-xl p-2.5 outline-none focus:border-purple-500 text-gray-800 transition-colors"
                />
              </div>

              {/* Date & Time */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-555 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span>Date & Time</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={uploadDate}
                  onChange={(e) => setUploadDate(e.target.value)}
                  className="w-full text-xs border border-gray-250 rounded-xl p-2.5 outline-none focus:border-purple-500 text-gray-800 transition-colors cursor-pointer"
                />
              </div>

              {/* Footer actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-150">
                <button
                  type="button"
                  onClick={() => setSelectedFileForUpload(null)}
                  disabled={isUploading}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:bg-purple-400"
                >
                  {isUploading ? "Uploading..." : "Upload & Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Help Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => onTriggerToast("Help & Support coming soon!", "success")}
          className="w-10 h-10 rounded-full bg-[#6E2CF4] hover:bg-[#5B21D6] text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer"
          title="Help & Support"
        >
          <span className="text-sm font-bold">?</span>
        </button>
      </div>
    </div>
  );
}