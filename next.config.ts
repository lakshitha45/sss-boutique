import type { NextConfig } from "next";

const supabaseDomain = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null;

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      ...(supabaseDomain
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseDomain,
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
