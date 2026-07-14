import { NextResponse } from "next/server";
import { dbService } from "@/services/dbService";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const product = await dbService.getProductBySlug(slug);
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, product });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch product" },
      { status: 500 }
    );
  }
}
