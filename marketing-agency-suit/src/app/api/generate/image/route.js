import { NextResponse } from "next/server";
import { antigravity } from "@/lib/antigravity";
import { db } from "@/lib/db";

export async function POST(req) {
  try {
    const body = await req.json();
    const { projectId, imageBase64, imageMimeType, style, aspectRatio, duration, creativePrompt } = body;

    // Call the AI video generator with uploaded image
    const aiResult = await antigravity.generateVideo({
      imageBase64,
      imageMimeType,
      style,
      aspect_ratio: aspectRatio || "9:16",
      duration: duration || "5",
      creative_prompt: creativePrompt,
    });

    // Store in our mock db
    const record = await db.generations.insert({
      project_id: projectId,
      service: "video",
      input_data: { style, aspectRatio, duration, creativePrompt },
      output_url: aiResult.url,
      style: style,
      status: "completed",
    });

    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    console.error("Video gen error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to generate video" }, { status: 500 });
  }
}
