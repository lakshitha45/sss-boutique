import { ShipmentStatus } from "@/types";

export interface ShipmentStatusUpdate {
  status: ShipmentStatus | string;
  action: string;
  timestamp: string;
  notes?: string;
}

export interface ShipmentCreationResult {
  success: boolean;
  trackingNumber: string;
  estimatedDeliveryDays: number;
}

export interface ShippingProvider {
  name: string;
  code: string;
  createShipment(orderId: string, address: any): Promise<ShipmentCreationResult>;
  trackShipment(trackingNumber: string): Promise<ShipmentStatusUpdate>;
}

// ── MANUAL COURIER PROVIDER (Fallback & default manual entry) ──────────
export class ManualShippingProvider implements ShippingProvider {
  name: string;
  code: string;

  constructor(name: string, code: string) {
    this.name = name;
    this.code = code;
  }

  async createShipment(orderId: string, address: any): Promise<ShipmentCreationResult> {
    // Generate simple tracking numbers if none entered
    const trackingNumber = `${this.code.toUpperCase()}-${Date.now().toString().slice(-6)}`;
    return {
      success: true,
      trackingNumber,
      estimatedDeliveryDays: 5
    };
  }

  async trackShipment(trackingNumber: string): Promise<ShipmentStatusUpdate> {
    // Default fallback tracking updates
    return {
      status: "In Transit",
      action: "Package processed through logistics center",
      timestamp: new Date().toISOString()
    };
  }
}

// ── PROVIDER ENGINE REGISTRY (Future-ready) ───────────────────────────
export const getShippingProvider = (providerName: string): ShippingProvider => {
  const normalized = providerName.toLowerCase().trim();
  
  if (normalized.includes("professional")) {
    return new ManualShippingProvider("Professional Courier", "prof");
  }
  if (normalized.includes("dtdc")) {
    return new ManualShippingProvider("DTDC", "dtdc");
  }
  if (normalized.includes("blue")) {
    return new ManualShippingProvider("Blue Dart", "bdart");
  }
  if (normalized.includes("delhivery")) {
    return new ManualShippingProvider("Delhivery", "dlhvy");
  }
  if (normalized.includes("post")) {
    return new ManualShippingProvider("India Post", "ipost");
  }
  
  // Custom or fallback
  return new ManualShippingProvider(providerName || "Other Courier", "oth");
};
