import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Webhook Simulation (Phase 1)
 * In a real SaaS (Phase 2), external providers (like Video Gen APIs, Stripe, etc.)
 * will hit this endpoint to update generation statuses asynchronously.
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { generationId, status, outputUrl } = body;

    // Verify webhook signature here in Phase 2

    // Update the database record
    const updatedRecord = await db.generations.update(generationId, {
      status: status || "completed",
      output_url: outputUrl,
    });

    return NextResponse.json({ success: true, data: updatedRecord });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ success: false, error: "Failed to process webhook" }, { status: 500 });
  }
}
