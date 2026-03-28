import { NextResponse } from "next/server";
import { antigravity } from "@/lib/antigravity";

export async function POST(req) {
  try {
    const body = await req.json();
    const { imageBase64, imageMimeType, style, aspectRatio, duration, creativePrompt } = body;

    // Submit the video job to Fal queue (returns instantly with request_id)
    const result = await antigravity.submitVideo({
      imageBase64,
      imageMimeType,
      style,
      aspect_ratio: aspectRatio || "9:16",
      duration: duration || "5",
      creative_prompt: creativePrompt,
    });

    return NextResponse.json({ success: true, request_id: result.request_id });
  } catch (error) {
    console.error("Video submit error:", error.message);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit video job" },
      { status: 500 }
    );
  }
}
