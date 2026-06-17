import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import SavedJob from "@/models/SavedJob";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const savedJob = await SavedJob.findByIdAndUpdate(id, body, { new: true });
    if (!savedJob) {
      return NextResponse.json({ error: "Saved job not found" }, { status: 404 });
    }

    return NextResponse.json(savedJob);
  } catch (error) {
    console.error("SavedJob update error:", error);
    return NextResponse.json({ error: "Failed to update saved job" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    await SavedJob.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("SavedJob delete error:", error);
    return NextResponse.json({ error: "Failed to delete saved job" }, { status: 500 });
  }
}
