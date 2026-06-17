import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import InterviewPlan from "@/models/InterviewPlan";
import Job from "@/models/Job";
import { generateInterviewPlan } from "@/lib/ai";

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

    const plans = await InterviewPlan.find({ userId }).sort("-createdAt").lean();
    return NextResponse.json(plans);
  } catch (error) {
    console.error("InterviewPlan fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch interview plans" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { userId, jobId, model } = body;

    if (!userId || !jobId) {
      return NextResponse.json({ error: "userId and jobId required" }, { status: 400 });
    }

    // Check existing
    const existing = await InterviewPlan.findOne({ userId, jobId });
    if (existing) {
      return NextResponse.json(existing);
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const planData = await generateInterviewPlan(
      {
        title: job.title,
        company: job.company,
        requiredSkills: job.requiredSkills,
        preferredSkills: job.preferredSkills,
        responsibilities: job.responsibilities,
        qualifications: job.qualifications,
        experienceRequirements: job.experienceRequirements,
        analysis: job.analysis,
      },
      undefined,
      model
    );

    const plan = await InterviewPlan.create({
      userId,
      jobId,
      jobTitle: job.title,
      company: job.company,
      ...planData,
    });

    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    console.error("InterviewPlan create error:", error);
    return NextResponse.json(
      { error: "Failed to create interview plan" },
      { status: 500 }
    );
  }
}
