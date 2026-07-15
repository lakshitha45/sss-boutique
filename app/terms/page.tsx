"use client";

import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FileText, Award, CreditCard, AlertTriangle } from "lucide-react";

export default function TermsAndConditionsPage() {
  const sections = [
    {
      icon: <FileText className="w-5 h-5 text-accent" />,
      title: "1. Agreement to Terms",
      content:
        "By accessing or using the SSS Boutique website, you agree to be bound by these Terms and Conditions and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site. The materials contained in this website are protected by applicable copyright and trademark law.",
    },
    {
      icon: <Award className="w-5 h-5 text-accent" />,
      title: "2. Intellectual Property Rights",
      content:
        "All custom clothing designs, product catalog layouts, fabric graphics, logos, images, text, and source code on the SSS Boutique platform are the exclusive intellectual property of SSS Boutique or its licensors. You may not copy, reproduce, republish, upload, post, transmit, or distribute any material from this site without our prior written consent.",
    },
    {
      icon: <CreditCard className="w-5 h-5 text-accent" />,
      title: "3. Purchase & Payments",
      content:
        "All purchases made through our website are subject to product availability. We reserve the right to refuse or cancel any order at our sole discretion. In the event of a pricing or description error, we reserve the right to cancel any orders placed under the incorrect price and notify you immediately. Payments are processed securely via verified gateways.",
    },
    {
      icon: <AlertTriangle className="w-5 h-5 text-accent" />,
      title: "4. Product Variations & Disclaimers",
      content:
        "Our luxury products are hand-crafted using fine materials, silks, and traditional weaves. Due to different monitor displays, studio lighting, and fabric dyeing batches, minor variations in color or embroidery patterns may occur. These variations are an inherent feature of luxury boutique fashion and do not constitute defective merchandise.",
    },
  ];

  return (
    <>
      <Header />
      
      <main className="flex-1 min-h-[70vh] bg-[#0A0A0A] font-poppins">
        {/* Banner */}
        <div className="border-b border-[#1A1A1A] py-16 text-center">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-[10px] tracking-[0.25em] text-accent uppercase font-bold">
              Legal Compliance
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif text-zinc-100 tracking-wide mt-3">
              Terms & Conditions
            </h1>
            <p className="text-zinc-500 text-xs mt-3">
              Last updated: July 15, 2026 • SSS Boutique Theme Engine
            </p>
          </div>
        </div>

        {/* Content Details */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
          <div className="bg-[#121212] border border-[#1F1F1F] rounded-xl p-6 sm:p-10 space-y-10">
            <p className="text-zinc-300 text-sm leading-relaxed">
              Please read these Terms & Conditions carefully before accessing or using our website. By accessing or using any part of the site, you agree to be bound by these terms.
            </p>

            <div className="border-t border-[#1A1A1A] pt-8 space-y-8">
              {sections.map((section, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">{section.icon}</div>
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider mb-2 font-serif">
                      {section.title}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-[#1A1A1A] pt-8 text-center">
              <p className="text-[11px] text-zinc-500">
                If you have any questions regarding these Terms & Conditions, you may contact our legal desk at{" "}
                <span className="text-accent hover:underline cursor-pointer">
                  legal@sss-boutique.com
                </span>
                .
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
