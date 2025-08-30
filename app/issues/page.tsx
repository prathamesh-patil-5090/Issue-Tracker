"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { KanbanBoard } from "@/components/KanbanBoard";
import { IssueModal } from "@/components/IssueModal";

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

interface BoardData {
  board: { id: number; name: string; userId: string };
  columns: Column[];
  issues: Issue[];
}

// Type for drag and drop event from @dnd-kit
interface DragEndEvent {
  active: {
    id: string | number;
    data?: {
      current?: {
        type?: string;
        columnId?: number;
      };
    };
  };
  over: {
    id: string | number;
    data?: {
      current?: {
        type?: string;
        columnId?: number;
      };
    };
  } | null;
}

export default function Issues() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [boardData, setBoardData] = useState<BoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/login");
  }, [session, status, router]);

  useEffect(() => {
    if (session) {
      fetchBoardData();
    }
  }, [session]);

  const fetchBoardData = async () => {
    try {
      const response = await fetch("/api/board");
      if (response.ok) {
        const data = await response.json();
        setBoardData(data);
      }
    } catch (error) {
      console.error("Error fetching board data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const activeIssue = boardData?.issues.find(
      (issue) => issue.id === active.id
    );

    if (!activeIssue) return;

    // Determine the target column
    let targetColumnId: number | null = null;

    // Check if dropping over a column directly
    const overColumn = boardData?.columns.find(
      (col) => col.id.toString() === over.id.toString()
    );

    if (overColumn) {
      targetColumnId = overColumn.id;
    } else {
      // Check if dropping over an issue in another column
      const overIssue = boardData?.issues.find(
        (issue) => issue.id.toString() === over.id.toString()
      );
      if (overIssue) {
        targetColumnId = overIssue.columnId;
      }
    }

    // If we can't determine the target column, try using the droppable data
    if (!targetColumnId && over.data?.current) {
      if (over.data.current.type === "column") {
        targetColumnId = parseInt(over.id.toString());
      } else if (over.data.current.columnId) {
        targetColumnId = over.data.current.columnId;
      }
    }

    if (!targetColumnId || activeIssue.columnId === targetColumnId) return;

    console.log("Moving issue", activeIssue.id, "to column", targetColumnId);

    try {
      const response = await fetch(`/api/issues/${activeIssue.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ columnId: targetColumnId }),
      });

      if (response.ok) {
        fetchBoardData();
      } else {
        console.error("Failed to move issue:", response.statusText);
      }
    } catch (error) {
      console.error("Error moving issue:", error);
    }
  };

  const handleAddIssue = async (
    columnId: number,
    title: string,
    description?: string
  ) => {
    try {
      const response = await fetch("/api/issues", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, description, columnId }),
      });

      if (response.ok) {
        fetchBoardData();
      }
    } catch (error) {
      console.error("Error adding issue:", error);
    }
  };

  const handleAddColumn = async (name: string) => {
    if (!boardData?.board.id) return;

    try {
      const response = await fetch("/api/columns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          boardId: boardData.board.id,
          order: boardData.columns.length,
        }),
      });

      if (response.ok) {
        fetchBoardData();
      }
    } catch (error) {
      console.error("Error adding column:", error);
    }
  };

  const handleIssueClick = (issue: Issue) => {
    console.log("Issue clicked:", issue); // Debug log
    setSelectedIssue(issue);
  };

  const handleIssueUpdate = async (
    id: number,
    title: string,
    description?: string,
    columnId?: number
  ) => {
    try {
      const updateData: {
        title: string;
        description?: string;
        columnId?: number;
      } = { title, description };
      if (columnId !== undefined) {
        updateData.columnId = columnId;
      }

      const response = await fetch(`/api/issues/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        // Refresh board data to get updated issue
        fetchBoardData();
        setSelectedIssue(null); // Close modal
      } else {
        console.error("Failed to update issue");
      }
    } catch (error) {
      console.error("Error updating issue:", error);
    }
  };

  const handleDeleteColumn = async (columnId: number) => {
    try {
      const response = await fetch(`/api/columns/${columnId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Refresh board data after successful deletion
        fetchBoardData();
      } else {
        console.error("Failed to delete column");
      }
    } catch (error) {
      console.error("Error deleting column:", error);
    }
  };

  const handleEditColumn = async (columnId: number, newName: string) => {
    try {
      const response = await fetch(`/api/columns/${columnId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newName }),
      });

      if (response.ok) {
        fetchBoardData();
      } else {
        console.error("Failed to edit column");
      }
    } catch (error) {
      console.error("Error editing column:", error);
    }
  };

  const handleDeleteIssue = async (issueId: number) => {
    if (!confirm("Are you sure you want to delete this issue?")) {
      return;
    }

    try {
      const response = await fetch(`/api/issues/${issueId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchBoardData();
        setSelectedIssue(null); // Close modal if the deleted issue was selected
      } else {
        console.error("Failed to delete issue");
      }
    } catch (error) {
      console.error("Error deleting issue:", error);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="h-6 w-6 sm:h-8 sm:w-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg
                  className="h-4 w-4 sm:h-5 sm:w-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h1 className="text-lg sm:text-2xl font-bold text-white truncate">
                {boardData?.board.name || "Issue Tracker"}
              </h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              {session?.user?.image && (
                <Image
                  src={session?.user?.image}
                  width={28}
                  height={28}
                  alt="profile image"
                  className="rounded-full border-2 border-gray-600 sm:w-8 sm:h-8"
                />
              )}
              <span className="text-xs sm:text-sm text-gray-300 hidden sm:inline">
                {session?.user?.name}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200"
              >
                <span className="hidden sm:inline">Sign Out</span>
                <svg
                  className="w-4 h-4 sm:hidden"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-3 sm:py-6 px-2 sm:px-4">
        {boardData ? (
          <>
            <KanbanBoard
              columns={boardData.columns}
              issues={boardData.issues}
              onDragEnd={handleDragEnd}
              onAddIssue={handleAddIssue}
              onAddColumn={handleAddColumn}
              onIssueClick={handleIssueClick}
              onDeleteColumn={handleDeleteColumn}
              onEditColumn={handleEditColumn}
              onDeleteIssue={handleDeleteIssue}
            />
            {selectedIssue && (
              <IssueModal
                isOpen={!!selectedIssue}
                issue={selectedIssue}
                columns={boardData.columns}
                onClose={() => setSelectedIssue(null)}
                onUpdate={handleIssueUpdate}
                onDelete={handleDeleteIssue}
              />
            )}
          </>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <p className="text-gray-400 text-sm sm:text-base">
              Loading your board...
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
