"use client";

import React from "react";
import { BookOpen, Key, Hash } from "lucide-react";
import { Summary } from "../app/types";

interface SummaryProps {
  summary: Summary | null;
}

export default function SummaryView({ summary }: SummaryProps) {
  if (!summary) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-gray-500 text-sm font-sans">
        <span>No summary or key topics generated for this meeting.</span>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-6 font-sans select-none">
      {/* Overview Section */}
      <section className="space-y-2">
        <h3 className="text-xs font-bold text-gray-900 flex items-center gap-2 uppercase tracking-widest">
          <BookOpen className="w-4 h-4 text-purple-600" />
          <span>Overview</span>
        </h3>
        <p className="text-sm leading-relaxed text-gray-700 select-text">
          {summary.overview_text}
        </p>
      </section>

      {/* Topics Outline Section */}
      {summary.key_topics && summary.key_topics.length > 0 && (
        <section className="space-y-3 pt-4 border-t border-gray-150">
          <h3 className="text-xs font-bold text-gray-900 flex items-center gap-2 uppercase tracking-widest">
            <Key className="w-4 h-4 text-purple-600" />
            <span>Key Topics & Agenda Outline</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {summary.key_topics.map((topic, i) => (
              <div 
                key={i}
                className="flex items-center gap-2.5 p-2.5 bg-gray-50 hover:bg-purple-50/30 border border-gray-200/60 rounded-lg text-xs font-semibold text-gray-800 transition-colors"
              >
                <div className="w-5 h-5 rounded bg-purple-100/70 flex items-center justify-center text-purple-600 shrink-0">
                  <Hash className="w-3 h-3" />
                </div>
                <span className="truncate">{topic}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
