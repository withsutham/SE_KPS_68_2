import { HeroSection } from "@/components/home/hero-section";
import { ServicesSection } from "@/components/home/services-section";
import { FeaturesSection } from "@/components/home/features-section";
import { MassageListingSection } from "@/components/home/massage-listing-section";

export default function Home() {
  return (
    <main className="flex flex-col items-center">
      <HeroSection />
      <ServicesSection />
      <MassageListingSection />
      <FeaturesSection />
    </main>
  );
}
