import { NextResponse } from "next/server";
import { antigravity } from "@/lib/antigravity";
import { db } from "@/lib/db";

export async function POST(req) {
  try {
    const body = await req.json();
    const { projectId, productName, category, audience } = body;

    const aiResult = await antigravity.generateCopy({ product_name: productName, category, audience });

    const record = await db.generations.insert({
      project_id: projectId,
      service: "copy",
      input_data: { productName, category, audience },
      output_url: aiResult.text, // we'll store text directly in output_url for text services in demo
      style: "text",
      status: "completed"
    });

    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    console.error("Copy gen error:", error);
    return NextResponse.json({ success: false, error: "Failed to generate copy" }, { status: 500 });
  }
}
