"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  Search, 
  Send, 
  Video, 
  Bot, 
  User, 
  CheckCircle2, 
  MessageSquare, 
  Zap, 
  ArrowRight,
  ListTodo,
  FileText,
  Clock,
  ExternalLink,
  ChevronDown
} from "lucide-react";
import { Meeting } from "../app/types";

interface AskFredViewProps {
  meetings: Meeting[];
  onSelectMeeting: (id: number) => void;
  onTriggerToast: (msg: string, type?: "success" | "error") => void;
}

interface ChatMessage {
  id: string;
  sender: "user" | "fred";
  text: string;
  timestamp: string;
  sourceMeetingId?: number;
  sourceMeetingTitle?: string;
}

export default function AskFredView({ meetings, onSelectMeeting, onTriggerToast }: AskFredViewProps) {
  const [selectedScope, setSelectedScope] = useState<"all" | "my" | number>("all");
  const [isScopeDropdownOpen, setIsScopeDropdownOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "fred",
      text: "Hi Harsh! I'm AskFred, your AI meeting intelligence assistant. I analyze all your transcribed calls, action items, and discussion points. How can I help you today?",
      timestamp: "Just now"
    }
  ]);

  const presetPrompts = [
    {
      icon: ListTodo,
      title: "Action Items Summary",
      desc: "What are my pending action items across all meetings this week?",
      query: "List all pending action items and assigned tasks from my recent meetings."
    },
    {
      icon: FileText,
      title: "Executive Overview",
      desc: "Summarize key decisions from the Database Optimization Review",
      query: "Provide an executive summary of key decisions made in the Database Optimization Review meeting."
    },
    {
      icon: Zap,
      title: "Tech Blockers & Issues",
      desc: "Were there any technical blockers mentioned in recent syncs?",
      query: "Identify any technical blockers, bugs, or infrastructure issues discussed in recent calls."
    },
    {
      icon: Clock,
      title: "Speaker Talktime Analysis",
      desc: "Show participant talk time breakdown across team syncs",
      query: "Who had the highest talk time percentage in recent team syncs?"
    }
  ];

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setInputQuery("");
    setIsGenerating(true);

    // AI Intelligence Response Simulation
    setTimeout(() => {
      let responseText = "";
      let citedMeetingId = meetings.length > 0 ? meetings[0].id : 1;
      let citedMeetingTitle = meetings.length > 0 ? meetings[0].title : "Database Optimization Review";

      const lowerQ = query.toLowerCase();

      const prep = `🍳 AskFred is still cooking! (I am not yet integrated with a live LLM API).`;
      if (lowerQ.includes("action") || lowerQ.includes("task")) {
        responseText = prep + `\n\nBased on your recent calls, here are the top Action Items:\n\n1. Configure Audio Sources in OBS Settings — Assigned to Harsh Anand (Due: Tomorrow)\n2. Set Desktop Audio to Default Device — Assigned to Harsh Anand\n3. Review Database Indexing & Turso Redirects — Assigned to Database Team\n4. Verify Markdown Export Utility — Completed ✅`;
      } else if (lowerQ.includes("database") || lowerQ.includes("optimization") || lowerQ.includes("tech")) {
        responseText = prep + `\n\nIn the Database Optimization Review, the team discussed:\n\n- Slow Query Diagnostics: Identified cloud DB query bottlenecks during peak concurrency.\n- Turso HTTP Protocol: Analyzed HTTP protocol redirects for faster connection pooling.\n- OBS Recording Setup: Configured multi-channel audio capture for live stream debugs.`;
      } else if (lowerQ.includes("talk") || lowerQ.includes("speaker") || lowerQ.includes("who")) {
        responseText = prep + `\n\nHere is the Speaker Talk Time Analysis:\n\n- Harsh Anand: 100% talk time (139 WPM avg speed)\n- Cross-talk overlap: 0%\n- Pacing: Steady, clear technical delivery without filler words.`;
      } else {
        responseText = prep;
      }

      const fredMsg: ChatMessage = {
        id: `fred-${Date.now()}`,
        sender: "fred",
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sourceMeetingId: citedMeetingId,
        sourceMeetingTitle: citedMeetingTitle
      };

      setChatMessages(prev => [...prev, fredMsg]);
      setIsGenerating(false);
    }, 1000);
  };

  const getScopeLabel = () => {
    if (selectedScope === "all") return "Scope: # All Meetings";
    if (selectedScope === "my") return "Scope: # My Meetings";
    const found = meetings.find(m => m.id === selectedScope);
    return `Scope: ${found ? found.title : "Selected Meeting"}`;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-b from-[#FAF5FF]/50 via-white to-gray-50/30 overflow-hidden font-sans select-none">
      {/* Top Navigation Bar */}
      <div className="h-14 border-b border-purple-100/60 bg-white/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#9333EA] to-[#C084FC] flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              AskFred AI Assistant
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                GPT-4o Powered
              </span>
            </h1>
            <p className="text-[11px] text-gray-500 font-medium">Cross-meeting intelligence & instant answers</p>
          </div>
        </div>

        {/* Scope Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsScopeDropdownOpen(!isScopeDropdownOpen)}
            className="flex items-center gap-2 bg-[#F4F4F6] hover:bg-purple-50 text-gray-700 hover:text-purple-700 text-xs font-semibold px-3 py-1.5 rounded-xl border border-gray-200/80 transition-colors cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{getScopeLabel()}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {isScopeDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 p-1.5 space-y-1 text-xs animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Select Intelligence Scope
              </div>
              <button
                onClick={() => { 
                  setSelectedScope("all"); 
                  setIsScopeDropdownOpen(false);
                  onTriggerToast("Scope set to # All Workspace Meetings", "success");
                }}
                className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between font-medium cursor-pointer transition-colors ${
                  selectedScope === "all" ? "bg-purple-50 text-purple-700 font-bold" : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                <span># All Workspace Meetings</span>
                {selectedScope === "all" && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
              </button>

              <button
                onClick={() => { 
                  setSelectedScope("my"); 
                  setIsScopeDropdownOpen(false);
                  onTriggerToast("Scope set to # My Meetings", "success");
                }}
                className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between font-medium cursor-pointer transition-colors ${
                  selectedScope === "my" ? "bg-purple-50 text-purple-700 font-bold" : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                <span># My Meetings</span>
                {selectedScope === "my" && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
              </button>

              <div className="border-t border-gray-100 my-1 pt-1">
                <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Specific Notebook
                </div>
                {meetings.map(m => (
                  <div 
                    key={m.id}
                    className={`flex items-center justify-between px-3 py-1.5 rounded-xl transition-colors ${
                      selectedScope === m.id ? "bg-purple-50 text-purple-700 font-bold" : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <button
                      onClick={() => { 
                        setSelectedScope(m.id); 
                        setIsScopeDropdownOpen(false);
                        onTriggerToast(`Scope set to "${m.title}"`, "success");
                      }}
                      className="flex-1 text-left truncate cursor-pointer font-medium"
                    >
                      📁 {m.title}
                    </button>
                    <button
                      onClick={() => {
                        setIsScopeDropdownOpen(false);
                        onSelectMeeting(m.id);
                      }}
                      title="Open full meeting notebook"
                      className="p-1 hover:bg-purple-100 text-purple-600 rounded-md cursor-pointer ml-1 text-[11px] shrink-0 flex items-center gap-1 font-bold"
                    >
                      <span>Open</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Conversation Canvas */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl w-full mx-auto">
        {/* Hero Banner when few messages */}
        {chatMessages.length === 1 && (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#9333EA]/20 via-purple-100 to-[#C084FC]/30 flex items-center justify-center mx-auto shadow-inner border border-purple-200/50">
              <Sparkles className="w-8 h-8 text-purple-600 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Ask Fred Anything</h2>
              <p className="text-xs text-gray-500 font-medium max-w-md mx-auto mt-1">
                Search transcripts, extract action items, generate executive briefs, or ask questions across all your meetings.
              </p>
            </div>

            {/* Quick Action Suggestion Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 text-left">
              {presetPrompts.map((preset, idx) => {
                const IconComponent = preset.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(preset.query)}
                    className="p-4 rounded-2xl bg-white border border-gray-200/80 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group text-left space-y-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-gray-800 group-hover:text-purple-700 transition-colors">
                        {preset.title}
                      </span>
                    </div>
                    <p className="text-[11.5px] text-gray-500 font-medium group-hover:text-gray-700 leading-snug">
                      {preset.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Message Thread */}
        <div className="space-y-4">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.sender === "fred" && (
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-2xl space-y-2 ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed shadow-xs ${
                    msg.sender === "user"
                      ? "bg-[#6E2CF4] text-white font-medium rounded-tr-xs"
                      : "bg-white border border-gray-200/80 text-gray-800 rounded-tl-xs whitespace-pre-wrap"
                  }`}
                >
                  {msg.text}
                </div>

                {/* Source Citation link if from Fred */}
                {msg.sender === "fred" && msg.sourceMeetingId && (
                  <div className="flex items-center gap-2 pl-1">
                    <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Source Citation:</span>
                    <button
                      onClick={() => onSelectMeeting(msg.sourceMeetingId!)}
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold text-purple-600 hover:text-purple-800 hover:underline cursor-pointer bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100"
                    >
                      <Video className="w-3 h-3" />
                      <span>{msg.sourceMeetingTitle}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  </div>
                )}
              </div>

              {msg.sender === "user" && (
                <div className="w-8 h-8 rounded-xl bg-gray-900 text-white flex items-center justify-center shrink-0 shadow-xs mt-1 font-bold text-xs">
                  H
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {isGenerating && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-tl-xs text-xs text-gray-500 font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping"></span>
                <span>AskFred is searching meeting transcripts...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Fixed Toolbar Input Bar */}
      <div className="p-4 bg-white/90 border-t border-purple-100/60 backdrop-blur-md shrink-0">
        <div className="max-w-4xl mx-auto space-y-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="relative flex items-center bg-[#F8F9FA] border border-purple-200/80 rounded-2xl p-1.5 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-200 transition-all shadow-sm"
          >
            <input
              type="text"
              placeholder="Ask anything across your meetings... (Type / to run AI Skills)"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-1 text-xs bg-transparent px-4 py-2.5 outline-none text-gray-800 placeholder-gray-400 font-medium"
            />

            <button
              type="submit"
              disabled={!inputQuery.trim() || isGenerating}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                inputQuery.trim() && !isGenerating
                  ? "bg-[#6E2CF4] text-white shadow-md hover:bg-purple-700"
                  : "bg-[#E0D7FE] text-[#6E2CF4] opacity-80 cursor-not-allowed"
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="flex items-center justify-between text-[10.5px] text-gray-400 font-medium px-2">
            <span>💡 Pro-tip: Try asking &ldquo;What action items were assigned to Harsh?&rdquo;</span>
            <span>AskFred v2.4 • Powered by Gemini AI</span>
          </div>
        </div>
      </div>
    </div>
  );
}
