"use client";

import Link from "next/link";

/* ─── Social Icon SVGs ─── */
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const PinterestIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
  </svg>
);

const EmailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0 mt-0.5">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0 mt-0.5">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.9 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const LocationIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0 mt-0.5">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const footerLinks = {
  needHelp: [
    { label: "Contact Us", href: "#" },
    { label: "Track Order", href: "#" },
    { label: "Returns & Refunds", href: "#" },
    { label: "FAQ's", href: "#" },
    { label: "Careers", href: "#" },
  ],
  company: [
    { label: "About Us", href: "#" },
    { label: "Our Story", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Collaboration", href: "#" },
    { label: "Media", href: "#" },
  ],
  customerCare: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms & Conditions", href: "#" },
    { label: "Shipping Policy", href: "#" },
    { label: "Exchange Policy", href: "#" },
    { label: "Sitemap", href: "#" },
  ],
};

const socialLinks = [
  { label: "Facebook", href: "https://www.facebook.com/", icon: <FacebookIcon /> },
  { label: "Instagram", href: "https://www.instagram.com/sss_boutique_for_u/", icon: <InstagramIcon /> },
  { label: "X (Twitter)", href: "https://x.com/", icon: <XIcon /> },
  { label: "LinkedIn", href: "https://www.linkedin.com/", icon: <LinkedInIcon /> },
  { label: "Pinterest", href: "https://www.pinterest.com/", icon: <PinterestIcon /> },
];

export default function Footer() {
  return (
    <footer
      aria-label="Site footer"
      className="w-full"
      style={{ background: "#111111" }}
    >
      {/* ── Main Footer Content ── */}
      <div className="max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-16 pt-16 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

          {/* ── Column 1: Need Help ── */}
          <div>
            <h3
              className="text-white text-sm font-semibold tracking-[0.18em] uppercase mb-7"
              style={{ fontFamily: "var(--font-inter, Inter, sans-serif)" }}
            >
              Need Help
            </h3>
            <ul className="space-y-4">
              {footerLinks.needHelp.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[#999999] text-sm tracking-wide transition-colors duration-200 hover:text-white"
                    style={{ fontFamily: "var(--font-inter, Inter, sans-serif)" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Column 2: Company ── */}
          <div>
            <h3
              className="text-white text-sm font-semibold tracking-[0.18em] uppercase mb-7"
              style={{ fontFamily: "var(--font-inter, Inter, sans-serif)" }}
            >
              Company
            </h3>
            <ul className="space-y-4">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[#999999] text-sm tracking-wide transition-colors duration-200 hover:text-white"
                    style={{ fontFamily: "var(--font-inter, Inter, sans-serif)" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Column 3: Customer Care ── */}
          <div>
            <h3
              className="text-white text-sm font-semibold tracking-[0.18em] uppercase mb-7"
              style={{ fontFamily: "var(--font-inter, Inter, sans-serif)" }}
            >
              Customer Care
            </h3>
            <ul className="space-y-4">
              {footerLinks.customerCare.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[#999999] text-sm tracking-wide transition-colors duration-200 hover:text-white"
                    style={{ fontFamily: "var(--font-inter, Inter, sans-serif)" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Column 4: Contact Us ── */}
          <div>
            <h3
              className="text-white text-sm font-semibold tracking-[0.18em] uppercase mb-7"
              style={{ fontFamily: "var(--font-inter, Inter, sans-serif)" }}
            >
              Contact Us
            </h3>
            <ul className="space-y-5">
              <li>
                <a
                  href="mailto:sssboutiqueforu@gmail.com"
                  className="flex items-start gap-3 text-[#999999] text-sm tracking-wide hover:text-white transition-colors duration-200 group"
                  style={{ fontFamily: "var(--font-inter, Inter, sans-serif)" }}
                >
                  <span className="text-[#666666] group-hover:text-white transition-colors duration-200">
                    <EmailIcon />
                  </span>
                  sssboutiqueforu@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+919999999999"
                  className="flex items-start gap-3 text-[#999999] text-sm tracking-wide hover:text-white transition-colors duration-200 group"
                  style={{ fontFamily: "var(--font-inter, Inter, sans-serif)" }}
                >
                  <span className="text-[#666666] group-hover:text-white transition-colors duration-200">
                    <PhoneIcon />
                  </span>
                  +91 99999 99999
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3 text-[#999999] text-sm tracking-wide leading-relaxed">
                  <span className="text-[#666666]">
                    <LocationIcon />
                  </span>
                  SSS Boutique For U,<br />
                  Your City, India — 000000
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* ── Social Icons Row ── */}
        <div className="flex items-center gap-3 mt-14">
          {socialLinks.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-[#111111] transition-all duration-200 hover:scale-110 hover:brightness-90"
              style={{ background: "#ffffff" }}
            >
              {social.icon}
            </a>
          ))}
        </div>
      </div>

      {/* ── Divider ── */}
      <div
        className="w-full"
        style={{ height: "1px", background: "rgba(255,255,255,0.08)" }}
        role="separator"
      />

      {/* ── Copyright Bar ── */}
      <div className="max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-16 py-6">
        <p
          className="text-center text-[#555555] text-xs tracking-widest uppercase"
          style={{ fontFamily: "var(--font-inter, Inter, sans-serif)" }}
        >
          &copy; 2025 SSS Boutique For U. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
