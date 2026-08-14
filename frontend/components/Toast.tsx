"use client";

import React, { useEffect } from "react";
import { CheckCircle, AlertCircle, X } from "lucide-react";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000); // Auto-dismiss after 4 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-6 right-6 z-[9999] flex items-center gap-3 px-4.5 py-3.5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] text-gray-900 font-sans animate-in slide-in-from-top-4 fade-in duration-300 border bg-white/75 backdrop-blur-md border-white/50 select-none">
      
      {/* Icon based on success/error */}
      {type === "success" ? (
        <div className="w-5.5 h-5.5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <CheckCircle className="w-3.5 h-3.5" />
        </div>
      ) : (
        <div className="w-5.5 h-5.5 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0">
          <AlertCircle className="w-3.5 h-3.5" />
        </div>
      )}

      {/* Message Text */}
      <span className="text-xs font-semibold tracking-normal text-gray-800 pr-1">
        {message}
      </span>

      {/* Close button */}
      <button 
        onClick={onClose}
        className="p-1 rounded-lg hover:bg-gray-100/80 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
