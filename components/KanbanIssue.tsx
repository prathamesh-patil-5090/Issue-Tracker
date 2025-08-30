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
}

export function KanbanIssue({
  id,
  title,
  description,
  columnId,
  onClick,
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
      className={`bg-gray-700 p-2 sm:p-3 rounded-lg shadow-sm border border-gray-600 cursor-pointer hover:bg-gray-600 transition-colors duration-200 ${
        isDragging ? "opacity-50 cursor-grabbing" : "cursor-grab"
      }`}
    >
      <h4 className="font-medium text-white text-sm sm:text-base leading-tight">
        {title}
      </h4>
      {description && (
        <p className="text-xs sm:text-sm text-gray-300 mt-1 leading-tight line-clamp-2">
          {description}
        </p>
      )}
    </div>
  );
}
