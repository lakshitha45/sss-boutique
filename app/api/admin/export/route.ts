import { NextResponse, NextRequest } from "next/server";
import { getCurrentUser } from "@/features/auth/authActions";
import { dbService } from "@/services/dbService";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "admin" && user.role !== "superadmin" && user.role !== "super_admin")) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Admins only" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as "orders" | "customers" | "products";

    if (!type || !["orders", "customers", "products"].includes(type)) {
      return NextResponse.json(
        { success: false, error: "Invalid type. Supported types: orders, customers, products" },
        { status: 400 }
      );
    }

    const csvData = await dbService.getExportData(type);

    return new NextResponse(csvData, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=export_${type}_${Date.now()}.csv`,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to export data" },
      { status: 500 }
    );
  }
}
