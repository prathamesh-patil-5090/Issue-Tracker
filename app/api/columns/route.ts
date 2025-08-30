import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { db } from "@/lib/db";
import { columns, boards } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Column name is required" },
        { status: 400 }
      );
    }

    // Get user's board
    const userBoards = await db
      .select()
      .from(boards)
      .where(eq(boards.userId, session.user.email));
    if (!userBoards.length) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    const board = userBoards[0];

    // Get the highest order in the board
    const boardColumns = await db
      .select()
      .from(columns)
      .where(eq(columns.boardId, board.id))
      .orderBy(desc(columns.order));
    const nextOrder = boardColumns.length > 0 ? boardColumns[0].order + 1 : 1;

    const newColumn = await db
      .insert(columns)
      .values({
        boardId: board.id,
        name: name.trim(),
        order: nextOrder,
      })
      .returning();

    return NextResponse.json(newColumn[0]);
  } catch (error) {
    console.error("Error creating column:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
