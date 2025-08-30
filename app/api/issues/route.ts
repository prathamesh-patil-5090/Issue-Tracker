import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { db } from "@/lib/db";
import { issues } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, columnId } = await request.json();

    if (!title || !columnId) {
      return NextResponse.json(
        { error: "Title and columnId are required" },
        { status: 400 }
      );
    }

    // Get the highest order in the column
    const columnIssues = await db
      .select()
      .from(issues)
      .where(eq(issues.columnId, columnId))
      .orderBy(desc(issues.order));
    const nextOrder = columnIssues.length > 0 ? columnIssues[0].order + 1 : 1;

    const newIssue = await db
      .insert(issues)
      .values({
        columnId,
        title,
        description,
        order: nextOrder,
      })
      .returning();

    return NextResponse.json(newIssue[0]);
  } catch (error) {
    console.error("Error creating issue:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
