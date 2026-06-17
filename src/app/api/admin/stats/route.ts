import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Job from "@/models/Job";
import SavedJob from "@/models/SavedJob";

export async function GET() {
  try {
    await dbConnect();
    const [userCount, jobCount, savedJobCount, recentJobs] = await Promise.all([
      User.countDocuments(),
      Job.countDocuments(),
      SavedJob.countDocuments(),
      Job.find().sort("-createdAt").limit(5).select("title company status createdAt").lean(),
    ]);

    return NextResponse.json({
      users: userCount,
      jobs: jobCount,
      savedJobs: savedJobCount,
      recentJobs,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Failed to fetch admin stats" }, { status: 500 });
  }
}
