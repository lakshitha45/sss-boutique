import { NextResponse } from "next/server";
import { dbService } from "@/services/dbService";

export async function GET() {
  try {
    const products = await dbService.getProducts(false);
    return NextResponse.json({ success: true, products });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}
