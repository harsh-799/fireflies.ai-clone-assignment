"use client";

import React from "react";

interface FirefliesLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
  darkText?: boolean;
}

export function FirefliesLogoMark({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg 
      className={`shrink-0 ${className}`} 
      viewBox="0 0 94 98" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="purple-grad" x1="0" y1="30" x2="30" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6E2CF4" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
        <linearGradient id="top-right-grad" x1="34" y1="15" x2="94" y2="15" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#D946EF" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
        <linearGradient id="bottom-left-grad" x1="15" y1="34" x2="15" y2="98" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#DB2777" />
          <stop offset="100%" stopColor="#F43F5E" />
        </linearGradient>
      </defs>
      
      {/* Top-left */}
      <path 
        d="M 30,3 A 3,3 0 0,0 27,0 L 12,0 A 12,12 0 0,0 0,12 L 0,27 A 3,3 0 0,0 3,30 L 27,30 A 3,3 0 0,0 30,27 Z" 
        fill="url(#purple-grad)" 
      />
      
      {/* Top-right */}
      <path 
        d="M 34,3 A 3,3 0 0,1 37,0 L 79,0 A 15,15 0 0,1 94,15 A 15,15 0 0,1 79,30 L 37,30 A 3,3 0 0,1 34,27 Z" 
        fill="url(#top-right-grad)" 
      />
      
      {/* Bottom-left */}
      <path 
        d="M 3,34 L 27,34 A 3,3 0 0,1 30,37 L 30,83 A 15,15 0 0,1 15,98 A 15,15 0 0,1 0,83 L 0,37 A 3,3 0 0,1 3,34 Z" 
        fill="url(#bottom-left-grad)" 
      />
      
      {/* Bottom-right */}
      <rect 
        x="34" 
        y="34" 
        width="30" 
        height="30" 
        rx="3" 
        fill="#FFC4E1" 
      />
    </svg>
  );
}

export default function FirefliesLogo({ 
  size = "md", 
  showText = true, 
  className = "",
  darkText = true
}: FirefliesLogoProps) {
  const markDimensions = size === "sm" ? "w-6 h-6 rounded-lg" : size === "lg" ? "w-11 h-11 rounded-2xl" : "w-8 h-8 rounded-xl";
  const textStyle = size === "sm" ? "text-xs" : size === "lg" ? "text-xl" : "text-[15px]";

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      <FirefliesLogoMark className={markDimensions} />
      {showText && (
        <span className={`font-black tracking-tight ${textStyle} ${darkText ? "text-gray-900" : "text-white"}`}>
          fireflies<span className="text-[#9333EA] font-bold">.ai</span>
        </span>
      )}
    </div>
  );
}
