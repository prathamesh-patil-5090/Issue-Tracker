"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { KanbanColumn } from "./KanbanColumn";
import { useState } from "react";

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

interface KanbanBoardProps {
  columns: Column[];
  issues: Issue[];
  onDragEnd: (event: DragEndEvent) => void;
  onAddIssue: (columnId: number, title: string, description?: string) => void;
  onAddColumn: (name: string) => void;
  onDeleteColumn: (columnId: number) => void;
  onEditColumn: (columnId: number, newName: string) => void;
  onDeleteIssue: (issueId: number) => void;
  onIssueClick: (issue: Issue) => void;
}

export function KanbanBoard({
  columns,
  issues,
  onDragEnd,
  onAddIssue,
  onAddColumn,
  onDeleteColumn,
  onEditColumn,
  onDeleteIssue,
  onIssueClick,
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Skip if dropping on the same item
    if (activeId === overId) return;

    // Find the active issue
    const activeIssue = issues.find(
      (issue) => issue.id.toString() === activeId
    );
    if (!activeIssue) return;

    // Check if we're dropping over a column or another issue
    const overColumn = columns.find((col) => col.id.toString() === overId);
    const overIssue = issues.find((issue) => issue.id.toString() === overId);

    // If dropping over a column directly
    if (overColumn) {
      return; // Let handleDragEnd handle this
    }

    // If dropping over an issue in a different column
    if (overIssue && overIssue.columnId !== activeIssue.columnId) {
      return; // Let handleDragEnd handle this
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    onDragEnd(event);
  }

  // Group issues by column
  const issuesByColumn = columns.reduce((acc, column) => {
    acc[column.id] = issues.filter((issue) => issue.columnId === column.id);
    return acc;
  }, {} as Record<number, Issue[]>);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-6 bg-gray-900 min-h-screen">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id.toString()}
            title={column.name}
            issues={issuesByColumn[column.id] || []}
            onAddIssue={onAddIssue}
            onDeleteColumn={onDeleteColumn}
            onEditColumn={onEditColumn}
            onDeleteIssue={onDeleteIssue}
            onIssueClick={onIssueClick}
            canDelete={columns.length > 1}
          />
        ))}
        {/* Add new column button */}
        <div className="bg-gray-800 p-3 sm:p-4 rounded-lg min-h-[300px] sm:min-h-[400px] w-full sm:w-80 border border-gray-700 border-dashed flex-shrink-0">
          <button
            onClick={() => {
              const name = prompt("Enter column name:");
              if (name && name.trim()) {
                onAddColumn(name.trim());
              }
            }}
            className="w-full h-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors duration-200 p-4"
          >
            <div className="text-center">
              <svg
                className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span className="text-xs sm:text-sm font-medium">Add Column</span>
            </div>
          </button>
        </div>
      </div>
    </DndContext>
  );
}
