"use client";

import { motion, useInView } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  rating: number;
  text: string;
  src: string;
  alt: string;
}

const testimonials: Testimonial[] = [
  {
    id: "review-1",
    name: "Aanya Sharma",
    role: "Fashion Consultant",
    rating: 5,
    text: "The quality of the gold block print anarkali is exceptional. The fabric feels incredibly soft and lightweight, perfect for long festive events. I've received so many compliments!",
    src: "/customer1.png",
    alt: "Aanya Sharma profile image",
  },
  {
    id: "review-2",
    name: "Meera Patel",
    role: "Corporate Executive",
    rating: 5,
    text: "I bought the Olive Botanical Print Kurti for my weekly office meetings. It fits perfectly, stays crisp all day, and has the perfect balance of modern professionalism and heritage craft.",
    src: "/customer2.png",
    alt: "Meera Patel profile image",
  },
  {
    id: "review-3",
    name: "Diya Rao",
    role: "Lifestyle Blogger",
    rating: 5,
    text: "I am absolutely in love with my Jaipur Yellow Floral Suit Set. The colors are so vibrant and didn't fade at all after washing. The styling feels very premium and boutique-like.",
    src: "/customer3.png",
    alt: "Diya Rao profile image",
  },
  {
    id: "review-4",
    name: "Priya Nair",
    role: "Architect",
    rating: 4.8,
    text: "Minimalist, chic, and very comfortable. The Rust Traditional Cotton Kurti has pockets, which is a huge plus! The stitching details show real craft. Will definitely buy more.",
    src: "/customer1.png",
    alt: "Priya Nair profile image",
  },
];

export default function Testimonials() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      aria-labelledby="testimonials-heading"
      className="w-full bg-[#faf9f6] py-20 sm:py-28 px-5 sm:px-10 lg:px-16 xl:px-24 border-t border-neutral-100 overflow-hidden"
    >
      {/* ── Centered Heading with Underline ── */}
      <div className="flex flex-col items-center mb-16">
        <h2
          id="testimonials-heading"
          className="text-3xl sm:text-4xl font-semibold tracking-[0.15em] text-neutral-900 uppercase text-center relative pb-3"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          What Our Customers Say
        </h2>
        <div className="w-56 h-[1.5px] bg-neutral-900 -mt-1" />
      </div>

      {/* ── Swiper Slider Container ── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative max-w-5xl mx-auto px-4 md:px-8"
      >
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
            el: ".custom-swiper-pagination",
          }}
          navigation={{
            nextEl: ".custom-swiper-button-next",
            prevEl: ".custom-swiper-button-prev",
          }}
          breakpoints={{
            768: {
              slidesPerView: 2,
            },
          }}
          className="pb-12"
        >
          {testimonials.map((item) => (
            <SwiperSlide key={item.id} className="h-auto">
              {/* Testimonial Card */}
              <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-sm border border-neutral-100 flex flex-col justify-between h-full relative group hover:shadow-md transition-shadow duration-300">
                {/* Decorative Quote Icon */}
                <Quote className="absolute right-8 top-8 w-10 h-10 text-neutral-100 group-hover:text-neutral-200 transition-colors duration-300 pointer-events-none" />

                <div>
                  {/* Star Rating */}
                  <div className="flex items-center gap-0.5 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 fill-current ${
                          i < Math.floor(item.rating) ? "text-[#fbbf24]" : "text-gray-300"
                        }`}
                        aria-hidden="true"
                      />
                    ))}
                  </div>

                  {/* Testimonial text */}
                  <p
                    className="text-neutral-600 text-sm sm:text-base leading-relaxed italic mb-8"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    &ldquo;{item.text}&rdquo;
                  </p>
                </div>

                {/* Profile detail */}
                <div className="flex items-center gap-4 border-t border-neutral-100 pt-6 mt-auto">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-neutral-100 border border-neutral-100 shadow-sm">
                    <Image
                      src={item.src}
                      alt={item.alt}
                      fill
                      className="object-cover"
                      quality={85}
                    />
                  </div>
                  <div>
                    <h4
                      className="text-[15px] font-semibold text-neutral-900 uppercase tracking-wider font-serif"
                      style={{ fontFamily: "var(--font-playfair)" }}
                    >
                      {item.name}
                    </h4>
                    <p
                      className="text-neutral-400 text-xs tracking-wide"
                      style={{ fontFamily: "var(--font-inter)" }}
                    >
                      {item.role}
                    </p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* ── Custom Navigation Buttons ── */}
        <button
          aria-label="Previous testimonial"
          className="custom-swiper-button-prev absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-12 z-10 w-11 h-11 bg-white hover:bg-neutral-50 text-neutral-900 border border-neutral-200 hover:border-neutral-900 rounded-full flex items-center justify-center shadow-sm transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
        >
          <ChevronLeft className="w-5 h-5 stroke-[1.5]" />
        </button>
        <button
          aria-label="Next testimonial"
          className="custom-swiper-button-next absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-12 z-10 w-11 h-11 bg-white hover:bg-neutral-50 text-neutral-900 border border-neutral-200 hover:border-neutral-900 rounded-full flex items-center justify-center shadow-sm transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
        >
          <ChevronRight className="w-5 h-5 stroke-[1.5]" />
        </button>

        {/* ── Custom Pagination Dots (Centered below slider) ── */}
        <div className="custom-swiper-pagination flex justify-center gap-2 mt-8 z-10" />
      </motion.div>
    </section>
  );
}
