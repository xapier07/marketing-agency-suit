import { NextResponse } from "next/server";
import { antigravity } from "@/lib/antigravity";
import { db } from "@/lib/db";

export async function POST(req) {
  try {
    const body = await req.json();
    const { projectId, productName, audience } = body;

    const aiResult = await antigravity.generateSocial({ product_name: productName, audience });

    const record = await db.generations.insert({
      project_id: projectId,
      service: "social",
      input_data: { productName, audience },
      output_url: aiResult.text,
      style: "text",
      status: "completed"
    });

    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    console.error("Social gen error:", error);
    return NextResponse.json({ success: false, error: "Failed to generate social campaign" }, { status: 500 });
  }
}
