import { NextResponse } from "next/server";
import { antigravity } from "@/lib/antigravity";
import { db } from "@/lib/db";

export async function POST(req) {
  try {
    const body = await req.json();
    const { projectId, productName } = body;

    const aiResult = await antigravity.generateEmail({ product_name: productName });

    const record = await db.generations.insert({
      project_id: projectId,
      service: "email",
      input_data: { productName },
      output_url: aiResult.text,
      style: "text",
      status: "completed"
    });

    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    console.error("Email gen error:", error);
    return NextResponse.json({ success: false, error: "Failed to generate email sequence" }, { status: 500 });
  }
}
