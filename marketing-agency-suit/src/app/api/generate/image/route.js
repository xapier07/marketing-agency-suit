import { NextResponse } from "next/server";
import { antigravity } from "@/lib/antigravity";
import { db } from "@/lib/db";

export async function POST(req) {
  try {
    const body = await req.json();
    const { projectId, imageBase64, imageMimeType, style, aspectRatio, numVariations, additionalContext } = body;

    // Call the AI generator with the uploaded image data
    const aiResult = await antigravity.generateImage({
      imageBase64,
      imageMimeType,
      style,
      aspect_ratio: aspectRatio || "square_hd",
      num_images: numVariations || 1,
      additional_context: additionalContext,
    });

    // Store in our mock db
    const record = await db.generations.insert({
      project_id: projectId,
      service: "image",
      input_data: { style, aspectRatio, numVariations, additionalContext },
      output_url: aiResult.url,
      variants: aiResult.variants,
      style: style,
      status: "completed",
    });

    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    console.error("Image gen error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to generate image" }, { status: 500 });
  }
}
