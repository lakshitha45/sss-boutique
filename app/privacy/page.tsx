"use client";

import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Shield, Lock, Eye, HelpCircle } from "lucide-react";

export default function PrivacyPolicyPage() {
  const sections = [
    {
      icon: <Eye className="w-5 h-5 text-accent" />,
      title: "1. Information We Collect",
      content:
        "We collect information you provide directly to us when creating an account, placing an order, subscribing to our newsletter, or communicating with us. This includes your name, email address, phone number, billing and shipping addresses, and payment information (processed securely through our payment partners). We also automatically collect certain device and usage information when you browse our site, such as IP addresses, browser types, and cookies to manage your active shopping cart session.",
    },
    {
      icon: <Lock className="w-5 h-5 text-accent" />,
      title: "2. How We Protect Your Data",
      content:
        "The security of your personal information is of paramount importance to us. We implement a variety of administrative, technical, and physical security measures to safeguard your data. All sensitive/credit information you supply is encrypted via Secure Socket Layer (SSL) technology and processed through secure gateway providers. We do not store credit card details on our local database servers.",
    },
    {
      icon: <Shield className="w-5 h-5 text-accent" />,
      title: "3. Sharing Information",
      content:
        "We do not sell, trade, or otherwise transfer your personally identifiable information to third parties, except for trusted partners who assist us in operating our website, conducting our business, or servicing your orders (e.g., courier services for shipping, payment gateways, and email dispatch providers), so long as those parties agree to keep this information confidential.",
    },
    {
      icon: <HelpCircle className="w-5 h-5 text-accent" />,
      title: "4. Cookies & Local Storage",
      content:
        "We use cookies and local browser storage to keep track of your shopping cart contents, remember your wishlist selections, and maintain your authentication session. Disabling cookies may limit some features of SSS Boutique, such as keeping items in your cart between visits.",
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
              Privacy Policy
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
              At SSS Boutique, we are committed to protecting and respecting your privacy. This Privacy Policy governs our data collection, processing, and usage practices. By using the SSS Boutique website, you consent to the data practices described in this statement.
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
                If you have any questions regarding this Privacy Policy, you may contact us at{" "}
                <span className="text-accent hover:underline cursor-pointer">
                  privacy@sss-boutique.com
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
