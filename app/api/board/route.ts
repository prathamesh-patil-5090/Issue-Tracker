import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { db } from "@/lib/db";
import { boards, columns, issues } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's board (assuming one board per user for simplicity)
    const userBoards = await db
      .select()
      .from(boards)
      .where(eq(boards.userId, session.user.email));
    let board = userBoards[0];

    if (!board) {
      // Create default board if none exists
      const newBoard = await db
        .insert(boards)
        .values({
          userId: session.user.email,
          name: "My Board",
        })
        .returning();
      board = newBoard[0];

      // Create default columns
      await db.insert(columns).values([
        { boardId: board.id, name: "To Do", order: 1 },
        { boardId: board.id, name: "In Progress", order: 2 },
        { boardId: board.id, name: "Done", order: 3 },
      ]);
    }

    // Get columns and issues
    const boardColumns = await db
      .select()
      .from(columns)
      .where(eq(columns.boardId, board.id))
      .orderBy(columns.order);

    // Get all issues for the board's columns
    const columnIds = boardColumns.map((col) => col.id);
    const allIssues = await db.select().from(issues);
    const boardIssues = allIssues.filter((issue) =>
      columnIds.includes(issue.columnId)
    );

    return NextResponse.json({
      board,
      columns: boardColumns,
      issues: boardIssues,
    });
  } catch (error) {
    console.error("Error fetching board:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
