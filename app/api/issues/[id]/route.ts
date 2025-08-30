import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { db } from "@/lib/db";
import { issues } from "@/lib/schema";
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

    const issueId = parseInt(params.id);
    if (isNaN(issueId)) {
      return NextResponse.json({ error: "Invalid issue ID" }, { status: 400 });
    }

    const { columnId, title, description } = await request.json();

    // Build update object
    const updateData: Record<string, any> = {};
    if (columnId !== undefined) updateData.columnId = columnId;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    updateData.updatedAt = new Date();

    const updatedIssue = await db
      .update(issues)
      .set(updateData)
      .where(eq(issues.id, issueId))
      .returning();

    if (!updatedIssue.length) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    return NextResponse.json(updatedIssue[0]);
  } catch (error) {
    console.error("Error updating issue:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
