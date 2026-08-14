"use client";

import React from "react";
import { 
  Search, 
  Plus, 
  Calendar, 
  ChevronRight, 
  Download, 
  Play,
  Video,
  Mic,
  Bell,
  Monitor,
  Smartphone,
  Settings
} from "lucide-react";
import { Meeting, MeetingDetail } from "../app/types";
import { FirefliesLogoMark } from "./FirefliesLogo";

interface DashboardViewProps {
  meetings: Meeting[];
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterParticipant: string;
  setFilterParticipant: (p: string) => void;
  filterDateFrom: string;
  setFilterDateFrom: (d: string) => void;
  filterDateTo: string;
  setFilterDateTo: (d: string) => void;
  sortBy: string;
  setSortBy: (s: string) => void;
  isFiltersOpen: boolean;
  setIsFiltersOpen: (o: boolean) => void;
  onSelectMeeting: (id: number) => void;
  onDeleteMeeting: (m: Meeting) => void;
  onTriggerCreate: () => void;
  onNavigateUploads: () => void;
  onTriggerToast: (msg: string, type?: "success" | "error") => void;
  fetchMeetings: () => void;
}

export default function DashboardView({
  meetings,
  isLoading,
  searchQuery,
  setSearchQuery,
  filterParticipant,
  setFilterParticipant,
  filterDateFrom,
  setFilterDateFrom,
  filterDateTo,
  setFilterDateTo,
  sortBy,
  setSortBy,
  isFiltersOpen,
  setIsFiltersOpen,
  onSelectMeeting,
  onDeleteMeeting,
  onTriggerCreate,
  onNavigateUploads,
  onTriggerToast,
  fetchMeetings,
}: DashboardViewProps) {

  const [isTrialBannerVisible, setIsTrialBannerVisible] = React.useState(true);
  const [activeHomeTab, setActiveHomeTab] = React.useState<"recent" | "upcoming" | "aifeed">("recent");

  // Sample upcoming meetings for Upcoming tab
  const upcomingMeetings = [
    {
      id: 801,
      title: "Product Sync & Sprint Planning",
      time: "Today, 4:00 PM",
      duration: "30 min",
      platform: "Google Meet",
      host: "Harsh Anand",
    },
    {
      id: 802,
      title: "Customer Feedback Review — Q3 Roadmap",
      time: "Tomorrow, 11:00 AM",
      duration: "45 min",
      platform: "Zoom",
      host: "Sarup Banskota",
    },
    {
      id: 803,
      title: "1:1 Leadership Sync",
      time: "Friday, 2:00 PM",
      duration: "30 min",
      platform: "Google Meet",
      host: "Neha Kapoor",
    },
  ];

  // Sample AI Feed insights
  const aiFeedItems = [
    {
      id: 1,
      type: "action",
      icon: "⚡",
      title: "12 Action items generated across 3 meetings today",
      subtext: "Assigned to Harsh Anand, Ankit Mehta & Priya Sharma",
      time: "10 mins ago",
    },
    {
      id: 2,
      type: "decision",
      icon: "🎯",
      title: "Key Decision: Shifting backend to Next.js Turbopack & PostgreSQL",
      subtext: "Agreed in Sprint 14 Standup — Frontend Team",
      time: "1 hour ago",
    },
    {
      id: 3,
      type: "sentiment",
      icon: "💬",
      title: "Overall Sentiment: 75% Positive, 20% Neutral, 5% Critical",
      subtext: "Based on last 5 customer sync transcripts",
      time: "3 hours ago",
    },
    {
      id: 4,
      type: "analytics",
      icon: "📊",
      title: "Talk time distribution balance improved by +14%",
      subtext: "Average talk speed 139 WPM with zero cross-talk overlap",
      time: "5 hours ago",
    },
  ];

  const formatDate = (isoStr: string) => {
    const date = new Date(isoStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  };

  // SVG Fireflies Emblem Logo Icon for meeting list items
  const FirefliesBadge = () => <FirefliesLogoMark className="w-8 h-8 rounded-lg" />;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white font-sans">
      
      {/* Free Trial Banner at Very Top */}
      {isTrialBannerVisible && (
        <div className="bg-[#F4F0FF] py-2 px-4 flex items-center justify-center gap-1 text-[12.5px] text-gray-700 shrink-0 relative select-none border-b border-purple-100/50">
          <span>You are eligible for 7 days business plan free trial.</span>
          <button 
            onClick={() => onTriggerToast("Free trial activation coming soon!", "success")}
            className="text-[#6E2CF4] font-medium hover:underline cursor-pointer ml-1"
          >
            Start free trial →
          </button>
          <button 
            onClick={() => setIsTrialBannerVisible(false)}
            className="absolute right-4 text-gray-400 hover:text-gray-600 text-sm leading-none cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* Header Toolbar */}
      <header className="px-6 py-3 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white select-none">
        <h1 className="text-[15px] font-bold text-gray-900">Home</h1>
        
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
          <span className="absolute right-3.5 text-[10px] text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded bg-white font-medium select-none">
            ⌘K
          </span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onTriggerToast("Premium plans upgrade coming soon!", "success")}
            className="bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#059669] font-medium py-1.5 px-3.5 rounded-lg text-[13px] transition-colors cursor-pointer"
          >
            Upgrade
          </button>

          <button
            onClick={onTriggerCreate}
            className="flex items-center gap-1.5 bg-[#6E2CF4] hover:bg-[#5B21D6] text-white font-medium py-1.5 px-3.5 rounded-lg text-[13px] transition-colors shadow-xs cursor-pointer"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Capture</span>
            <span className="text-[9px] text-purple-200 ml-0.5">▼</span>
          </button>

          <button 
            onClick={() => onTriggerToast("Mic settings coming soon!", "success")}
            className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <Mic className="w-4 h-4" />
          </button>

          <button 
            onClick={() => onTriggerToast("No new notifications.", "success")}
            className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-700 transition-colors relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 shrink-0 ml-1 cursor-pointer">
            <div className="w-full h-full bg-[#6E2CF4] flex items-center justify-center text-white font-bold text-xs">
              H
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area with Smooth Top-to-Bottom Background Gradient */}
      <div className="flex-1 overflow-y-auto bg-[linear-gradient(180deg,#D6E6FE_0%,#FFEBE3_28%,#FFFFFF_48%)]">
        <div className="max-w-5xl mx-auto px-8 py-8 space-y-9">
          
          {/* Welcome Hero Card matching Image 2 */}
          <div className="bg-[#FFF6EE] border border-[#FCD5B5] rounded-[24px] p-8 md:p-10 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden shadow-2xs">
            <div className="space-y-3 relative z-10 max-w-md">
              <h2 className="text-2xl font-semibold tracking-tight text-[#332D27]">
                Welcome Aboard, Harsh!
              </h2>
              <p className="text-[13.5px] text-[#70685F] leading-relaxed font-normal">
                Fireflies is now ready to automate your meetings and streamline your workflows.
              </p>
            </div>
            
            {/* Tablet Video Mockup Card Container matching Image 2 */}
            <div className="relative shrink-0">
              <div className="w-64 h-36 rounded-[18px] bg-[#16102B] border-2 border-[#FCD5B5] overflow-hidden relative shadow-md cursor-pointer group">
                {/* Top header bar inside mockup */}
                <div className="absolute top-2.5 inset-x-0 flex items-center justify-center gap-1.5 px-3">
                  <div className="w-2.5 h-2.5 rounded-xs bg-[#D946EF] flex items-center justify-center">
                    <span className="text-[6px] text-white font-extrabold">f</span>
                  </div>
                  <span className="text-[9px] font-medium text-white/80 tracking-wide">Product Demo</span>
                </div>
                
                {/* Center Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-11 h-11 rounded-full bg-[#7030F4] text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                </div>
                
                {/* Bottom Left Profile Icon */}
                <div className="absolute bottom-2.5 left-3 w-6 h-6 rounded-full bg-purple-500 border border-white/40 flex items-center justify-center text-[9px] font-bold text-white shadow-2xs">
                  H
                </div>
              </div>
            </div>
          </div>

          {/* Quick Start Section */}
          <section className="space-y-3.5">
            <div className="space-y-1">
              <h3 className="text-[15px] font-bold text-gray-900">Quick Start</h3>
              <p className="text-[12.5px] text-gray-500 font-medium">
                Capture your first meeting or upload a recording to see Fireflies in action.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <button 
                onClick={onTriggerCreate}
                className="bg-[#FDF2F8] hover:bg-[#FCE7F3] rounded-lg px-5 py-3.5 flex items-center justify-between cursor-pointer transition-all group text-left border border-pink-100/40"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-pink-500" />
                  <span className="text-[13px] font-semibold text-gray-800">Schedule Meeting</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button 
                onClick={onNavigateUploads}
                className="bg-[#ECFDF5] hover:bg-[#D1FAE5] rounded-lg px-5 py-3.5 flex items-center justify-between cursor-pointer transition-all group text-left border border-emerald-100/40"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span className="text-[13px] font-semibold text-gray-800">Upload File</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button 
                onClick={onTriggerCreate}
                className="bg-[#F5F3FF] hover:bg-[#EDE9FE] rounded-lg px-5 py-3.5 flex items-center justify-between cursor-pointer transition-all group text-left border border-purple-100/40"
              >
                <div className="flex items-center gap-3">
                  <Plus className="w-4 h-4 text-[#7C3AED]" />
                  <span className="text-[13px] font-semibold text-gray-800">Capture Meeting</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </section>

          {/* Recent / Upcoming / AI Feed Tabs & Content */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveHomeTab("recent")}
                  className={`text-[13px] font-bold px-3.5 py-1.5 rounded-xl cursor-pointer transition-all ${
                    activeHomeTab === "recent"
                      ? "text-gray-900 bg-gray-100 shadow-2xs"
                      : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  Recent
                </button>
                <button
                  onClick={() => setActiveHomeTab("upcoming")}
                  className={`text-[13px] font-bold px-3.5 py-1.5 rounded-xl cursor-pointer transition-all ${
                    activeHomeTab === "upcoming"
                      ? "text-gray-900 bg-gray-100 shadow-2xs"
                      : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  Upcoming
                </button>
                <button
                  onClick={() => setActiveHomeTab("aifeed")}
                  className={`text-[13px] font-bold px-3.5 py-1.5 rounded-xl cursor-pointer transition-all ${
                    activeHomeTab === "aifeed"
                      ? "text-gray-900 bg-gray-100 shadow-2xs"
                      : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  AI Feed
                </button>
              </div>

              <button
                onClick={() => onTriggerToast("Settings coming soon!", "success")}
                className="flex items-center gap-1.5 text-[12.5px] font-medium text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Settings</span>
              </button>
            </div>

            {/* TAB CONTENT: Recent */}
            {activeHomeTab === "recent" && (
              <div className="space-y-1 animate-in fade-in duration-200">
                {isLoading ? (
                  <div className="h-28 flex items-center justify-center text-gray-400 text-xs">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 rounded-full border-2 border-gray-200 border-t-[#7C3AED] animate-spin"></div>
                      <span className="font-medium">Loading meetings...</span>
                    </div>
                  </div>
                ) : meetings.length === 0 ? (
                  <div className="py-2">
                    <div
                      onClick={() => onSelectMeeting(1)}
                      className="group flex items-center gap-3.5 py-3 px-2 hover:bg-gray-50/80 rounded-xl cursor-pointer transition-all"
                    >
                      <FirefliesBadge />
                      <div>
                        <h4 className="text-[13.5px] font-semibold text-gray-900 group-hover:text-[#7C3AED] transition-colors">
                          Fireflies AI Platform Quick Overview
                        </h4>
                        <span className="text-[11.5px] text-gray-400 font-medium">
                          Thu, Aug 8 2024, 3:52 PM
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  meetings.map((meeting) => (
                    <div
                      key={meeting.id}
                      onClick={() => onSelectMeeting(meeting.id)}
                      className="group flex items-center gap-3.5 py-3 px-2 hover:bg-gray-50/80 rounded-xl cursor-pointer transition-all"
                    >
                      <FirefliesBadge />
                      <div>
                        <h4 className="text-[13.5px] font-semibold text-gray-900 group-hover:text-[#7C3AED] transition-colors">
                          {meeting.title}
                        </h4>
                        <span className="text-[11.5px] text-gray-400 font-medium">
                          {formatDate(meeting.date)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB CONTENT: Upcoming */}
            {activeHomeTab === "upcoming" && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between px-1 mb-2">
                  <span className="text-xs font-semibold text-gray-500">
                    {upcomingMeetings.length} Scheduled Meetings
                  </span>
                  <button 
                    onClick={onTriggerCreate}
                    className="text-xs font-bold text-[#7C3AED] hover:underline cursor-pointer"
                  >
                    + Schedule New Meeting
                  </button>
                </div>
                {upcomingMeetings.map((m) => (
                  <div 
                    key={m.id}
                    className="bg-white border border-gray-200 hover:border-purple-200 rounded-xl p-4 flex items-center justify-between shadow-2xs transition-all"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center font-bold">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-[13.5px] font-bold text-gray-900">{m.title}</h4>
                        <p className="text-[11.5px] text-gray-500 font-medium mt-0.5">
                          {m.time} · {m.duration} · {m.platform} · Host: {m.host}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => onTriggerToast(`Joining ${m.platform} for ${m.title}...`, "success")}
                      className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold py-1.5 px-3.5 rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      Join Meeting
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* TAB CONTENT: AI Feed */}
            {activeHomeTab === "aifeed" && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="px-1 mb-2">
                  <span className="text-xs font-semibold text-gray-500">
                    Workspace AI Highlights & Intelligence Feed
                  </span>
                </div>
                {aiFeedItems.map((item) => (
                  <div 
                    key={item.id}
                    className="bg-white border border-gray-200 hover:border-purple-200 rounded-xl p-4 flex items-start gap-3.5 shadow-2xs transition-all"
                  >
                    <div className="text-xl shrink-0 mt-0.5">{item.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[13.5px] font-bold text-gray-900">{item.title}</h4>
                        <span className="text-[10.5px] text-gray-400 font-medium">{item.time}</span>
                      </div>
                      <p className="text-[12px] text-gray-500 font-medium mt-1">{item.subtext}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Try More Section */}
          <section className="space-y-4 pt-2">
            <h3 className="text-[15px] font-bold text-gray-900">Try More</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Desktop App Card */}
              <div className="bg-[#F8FAFC] border border-gray-100 rounded-3xl p-6 flex flex-col justify-between gap-5">
                <div className="space-y-3">
                  <div className="w-9 h-9 rounded-xl bg-[#E0F2FE] flex items-center justify-center text-[#0284C7]">
                    <Monitor className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[13.5px] font-bold text-gray-900">Desktop App</h4>
                    <p className="text-[12.5px] text-gray-500 leading-relaxed font-normal">
                      Capture conversations without any bot present in your meeting.
                    </p>
                  </div>
                </div>
                <div>
                  <button 
                    onClick={() => onTriggerToast("Desktop app download coming soon!", "success")}
                    className="inline-flex items-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold py-2 px-4 rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              {/* Mobile App Card */}
              <div className="bg-[#F8FAFC] border border-gray-100 rounded-3xl p-6 flex flex-col justify-between gap-5">
                <div className="space-y-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FCE7F3] flex items-center justify-center text-[#EC4899]">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[13.5px] font-bold text-gray-900">Mobile App</h4>
                    <p className="text-[12.5px] text-gray-500 leading-relaxed font-normal">
                      Record in-person conversations and review meetings on the go.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => onTriggerToast("App Store download coming soon!", "success")}
                    className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-2xs hover:bg-gray-50 transition-colors cursor-pointer"
                    title="App Store"
                  >
                    <span className="text-[14px]"></span>
                  </button>
                  <button 
                    onClick={() => onTriggerToast("Google Play download coming soon!", "success")}
                    className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-2xs hover:bg-gray-50 transition-colors cursor-pointer"
                    title="Google Play"
                  >
                    <span className="text-[12px] text-emerald-600 font-bold">▶</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>

      {/* Floating Help Button Bottom Right */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => onTriggerToast("Help & Support coming soon!", "success")}
          className="w-10 h-10 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer"
          title="Help & Support"
        >
          <span className="text-sm font-bold">?</span>
        </button>
      </div>

    </div>
  );
}