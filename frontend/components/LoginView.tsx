"use client";

import React, { useState } from "react";
import { Lock, User as UserIcon } from "lucide-react";
import FirefliesLogo from "./FirefliesLogo";

interface LoginViewProps {
  onLoginSuccess: () => void;
  triggerToast: (msg: string, type?: "success" | "error") => void;
}

export default function LoginView({ onLoginSuccess, triggerToast }: LoginViewProps) {
  const [loginEmail, setLoginEmail] = useState("demo@fireflies.local");
  const [loginPassword, setLoginPassword] = useState("demo123");
  const [loginError, setLoginError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("fireflies_session", "authenticated");
    onLoginSuccess();
    setLoginError("");
    triggerToast("Logged in successfully!", "success");
  };

  return (
    <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center p-4 lg:p-8 font-sans select-none text-white">
      {/* Main card */}
      <div className="bg-[#121318] border border-gray-800/60 rounded-3xl overflow-hidden shadow-2xl max-w-5xl w-full flex flex-col md:flex-row min-h-[620px]">
        
        {/* ───────── LEFT COLUMN ───────── */}
        <div className="w-full md:w-1/2 p-10 lg:p-14 flex flex-col justify-between bg-[#121318]">
          <div className="space-y-8">
            {/* Logo */}
            <FirefliesLogo size="lg" darkText={false} />

            {/* Title + legal */}
            <div className="space-y-4">
              <h1 className="text-[28px] lg:text-[32px] font-bold text-white leading-[1.15] tracking-tight">
                Get the #1 AI Assistant for<br />Your Meetings
              </h1>
              <p className="text-[12.5px] text-gray-400 leading-relaxed max-w-[340px]">
                By clicking &quot;Continue&quot;, you agree to our{" "}
                <button type="button" className="text-[#A78BFA] hover:text-[#C4B5FD] underline underline-offset-2">
                  Terms of Service
                </button>
                , acknowledge{" "}
                <button type="button" className="text-[#A78BFA] hover:text-[#C4B5FD] underline underline-offset-2">
                  Privacy Policy
                </button>{" "}
                & consent to Fireflies recording and using your voice data to provide Fireflies&apos; services.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5 max-w-[360px]">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Workspace Email
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full text-[13.5px] bg-[#1C1E26] border border-gray-700/80 focus:border-purple-500 rounded-xl py-3 pl-11 pr-4 outline-none text-white placeholder-gray-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full text-[13.5px] bg-[#1C1E26] border border-gray-700/80 focus:border-purple-500 rounded-xl py-3 pl-11 pr-4 outline-none text-white placeholder-gray-500 transition-colors"
                  />
                </div>
              </div>

              {loginError && (
                <div className="bg-red-950/50 border border-red-900/60 rounded-lg px-3 py-2.5 text-[12px] text-red-400 font-medium">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold py-3 px-4 rounded-xl text-[14px] transition-colors shadow-lg shadow-purple-900/20"
              >
                Sign In to Workspace
              </button>
            </form>
          </div>

          {/* Security badges */}
          <div className="pt-10 flex items-center justify-center gap-1.5 text-[11px] font-medium text-[#34D399] tracking-wide">
            <span>🔒</span>
            <span>SOC 2 TYPE II · GDPR · HIPAA · 256-BIT ENCRYPTION</span>
          </div>
        </div>

        {/* ───────── RIGHT COLUMN ───────── */}
        <div className="hidden md:flex md:w-1/2 bg-[#0E0F14] border-l border-gray-800/50 p-10 lg:p-12 flex-col justify-between relative overflow-hidden">
          {/* Soft glow */}
          <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-blue-600/10 rounded-full blur-[90px] pointer-events-none" />

          <div className="space-y-5 my-auto relative z-10">
            {/* Meeting card */}
            <div className="bg-[#16171E] border border-gray-800/70 rounded-2xl p-5 shadow-2xl">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-white font-semibold text-[15px]">Marketing Sync</h3>
                  <p className="text-[12px] text-gray-500 mt-0.5">Jan 15, 11:30 AM</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-[12px]">
                  <span>🚀</span>
                  <span className="text-gray-400 font-medium">Priorities:</span>
                  <span className="text-[#A78BFA] font-semibold">00:00 - 10:12</span>
                </div>

                <div className="bg-[#121319] border border-gray-800/60 rounded-xl px-4 py-3 text-[13px] text-gray-200 leading-relaxed">
                  Ensure clarity on messaging, target audience, and primary channels
                </div>

                {/* Skeleton lines */}
                <div className="space-y-2 pt-1">
                  <div className="h-2 w-48 bg-gray-800/60 rounded-full" />
                  <div className="h-2 w-32 bg-gray-800/50 rounded-full" />
                </div>
              </div>
            </div>

            {/* Chat input bar (matches original) */}
            <div className="bg-[#181922] border border-gray-800/70 rounded-2xl p-3.5 flex items-center gap-3 shadow-xl">
              {/* App icons */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Teams */}
                <div className="w-6 h-6 rounded-md bg-[#5059C9] flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.625 7.5h-3.75V5.25A2.25 2.25 0 0014.625 3h-5.25A2.25 2.25 0 007.125 5.25v2.25h-3.75A.75.75 0 002.625 8.25v10.5c0 .414.336.75.75.75h16.5a.75.75 0 00.75-.75V8.25a.75.75 0 00-.75-.75zM9 5.25a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v2.25h-6V5.25zm-4.5 3h15v9.75h-15V8.25z"/>
                  </svg>
                </div>
                {/* Google Meet */}
                <div className="w-6 h-6 rounded-md bg-[#00897B] flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">M</span>
                </div>
                {/* Fireflies */}
                <div className="w-6 h-6 rounded-md bg-[#7C3AED] flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">F</span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-gray-300 truncate">
                  List out all the tasks for the new website.
                </p>
              </div>

              <button className="w-8 h-8 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] flex items-center justify-center text-white shrink-0 transition-colors">
                <span className="text-sm font-bold">↑</span>
              </button>
            </div>
          </div>

          {/* Testimonial */}
          <div className="space-y-4 pt-6 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Vercel triangle */}
                <svg className="w-4 h-4 text-white" viewBox="0 0 76 65" fill="currentColor">
                  <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
                </svg>
                <span className="text-[14px] font-semibold text-white">Vercel</span>
              </div>
              <div className="flex items-center gap-1 text-[#F97316] text-[13px] font-semibold">
                <span>🎯</span>
                <span>4.8 / 5</span>
              </div>
            </div>

            <p className="text-[13.5px] text-gray-300 leading-relaxed">
              &ldquo;Fireflies keeps me 100% present in meetings without losing any of the details.&rdquo;
            </p>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center text-[12px] font-bold text-white">
                SB
              </div>
              <div>
                <p className="text-[13px] font-semibold text-white">Sarup Banskota</p>
                <p className="text-[12px] text-gray-500">Head of Growth</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}