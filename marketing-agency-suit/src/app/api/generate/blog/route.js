import { NextResponse } from "next/server";
import { antigravity } from "@/lib/antigravity";
import { db } from "@/lib/db";

export async function POST(req) {
  try {
    const body = await req.json();
    const { projectId, productName, keywords } = body;

    const aiResult = await antigravity.generateSEO({ product_name: productName, keywords });

    const record = await db.generations.insert({
      project_id: projectId,
      service: "blog",
      input_data: { productName, keywords },
      output_url: aiResult.text,
      style: "text",
      status: "completed"
    });

    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    console.error("Blog gen error:", error);
    return NextResponse.json({ success: false, error: "Failed to generate blog" }, { status: 500 });
  }
}
