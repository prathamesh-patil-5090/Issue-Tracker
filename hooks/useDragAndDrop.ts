import { useState } from "react";
import axios from "axios";

interface Issue {
  id: number;
  title: string;
  description?: string;
  order: number;
  columnId: number;
}

interface BoardData {
  board: { id: number; name: string; userId: string };
  columns: Array<{ id: number; name: string; order: number }>;
  issues: Issue[];
}

interface UseDragAndDropProps {
  boardData: BoardData | null;
  setBoardData: (data: BoardData) => void;
  fetchBoardData: () => void;
}

export function useDragAndDrop({
  boardData,
  setBoardData,
  fetchBoardData,
}: UseDragAndDropProps) {
  const [isDragging, setIsDragging] = useState(false);

  const moveIssueToColumn = async (issueId: number, targetColumnId: number) => {
    if (!boardData) return false;

    const issue = boardData.issues.find((i) => i.id === issueId);
    if (!issue || issue.columnId === targetColumnId) return false;

    const sourceColumnId = issue.columnId;

    // Optimistic update
    const updateUI = () => {
      const updatedIssues = boardData.issues.map((issue) =>
        issue.id === issueId ? { ...issue, columnId: targetColumnId } : issue
      );

      setBoardData({
        ...boardData,
        issues: updatedIssues,
      });
    };

    console.log(
      `🔄 Moving issue ${issueId} from column ${sourceColumnId} to column ${targetColumnId}`
    );

    // Apply optimistic update immediately
    updateUI();
    setIsDragging(false);

    try {
      const response = await axios.patch(`/api/issues/${issueId}/move`, {
        targetColumnId,
        sourceColumnId,
      });

      if (response.status === 200) {
        console.log("✅ Issue moved successfully:", response.data.message);
        // Refresh to ensure server state consistency
        await fetchBoardData();
        return true;
      } else {
        console.error("❌ Failed to move issue:", response.statusText);
        await fetchBoardData(); // Revert on failure
        return false;
      }
    } catch (error) {
      console.error("❌ Error moving issue:", error);
      await fetchBoardData(); // Revert on error
      return false;
    }
  };

  return {
    isDragging,
    setIsDragging,
    moveIssueToColumn,
  };
}
