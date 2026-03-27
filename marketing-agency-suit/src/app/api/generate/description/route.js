import { NextResponse } from "next/server";
import { antigravity } from "@/lib/antigravity";
import { db } from "@/lib/db";

export async function POST(req) {
  try {
    const body = await req.json();
    const { projectId, productName, features } = body;

    const aiResult = await antigravity.generateDescription({ product_name: productName, features });

    const record = await db.generations.insert({
      project_id: projectId,
      service: "description",
      input_data: { productName, features },
      output_url: aiResult.text,
      style: "text",
      status: "completed"
    });

    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    console.error("Desc gen error:", error);
    return NextResponse.json({ success: false, error: "Failed to generate description" }, { status: 500 });
  }
}
