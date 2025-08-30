"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  closestCorners,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  UniqueIdentifier,
  MeasuringStrategy,
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
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [draggedIssue, setDraggedIssue] = useState<Issue | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [clonedIssues, setClonedIssues] = useState<Issue[] | null>(null);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);

  // Enhanced sensors with better activation constraints
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10, // Require 10px movement before activating
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250, // 250ms delay for touch
      tolerance: 10, // 10px tolerance
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  // Helper function to find which column contains an item
  function findContainer(
    id: UniqueIdentifier,
    context: "active" | "over"
  ): number | null {
    if (context === "active") {
      // For active (dragged) items, it should be an issue
      const issue = issues.find(
        (issue) => issue.id.toString() === id.toString()
      );
      if (issue) {
        return issue.columnId;
      }
    } else {
      // For over (drop target), check column first, then issue
      const column = columns.find((col) => col.id.toString() === id.toString());
      if (column) {
        return column.id;
      }

      // If not a column, check if it's an issue (dropping over another issue)
      const issue = issues.find(
        (issue) => issue.id.toString() === id.toString()
      );
      if (issue) {
        return issue.columnId;
      }
    }

    return null;
  }
  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const { id } = active;

    setActiveId(id);
    setOverId(null);

    // Find and store the dragged issue
    const issue = issues.find((issue) => issue.id.toString() === id.toString());
    if (issue) {
      setDraggedIssue(issue);
      setClonedIssues([...issues]); // Store original state for potential rollback
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    const { id } = active;
    const overTarget = over?.id;

    setOverId(overTarget || null);

    if (!overTarget || !draggedIssue) return;

    // Find the containers
    const activeContainer = findContainer(id, "active");
    const overContainer = findContainer(overTarget, "over");

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
      return;
    }

    // This handles moving items between different columns during drag
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    // Reset drag state
    setActiveId(null);
    setDraggedIssue(null);
    setClonedIssues(null);
    setOverId(null);

    if (!over || !draggedIssue) {
      return;
    }

    const activeId = active.id;
    const overId = over.id;

    // If dropped on the same position, do nothing
    if (activeId === overId) {
      return;
    }

    // Determine target column
    let targetColumnId: number | null = null;

    // Check if dropping over a column directly
    const overColumn = columns.find(
      (col) => col.id.toString() === overId.toString()
    );
    if (overColumn) {
      targetColumnId = overColumn.id;
    } else {
      // Check if dropping over an issue
      const overIssue = issues.find(
        (issue) => issue.id.toString() === overId.toString()
      );
      if (overIssue) {
        targetColumnId = overIssue.columnId;
      }
    }

    // If we can't determine target column, try using droppable data
    if (!targetColumnId && over.data?.current) {
      if (over.data.current.type === "column") {
        targetColumnId = parseInt(overId.toString());
      } else if (over.data.current.columnId) {
        targetColumnId = over.data.current.columnId;
      }
    }

    if (!targetColumnId || draggedIssue.columnId === targetColumnId) {
      return; // No valid target or same column
    }

    // Create enhanced event data for the parent handler
    const enhancedEvent = {
      ...event,
      active: {
        ...active,
        data: {
          current: {
            type: "issue",
            columnId: draggedIssue.columnId,
          },
        },
      },
      over: {
        ...over,
        data: {
          current: {
            type: overColumn ? "column" : "issue",
            columnId: targetColumnId,
          },
        },
      },
    };

    // Call the parent's drag end handler
    onDragEnd(enhancedEvent);
  }

  // Group issues by column
  const issuesByColumn = columns.reduce((acc, column) => {
    acc[column.id] = issues.filter((issue) => issue.columnId === column.id);
    return acc;
  }, {} as Record<number, Issue[]>);

  return (
    <DndContext
      sensors={sensors}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
        },
      }}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="overflow-x-auto bg-gray-900 min-h-screen">
        <div className="flex gap-4 sm:gap-6 p-4 sm:p-6 min-w-fit">
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
              isActive={activeId === column.id.toString()}
              isDraggedOver={Boolean(
                draggedIssue &&
                  overId &&
                  (overId.toString() === column.id.toString() ||
                    issues.find(
                      (issue) => issue.id.toString() === overId.toString()
                    )?.columnId === column.id)
              )}
            />
          ))}
          {/* Add new column button */}
          <div className="bg-gray-800 p-3 sm:p-4 rounded-lg min-h-full sm:min-h-full w-72 sm:w-80 border border-gray-700 border-dashed flex-shrink-0">
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
                <span className="text-xs sm:text-sm font-medium">
                  Add Column
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeId && draggedIssue ? (
          <div className="bg-gray-700 p-2 sm:p-3 rounded-lg shadow-lg border border-gray-600 opacity-90 transform rotate-3 scale-105 cursor-grabbing">
            <h4 className="font-medium text-white text-sm sm:text-base leading-tight">
              {draggedIssue.title}
            </h4>
            {draggedIssue.description && (
              <p className="text-xs sm:text-sm text-gray-300 mt-1 leading-tight line-clamp-2">
                {draggedIssue.description}
              </p>
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
