import { NextResponse } from "next/server";
import { antigravity } from "@/lib/antigravity";
import { db } from "@/lib/db";

export async function POST(req) {
  try {
    const body = await req.json();
    const { projectId, productName, style } = body;

    const aiResult = await antigravity.generateScript({ product_name: productName, style });

    const record = await db.generations.insert({
      project_id: projectId,
      service: "script",
      input_data: { productName, style },
      output_url: aiResult.text,
      style: "text",
      status: "completed"
    });

    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    console.error("Script gen error:", error);
    return NextResponse.json({ success: false, error: "Failed to generate script" }, { status: 500 });
  }
}
