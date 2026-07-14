import { NextResponse } from "next/server";
import { dbService } from "@/services/dbService";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.productName || !body.sku || !body.price || !body.categoryId) {
      return NextResponse.json(
        { success: false, error: "Missing required product details" },
        { status: 400 }
      );
    }
    const product = await dbService.createProduct(body);
    return NextResponse.json({ success: true, product });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to create product" },
      { status: 500 }
    );
  }
}
