import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { db } from "@/lib/db";
import { columns, issues } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const columnId = parseInt(params.id);
    if (isNaN(columnId)) {
      return NextResponse.json({ error: "Invalid column ID" }, { status: 400 });
    }

    const { name } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Column name is required" },
        { status: 400 }
      );
    }

    const updatedColumn = await db
      .update(columns)
      .set({ name: name.trim() })
      .where(eq(columns.id, columnId))
      .returning();

    if (!updatedColumn.length) {
      return NextResponse.json({ error: "Column not found" }, { status: 404 });
    }

    return NextResponse.json(updatedColumn[0]);
  } catch (error) {
    console.error("Error updating column:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const columnId = parseInt(params.id);
    if (isNaN(columnId)) {
      return NextResponse.json({ error: "Invalid column ID" }, { status: 400 });
    }

    // First, delete all issues in this column
    await db.delete(issues).where(eq(issues.columnId, columnId));

    // Then delete the column
    const deletedColumn = await db
      .delete(columns)
      .where(eq(columns.id, columnId))
      .returning();

    if (!deletedColumn.length) {
      return NextResponse.json({ error: "Column not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Column deleted successfully" });
  } catch (error) {
    console.error("Error deleting column:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
