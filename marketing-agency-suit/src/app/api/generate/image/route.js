import { NextResponse } from "next/server";
import { antigravity } from "@/lib/antigravity";
import { db } from "@/lib/db";

export async function POST(req) {
  try {
    const body = await req.json();
    const { projectId, prompt, style, productName, category } = body;

    // Call the mock AI generator
    const aiResult = await antigravity.generateImage({ prompt, style, product_name: productName });

    // Store in our mock db
    const record = await db.generations.insert({
      project_id: projectId,
      service: "image",
      input_data: { prompt, style, productName, category },
      output_url: aiResult.url,
      style: style,
      status: "completed"
    });

    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    console.error("Image gen error:", error);
    return NextResponse.json({ success: false, error: "Failed to generate image" }, { status: 500 });
  }
}
