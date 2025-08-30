"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, useRef } from "react";

interface KanbanIssueProps {
  id: string;
  title: string;
  description?: string;
  columnId: number;
  onClick: () => void;
  onDelete: (issueId: number) => void;
}

export function KanbanIssue({
  id,
  title,
  description,
  columnId,
  onClick,
  onDelete,
}: KanbanIssueProps) {
  const [isDragStart, setIsDragStart] = useState(false);
  const dragStarted = useRef(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: {
      type: "issue",
      columnId: columnId,
    },
    transition: {
      duration: 150,
      easing: "cubic-bezier(0.25, 1, 0.5, 1)",
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handlePointerDown = () => {
    dragStarted.current = false;
    setIsDragStart(false);
  };

  const handlePointerUp = () => {
    // Small delay to distinguish click from drag
    setTimeout(() => {
      if (!isDragging && !dragStarted.current) {
        onClick();
      }
      setIsDragStart(false);
      dragStarted.current = false;
    }, 100);
  };

  const handlePointerMove = () => {
    if (!dragStarted.current) {
      dragStarted.current = true;
      setIsDragStart(true);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      className={`bg-gray-700 p-2 sm:p-3 rounded-lg shadow-sm border border-gray-600 cursor-pointer hover:bg-gray-600 transition-colors duration-200 relative group ${
        isDragging ? "opacity-50 cursor-grabbing" : "cursor-grab"
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-white text-sm sm:text-base leading-tight pr-6">
            {title}
          </h4>
          {description && (
            <p className="text-xs sm:text-sm text-gray-300 mt-1 leading-tight line-clamp-2">
              {description}
            </p>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(parseInt(id));
          }}
          className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity duration-200 flex-shrink-0 ml-2"
          title="Delete issue"
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
      </div>
    </div>
  );
}
