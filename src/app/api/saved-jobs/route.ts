import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import SavedJob from "@/models/SavedJob";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    if (userId === "demo-user") {
      return NextResponse.json([]);
    }

    await dbConnect();

    const savedJobs = await SavedJob.find({ userId })
      .populate("jobId")
      .sort("-createdAt")
      .lean();

    return NextResponse.json(savedJobs);
  } catch (error) {
    console.error("SavedJobs fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch saved jobs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { userId, jobId } = body;

    if (!userId || !jobId) {
      return NextResponse.json({ error: "userId and jobId required" }, { status: 400 });
    }

    if (userId === "demo-user") {
      return NextResponse.json(
        {
          _id: `demo-${jobId}`,
          userId,
          jobId,
          notes: "",
          tags: [],
          readinessScore: 0,
          skillProgress: [],
          status: "interested",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        { status: 201 }
      );
    }

    const existing = await SavedJob.findOne({ userId, jobId });
    if (existing) {
      return NextResponse.json({ error: "Job already saved" }, { status: 409 });
    }

    const savedJob = await SavedJob.create({
      userId,
      jobId,
      skillProgress: [],
    });

    return NextResponse.json(savedJob, { status: 201 });
  } catch (error) {
    console.error("SavedJob create error:", error);
    return NextResponse.json({ error: "Failed to save job" }, { status: 500 });
  }
}
