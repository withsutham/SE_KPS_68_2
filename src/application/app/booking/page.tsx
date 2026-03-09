"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { BookingProgress } from "@/components/booking/booking-progress";
import { StepServiceSelection } from "@/components/booking/step-service-selection";
import { StepDateTime } from "@/components/booking/step-date-time";
import { StepDetails } from "@/components/booking/step-details";
import { StepPayment } from "@/components/booking/step-payment";
import { StepSummary } from "@/components/booking/step-summary";
import { BookingData, BookingStep, INITIAL_BOOKING_DATA } from "@/components/booking/types";

// Inner component that can safely use useSearchParams
function BookingPageInner() {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState<BookingStep>(1);
  const [bookingData, setBookingData] = useState<BookingData>(INITIAL_BOOKING_DATA);

  // Pre-select a service if ?serviceId= is present in the URL
  useEffect(() => {
    const serviceId = searchParams.get("serviceId");
    if (!serviceId) return;

    async function preSelectService() {
      try {
        const res = await fetch(`/api/massage/${serviceId}`);
        const json = await res.json();
        if (!json.success || !json.data) return;

        const massage = json.data;
        setBookingData(prev => ({
          ...prev,
          selectedServices: [{
            massage_id: massage.massage_id, // keep as-is (number) to match StepServiceSelection's runtime type
            massage_name: massage.massage_name,
            massage_price: massage.massage_price,
            duration: massage.massage_time ?? 60,
          }],
        }));
      } catch {
        // Silently ignore — user can manually select
      }
    }
    preSelectService();
  }, [searchParams]);

  const updateData = (updates: Partial<BookingData>) => {
    setBookingData(prev => ({ ...prev, ...updates }));
  };

  const goNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, 5) as BookingStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1) as BookingStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const serviceId = searchParams.get("serviceId");
  const stepProps = { data: bookingData, onUpdate: updateData, onNext: goNext, onBack: goBack, autoOpenPicker: !serviceId };

  return (
    <main className="flex-1 w-full">
      {/* Subtle background motif */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-1/2 -right-60 h-[400px] w-[400px] rounded-full bg-secondary/30 blur-3xl" />
      </div>

      <div className="w-full max-w-5xl mx-auto px-4 md:px-8 pt-8 pb-24">
        {/* Page header */}
        <div className="text-center mb-2 print:hidden">
          <p className="text-xs font-medium tracking-widest text-primary/60 uppercase font-sans mb-3">
            ฟื้นใจ · Massage & Spa
          </p>
          <h1 className="text-3xl md:text-4xl font-medium font-mitr text-foreground">
            จองบริการนวดสปา
          </h1>
        </div>

        {/* Step progress */}
        <div className="print:hidden">
          <BookingProgress currentStep={currentStep} />
        </div>

        {/* Divider */}
        <div className="h-px bg-border/40 mb-8 print:hidden" />

        {/* Step content */}
        <div className="min-h-[420px]">
          {currentStep === 1 && <StepServiceSelection {...stepProps} />}
          {currentStep === 2 && <StepDateTime {...stepProps} />}
          {currentStep === 3 && <StepDetails {...stepProps} />}
          {currentStep === 4 && <StepPayment {...stepProps} />}
          {currentStep === 5 && <StepSummary data={bookingData} />}
        </div>
      </div>
    </main>
  );
}

export default function BookingPage() {
  return (
    <Suspense>
      <BookingPageInner />
    </Suspense>
  );
}
