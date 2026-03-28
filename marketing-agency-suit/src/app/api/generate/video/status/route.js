import { NextResponse } from "next/server";
import { antigravity } from "@/lib/antigravity";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get("id");

    if (!requestId) {
      return NextResponse.json({ success: false, error: "Missing request ID" }, { status: 400 });
    }

    const result = await antigravity.checkVideoStatus(requestId);

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Video status error:", error.message);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to check video status" },
      { status: 500 }
    );
  }
}
