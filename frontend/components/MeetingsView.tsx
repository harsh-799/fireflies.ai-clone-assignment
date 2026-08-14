"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  Video, 
  Mic, 
  Bell, 
  Plus, 
  ChevronRight, 
  Sparkles, 
  MessageSquare,
  FolderOpen,
  Hash,
  Send,
  Grid,
  Bot,
  Filter,
  MoreVertical,
  Edit2,
  Trash2
} from "lucide-react";
import { Meeting } from "../app/types";

interface MeetingsViewProps {
  meetings: Meeting[];
  onSelectMeeting: (id: number) => void;
  onTriggerCreate: () => void;
  onTriggerToast: (msg: string, type?: "success" | "error") => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onRenameMeeting: (id: number, newTitle: string) => Promise<void>;
  onDeleteMeeting: (meeting: Meeting) => void;
}

export default function MeetingsView({
  meetings,
  onSelectMeeting,
  onTriggerCreate,
  onTriggerToast,
  searchQuery,
  setSearchQuery,
  onRenameMeeting,
  onDeleteMeeting,
}: MeetingsViewProps) {
  const [meetingsSubTab, setMeetingsSubTab] = useState<"my" | "all" | "voice">("my");
  const [hostedTab, setHostedTab] = useState<"hosted" | "shared">("hosted");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "fred"; text: string }>>([]);
  const [activeMenuMeetingId, setActiveMenuMeetingId] = useState<number | null>(null);

  // Close card menu dropdown if clicking outside
  useEffect(() => {
    const handleOutsideClick = () => {
      setActiveMenuMeetingId(null);
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  // ── Fully functional filter states ──
  const [filterCategory, setFilterCategory] = useState<"Hosted by" | "Participants" | "Date Range" | "Duration">("Hosted by");
  const [selectedHosts, setSelectedHosts] = useState<string[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [selectedDurationFilter, setSelectedDurationFilter] = useState<"all" | "short" | "medium" | "long">("all");
  const [selectedDateRangeFilter, setSelectedDateRangeFilter] = useState<"all" | "7days" | "30days">("all");
  const [filterQueryText, setFilterQueryText] = useState("");

  const handleClearAllFilters = () => {
    setSelectedHosts([]);
    setSelectedParticipants([]);
    setSelectedDurationFilter("all");
    setSelectedDateRangeFilter("all");
    setFilterQueryText("");
  };

  // Close filter dropdown on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFiltersOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Mock data that mirrors the screenshot
  const hostedMockMeetings = [
    {
      id: 901,
      title: "Sprint 14 Standup — Frontend Team",
      date: new Date(Date.now() - 0.5 * 24 * 3600 * 1000).toISOString(),
      duration: 900,
      participants: [{ id: 1, name: "Harsh Anand" }, { id: 2, name: "Ankit Mehta" }, { id: 3, name: "Priya Sharma" }],
      status: "completed",
      sharedBy: null,
    },
    {
      id: 902,
      title: "Backend API Review — Auth & Meetings",
      date: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
      duration: 2700,
      participants: [{ id: 1, name: "Harsh Anand" }, { id: 4, name: "Rohan Gupta" }],
      status: "completed",
      sharedBy: null,
    },
    {
      id: 903,
      title: "1:1 — Manager Sync with Neha",
      date: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      duration: 1800,
      participants: [{ id: 1, name: "Harsh Anand" }, { id: 5, name: "Neha Kapoor" }],
      status: "completed",
      sharedBy: null,
    },
    {
      id: 904,
      title: "Design Handoff — Dashboard V2 Screens",
      date: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
      duration: 3600,
      participants: [{ id: 1, name: "Harsh Anand" }, { id: 6, name: "Simran Kaur" }, { id: 7, name: "Aarav Patel" }, { id: 8, name: "Meera Shah" }],
      status: "completed",
      sharedBy: null,
    },
    {
      id: 905,
      title: "Investor Demo Prep — Seed Round",
      date: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
      duration: 5400,
      participants: [{ id: 1, name: "Harsh Anand" }, { id: 9, name: "Arjun Reddy" }, { id: 10, name: "Kavya Nair" }, { id: 11, name: "Sam Wilson" }, { id: 12, name: "Rita Verma" }],
      status: "completed",
      sharedBy: null,
    },
  ];

  const sharedMeetings = [
    {
      id: 951,
      title: "Marketing Alignment Session Q3",
      date: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      duration: 2400,
      participants: [{ id: 20, name: "Alice Smith" }, { id: 21, name: "Bob Jones" }, { id: 22, name: "Emma Watson" }],
      status: "completed",
      sharedBy: "Alice Smith",
    },
    {
      id: 952,
      title: "Product Roadmap Planning — H2 2026",
      date: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
      duration: 3600,
      participants: [{ id: 23, name: "Sarup Banskota" }, { id: 24, name: "Emma Watson" }, { id: 25, name: "Leo Chen" }],
      status: "completed",
      sharedBy: "Sarup Banskota",
    },
    {
      id: 953,
      title: "Client Onboarding — Acme Corp",
      date: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
      duration: 1500,
      participants: [{ id: 26, name: "Diana Prince" }, { id: 1, name: "Harsh Anand" }],
      status: "completed",
      sharedBy: "Diana Prince",
    },
    {
      id: 954,
      title: "Cross-Team Retro — Platform Engineering",
      date: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
      duration: 2700,
      participants: [{ id: 27, name: "Ravi Kumar" }, { id: 28, name: "Sneha Roy" }, { id: 29, name: "Karan Iyer" }],
      status: "completed",
      sharedBy: "Ravi Kumar",
    },
  ];

  const voiceAgentMeetings = [
    {
      id: 981,
      title: "AI Voice Bot — Inbound Lead Qualification",
      date: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
      duration: 420,
      participants: [{ id: 30, name: "AskFred AI" }, { id: 31, name: "Prospective Customer" }],
      status: "completed",
      sharedBy: "AskFred AI",
    },
    {
      id: 982,
      title: "Automated Follow-up Call — Customer Support",
      date: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      duration: 680,
      participants: [{ id: 30, name: "AskFred AI" }, { id: 32, name: "John Doe" }],
      status: "completed",
      sharedBy: "AskFred AI",
    },
  ];

  const allHosted = meetings.map(m => ({ ...m, status: "completed", sharedBy: null, participants: m.participants || [] }));

  let displayedMeetings: any[] = [];
  if (meetingsSubTab === "my") {
    displayedMeetings = hostedTab === "hosted" ? allHosted : [];
  } else if (meetingsSubTab === "all") {
    displayedMeetings = allHosted;
  } else {
    displayedMeetings = [];
  }

  // 1. Filter by search query
  if (searchQuery.trim()) {
    displayedMeetings = displayedMeetings.filter(m =>
      m.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // 2. Filter by selected hosts
  if (selectedHosts.length > 0) {
    displayedMeetings = displayedMeetings.filter(m => 
      selectedHosts.some(host => 
        m.title.toLowerCase().includes(host.toLowerCase()) || 
        (m.sharedBy && m.sharedBy.toLowerCase().includes(host.toLowerCase())) ||
        (m.participants && m.participants.some((p: any) => p.name.toLowerCase().includes(host.toLowerCase())))
      )
    );
  }

  // 3. Filter by selected participants
  if (selectedParticipants.length > 0) {
    displayedMeetings = displayedMeetings.filter(m =>
      m.participants && m.participants.some((p: any) => selectedParticipants.includes(p.name))
    );
  }

  // 4. Filter by duration
  if (selectedDurationFilter === "short") {
    displayedMeetings = displayedMeetings.filter(m => m.duration && m.duration <= 900);
  } else if (selectedDurationFilter === "medium") {
    displayedMeetings = displayedMeetings.filter(m => m.duration && m.duration > 900 && m.duration <= 2700);
  } else if (selectedDurationFilter === "long") {
    displayedMeetings = displayedMeetings.filter(m => m.duration && m.duration > 2700);
  }

  // 5. Filter by date range
  if (selectedDateRangeFilter === "7days") {
    const cutoff = Date.now() - 7 * 24 * 3600 * 1000;
    displayedMeetings = displayedMeetings.filter(m => new Date(m.date).getTime() >= cutoff);
  } else if (selectedDateRangeFilter === "30days") {
    const cutoff = Date.now() - 30 * 24 * 3600 * 1000;
    displayedMeetings = displayedMeetings.filter(m => new Date(m.date).getTime() >= cutoff);
  }

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userText = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: "user", text: userText }]);
    setChatInput("");
    setTimeout(() => {
      setChatMessages(prev => [...prev, { 
          sender: "fred", 
          text: "🍳 AskFred is still cooking! (I am not yet integrated with a live LLM API). My developer is currently making me ready." 
      }]);
    }, 800);
  };

  const triggerFredQuickAction = (action: string) => {
    setChatMessages(prev => [...prev, { sender: "user", text: `Show me ${action}` }]);
    setTimeout(() => {
      setChatMessages(prev => [...prev, { 
          sender: "fred", 
          text: "🍳 AskFred is still cooking! (I am not yet integrated with a live LLM API). My developer is currently making me ready." 
      }]);
    }, 700);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white font-sans">
      {/* Free trial banner */}
      <div className="bg-[#F4F0FF] border-b border-purple-100/50 px-4 py-2 flex items-center justify-center gap-1.5 text-[12.5px] text-gray-700 shrink-0">
        <span>You are eligible for 7 days business plan free trial.</span>
        <button 
          onClick={() => onTriggerToast("Free trial activation coming soon!", "success")}
          className="text-[#6E2CF4] font-semibold hover:underline"
        >
          Start free trial →
        </button>
      </div>

      {/* Top header */}
      <header className="px-6 py-3 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
        <h1 className="text-[15px] font-semibold text-gray-800">Meetings</h1>

        <div className="max-w-[420px] w-full relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title or keyword"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-[13px] bg-gray-50 border border-gray-200 focus:border-purple-300 focus:bg-white rounded-xl py-2.5 pl-10 pr-14 outline-none text-gray-800 placeholder-gray-400"
          />
          <span className="absolute right-3.5 text-[11px] text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded-md bg-white font-medium">
            ⌘K
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => onTriggerToast("Premium plans upgrade coming soon!", "success")}
            className="bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#059669] border border-emerald-200/60 font-semibold py-1.5 px-3.5 rounded-lg text-xs"
          >
            Upgrade
          </button>

          <button
            onClick={onTriggerCreate}
            className="flex items-center gap-1.5 bg-[#6E2CF4] hover:bg-[#5B21D6] text-white font-semibold py-1.5 px-3.5 rounded-lg text-xs"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Capture</span>
            <span className="text-[10px] text-purple-200">▼</span>
          </button>

          <button 
            onClick={() => onTriggerToast("Mic settings coming soon!", "success")}
            className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-700"
          >
            <Mic className="w-4 h-4" />
          </button>

          <button 
            onClick={() => onTriggerToast("No new notifications.", "success")}
            className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-700 relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>

          <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
            <div className="w-full h-full bg-[#6E2CF4] flex items-center justify-center text-white font-bold text-sm">
              H
            </div>
          </div>
        </div>
      </header>

      {/* Three-column layout */}
      <div className="flex-1 flex overflow-hidden">

        {/* LEFT: Meetings sub-sidebar */}
        <div className="w-56 border-r border-gray-100 flex flex-col bg-white py-4 shrink-0">
          <div className="px-3 mb-5">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search channels"
                className="w-full text-[12px] bg-gray-50 border border-gray-200 rounded-lg py-2 pl-8 pr-3 outline-none"
                readOnly
                onClick={() => onTriggerToast("Channel search coming soon!", "success")}
              />
            </div>
          </div>

          <div className="px-2 space-y-0.5 mb-8">
            <button
              onClick={() => setMeetingsSubTab("my")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors ${
                meetingsSubTab === "my"
                  ? "bg-purple-50 text-purple-700 font-semibold"
                  : "text-gray-600 hover:bg-gray-50 font-medium"
              }`}
            >
              <Hash className={`w-4 h-4 ${meetingsSubTab === "my" ? "text-purple-600" : "text-gray-400"}`} />
              My Meetings
            </button>

            <button
              onClick={() => setMeetingsSubTab("all")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors ${
                meetingsSubTab === "all"
                  ? "bg-purple-50 text-purple-700 font-semibold"
                  : "text-gray-600 hover:bg-gray-50 font-medium"
              }`}
            >
              <FolderOpen className={`w-4 h-4 ${meetingsSubTab === "all" ? "text-purple-600" : "text-gray-400"}`} />
              All Meetings
            </button>

            <button
              onClick={() => setMeetingsSubTab("voice")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors ${
                meetingsSubTab === "voice"
                  ? "bg-purple-50 text-purple-700 font-semibold"
                  : "text-gray-600 hover:bg-gray-50 font-medium"
              }`}
            >
              <Bot className={`w-4 h-4 ${meetingsSubTab === "voice" ? "text-purple-600" : "text-gray-400"}`} />
              Voice Agent Meetings
            </button>
          </div>

          <div className="px-4">
            <p className="text-[11px] font-medium text-gray-400 mb-3">All channels</p>
            <div className="text-center space-y-3">
              <div className="text-pink-400 text-xl font-light">#</div>
              <p className="text-[12px] text-gray-500 leading-snug">
                Create channels to organize your conversations
              </p>
              <button
                onClick={() => onTriggerToast("Create channel coming soon!", "success")}
                className="inline-flex items-center gap-1.5 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-1.5 px-3 rounded-lg text-[12px]"
              >
                <Plus className="w-3.5 h-3.5" />
                Channel
              </button>
            </div>
          </div>
        </div>

        {/* CENTER: Meetings list */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          {/* Sub-header */}
          <div className="px-5 py-2.5 border-b border-gray-100 flex items-center justify-between shrink-0 relative">
            <div className="flex items-center gap-1.5">
              {meetingsSubTab === "my" && (
                <>
                  <button
                    onClick={() => setHostedTab("hosted")}
                    className={`text-[13px] font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                      hostedTab === "hosted"
                        ? "bg-gray-100 text-gray-800 border-gray-200"
                        : "text-gray-500 border-transparent hover:bg-gray-50"
                    }`}
                  >
                    Hosted by me
                  </button>
                  <button
                    onClick={() => setHostedTab("shared")}
                    className={`text-[13px] font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                      hostedTab === "shared"
                        ? "bg-gray-100 text-gray-800 border-gray-200"
                        : "text-gray-500 border-transparent hover:bg-gray-50"
                    }`}
                  >
                    Shared with me
                  </button>
                </>
              )}

              <div className="relative">
                <button
                  onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                  className={`flex items-center gap-1.5 text-[13px] font-medium px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                    isFiltersOpen
                      ? "bg-purple-50 text-purple-700 border-purple-200"
                      : "text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <Filter className="w-3.5 h-3.5" />
                  Filters
                </button>

                {/* Filter dropdown panel */}
                {isFiltersOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 flex min-w-[560px] animate-in fade-in duration-150 relative">
                    {/* Close button */}
                    <button
                      onClick={() => setIsFiltersOpen(false)}
                      className="absolute top-2.5 right-3 w-6 h-6 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 cursor-pointer text-xs font-bold z-20 transition-colors"
                      title="Close filters (Esc)"
                    >
                      ✕
                    </button>

                {/* Filter categories sidebar */}
                <div className="w-44 border-r border-gray-100 p-2.5 space-y-0.5 shrink-0 bg-gray-50/40 rounded-l-xl select-none">
                  {(["Hosted by", "Participants", "Date Range", "Duration"] as const).map((cat) => (
                    <button 
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className={`w-full text-left text-[12.5px] px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                        filterCategory === cat ? "text-purple-700 bg-purple-50 font-bold shadow-2xs" : "text-gray-600 hover:bg-gray-100/60"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                  <div className="pt-3 border-t border-gray-200 mt-2 px-1">
                    <button 
                      onClick={handleClearAllFilters}
                      className="text-[11px] text-gray-500 hover:text-purple-600 font-bold cursor-pointer transition-colors"
                    >
                      Clear All Filters
                    </button>
                  </div>
                </div>

                {/* Filter content area based on active category */}
                <div className="flex-1 pt-9 pb-4 px-4 space-y-3 min-h-[220px]">
                  {filterCategory === "Hosted by" && (
                    <div className="space-y-3">
                      <div className="relative pr-6">
                        <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
                        <input 
                          type="text" 
                          placeholder="Search host" 
                          value={filterQueryText}
                          onChange={(e) => setFilterQueryText(e.target.value)}
                          className="w-full text-xs bg-white border border-gray-200 rounded-lg py-2 pl-8 pr-3 outline-none focus:border-purple-400"
                        />
                      </div>
                      
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        {[
                          { name: "Harsh Anand", email: "harsh.anand@example.com" },
                          { name: "Alice Smith", email: "alice.smith@fireflies.ai" },
                          { name: "Sarup Banskota", email: "sarup@fireflies.ai" },
                          { name: "Diana Prince", email: "diana@fireflies.ai" },
                        ]
                        .filter(h => !filterQueryText || h.name.toLowerCase().includes(filterQueryText.toLowerCase()) || h.email.toLowerCase().includes(filterQueryText.toLowerCase()))
                        .map((host) => {
                          const isSelected = selectedHosts.includes(host.name);
                          return (
                            <div 
                              key={host.name}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedHosts(selectedHosts.filter(h => h !== host.name));
                                } else {
                                  setSelectedHosts([...selectedHosts, host.name]);
                                }
                              }}
                              className="flex items-center gap-3 py-2 px-2 hover:bg-purple-50/50 rounded-lg cursor-pointer transition-colors"
                            >
                              <div className="w-7 h-7 rounded-full bg-[#18181B] flex items-center justify-center text-white text-[10px] font-bold select-none">
                                {host.name.split(" ").map(n => n[0]).join("")}
                              </div>
                              <div className="flex-1 select-none">
                                <span className="text-[12.5px] font-semibold text-gray-800 block">{host.name}</span>
                                <span className="text-[11px] text-gray-400 block">{host.email}</span>
                              </div>
                              <input 
                                type="checkbox" 
                                checked={isSelected}
                                readOnly
                                className="w-4 h-4 rounded border-gray-300 accent-[#6E2CF4] cursor-pointer pointer-events-none" 
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {filterCategory === "Participants" && (
                    <div className="space-y-3">
                      <div className="relative pr-6">
                        <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
                        <input 
                          type="text" 
                          placeholder="Search participants" 
                          value={filterQueryText}
                          onChange={(e) => setFilterQueryText(e.target.value)}
                          className="w-full text-xs bg-white border border-gray-200 rounded-lg py-2 pl-8 pr-3 outline-none focus:border-purple-400"
                        />
                      </div>
                      
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        {[
                          "Ankit Mehta", "Priya Sharma", "Neha Kapoor", "Rohan Gupta", "Simran Kaur", "Emma Watson", "Bob Jones"
                        ]
                        .filter(p => !filterQueryText || p.toLowerCase().includes(filterQueryText.toLowerCase()))
                        .map((part) => {
                          const isSelected = selectedParticipants.includes(part);
                          return (
                            <div 
                              key={part}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedParticipants(selectedParticipants.filter(p => p !== part));
                                } else {
                                  setSelectedParticipants([...selectedParticipants, part]);
                                }
                              }}
                              className="flex items-center gap-3 py-2 px-2 hover:bg-purple-50/50 rounded-lg cursor-pointer transition-colors"
                            >
                              <div className="w-7 h-7 rounded-full bg-[#18181B] text-white text-[10px] font-bold flex items-center justify-center select-none">
                                {part.split(" ").map(n => n[0]).join("")}
                              </div>
                              <span className="text-[12.5px] font-semibold text-gray-800 flex-1 select-none">{part}</span>
                              <input 
                                type="checkbox" 
                                checked={isSelected}
                                readOnly
                                className="w-4 h-4 rounded border-gray-300 accent-[#6E2CF4] cursor-pointer pointer-events-none" 
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {filterCategory === "Date Range" && (
                    <div className="space-y-2 text-xs">
                      <h4 className="font-bold text-gray-700 mb-2">Filter by Date</h4>
                      {[
                        { id: "all", label: "All Time" },
                        { id: "7days", label: "Last 7 Days" },
                        { id: "30days", label: "Last 30 Days" },
                      ].map(opt => (
                        <label 
                          key={opt.id}
                          className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 cursor-pointer font-medium text-gray-700"
                        >
                          <input 
                            type="radio"
                            name="dateRange"
                            checked={selectedDateRangeFilter === opt.id}
                            onChange={() => setSelectedDateRangeFilter(opt.id as any)}
                            className="accent-[#6E2CF4]"
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {filterCategory === "Duration" && (
                    <div className="space-y-2 text-xs">
                      <h4 className="font-bold text-gray-700 mb-2">Filter by Meeting Duration</h4>
                      {[
                        { id: "all", label: "All Durations" },
                        { id: "short", label: "Short (< 15 mins)" },
                        { id: "medium", label: "Medium (15 - 45 mins)" },
                        { id: "long", label: "Long (> 45 mins)" },
                      ].map(opt => (
                        <label 
                          key={opt.id}
                          className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 cursor-pointer font-medium text-gray-700"
                        >
                          <input 
                            type="radio"
                            name="duration"
                            checked={selectedDurationFilter === opt.id}
                            onChange={() => setSelectedDurationFilter(opt.id as any)}
                            className="accent-[#6E2CF4]"
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  )}


                </div>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => onTriggerToast("Search modal coming soon!", "success")}
          className="p-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 cursor-pointer"
        >
          <Search className="w-3.5 h-3.5" />
        </button>

        {/* Click-away backdrop overlay */}
        {isFiltersOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/5 cursor-default" 
            onClick={() => setIsFiltersOpen(false)} 
          />
        )}
      </div>

          {/* List area */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {displayedMeetings.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center gap-4">
                <p className="text-[14px] text-gray-500">No meetings found</p>
                <button
                  onClick={onTriggerCreate}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-5 rounded-lg text-sm"
                >
                  + Capture
                </button>
              </div>
            ) : (
              <>
                {/* Today header */}
                <div className="flex items-center justify-between mb-3 text-[13px] text-gray-500">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" className="w-3.5 h-3.5 rounded border-gray-300 accent-purple-600" />
                    <span className="font-medium text-gray-700">Today</span>
                  </div>
                  <button
                    onClick={() => onTriggerToast("Feedback coming soon!", "success")}
                    className="flex items-center gap-1 text-gray-400 hover:text-gray-600"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Feedback</span>
                  </button>
                </div>

                {/* Meeting cards */}
                <div className="space-y-2">
                  {displayedMeetings.map((meeting) => (
                    <div
                      key={meeting.id}
                      onClick={() => onSelectMeeting(meeting.id)}
                      className="group bg-white border border-gray-200 hover:border-purple-200 rounded-xl px-4 py-3 flex items-center gap-3.5 cursor-pointer transition-all hover:shadow-sm"
                    >
                      {/* Solid black profile avatar box matching user request */}
                      <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-[#18181B] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                        {meeting.title.charAt(0).toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-[13.5px] font-semibold text-gray-900 truncate group-hover:text-purple-700">
                            {meeting.title}
                          </h4>
                          <span className="text-gray-300 text-xs">›</span>
                          <span className="text-gray-400 text-[11px]">↑</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[12px] text-gray-400">
                          <span>
                            {new Date(meeting.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                          <span>·</span>
                          <span>
                            {new Date(meeting.date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                          </span>
                          <span>·</span>
                          <span>{formatDuration(meeting.duration || 120)}</span>
                          <span>·</span>
                          <span>{meeting.sharedBy || "Harsh"}</span>
                        </div>
                      </div>

                      {/* Three-dot options menu */}
                      <div className="flex items-center gap-2 shrink-0 relative select-none">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuMeetingId(activeMenuMeetingId === meeting.id ? null : meeting.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 focus:opacity-100 focus-within:opacity-100 transition-opacity p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                          title="More options"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        
                        {activeMenuMeetingId === meeting.id && (
                          <div 
                            className="absolute right-0 top-8 w-28 bg-white border border-gray-205 rounded-lg shadow-md py-1 z-50 text-[12.5px] font-sans"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                setActiveMenuMeetingId(null);
                                const newTitle = prompt("Enter new meeting title:", meeting.title);
                                if (newTitle && newTitle.trim() && newTitle.trim() !== meeting.title) {
                                  await onRenameMeeting(meeting.id, newTitle.trim());
                                }
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-gray-50 text-gray-700 flex items-center gap-1.5 cursor-pointer font-semibold"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-gray-400" />
                              <span>Rename</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuMeetingId(null);
                                onDeleteMeeting(meeting);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-1.5 cursor-pointer font-bold"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-10 pb-6 text-center">
                  <p className="text-[13px] text-gray-400">
                    You've reached the end of your meetings.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT: Ask Fred panel — wider matching Image 2 */}
        <div className="w-[380px] border-l border-gray-100 flex flex-col bg-white shrink-0">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#6E2CF4]/10 flex items-center justify-center">
                <Bot className="w-4 h-4 text-[#6E2CF4]" />
              </div>
              <span className="text-[13px] font-bold text-gray-900">Ask Fred</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <button onClick={() => onTriggerToast("Chat history", "success")} className="hover:text-gray-600 cursor-pointer">
                <MessageSquare className="w-4 h-4" />
              </button>
              <button onClick={() => setChatMessages([])} className="hover:text-gray-600 text-lg leading-none cursor-pointer">
                +
              </button>
            </div>
          </div>

          {/* Content with soft top gradient matching Image 2 */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-[#ECFDF5]/30 via-[#F5F3FF]/20 to-white">
            {chatMessages.length === 0 ? (
              <div className="space-y-6">
                {/* Hero text matching Image 2 */}
                <div className="space-y-3 pt-2">
                  <div className="w-7 h-7 text-[#34D399] flex items-center justify-center">
                    <Sparkles className="w-6 h-6 fill-current" />
                  </div>
                  <div>
                    <h4 className="text-[17px] font-bold text-gray-900 leading-snug">Hi Harsh!</h4>
                    <p className="text-[17px] font-bold text-gray-900 leading-snug">Get ready for your meeting</p>
                  </div>
                </div>

                {/* Quick action pills matching Image 2 (clean gray background, dark text, no harsh borders) */}
                <div className="space-y-2.5 flex flex-col items-start select-none">
                  <button
                    onClick={() => triggerFredQuickAction("my action items")}
                    className="flex items-center gap-2.5 bg-[#F4F4F6]/80 hover:bg-[#E4E4E7] text-[#334155] rounded-xl px-3.5 py-2 text-[13px] font-medium transition-all cursor-pointer border border-transparent"
                  >
                    <span className="w-4 h-4 rounded bg-[#22C55E] text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                    <span>My action items</span>
                  </button>
                  <button
                    onClick={() => triggerFredQuickAction("key decisions")}
                    className="flex items-center gap-2.5 bg-[#F4F4F6]/80 hover:bg-[#E4E4E7] text-[#334155] rounded-xl px-3.5 py-2 text-[13px] font-medium transition-all cursor-pointer border border-transparent"
                  >
                    <span className="text-sm">🎯</span>
                    <span>Key decisions</span>
                  </button>
                  <button
                    onClick={() => triggerFredQuickAction("key initiatives")}
                    className="flex items-center gap-2.5 bg-[#F4F4F6]/80 hover:bg-[#E4E4E7] text-[#334155] rounded-xl px-3.5 py-2 text-[13px] font-medium transition-all cursor-pointer border border-transparent"
                  >
                    <span className="text-sm">📌</span>
                    <span>Key initiatives</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                      msg.sender === "user"
                        ? "ml-auto bg-[#6E2CF4] text-white rounded-tr-sm"
                        : "bg-gray-100 text-gray-800 rounded-tl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Input area matching Image 2 */}
          <div className="p-4 border-t border-gray-100 bg-white">
            <div className="mb-2">
              <span className="inline-block text-[11px] font-semibold text-[#334155] bg-gray-100/80 px-2.5 py-1 rounded-md">
                # My Meetings
              </span>
            </div>

            <form onSubmit={handleSendChat} className="border border-gray-200 focus-within:border-purple-300 rounded-2xl p-3 flex flex-col gap-2 transition-colors">
              <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask anything. Type / to run AI skills."
                rows={2}
                className="w-full text-[13px] resize-none outline-none border-none text-gray-800 bg-transparent placeholder-gray-400"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendChat(e);
                  }
                }}
              />
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2 text-gray-400">
                  <button type="button" className="p-1 hover:text-gray-600 rounded cursor-pointer text-sm">
                    +
                  </button>
                  <button type="button" className="p-1 hover:text-gray-600 rounded cursor-pointer text-xs">
                    ⛶
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" className="p-1 text-gray-400 hover:text-gray-600 rounded cursor-pointer">
                    <Mic className="w-4 h-4" />
                  </button>
                  <button
                    type="submit"
                    disabled={!chatInput.trim()}
                    className="w-7 h-7 bg-[#E0D7FE] hover:bg-[#D4C7FE] text-[#6E2CF4] rounded-lg flex items-center justify-center transition-colors cursor-pointer disabled:bg-gray-100 disabled:text-gray-300 font-bold"
                  >
                    ↑
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}