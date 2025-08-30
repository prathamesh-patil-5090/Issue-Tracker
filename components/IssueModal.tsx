"use client";

import { useState, useEffect } from "react";

interface Issue {
  id: number;
  title: string;
  description?: string;
  order: number;
  columnId: number;
}

interface Column {
  id: number;
  name: string;
  order: number;
}

interface IssueModalProps {
  issue: Issue | null;
  columns: Column[];
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (
    id: number,
    title: string,
    description?: string,
    columnId?: number
  ) => void;
}

export function IssueModal({
  issue,
  columns,
  isOpen,
  onClose,
  onUpdate,
}: IssueModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColumnId, setSelectedColumnId] = useState<number | null>(null);

  useEffect(() => {
    if (issue) {
      setTitle(issue.title || "");
      setDescription(issue.description || "");
      setSelectedColumnId(issue.columnId);
    }
  }, [issue]);

  const handleSave = () => {
    if (issue && title.trim()) {
      onUpdate(
        issue.id,
        title.trim(),
        description.trim() || undefined,
        selectedColumnId || issue.columnId
      );
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSave();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen || !issue) return null;

  const currentColumn = columns.find((col) => col.id === selectedColumnId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Issue Details
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors duration-200 p-1"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Column Badge */}
          <div className="mb-3 sm:mb-4">
            <span className="inline-flex items-center px-2 py-1 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <svg
                className="w-3 h-3 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              {currentColumn?.name || "Unknown Column"}
            </span>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full p-2 sm:p-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none text-sm sm:text-base"
                placeholder="Enter issue title"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                Column
              </label>
              <select
                value={selectedColumnId || ""}
                onChange={(e) => setSelectedColumnId(Number(e.target.value))}
                className="w-full p-2 sm:p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:border-blue-500 focus:outline-none text-sm sm:text-base"
              >
                {columns.map((column) => (
                  <option key={column.id} value={column.id}>
                    {column.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full p-2 sm:p-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none text-sm sm:text-base"
                rows={3}
                placeholder="Enter issue description (optional)"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
            <button
              onClick={onClose}
              className="w-full sm:w-auto bg-gray-600 hover:bg-gray-700 text-gray-300 px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-colors duration-200 text-sm sm:text-base order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-colors duration-200 text-sm sm:text-base order-1 sm:order-2"
            >
              Save Changes
            </button>
          </div>

          <div className="mt-3 sm:mt-4 text-xs text-gray-400 text-center">
            Press Ctrl+Enter to save • Press Escape to cancel
          </div>
        </div>
      </div>
    </div>
  );
}
