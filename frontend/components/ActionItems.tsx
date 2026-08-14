"use client";

import React, { useState } from "react";
import { CheckSquare, Square, User, Plus, Edit2, Trash2, Check, X } from "lucide-react";
import { ActionItem } from "../app/types";

interface ActionItemsProps {
  meetingId: number;
  items: ActionItem[];
  onToggleComplete: (id: number, currentCompleted: boolean) => Promise<void>;
  onAddActionItem: (text: string, assignee: string) => Promise<void>;
  onEditActionItem: (id: number, text: string, assignee: string) => Promise<void>;
  onDeleteActionItem: (id: number) => Promise<void>;
}

export default function ActionItems({
  meetingId,
  items,
  onToggleComplete,
  onAddActionItem,
  onEditActionItem,
  onDeleteActionItem,
}: ActionItemsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newText, setNewText] = useState("");
  const [newAssignee, setNewAssignee] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [editAssignee, setEditAssignee] = useState("");

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    await onAddActionItem(newText.trim(), newAssignee.trim() || "Unassigned");
    setNewText("");
    setNewAssignee("");
    setIsAdding(false);
  };

  const handleStartEdit = (item: ActionItem) => {
    setEditingId(item.id);
    setEditText(item.text);
    setEditAssignee(item.assignee);
  };

  const handleSaveEdit = async (id: number) => {
    if (!editText.trim()) return;
    await onEditActionItem(id, editText.trim(), editAssignee.trim() || "Unassigned");
    setEditingId(null);
  };

  const getInitials = (name: string) => {
    return name ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "UN";
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 font-sans select-none">
      <div className="flex items-center justify-between border-b border-gray-150 pb-3">
        <h3 className="text-xs font-bold text-gray-900 flex items-center gap-2 uppercase tracking-widest">
          <CheckSquare className="w-4 h-4 text-purple-600" />
          <span>Action Items & Decisions ({items.length})</span>
        </h3>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-800 transition-colors bg-purple-50 hover:bg-purple-100/80 px-2 py-1.5 rounded-lg border border-purple-150 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
        )}
      </div>

      {/* Add New Action Item Form Block */}
      {isAdding && (
        <form onSubmit={handleAddSubmit} className="bg-gray-50 border border-gray-250 rounded-xl p-3 space-y-2.5">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Task Description</label>
            <input
              type="text"
              required
              placeholder="e.g. Design initial schema"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              className="w-full text-xs bg-white border border-gray-250 rounded-lg p-1.5 outline-none focus:border-purple-500 text-gray-800"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Assignee</label>
            <input
              type="text"
              placeholder="e.g. Charlie Brown"
              value={newAssignee}
              onChange={(e) => setNewAssignee(e.target.value)}
              className="w-full text-xs bg-white border border-gray-255 rounded-lg p-1.5 outline-none focus:border-purple-500 text-gray-800"
            />
          </div>
          <div className="flex justify-end gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-500 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              Create Item
            </button>
          </div>
        </form>
      )}

      {/* Items Checklist list */}
      <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin">
        {items.length === 0 ? (
          <div className="text-center text-gray-400 py-6 text-xs">
            <span>No action items found. Feel free to add one above!</span>
          </div>
        ) : (
          items.map((item) => {
            const isEditing = editingId === item.id;
            
            return (
              <div
                key={item.id}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                  item.is_completed 
                    ? "bg-gray-50/60 border-gray-200/50" 
                    : "bg-white border-gray-200 hover:shadow-xs"
                }`}
              >
                {/* Completion Toggle */}
                <button
                  onClick={() => onToggleComplete(item.id, item.is_completed)}
                  className={`mt-0.5 shrink-0 transition-colors cursor-pointer ${
                    item.is_completed ? "text-purple-600" : "text-gray-400 hover:text-purple-500"
                  }`}
                >
                  {item.is_completed ? (
                    <CheckSquare className="w-4 h-4 fill-purple-50" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full text-xs bg-white border border-gray-200 rounded-md p-1.5 outline-none focus:border-purple-500"
                      />
                      <input
                        type="text"
                        value={editAssignee}
                        onChange={(e) => setEditAssignee(e.target.value)}
                        className="w-full text-xs bg-white border border-gray-200 rounded-md p-1.5 outline-none focus:border-purple-500"
                        placeholder="Assignee"
                      />
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleSaveEdit(item.id)}
                          className="p-1 bg-purple-600 text-white rounded hover:bg-purple-700 cursor-pointer"
                          title="Save Changes"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 cursor-pointer"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <span
                        className={`text-xs leading-relaxed block break-words select-text ${
                          item.is_completed ? "text-gray-400 line-through font-medium" : "text-gray-800 font-bold"
                        }`}
                      >
                        {item.text}
                      </span>
                      
                      {/* Assignee Badge info */}
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full bg-purple-50 flex items-center justify-center text-[7px] font-extrabold text-purple-600 border border-purple-100">
                          {getInitials(item.assignee)}
                        </div>
                        <span className="text-[10px] font-semibold text-gray-450 truncate">
                          {item.assignee}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Edit / Delete Actions */}
                {!isEditing && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleStartEdit(item)}
                      className="p-1 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit Item"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteActionItem(item.id)}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
