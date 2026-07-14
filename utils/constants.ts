/**
 * SSS Boutique Global Constants System
 */

export const CURRENCY = {
  code: "INR",
  symbol: "₹",
  locale: "en-IN",
};

export const FALLBACK_IMAGES = {
  product: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop",
  category: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop",
  banner: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop",
};

export const BREAKPOINTS = {
  mobile: "(max-width: 639px)",
  tablet: "(min-width: 640px) and (max-width: 1023px)",
  laptop: "(min-width: 1024px) and (max-width: 1439px)",
  desktop: "(min-width: 1440px)",
};

export const PINCODE_REGEX = /^[1-9][0-9]{5}$/;
export const PHONE_REGEX = /^\+?[0-9\s\-]{10,15}$/;

export const SUPPORT_LINKS = {
  phone: "+91 98765 43210",
  email: "concierge@sssboutique.com",
  whatsapp: "https://wa.me/919876543210",
};
