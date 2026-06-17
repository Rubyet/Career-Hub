import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import LearningPlan from "@/models/LearningPlan";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const plan = await LearningPlan.findById(id).lean();
    if (!plan) {
      return NextResponse.json({ error: "Learning plan not found" }, { status: 404 });
    }
    return NextResponse.json(plan);
  } catch (error) {
    console.error("LearningPlan fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch learning plan" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const plan = await LearningPlan.findByIdAndUpdate(id, body, { new: true });
    if (!plan) {
      return NextResponse.json({ error: "Learning plan not found" }, { status: 404 });
    }
    return NextResponse.json(plan);
  } catch (error) {
    console.error("LearningPlan update error:", error);
    return NextResponse.json({ error: "Failed to update learning plan" }, { status: 500 });
  }
}
