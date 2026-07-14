import { NextResponse } from "next/server";
import { dbService } from "@/services/dbService";

export async function GET() {
  try {
    const orders = await dbService.getOrders();
    return NextResponse.json({ success: true, orders });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to retrieve orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.customerEmail || !body.customerName || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid checkout details" },
        { status: 400 }
      );
    }
    const order = await dbService.createOrder(body);
    return NextResponse.json({ success: true, order });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to submit order" },
      { status: 500 }
    );
  }
}
