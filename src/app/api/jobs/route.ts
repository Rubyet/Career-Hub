import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Job from "@/models/Job";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const location = searchParams.get("location") || "";
    const remoteStatus = searchParams.get("remoteStatus") || "";
    const difficulty = searchParams.get("difficulty") || "";
    const crawlSessionId = searchParams.get("crawlSessionId") || "";
    const sort = searchParams.get("sort") || "-createdAt";

    const query: Record<string, unknown> = {};

    if (search) {
      query.$text = { $search: search };
    }
    if (location) {
      query.location = { $regex: location, $options: "i" };
    }
    if (remoteStatus) {
      query.remoteStatus = remoteStatus;
    }
    if (difficulty) {
      query["analysis.difficulty"] = difficulty;
    }
    if (crawlSessionId) {
      query.crawlSessionId = crawlSessionId;
    }

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .select("-originalHtml")
      .lean();

    return NextResponse.json({
      jobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Jobs fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}
