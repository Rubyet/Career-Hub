import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Note from "@/models/Note";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const jobId = searchParams.get("jobId");

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    if (userId === "demo-user") {
      return NextResponse.json([]);
    }

    await dbConnect();

    const query: Record<string, unknown> = { userId };
    if (jobId) query.jobId = jobId;

    const notes = await Note.find(query).sort("-updatedAt").lean();
    return NextResponse.json(notes);
  } catch (error) {
    console.error("Notes fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const note = await Note.create(body);
    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error("Note create error:", error);
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}
