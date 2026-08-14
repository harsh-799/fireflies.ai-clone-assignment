"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

interface DeleteMeetingDialogProps {
  meetingTitle: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function DeleteMeetingDialog({
  meetingTitle,
  onClose,
  onConfirm,
}: DeleteMeetingDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } catch (err) {
      console.error(err);
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs font-sans p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col border border-gray-100 p-5 space-y-4">
        
        {/* Warning Icon & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Delete meeting?</h3>
            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[240px]" title={meetingTitle}>
              {meetingTitle}
            </p>
          </div>
        </div>

        {/* Message */}
        <p className="text-xs text-gray-600 leading-relaxed">
          This action cannot be undone. All associated transcript segments, summaries, and action items will be permanently removed.
        </p>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-3.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-500 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer disabled:bg-red-400"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
