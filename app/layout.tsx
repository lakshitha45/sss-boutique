import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SSS Boutique For U — Premium Women's Fashion",
  description:
    "Discover the latest in premium women's fashion. Exclusive kurtis, festive wear, designer collections and new arrivals at SSS Boutique For U.",
  keywords: ["kurtis", "fashion", "boutique", "women", "festive wear", "designer kurtis", "SSS Boutique"],
  openGraph: {
    title: "SSS Boutique For U — Premium Women's Fashion",
    description:
      "Discover the latest in premium women's fashion. Exclusive kurtis, festive wear, designer collections and new arrivals at SSS Boutique For U.",
    type: "website",
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
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
