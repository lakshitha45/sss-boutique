import HeroBanner from "@/components/HeroBanner";
import PromoSection from "@/components/PromoSection";
import FeaturedProducts from "@/components/FeaturedProducts";
import BestSellers from "@/components/BestSellers";
import BigSavingZone from "@/components/BigSavingZone";
import Testimonials from "@/components/Testimonials";

export default function Home() {
  return (
    <main>
      <HeroBanner />
      <PromoSection />
      <FeaturedProducts />
      <BestSellers />
      <BigSavingZone />
      <Testimonials />
    </main>
  );
}
