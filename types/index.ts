export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  bannerImage?: string;
  imageUrl?: string; // Alias for backward compatibility
  isFeatured: boolean;
  active?: boolean;
  displayOrder?: number;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  displayOrder: number;
  altText?: string;
  isPrimary: boolean;
}

export interface ProductVariant {
  id: string;
  productId: string;
  size: string; // XS, S, M, L, XL, XXL
  stock: number;
  sku: string; // Unique variant SKU
}

export interface Product {
  id: string;
  categoryId: string;
  productName: string;
  name: string; // Alias for productName
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  discountPrice?: number;
  compareAtPrice?: number; // Alias for compareAtPrice (before discount)
  stock: number; // Cumulative variant stock
  inventory: number; // Alias for stock
  sku: string; // Unique product SKU
  material?: string;
  brand?: string;
  careInstructions?: string;
  care?: string; // Alias for careInstructions
  featured: boolean;
  active: boolean; // Status
  createdAt: string;
  updatedAt: string;
  images: ProductImage[];
  variants: ProductVariant[];
  metadata?: {
    material?: string;
    care?: string;
    sizeFit?: string;
    sizes?: string[];
    colors?: string[];
    brand?: string;
  };
  metaTitle?: string;
  metaDescription?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  phone?: string;
  fullName: string;
  avatar?: string;
  role: "customer" | "staff" | "admin" | "superadmin" | "super_admin";
  createdAt: string;
}

export interface Address {
  id: string;
  userId: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  isDefault: boolean;
}

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
}

export interface Cart {
  id: string;
  userId?: string;
  createdAt: string;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  variantId?: string;
  quantity: number;
  product?: Product;
  variant?: ProductVariant;
  selectedSize?: string;
  selectedColor?: string;
  size?: string;
  color?: string;
}

export interface OrderItem {
  id?: string;
  orderId?: string;
  productId: string;
  productName: string;
  productImage: string;
  variantId?: string;
  variantSize?: string;
  quantity: number;
  price: number;
}

export interface OrderStatusHistoryItem {
  status: string;
  timestamp: string;
  user: string;
  action: string;
  note?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  grandTotal: number;
  paymentStatus: string;
  orderStatus: string;
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  billingAddress?: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  items: OrderItem[];
  trackingNumber?: string;
  orderNotes?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt?: string;
  statusHistory?: OrderStatusHistoryItem[];
}

export interface Coupon {
  id: string;
  code: string;
  discountType: "fixed" | "percent";
  discountValue: number;
  minimumOrder: number;
  expiry: string;
  usageLimit: number;
  active: boolean;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number; // 1-5
  review: string;
  images?: string[];
  createdAt: string;
}

export interface HomepageBanner {
  id: string;
  title: string;
  imageUrl: string;
  buttonText: string;
  buttonLink: string;
  priority: number;
  active: boolean;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  details?: string;
  ip?: string; // IP Placeholder
  createdAt: string;
}

export interface Notification {
  id: string;
  type: "new_order" | "order_cancelled" | "low_stock" | "inventory_updated" | "customer_registered";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// ── White-Label Brand Management System ──────────────────────────────

export type ThemePreset = "luxury-pink" | "luxury-black" | "luxury-beige" | "luxury-gold" | "custom";
export type ShadowStyle = "minimal" | "soft" | "luxury" | "glass" | "none";
export type AnimationSpeed = "fast" | "normal" | "luxury";
export type PageTransition = "fade" | "slide" | "scale" | "none";
export type ButtonHover = "scale" | "glow" | "lift" | "border" | "none";
export type CardHover = "lift" | "tilt" | "glow" | "minimal";

export interface BrandSettings {
  // Identity
  brandName: string;
  tagline: string;
  copyright: string;
  logoUrl: string;
  transparentLogoUrl: string;
  faviconUrl: string;

  // Theme Preset
  themePreset: ThemePreset;

  // Colors
  primary: string;
  primaryHover: string;
  secondary: string;
  accent: string;
  accentHover: string;
  background: string;
  surface: string;
  foreground: string;
  border: string;
  success: string;
  warning: string;
  error: string;

  // Typography
  headingFont: string;
  bodyFont: string;
  buttonFont: string;

  // Design Tokens
  borderRadius: number; // px
  shadowStyle: ShadowStyle;
  animationSpeed: AnimationSpeed;
  pageTransition: PageTransition;
  buttonHover: ButtonHover;
  cardHover: CardHover;

  // Glass Effects
  glassNavbar: boolean;
  glassCards: boolean;
  glassDialogs: boolean;

  // Navigation
  stickyNavbar: boolean;
  transparentNavbar: boolean;
  announcementBar: boolean;
  announcementText: string;
  showSearch: boolean;
  showWishlist: boolean;
  showCart: boolean;

  // Footer
  showNewsletter: boolean;
  showInstagramFeed: boolean;
  showQuickLinks: boolean;
  showPaymentIcons: boolean;

  // Contact
  phone: string;
  email: string;
  address: string;
  whatsapp: string;
  businessHours: string;

  // Social Media
  instagram: string;
  facebook: string;
  youtube: string;
  pinterest: string;
}

