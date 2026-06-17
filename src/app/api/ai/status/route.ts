import { NextResponse } from "next/server";
import { listModels, checkOllamaHealth, SUPPORTED_MODELS } from "@/lib/ai";

export async function GET() {
  try {
    const healthy = await checkOllamaHealth();
    const installedModels = healthy ? await listModels() : [];

    return NextResponse.json({
      healthy,
      installedModels,
      supportedModels: SUPPORTED_MODELS,
    });
  } catch (error) {
    console.error("AI status error:", error);
    return NextResponse.json({
      healthy: false,
      installedModels: [],
      supportedModels: SUPPORTED_MODELS,
    });
  }
}
