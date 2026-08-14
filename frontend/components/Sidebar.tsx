"use client";

import React, { useState } from "react";
import { 
  Home, 
  Video, 
  Activity, 
  Upload, 
  Layers, 
  BarChart2, 
  Mic, 
  Sparkles, 
  Users, 
  Star, 
  Settings, 
  MoreHorizontal,
  Lock,
  Plus,
  LogOut,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";
import FirefliesLogo, { FirefliesLogoMark } from "./FirefliesLogo";

interface SidebarProps {
  currentView: "library" | "detail" | "uploads" | "meetings" | "askfred";
  onNavigateHome: () => void;
  onNavigateUploads: () => void;
  onNavigateMeetings: () => void;
  onNavigateAskFred?: () => void;
  onLogout: () => void;
  onComingSoon: (featureName: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({ 
  currentView, 
  onNavigateHome, 
  onNavigateUploads, 
  onNavigateMeetings,
  onNavigateAskFred,
  onLogout, 
  onComingSoon,
  isCollapsed,
  onToggleCollapse
}: SidebarProps) {
  const [isInviteDismissed, setIsInviteDismissed] = useState(false);

  // AskFred Cute Robot Head Icon matching real Fireflies UI
  const AskFredRobotIcon = ({ className }: { className?: string }) => (
    <svg className={`w-4 h-4 shrink-0 ${className || "text-[#8B5CF6]"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="3" />
      <circle cx="9" cy="16" r="1" fill="currentColor" />
      <circle cx="15" cy="16" r="1" fill="currentColor" />
      <path d="M12 2v4" />
      <path d="M8 2h8" />
    </svg>
  );

  interface MenuItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }> | (({ className }: { className?: string }) => React.JSX.Element);
    active: boolean;
    onClick?: () => void;
    shortcut?: string;
    badge?: string;
  }

  const topItems: MenuItem[] = [
    { id: "home", label: "Home", icon: Home, active: currentView === "library", onClick: onNavigateHome },
    { id: "askfred", label: "AskFred", icon: AskFredRobotIcon, active: currentView === "askfred", onClick: onNavigateAskFred, shortcut: "⌘J" },
    { id: "meetings", label: "Meetings", icon: Video, active: currentView === "meetings" || currentView === "detail", onClick: onNavigateMeetings },
    { id: "status", label: "Meeting Status", icon: Activity, active: false },
    { id: "uploads", label: "Uploads", icon: Upload, active: currentView === "uploads", onClick: onNavigateUploads },
  ];

  const middleItems: MenuItem[] = [
    { id: "integrations", label: "Integrations", icon: Layers, active: false },
    { id: "analytics", label: "Analytics", icon: BarChart2, active: false },
    { id: "voice_agents", label: "Voice Agents", icon: Mic, active: false, badge: "NEW" },
    { id: "ai_skills", label: "AI Skills", icon: Sparkles, active: false },
  ];

  const bottomItems: MenuItem[] = [
    { id: "team", label: "Team", icon: Users, active: false },
    { id: "upgrade", label: "Upgrade", icon: Star, active: false },
    { id: "settings", label: "Settings", icon: Settings, active: false },
    { id: "more", label: "More", icon: MoreHorizontal, active: false },
  ];

  const renderItem = (item: MenuItem, showDividerAfter?: boolean) => {
    const Icon = item.icon;
    const isActive = item.active;
    
    return (
      <div key={item.id}>
        <button
          onClick={item.onClick || (() => onComingSoon(item.label))}
          title={isCollapsed ? item.label : undefined}
          className={`w-full flex items-center rounded-xl transition-all cursor-pointer group relative ${
            isCollapsed 
              ? "justify-center p-2.5 my-0.5" 
              : "gap-3 px-3 py-2 my-[1px]"
          } ${
            isActive 
              ? "bg-[#F3E8FF] text-[#7E22CE] font-semibold" 
              : "text-[#475569] hover:bg-gray-50 hover:text-gray-900 font-medium"
          }`}
        >
          <Icon 
            className={`w-4 h-4 shrink-0 transition-colors ${
              isActive 
                ? "text-[#7E22CE]" 
                : item.id === "askfred" 
                  ? "text-[#8B5CF6]" 
                  : "text-[#64748B] group-hover:text-gray-800"
            }`} 
          />
          
          {!isCollapsed && (
            <span className="text-[13.5px] flex-1 text-left tracking-tight">
              {item.label}
            </span>
          )}
          
          {!isCollapsed && item.shortcut && (
            <span className="text-[10px] text-gray-400 font-medium tracking-wide">{item.shortcut}</span>
          )}
          
          {!isCollapsed && item.badge && (
            <span className="text-[9px] font-bold px-1.5 py-[2px] rounded-md bg-[#10B981] text-white leading-none">
              {item.badge}
            </span>
          )}

          {isCollapsed && item.badge && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#10B981]"></span>
          )}
        </button>
        {showDividerAfter && <div className="my-2 mx-1 border-t border-gray-100"></div>}
      </div>
    );
  };

  return (
    <aside 
      className={`h-screen border-r border-gray-200 bg-white flex flex-col shrink-0 select-none font-sans transition-all duration-200 ${
        isCollapsed ? "w-[56px]" : "w-60"
      }`}
    >
      {/* Brand Header */}
      <div 
        className={`flex items-center shrink-0 border-b border-gray-100 cursor-pointer ${
          isCollapsed ? "justify-center py-3.5" : "px-4 py-3.5 justify-between"
        }`}
      >
        <div 
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={onNavigateHome}
        >
          {isCollapsed ? (
            <FirefliesLogoMark className="w-7.5 h-7.5 rounded-xl" />
          ) : (
            <FirefliesLogo size="md" darkText={true} />
          )}
        </div>

        {/* Collapse Toggle Button */}
        {!isCollapsed && (
          <button 
            onClick={onToggleCollapse}
            className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            title="Collapse Sidebar"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Expand Button when collapsed */}
      {isCollapsed && (
        <div className="px-2 py-2 flex justify-center border-b border-gray-100">
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            title="Expand Sidebar"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Links */}
      <nav className={`flex-1 overflow-y-auto py-2 ${isCollapsed ? "px-1.5" : "px-3"} space-y-0 scrollbar-none`}>
        {topItems.map((item, i) => renderItem(item, i === topItems.length - 1))}
        {middleItems.map((item, i) => renderItem(item, i === middleItems.length - 1))}
        {bottomItems.map(item => renderItem(item))}
      </nav>

      {/* Bottom Section */}
      <div className={`border-t border-gray-100 ${isCollapsed ? "px-1.5 py-2" : "px-3 py-3"} space-y-2`}>
        {/* Privacy Choices */}
        <button
          onClick={() => onComingSoon("Privacy Choices")}
          title={isCollapsed ? "Your Privacy Choices" : undefined}
          className={`w-full flex items-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer ${
            isCollapsed ? "justify-center p-2" : "gap-2.5 px-2 py-1.5"
          }`}
        >
          <Lock className="w-3.5 h-3.5 shrink-0 text-gray-400" />
          {!isCollapsed && <span className="text-[12px] font-medium text-gray-500">Your Privacy Choices</span>}
        </button>

        {/* Invite Coworkers Promo Box */}
        {!isCollapsed && !isInviteDismissed && (
          <div className="bg-[#F5F3FF] rounded-2xl p-3.5 relative animate-in fade-in duration-200">
            <button 
              onClick={() => setIsInviteDismissed(true)}
              className="absolute top-2.5 right-2.5 text-gray-400 hover:text-gray-600 text-sm leading-none cursor-pointer"
            >
              ×
            </button>
            <p className="text-[12px] font-semibold text-gray-800 mb-3 leading-snug pr-4">
              Invite coworkers to your Fireflies team
            </p>
            <button 
              onClick={() => onComingSoon("Create Team")}
              className="w-full flex items-center justify-center gap-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold py-2 px-3 rounded-xl text-[12.5px] transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
              <span>Create Team</span>
            </button>
          </div>
        )}

        {isCollapsed && (
          <button 
            onClick={() => onComingSoon("Create Team")}
            title="Create Team"
            className="w-full flex items-center justify-center p-2 rounded-xl text-[#7C3AED] bg-[#F5F3FF] hover:bg-[#EDE9FE] transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
          </button>
        )}

        {/* Logout */}
        <button
          onClick={onLogout}
          title={isCollapsed ? "Logout" : undefined}
          className={`w-full flex items-center justify-center rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer ${
            isCollapsed ? "p-2" : "text-[12px] font-semibold py-1.5 px-2 gap-1.5"
          }`}
        >
          <LogOut className={`shrink-0 ${isCollapsed ? "w-4 h-4" : "w-3.5 h-3.5"}`} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}