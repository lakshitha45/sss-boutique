import type { Metadata } from "next";
import { Playfair_Display, Inter, Poppins } from "next/font/google";
import Providers from "@/components/Providers";
import ErrorBoundary from "@/components/ErrorBoundary";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SSS Boutique | Luxury Fashion & Designer E-Commerce",
  description: "Browse premium, elegant fashion collections at SSS Boutique. Fast delivery, luxury quality, and personalized shopping.",
  metadataBase: new URL("https://sss-boutique.com"),
  openGraph: {
    title: "SSS Boutique | Luxury Fashion E-Commerce",
    description: "Browse premium, elegant fashion collections at SSS Boutique. Fast delivery and luxury quality.",
    type: "website",
    locale: "en_US",
    siteName: "SSS Boutique",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <Providers>
          <ErrorBoundary>{children}</ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
