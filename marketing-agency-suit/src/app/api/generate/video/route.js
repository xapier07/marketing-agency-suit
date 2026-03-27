import { NextResponse } from "next/server";
import { antigravity } from "@/lib/antigravity";
import { db } from "@/lib/db";

export async function POST(req) {
  try {
    const body = await req.json();
    const { projectId, textPrompt, style, productName } = body;

    // Call the mock AI generator
    const aiResult = await antigravity.generateVideo({ text_prompt: textPrompt, style });

    // Store in our mock db
    const record = await db.generations.insert({
      project_id: projectId,
      service: "video",
      input_data: { textPrompt, style, productName },
      output_url: aiResult.url,
      style: style,
      status: "completed"
    });

    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    console.error("Video gen error:", error);
    return NextResponse.json({ success: false, error: "Failed to generate video" }, { status: 500 });
  }
}
