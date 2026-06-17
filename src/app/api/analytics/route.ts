import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Analytics from "@/models/Analytics";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const crawlSessionId = searchParams.get("crawlSessionId");

    if (!crawlSessionId) {
      // Return latest analytics
      const analytics = await Analytics.findOne().sort("-createdAt").lean();
      return NextResponse.json(analytics || {});
    }

    const analytics = await Analytics.findOne({ crawlSessionId }).lean();
    return NextResponse.json(analytics || {});
  } catch (error) {
    console.error("Analytics fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
