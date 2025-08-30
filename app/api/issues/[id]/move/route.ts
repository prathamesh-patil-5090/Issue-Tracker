import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { db } from "@/lib/db";
import { issues } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const issueId = parseInt(id);
    if (isNaN(issueId)) {
      return NextResponse.json({ error: "Invalid issue ID" }, { status: 400 });
    }

    const { targetColumnId, sourceColumnId } = await request.json();

    if (!targetColumnId) {
      return NextResponse.json(
        { error: "Target column ID is required" },
        { status: 400 }
      );
    }

    // Log the drag operation
    console.log(
      `🔄 Moving issue ${issueId} from column ${sourceColumnId} to column ${targetColumnId}`
    );

    // Update the issue's column
    const updatedIssue = await db
      .update(issues)
      .set({
        columnId: targetColumnId,
        updatedAt: new Date(),
      })
      .where(eq(issues.id, issueId))
      .returning();

    if (!updatedIssue.length) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    console.log(
      `✅ Successfully moved issue ${issueId} to column ${targetColumnId}`
    );

    return NextResponse.json({
      success: true,
      message: `Issue moved from column ${sourceColumnId} to column ${targetColumnId}`,
      issue: updatedIssue[0],
    });
  } catch (error) {
    console.error("❌ Error moving issue:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
