import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import LearningPlan from "@/models/LearningPlan";
import { generateLearningRoadmap } from "@/lib/ai";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const skill = searchParams.get("skill");

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const query: Record<string, unknown> = { userId };
    if (skill) query.skill = skill;

    const plans = await LearningPlan.find(query).sort("-createdAt").lean();
    return NextResponse.json(plans);
  } catch (error) {
    console.error("LearningPlan fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch learning plans" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { userId, skill, jobContext, model } = body;

    if (!userId || !skill) {
      return NextResponse.json({ error: "userId and skill required" }, { status: 400 });
    }

    // Check if plan already exists
    const existing = await LearningPlan.findOne({ userId, skill });
    if (existing) {
      return NextResponse.json(existing);
    }

    // Generate roadmap using AI
    const roadmapData = await generateLearningRoadmap(skill, jobContext, model);

    const plan = await LearningPlan.create({
      userId,
      skill,
      ...roadmapData,
    });

    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    console.error("LearningPlan create error:", error);
    return NextResponse.json({ error: "Failed to create learning plan" }, { status: 500 });
  }
}
