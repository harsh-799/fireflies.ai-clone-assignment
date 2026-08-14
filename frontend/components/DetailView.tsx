"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  ArrowLeft, 
  ChevronRight, 
  Download, 
  Edit2, 
  Trash2, 
  CalendarDays, 
  Clock, 
  Users,
  Search,
  Sparkles,
  Bot,
  Video,
  Share2,
  MoreHorizontal,
  Copy,
  Check,
  Send,
  Star,
  ThumbsUp,
  ThumbsDown,
  Globe,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Plus,
  Maximize2
} from "lucide-react";
import Transcript from "./Transcript";
import SummaryView from "./Summary";
import ActionItems from "./ActionItems";
import { MeetingDetail } from "../app/types";

interface DetailViewProps {
  meetingDetail: MeetingDetail;
  currentTime: number;
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>;
  isPlaying: boolean;
  setIsPlaying: (p: boolean) => void;
  detailTab: "summary" | "actions";
  setDetailTab: (t: "summary" | "actions") => void;
  onGoBack: () => void;
  onTriggerEdit: (m: MeetingDetail) => void;
  onTriggerDelete: (m: MeetingDetail) => void;
  onToggleActionComplete: (id: number, currentCompleted: boolean) => Promise<void>;
  onAddActionItem: (text: string, assignee: string) => Promise<void>;
  onEditActionItem: (id: number, text: string, assignee: string) => Promise<void>;
  onDeleteActionItem: (id: number) => Promise<void>;
  onUpdateTranscriptSegment: (segmentId: number, isHighlighted: boolean, comment: string | null) => Promise<void>;
  API_BASE_URL: string;
  onTriggerToast: (msg: string, type?: "success" | "error") => void;
}

export default function DetailView({
  meetingDetail,
  currentTime,
  setCurrentTime,
  isPlaying,
  setIsPlaying,
  detailTab,
  setDetailTab,
  onGoBack,
  onTriggerEdit,
  onTriggerDelete,
  onToggleActionComplete,
  onAddActionItem,
  onEditActionItem,
  onDeleteActionItem,
  onUpdateTranscriptSegment,
  API_BASE_URL,
  onTriggerToast,
}: DetailViewProps) {

  // Right sidebar tab state: AskFred vs Transcript
  const [rightPanelTab, setRightPanelTab] = useState<"askfred" | "transcript">("askfred");
  const [centerTab, setCenterTab] = useState<"notes" | "skills">("notes");
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Playback progress timer effect
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= meetingDetail.duration) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
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
  }, [isPlaying, meetingDetail.duration, setCurrentTime, setIsPlaying]);

  // AskFred chat state
  const [fredInput, setFredInput] = useState("");
  const [fredMessages, setFredMessages] = useState<Array<{ sender: "user" | "fred"; text: string }>>([]);

  // Smart Search & AI Filters state
  const [smartSearchQuery, setSmartSearchQuery] = useState("");
  const [activeAiFilter, setActiveAiFilter] = useState<"all" | "datetime" | "metrics" | "tasks">("all");
  const [activeSentimentFilter, setActiveSentimentFilter] = useState<"all" | "neutral" | "positive" | "negative">("all");
  const [activeSpeakerFilter, setActiveSpeakerFilter] = useState<string | null>(null);
  const [customTopicTracker, setCustomTopicTracker] = useState<string | null>(null);
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [newTopicText, setNewTopicText] = useState("");
  // AI Summary Generation state
  const [summaryStyle, setSummaryStyle] = useState<"general" | "executive" | "technical" | "action_centric">("general");
  const [isSummaryPresetOpen, setIsSummaryPresetOpen] = useState(false);
  const [isRefineModalOpen, setIsRefineModalOpen] = useState(false);
  const [refinePrompt, setRefinePrompt] = useState("");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [currentSummaryText, setCurrentSummaryText] = useState(meetingDetail.summary?.overview_text || "The purpose of the meeting is to set up recording for Google Meet calls using OBS, covering scene setup and audio configuration.");
  const [currentKeyTopics, setCurrentKeyTopics] = useState<string[]>(meetingDetail.summary?.key_topics || ["OBS Setup", "Google Meet Recording", "Audio Routing"]);

  const handleRegenerateSummary = async (style: string, customPrompt?: string) => {
    setSummaryStyle(style as any);
    setIsGeneratingSummary(true);
    setIsSummaryPresetOpen(false);
    setIsRefineModalOpen(false);

    try {
      const queryParams = new URLSearchParams({ style });
      if (customPrompt) queryParams.append("custom_prompt", customPrompt);

      const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
      const res = await fetch(`${API_BASE_URL}/meetings/${meetingDetail.id}/regenerate-summary?${queryParams.toString()}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token || ""}`,
          "Content-Type": "application/json"
        }
      });

      if (res.ok) {
        const updatedData = await res.json();
        if (updatedData.summary) {
          setCurrentSummaryText(updatedData.summary.overview_text);
          setCurrentKeyTopics(updatedData.summary.key_topics || []);
        }
      } else {
        // Fallback mock generation logic
        if (style === "executive") {
          setCurrentSummaryText(`EXECUTIVE BRIEF: High-level alignment meeting for '${meetingDetail.title}'. Key strategic priorities were established with clear milestones and immediate deliverables.`);
          setCurrentKeyTopics(["Strategic Alignment", "Executive Milestones", "Key Outcomes"]);
        } else if (style === "technical") {
          setCurrentSummaryText(`TECHNICAL BREAKDOWN: Comprehensive engineering overview for '${meetingDetail.title}'. Reviewed architecture configuration, window capture parameters, and audio routing settings across transcript segments.`);
          setCurrentKeyTopics(["OBS Scene Setup", "Audio Input Capture", "Desktop Routing"]);
        } else if (style === "action_centric") {
          setCurrentSummaryText(`ACTION-ITEM SUMMARY: Tactical summary for '${meetingDetail.title}'. Primary focus on task assignment, scene creation, and verification steps.`);
          setCurrentKeyTopics(["Task Execution", "Assigned Workflows", "Next Steps"]);
        } else {
          setCurrentSummaryText(customPrompt ? `CUSTOM AI FOCUS ('${customPrompt}'): Tailored summary for '${meetingDetail.title}'. Incorporated requested constraints.` : meetingDetail.summary?.overview_text || "General summary of meeting notes.");
          setCurrentKeyTopics(meetingDetail.summary?.key_topics || ["Google Meet Setup", "OBS Recording", "Audio Configuration"]);
        }
      }
    } catch (err) {
      console.error("Summary generation error:", err);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(mins).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const formatDate = (isoStr: string) => {
    const date = new Date(isoStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  };

  const handleSendFred = (textToSend?: string) => {
    const query = textToSend || fredInput.trim();
    if (!query) return;

    setFredMessages(prev => [...prev, { sender: "user", text: query }]);
    setFredInput("");

    setTimeout(() => {
      let botResponse = `🍳 AskFred is still cooking! (I am not yet integrated with a live LLM API).`;
      if (query.toLowerCase().includes("purpose")) {
        botResponse += `\n\nBased on the transcript for "${meetingDetail.title}":\nThe main purpose is to review setup, scene configuration, and audio routing for Google Meet recording.`;
      } else if (query.toLowerCase().includes("files") || query.toLowerCase().includes("where")) {
        botResponse += `\n\nBased on the transcript for "${meetingDetail.title}":\nRecording files are saved locally via File > Show Recordings in OBS.`;
      }

      setFredMessages(prev => [...prev, { sender: "fred", text: botResponse }]);
    }, 600);
  };

  const handleCopySummary = () => {
    if (meetingDetail.summary) {
      const summaryText = `${meetingDetail.summary.overview_text}\n\nKey Takeaways:\n${(meetingDetail.summary.key_topics || []).join("\n")}`;
      navigator.clipboard.writeText(summaryText);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    }
  };

  const handleExportMarkdown = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
      const res = await fetch(`${API_BASE_URL}/meetings/${meetingDetail.id}/export/markdown`, {
        headers: {
          "Authorization": `Bearer ${token || ""}`
        }
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${meetingDetail.title.toLowerCase().replace(/ /g, "_")}_notes.md`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        return;
      }
    } catch (err) {
      console.warn("Backend export endpoint offline, using client fallback:", err);
    }

    // Client-side fallback download
    let md = `# ${meetingDetail.title}\n`;
    md += `**Date:** ${formatDate(meetingDetail.date)}\n\n`;
    if (currentSummaryText) {
      md += `## AI Summary & Overview\n${currentSummaryText}\n\n`;
    }
    if (currentKeyTopics.length > 0) {
      md += `### Key Topics\n`;
      currentKeyTopics.forEach(t => { md += `- ${t}\n`; });
      md += `\n`;
    }
    if (meetingDetail.transcript_segments && meetingDetail.transcript_segments.length > 0) {
      md += `## Meeting Transcript\n`;
      meetingDetail.transcript_segments.forEach(s => {
        md += `**${s.speaker_name}**: ${s.text}\n\n`;
      });
    }

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${meetingDetail.title.toLowerCase().replace(/ /g, "_")}_notes.md`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  };

  const handleClearFilters = () => {
    setSmartSearchQuery("");
    setActiveAiFilter("all");
    setActiveSentimentFilter("all");
    setActiveSpeakerFilter(null);
    setCustomTopicTracker(null);
  };

  const hasActiveFilters = !!smartSearchQuery;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white font-sans text-gray-800 select-none">
      
      {/* 1. Header Toolbar matching Image 2 & 3 */}
      <header className="px-5 py-2.5 border-b border-gray-150 flex items-center justify-between shrink-0 bg-white z-20">
        {/* Left Breadcrumbs & Back */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button 
            onClick={onGoBack}
            className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            title="Back to meetings"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold truncate">
            <span className="hover:underline cursor-pointer text-gray-400" onClick={onGoBack}># All Meetings</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
            <span className="truncate max-w-[280px] text-gray-800 font-bold">{meetingDetail.title}</span>
          </div>
          <button 
            onClick={() => onTriggerEdit(meetingDetail)}
            className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-50 cursor-pointer ml-1"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button 
            onClick={() => alert("Upgrade feature")}
            className="bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#059669] font-semibold py-1 px-3 rounded-lg text-xs transition-colors cursor-pointer"
          >
            Upgrade
          </button>
          
          <div className="flex items-center gap-1 text-xs text-gray-400 font-medium px-2 py-1 rounded bg-gray-50 border border-gray-200">
            <span>👁 1 View</span>
          </div>

          <button 
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 bg-[#6E2CF4] hover:bg-[#5B21D6] text-white font-semibold py-1.5 px-3.5 rounded-lg text-xs transition-colors shadow-xs cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>

          <button 
            onClick={() => onTriggerToast("Download coming soon!", "success")}
            className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 hover:text-gray-700 cursor-pointer"
            title="Download Notes Markdown"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button 
            onClick={() => onTriggerDelete(meetingDetail)}
            className="p-1.5 border border-red-200 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            title="Delete meeting"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <div className="w-7 h-7 rounded-full bg-[#6E2CF4] text-white flex items-center justify-center font-bold text-xs">
            V
          </div>
        </div>
      </header>

      {/* 2. Main 3-Column Container */}
      <div className="flex-1 flex overflow-hidden bg-[#FAF9F6]">

        {/* ── COLUMN 1: Left Analytics & Smart Search Panel (Image 2 & 3) ── */}
        <div className="w-60 border-r border-gray-200 bg-white flex flex-col shrink-0 overflow-y-auto p-4 space-y-6 hidden lg:flex select-none scrollbar-thin">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Smart Search</h3>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="text-[10px] font-bold text-purple-600 hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search transcript.." 
                value={smartSearchQuery}
                onChange={(e) => {
                  setSmartSearchQuery(e.target.value);
                  if (e.target.value.trim() && rightPanelTab !== "transcript") {
                    setRightPanelTab("transcript");
                  }
                }}
                className="w-full text-xs bg-gray-50 border border-gray-200 focus:border-purple-400 focus:bg-white rounded-xl py-2 pl-8 pr-3 outline-none transition-colors"
              />
            </div>
          </div>
        </div>


        {/* ── COLUMN 2: Center Notes & AI Summary Panel (Image 2 & 3) ── */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-white p-6 space-y-6 scrollbar-thin">
          
          {/* Notes / AI Skills Switcher */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCenterTab("notes")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  centerTab === "notes" ? "bg-gray-100 text-gray-900 shadow-2xs" : "text-gray-400 hover:text-gray-700"
                }`}
              >
                Notes
              </button>
              <button 
                onClick={() => setCenterTab("skills")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  centerTab === "skills" ? "bg-gray-100 text-gray-900 shadow-2xs" : "text-gray-400 hover:text-gray-700"
                }`}
              >
                AI Skills · 0
              </button>
            </div>

            <button 
              onClick={() => alert("Full screen view")} 
              className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {hasActiveFilters && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 flex items-center justify-between text-xs text-purple-900 font-medium select-none animate-in fade-in duration-150">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-purple-700">🔍 Filter Active:</span>
                {smartSearchQuery && <span className="bg-white border border-purple-200 px-2 py-0.5 rounded font-bold text-purple-800">"{smartSearchQuery}"</span>}
              </div>
              <button 
                onClick={handleClearFilters} 
                className="text-purple-600 hover:text-purple-900 font-bold hover:underline ml-2 cursor-pointer shrink-0"
              >
                Clear Filter ✕
              </button>
            </div>
          )}

          {/* Title & Meta Row */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h1 className="text-xl font-bold text-gray-950 tracking-tight">
                {meetingDetail.title}
              </h1>
              <button className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer">
                <Video className="w-3.5 h-3.5 text-purple-600" />
                <span>Video</span>
              </button>
            </div>

            {/* Author info */}
            <div className="flex items-center gap-2.5 text-xs text-gray-500 font-medium">
              <div className="w-6 h-6 rounded-full bg-purple-700 text-white font-bold text-[10px] flex items-center justify-center">
                HA
              </div>
              <span className="font-bold text-gray-800">Harsh Anand</span>
              <span>{formatDate(meetingDetail.date)}</span>
              <span>↑</span>
              <span className="flex items-center gap-1 text-gray-400 cursor-pointer hover:text-gray-600">
                English (Global) ▼
              </span>
            </div>
          </div>

          {/* Summary Action Toolbar */}
          <div className="relative flex items-center gap-3 pt-2 border-t border-gray-100">
            {/* Preset Switcher Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsSummaryPresetOpen(!isSummaryPresetOpen)}
                className="flex items-center gap-1.5 text-xs font-bold text-[#6E2CF4] bg-purple-50 hover:bg-purple-100 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {summaryStyle === "executive" ? "Executive Brief" :
                   summaryStyle === "technical" ? "Technical Breakdown" :
                   summaryStyle === "action_centric" ? "Action-Item Centric" :
                   "General Summary"} ▼
                </span>
              </button>

              {isSummaryPresetOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsSummaryPresetOpen(false)} />
                  <div className="absolute top-full left-0 mt-1 z-40 bg-white border border-gray-200 rounded-xl shadow-lg p-1.5 w-56 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-150">
                    <button
                      onClick={() => handleRegenerateSummary("general")}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-purple-50 flex items-center justify-between text-gray-800 font-semibold cursor-pointer"
                    >
                      <span>✨ General Summary</span>
                      {summaryStyle === "general" && <Check className="w-3.5 h-3.5 text-purple-600" />}
                    </button>
                    <button
                      onClick={() => handleRegenerateSummary("executive")}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-purple-50 flex items-center justify-between text-gray-800 font-semibold cursor-pointer"
                    >
                      <span>⚡ Executive Brief</span>
                      {summaryStyle === "executive" && <Check className="w-3.5 h-3.5 text-purple-600" />}
                    </button>
                    <button
                      onClick={() => handleRegenerateSummary("technical")}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-purple-50 flex items-center justify-between text-gray-800 font-semibold cursor-pointer"
                    >
                      <span>🛠️ Technical Breakdown</span>
                      {summaryStyle === "technical" && <Check className="w-3.5 h-3.5 text-purple-600" />}
                    </button>
                    <button
                      onClick={() => handleRegenerateSummary("action_centric")}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-purple-50 flex items-center justify-between text-gray-800 font-semibold cursor-pointer"
                    >
                      <span>📌 Action-Item Centric</span>
                      {summaryStyle === "action_centric" && <Check className="w-3.5 h-3.5 text-purple-600" />}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Refine Summary Button */}
            <button 
              onClick={() => setIsRefineModalOpen(true)}
              className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <span>✏️ Refine Summary</span>
            </button>

            <button 
              onClick={handleCopySummary}
              className="text-gray-400 hover:text-gray-600 cursor-pointer ml-auto"
              title="Copy summary"
            >
              {copiedSummary ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* AI Generation Loading Indicator */}
          {isGeneratingSummary && (
            <div className="bg-purple-50/80 border border-purple-200 rounded-xl p-3.5 flex items-center gap-3 animate-pulse text-xs text-purple-900 font-semibold">
              <Sparkles className="w-4 h-4 text-purple-600 animate-spin" />
              <span>✨ Generating custom AI summary notes...</span>
            </div>
          )}

          {/* Summary Overview Banner */}
          {currentSummaryText && (
            <div className="bg-[#FAF8FF] border border-purple-100 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-purple-900">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  AI Summary Overview
                </span>
                <span className="text-[10px] text-purple-500 bg-purple-100/60 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {summaryStyle}
                </span>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed font-medium">
                {currentSummaryText}
              </p>
              {currentKeyTopics.length > 0 && (
                <div className="flex items-center gap-1.5 pt-1.5 flex-wrap">
                  {currentKeyTopics.map((topic, i) => (
                    <span key={i} className="text-[11px] font-bold text-purple-700 bg-purple-100/70 px-2.5 py-0.5 rounded-md">
                      #{topic}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Refine Summary Modal Overlay */}
          {isRefineModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <h3 className="text-sm font-bold text-gray-900">Refine AI Summary</h3>
                  </div>
                  <button 
                    onClick={() => setIsRefineModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 font-bold text-base cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-xs text-gray-500 font-medium">
                  Provide custom instructions for Fireflies AI to regenerate and tailor this meeting summary to your exact needs.
                </p>

                {/* Preset Chips */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => setRefinePrompt("Summarize in 3 concise bullet points with timestamp links")}
                    className="text-[11px] font-semibold bg-gray-100 hover:bg-purple-100 hover:text-purple-700 text-gray-700 px-2.5 py-1 rounded-full cursor-pointer transition-colors"
                  >
                    • Bullet Points
                  </button>
                  <button
                    onClick={() => setRefinePrompt("Focus on technical architecture and audio routing parameters")}
                    className="text-[11px] font-semibold bg-gray-100 hover:bg-purple-100 hover:text-purple-700 text-gray-700 px-2.5 py-1 rounded-full cursor-pointer transition-colors"
                  >
                    🛠️ Technical Focus
                  </button>
                  <button
                    onClick={() => setRefinePrompt("Highlight executive takeaways and key decisions for leadership")}
                    className="text-[11px] font-semibold bg-gray-100 hover:bg-purple-100 hover:text-purple-700 text-gray-700 px-2.5 py-1 rounded-full cursor-pointer transition-colors"
                  >
                    ⚡ Executive Summary
                  </button>
                </div>

                <textarea
                  rows={4}
                  value={refinePrompt}
                  onChange={(e) => setRefinePrompt(e.target.value)}
                  placeholder="e.g. Focus on OBS audio setup steps, list deadlines, and highlight key decisions..."
                  className="w-full text-xs border border-gray-200 focus:border-purple-400 rounded-xl p-3 outline-none resize-none"
                />

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsRefineModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleRegenerateSummary(summaryStyle, refinePrompt)}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#6E2CF4] hover:bg-[#5B21D6] text-white rounded-xl cursor-pointer shadow-xs transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate AI Summary</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── NOTES / OUTLINE SECTION matching Image 2 ── */}
          <div className="space-y-6 pt-2">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-900">Notes</h3>
              <h4 className="text-xs font-bold text-gray-800">Google Meet Recording Setup</h4>
              
              <ul className="space-y-2 text-xs text-gray-700 leading-relaxed list-disc pl-4">
                <li>
                  Create new scene in OBS named Google Meet calls{" "}
                  <button 
                    onClick={() => { setCurrentTime(0); setIsPlaying(true); }}
                    className="text-[#6E2CF4] hover:underline font-semibold cursor-pointer"
                  >
                    (00:00)
                  </button>
                  <ul className="list-circle pl-5 mt-1 space-y-1 text-gray-600">
                    <li>Select Window Capture source</li>
                    <li>Choose Google Meet window</li>
                  </ul>
                </li>
                <li>
                  Configure audio sources in OBS settings{" "}
                  <button 
                    onClick={() => { setCurrentTime(15); setIsPlaying(true); }}
                    className="text-[#6E2CF4] hover:underline font-semibold cursor-pointer"
                  >
                    (00:15)
                  </button>
                  <ul className="list-circle pl-5 mt-1 space-y-1 text-gray-600">
                    <li>Set Desktop Audio to default device</li>
                    <li>Add Audio Input Capture for microphone</li>
                  </ul>
                </li>
              </ul>

              <h4 className="text-xs font-bold text-gray-800 pt-2">Recording Process</h4>
              <ul className="space-y-2 text-xs text-gray-700 leading-relaxed list-disc pl-4">
                <li>
                  Start recording in OBS to capture video and audio{" "}
                  <button 
                    onClick={() => { setCurrentTime(45); setIsPlaying(true); }}
                    className="text-[#6E2CF4] hover:underline font-semibold cursor-pointer"
                  >
                    (00:45)
                  </button>
                </li>
                <li>
                  Stop recording and locate file via File &gt; Show Recordings{" "}
                  <button 
                    onClick={() => { setCurrentTime(114); setIsPlaying(true); }}
                    className="text-[#6E2CF4] hover:underline font-semibold cursor-pointer"
                  >
                    (01:54)
                  </button>
                </li>
              </ul>
            </div>

            {/* ── ACTION ITEMS SECTION matching Image 3 ── */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">Action items</h3>
              <h4 className="text-xs font-semibold text-gray-500">Unassigned</h4>
              
              <ul className="space-y-2 text-xs text-gray-700 leading-relaxed list-disc pl-4">
                <li>
                  Create new scene "Google Meet calls"{" "}
                  <button 
                    onClick={() => { setCurrentTime(15); setIsPlaying(true); }}
                    className="text-[#6E2CF4] hover:underline font-semibold cursor-pointer"
                  >
                    (00:15)
                  </button>
                </li>
                <li>
                  Add Google Meet window as Window Capture source{" "}
                  <button 
                    onClick={() => { setCurrentTime(35); setIsPlaying(true); }}
                    className="text-[#6E2CF4] hover:underline font-semibold cursor-pointer"
                  >
                    (00:35)
                  </button>
                </li>
                <li>
                  Configure Desktop Audio in OBS{" "}
                  <button 
                    onClick={() => { setCurrentTime(55); setIsPlaying(true); }}
                    className="text-[#6E2CF4] hover:underline font-semibold cursor-pointer"
                  >
                    (00:55)
                  </button>
                </li>
                <li>
                  Add microphone as Audio Input Capture source{" "}
                  <button 
                    onClick={() => { setCurrentTime(90); setIsPlaying(true); }}
                    className="text-[#6E2CF4] hover:underline font-semibold cursor-pointer"
                  >
                    (01:30)
                  </button>
                </li>
                <li>
                  Start recording Google Meet call{" "}
                  <button 
                    onClick={() => { setCurrentTime(100); setIsPlaying(true); }}
                    className="text-[#6E2CF4] hover:underline font-semibold cursor-pointer"
                  >
                    (01:40)
                  </button>
                </li>
                <li>
                  Stop recording and locate video file{" "}
                  <button 
                    onClick={() => { setCurrentTime(114); setIsPlaying(true); }}
                    className="text-[#6E2CF4] hover:underline font-semibold cursor-pointer"
                  >
                    (01:54)
                  </button>
                </li>
              </ul>
            </div>

            {/* ── FEEDBACK & CONTINUE CARDS matching Image 3 ── */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="bg-gray-50 border border-gray-200/60 rounded-xl p-4 flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-700">Did you like the summary?</span>
                <div className="flex gap-1 text-gray-300 cursor-pointer hover:text-amber-400">
                  {"★★★★★".split("").map((star, idx) => (
                    <span key={idx} className="text-base">{star}</span>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-b from-[#F5F3FF] to-white border border-purple-100 rounded-2xl p-5 space-y-3">
                <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                  <span>Continue from this meeting</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  The purpose of the meeting is to set up recording for Google Meet calls using OBS, covering scene setup and audio configuration.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button 
                    onClick={() => handleSendFred("Troubleshooting guides")}
                    className="bg-purple-100 hover:bg-purple-200 text-[#6E2CF4] font-semibold px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors"
                  >
                    + Troubleshooting Guides
                  </button>
                  <button 
                    onClick={() => handleSendFred("Technical issue tracker")}
                    className="bg-purple-100 hover:bg-purple-200 text-[#6E2CF4] font-semibold px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors"
                  >
                    + Technical issue tracker
                  </button>
                  <button 
                    onClick={() => handleSendFred("Issue resolution")}
                    className="bg-purple-100 hover:bg-purple-200 text-[#6E2CF4] font-semibold px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors"
                  >
                    + Issue Resolution
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>


        {/* ── COLUMN 3: Right AskFred & Transcript Panel (Image 2 & 3) ── */}
        <div className="w-80 border-l border-gray-200 bg-white flex flex-col shrink-0 overflow-hidden select-none">
          
          {/* Top Panel Tab Switcher */}
          <div className="flex border-b border-gray-100 px-4 pt-3 bg-white shrink-0">
            <button 
              onClick={() => setRightPanelTab("askfred")}
              className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                rightPanelTab === "askfred"
                  ? "border-[#6E2CF4] text-[#6E2CF4]"
                  : "border-transparent text-gray-400 hover:text-gray-700"
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AskFred</span>
            </button>
            <button 
              onClick={() => setRightPanelTab("transcript")}
              className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                rightPanelTab === "transcript"
                  ? "border-[#6E2CF4] text-[#6E2CF4]"
                  : "border-transparent text-gray-400 hover:text-gray-700"
              }`}
            >
              Transcript
            </button>
          </div>

          {/* Right Tab Content */}
          <div className="flex-1 overflow-y-auto flex flex-col justify-between scrollbar-thin">
            {rightPanelTab === "askfred" ? (
              <div className="flex-1 flex flex-col justify-between p-4 overflow-y-auto">
                <div className="space-y-4">
                  {fredMessages.length === 0 && (
                    <div className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <Sparkles className="w-5 h-5 text-emerald-400" />
                        <h4 className="text-sm font-bold text-gray-950">Hi Harsh!</h4>
                        <p className="text-xs font-semibold text-gray-600">Ask anything about this meeting</p>
                      </div>

                      {/* Quick Pills matching Image 2 & 3 */}
                      <div className="space-y-2 flex flex-col pt-2 select-none">
                        <button 
                          onClick={() => handleSendFred("What format should the recordings be in?")}
                          className="w-full text-left bg-white hover:bg-purple-50/40 border border-gray-200 hover:border-purple-300 rounded-lg p-2.5 text-xs text-gray-700 font-medium cursor-pointer transition-all shadow-2xs"
                        >
                          What format should the recordings be in?
                        </button>
                        <button 
                          onClick={() => handleSendFred("What is the main purpose of recording?")}
                          className="w-full text-left bg-white hover:bg-purple-50/40 border border-gray-200 hover:border-purple-300 rounded-lg p-2.5 text-xs text-gray-700 font-medium cursor-pointer transition-all shadow-2xs"
                        >
                          What is the main purpose of recording?
                        </button>
                        <button 
                          onClick={() => handleSendFred("Where can I find the recording files?")}
                          className="w-full text-left bg-white hover:bg-purple-50/40 border border-gray-200 hover:border-purple-300 rounded-lg p-2.5 text-xs text-gray-700 font-medium cursor-pointer transition-all shadow-2xs"
                        >
                          Where can I find the recording files?
                        </button>
                        <button 
                          onClick={() => handleSendFred("Are there any tips for better audio quality?")}
                          className="w-full text-left bg-white hover:bg-purple-50/40 border border-gray-200 hover:border-purple-300 rounded-lg p-2.5 text-xs text-gray-700 font-medium cursor-pointer transition-all shadow-2xs"
                        >
                          Are there any tips for better audio quality?
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Chat Messages */}
                  {fredMessages.map((msg, i) => (
                    <div 
                      key={i} 
                      className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === "user" 
                          ? "ml-auto bg-[#6E2CF4] text-white rounded-tr-none max-w-[85%]" 
                          : "bg-gray-100 text-gray-800 rounded-tl-none max-w-[90%]"
                      }`}
                    >
                      <span className="whitespace-pre-line font-medium">{msg.text}</span>
                    </div>
                  ))}
                </div>

                {/* Input Form at Bottom */}
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSendFred(); }}
                  className="mt-4 border border-gray-250 rounded-lg p-2.5 flex items-center justify-between bg-white focus-within:border-purple-400 shadow-2xs"
                >
                  <input 
                    type="text" 
                    placeholder="Ask anything. Type / to run AI Skills" 
                    value={fredInput}
                    onChange={(e) => setFredInput(e.target.value)}
                    className="w-full text-xs outline-none bg-transparent pr-2 text-gray-800"
                  />
                  <button 
                    type="submit"
                    disabled={!fredInput.trim()}
                    className="p-1.5 bg-[#6E2CF4] hover:bg-[#5B21D6] text-white rounded-lg disabled:bg-gray-200 disabled:text-gray-400 cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                  </button>
                </form>
              </div>
            ) : (
              <div className="p-4 flex-1 flex flex-col overflow-hidden">
                <Transcript 
                  segments={meetingDetail.transcript_segments}
                  currentTime={currentTime}
                  isPlaying={isPlaying}
                  onSegmentClick={(t) => { setCurrentTime(t); setIsPlaying(true); }}
                  onUpdateSegment={onUpdateTranscriptSegment}
                  searchQuery={smartSearchQuery}
                />
              </div>
            )}
          </div>

        </div>

      </div>


      {/* 3. Bottom Fixed Media Controls Bar matching Image 2 & 3 */}
      <div className="border-t border-gray-200 bg-white shrink-0 select-none z-30 flex flex-col w-full">
        {/* Seekbar Progress Slider */}
        <div className="w-full px-6 pt-2 bg-white">
          <input
            type="range"
            min={0}
            max={meetingDetail.duration}
            value={currentTime}
            onChange={(e) => setCurrentTime(Number(e.target.value))}
            className="w-full h-1 rounded-lg appearance-none cursor-pointer bg-gray-200 accent-[#6E2CF4] focus:outline-none transition-all hover:h-1.5"
            style={{
              background: `linear-gradient(to right, #6E2CF4 0%, #6E2CF4 ${meetingDetail.duration > 0 ? (currentTime / meetingDetail.duration) * 100 : 0}%, #e5e7eb ${meetingDetail.duration > 0 ? (currentTime / meetingDetail.duration) * 100 : 0}%, #e5e7eb 100%)`
            }}
          />
        </div>
        <footer className="h-12 px-6 flex items-center justify-between w-full">
          {/* Left Time Indicator */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 min-w-[100px]">
            <span>{formatTime(currentTime)}</span>
            <span className="text-gray-400">/</span>
            <span>{formatTime(meetingDetail.duration)}</span>
            <span className="text-[10px] text-gray-400">▼</span>
          </div>

          {/* Center Media Player Buttons */}
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-gray-500 cursor-pointer hover:text-gray-800">1x</span>
            
            <button 
              onClick={() => setCurrentTime(Math.max(0, currentTime - 5))}
              className="p-1 text-gray-500 hover:text-gray-800 cursor-pointer"
              title="Rewind 5s"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-9 h-9 rounded-full bg-[#6E2CF4] hover:bg-[#5B21D6] text-white flex items-center justify-center shadow-xs transition-transform active:scale-95 cursor-pointer"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>

            <button 
              onClick={() => setCurrentTime(Math.min(meetingDetail.duration, currentTime + 5))}
              className="p-1 text-gray-500 hover:text-gray-800 cursor-pointer"
              title="Forward 5s"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            <button 
              onClick={() => onTriggerToast("Download coming soon!", "success")}
              className="p-1 text-gray-500 hover:text-gray-800 cursor-pointer"
              title="Download transcript"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          {/* Right Rating Icons */}
          <div className="flex items-center gap-3 text-gray-400">
            <Star className="w-4 h-4 hover:text-amber-400 cursor-pointer" />
            <ThumbsUp className="w-4 h-4 hover:text-emerald-500 cursor-pointer" />
            <ThumbsDown className="w-4 h-4 hover:text-rose-500 cursor-pointer" />
            <Share2 className="w-4 h-4 hover:text-purple-600 cursor-pointer" />
          </div>
        </footer>
      </div>

    </div>
  );
}
