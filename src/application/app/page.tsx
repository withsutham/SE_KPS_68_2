"use client";

import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { Services } from "@/components/services";
import { About } from "@/components/about";
import { Footer } from "@/components/footer";

export default function HomePage() {
  const router = useRouter();

  const handleBookNow = () => {
    router.push("/booking");
  };

  const handleBookService = (serviceId: string) => {
    router.push(`/booking/${serviceId}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header onBookNowClick={handleBookNow} />
      <Hero onBookNowClick={handleBookNow} />
      <Services onBookService={handleBookService} />
      <About />
      <Footer />
    </div>
  );
}