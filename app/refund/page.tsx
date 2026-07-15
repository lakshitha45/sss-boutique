"use client";

import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { RefreshCw, CheckCircle, AlertOctagon, HelpCircle } from "lucide-react";

export default function RefundPolicyPage() {
  const sections = [
    {
      icon: <RefreshCw className="w-5 h-5 text-accent" />,
      title: "1. Return & Exchange Window",
      content:
        "We offer a 7-day return and exchange window from the date of delivery. If 7 days have gone by since your delivery confirmation, we unfortunately cannot offer you a refund or exchange. To initiate a return, please send an email request to support@sss-boutique.com with your order number and invoice.",
    },
    {
      icon: <CheckCircle className="w-5 h-5 text-accent" />,
      title: "2. Eligibility Criteria",
      content:
        "To be eligible for a return, your item must be unused, unworn, unwashed, and in the same pristine condition that you received it. It must also be in the original designer packaging with all security tags and brand tags fully intact. Items showing signs of wear, perfume, alterations, or makeup stains will be returned to the client and will not be refunded.",
    },
    {
      icon: <AlertOctagon className="w-5 h-5 text-accent" />,
      title: "3. Non-Returnable Items",
      content:
        "Certain luxury goods are non-returnable. This includes custom-tailored orders (bespoke sizing), items purchased during final clearance sales, accessories, and products modified or altered by our tailor service at your request. Any product that has been personalized is final sale.",
    },
    {
      icon: <HelpCircle className="w-5 h-5 text-accent" />,
      title: "4. Processing Refunds",
      content:
        "Once your return is received and inspected by our Quality Control unit, we will send you an email to notify you that we have received your returned item and whether the refund has been approved. If approved, your refund will be processed, and a credit will automatically be applied to your original method of payment within 5 to 7 business days.",
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
              Customer Care
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif text-zinc-100 tracking-wide mt-3">
              Refund & Cancellation Policy
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
              At SSS Boutique, we strive to deliver the highest quality designer wear. If you are not fully satisfied with your purchase, we are here to assist you through our return and exchange procedure.
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
                For queries regarding shipping tracking, please use the navigation link. For direct assistance, mail us at{" "}
                <span className="text-accent hover:underline cursor-pointer">
                  support@sss-boutique.com
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
