import { NextResponse } from "next/server";
import { dbService } from "@/services/dbService";

export async function GET() {
  try {
    const categories = await dbService.getCategories();
    return NextResponse.json({ success: true, categories });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
