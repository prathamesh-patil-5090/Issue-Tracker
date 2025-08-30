"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { KanbanIssue } from "./KanbanIssue";
import { useState } from "react";

interface Issue {
  id: number;
  title: string;
  description?: string;
  order: number;
  columnId: number;
}

interface KanbanColumnProps {
  id: string;
  title: string;
  issues: Issue[];
  onAddIssue: (columnId: number, title: string, description?: string) => void;
  onDeleteColumn: (columnId: number) => void;
  onEditColumn: (columnId: number, newName: string) => void;
  onDeleteIssue: (issueId: number) => void;
  onIssueClick: (issue: Issue) => void;
  canDelete: boolean;
  isActive?: boolean;
  isDraggedOver?: boolean;
}

export function KanbanColumn({
  id,
  title,
  issues,
  onAddIssue,
  onDeleteColumn,
  onEditColumn,
  onDeleteIssue,
  onIssueClick,
  canDelete,
  isActive = false,
  isDraggedOver = false,
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id,
    data: {
      type: "column",
      columnId: parseInt(id),
    },
  });
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);

  const handleAddIssue = async () => {
    if (newTitle.trim()) {
      await onAddIssue(
        parseInt(id),
        newTitle.trim(),
        newDescription.trim() || undefined
      );
      setNewTitle("");
      setNewDescription("");
      setIsAdding(false);
    }
  };

  const handleEditColumn = async () => {
    if (editTitle.trim() && editTitle !== title) {
      await onEditColumn(parseInt(id), editTitle.trim());
      setIsEditing(false);
    } else {
      setIsEditing(false);
      setEditTitle(title);
    }
  };

  const handleStartEdit = () => {
    setEditTitle(title);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle(title);
  };

  const handleDeleteColumn = () => {
    if (issues.length > 0) {
      if (
        !confirm(
          `This column contains ${issues.length} issue(s). Are you sure you want to delete it? All issues will be lost.`
        )
      ) {
        return;
      }
    } else {
      if (!confirm("Are you sure you want to delete this column?")) {
        return;
      }
    }
    onDeleteColumn(parseInt(id));
  };

  return (
    <div
      ref={setNodeRef}
      className={`bg-gray-800 p-3 sm:p-4 rounded-lg min-h-[500px] sm:min-h-[600px] w-72 sm:w-80 border flex-shrink-0 transition-all duration-200 ${
        isDraggedOver
          ? "border-blue-500 bg-gray-750 shadow-lg shadow-blue-500/20"
          : isActive
          ? "border-blue-400"
          : "border-gray-700"
      }`}
    >
      <div className="flex justify-between items-center mb-3 sm:mb-4">
        {isEditing ? (
          <div className="flex-1 flex items-center space-x-2">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleEditColumn();
                if (e.key === "Escape") handleCancelEdit();
              }}
              className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm sm:text-base focus:border-blue-500 focus:outline-none"
              autoFocus
            />
            <button
              onClick={handleEditColumn}
              className="text-green-400 hover:text-green-300 transition-colors duration-200 flex-shrink-0"
              title="Save"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </button>
            <button
              onClick={handleCancelEdit}
              className="text-gray-400 hover:text-gray-300 transition-colors duration-200 flex-shrink-0"
              title="Cancel"
            >
              <svg
                className="w-4 h-4"
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
        ) : (
          <>
            <h3 className="font-semibold text-white text-sm sm:text-base truncate pr-2">
              {title}
            </h3>
            <div className="flex items-center space-x-1 flex-shrink-0">
              <button
                onClick={handleStartEdit}
                className="text-gray-400 hover:text-gray-300 transition-colors duration-200"
                title="Edit column"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              {canDelete && (
                <button
                  onClick={handleDeleteColumn}
                  className="text-red-400 hover:text-red-300 transition-colors duration-200"
                  title="Delete column"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </div>
          </>
        )}
      </div>
      <div ref={setNodeRef} className="space-y-3">
        <SortableContext
          items={issues.map((issue) => issue.id.toString())}
          strategy={verticalListSortingStrategy}
        >
          {issues.map((issue) => (
            <KanbanIssue
              key={issue.id}
              id={issue.id.toString()}
              title={issue.title}
              description={issue.description}
              columnId={issue.columnId}
              onClick={() => onIssueClick(issue)}
              onDelete={onDeleteIssue}
            />
          ))}
        </SortableContext>

        {isAdding ? (
          <div className="bg-gray-700 p-2 sm:p-3 rounded-lg shadow-sm border border-gray-600">
            <input
              type="text"
              placeholder="Issue title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full mb-2 p-2 text-sm border border-gray-600 rounded bg-gray-800 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddIssue();
                if (e.key === "Escape") setIsAdding(false);
              }}
              autoFocus
            />
            <textarea
              placeholder="Description (optional)"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full mb-2 p-2 text-sm border border-gray-600 rounded resize-none bg-gray-800 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              rows={2}
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddIssue}
                className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 sm:px-3 sm:py-1 rounded text-xs sm:text-sm transition-colors duration-200"
              >
                Add
              </button>
              <button
                onClick={() => setIsAdding(false)}
                className="bg-gray-600 hover:bg-gray-700 text-gray-300 px-2 py-1 sm:px-3 sm:py-1 rounded text-xs sm:text-sm transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 py-2 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 border border-gray-600"
          >
            + Add Issue
          </button>
        )}
      </div>
    </div>
  );
}
