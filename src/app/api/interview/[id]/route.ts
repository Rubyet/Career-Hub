import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import InterviewPlan from "@/models/InterviewPlan";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const plan = await InterviewPlan.findById(id).lean();
    if (!plan) {
      return NextResponse.json({ error: "Interview plan not found" }, { status: 404 });
    }
    return NextResponse.json(plan);
  } catch (error) {
    console.error("InterviewPlan fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch interview plan" }, { status: 500 });
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
    const plan = await InterviewPlan.findByIdAndUpdate(id, body, { new: true });
    if (!plan) {
      return NextResponse.json({ error: "Interview plan not found" }, { status: 404 });
    }
    return NextResponse.json(plan);
  } catch (error) {
    console.error("InterviewPlan update error:", error);
    return NextResponse.json({ error: "Failed to update interview plan" }, { status: 500 });
  }
}
