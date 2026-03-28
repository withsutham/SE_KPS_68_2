"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BookingProgress } from "@/components/booking/booking-progress";
import { StepServiceSelection } from "@/components/booking/step-service-selection";
import { StepDateTime } from "@/components/booking/step-date-time";
import { StepDetails } from "@/components/booking/step-details";
import { StepPayment } from "@/components/booking/step-payment";
import { StepSummary } from "@/components/booking/step-summary";
import {
  BookingData,
  BookingStep,
  INITIAL_BOOKING_DATA,
} from "@/components/booking/types";

// Inner component that can safely use useSearchParams
function BookingPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<BookingStep>(1);
  const [bookingData, setBookingData] =
    useState<BookingData>(INITIAL_BOOKING_DATA);
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        // Redirect to login via full page load or push depending on preference; push is fine here.
        const currentPath = window.location.pathname + window.location.search;
        window.location.href = `/auth/login?returnTo=${encodeURIComponent(currentPath)}&message=booking`;
      } else {
        // Fetch user data from database and pre-fill step 3
        try {
          const res = await fetch(
            `/api/customer?profile_id=${session.user.id}`,
          );
          if (res.ok) {
            const { data } = await res.json();
            if (data && data.length > 0) {
              const customer = data[0];
              setBookingData((prev) => ({
                ...prev,
                customerId: customer.customer_id,
                firstName: customer.first_name || prev.firstName,
                lastName: customer.last_name || prev.lastName,
                phone: customer.phone_number || prev.phone,
                email:
                  session.user.email || customer.email_address || prev.email,
              }));
            }
          }
        } catch (error) {
          console.error("Failed to fetch customer data:", error);
        }
        setIsAuthenticating(false);
      }
    };
    checkAuth();
  }, [router]);

  // Pre-select a service if ?serviceId= is present in the URL
  useEffect(() => {
    const serviceId = searchParams.get("serviceId");
    const packageServiceId = searchParams.get("packageServiceId");
    const massageId = searchParams.get("massageId");

    // Handle package service pre-selection
    if (packageServiceId && massageId) {
      async function preSelectPackageService() {
        try {
          // Fetch the massage details
          const res = await fetch(`/api/massage/${massageId}`);
          const json = await res.json();
          if (!json.success || !json.data) return;

          const massage = json.data;
          
          // Fetch the member_package details to get package name
          const pkgRes = await fetch(`/api/member_package/unused?customer_id=${bookingData.customerId}`);
          const pkgJson = await pkgRes.json();
          if (pkgJson.success && pkgJson.data) {
            const memberPackage = pkgJson.data.find(
              (mp: any) => mp.member_package_id === Number(packageServiceId)
            );
            
            setBookingData((prev) => ({
              ...prev,
              selectedServices: [
                {
                  massage_id: `pkg_${packageServiceId}`, // Synthetic ID for UI tracking
                  massage_name: massage.massage_name,
                  massage_price: 0, // Package services are free
                  duration: massage.massage_time ?? 60,
                  fromPackage: true,
                  member_package_id: Number(packageServiceId),
                  package_name: memberPackage?.package_detail?.package?.package_name,
                  real_massage_id: massage.massage_id, // Real massage_id for auto-assignment
                },
              ],
            }));
          }
        } catch {
          // Silently ignore — user can manually select
        }
      }
      preSelectPackageService();
      return;
    }

    // Handle regular service pre-selection
    if (serviceId) {
      async function preSelectService() {
        try {
          const res = await fetch(`/api/massage/${serviceId}`);
          const json = await res.json();
          if (!json.success || !json.data) return;

          const massage = json.data;
          setBookingData((prev) => ({
            ...prev,
            selectedServices: [
              {
                massage_id: massage.massage_id, // keep as-is (number) to match StepServiceSelection's runtime type
                massage_name: massage.massage_name,
                massage_price: massage.massage_price,
                duration: massage.massage_time ?? 60,
              },
            ],
          }));
        } catch {
          // Silently ignore — user can manually select
        }
      }
      preSelectService();
    }
  }, [searchParams, bookingData.customerId]);

  const updateData = (updates: Partial<BookingData>) => {
    setBookingData((prev) => ({ ...prev, ...updates }));
  };

  const goNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 5) as BookingStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1) as BookingStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToStep = (step: BookingStep) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const canGoToStep = (targetStep: BookingStep) => {
    if (targetStep === 5) return currentStep === 5; // Can only view step 5 if already there (completed)
    if (targetStep === 1) return true; // Always able to go to step 1

    // To go to step 2 (or beyond), must have selected at least one service
    if (bookingData.selectedServices.length === 0) return false;
    if (targetStep === 2) return true;

    // To go to step 3 (or beyond), must have selected a date and time
    if (!bookingData.selectedDate || !bookingData.selectedTime) return false;
    if (targetStep === 3) return true;

    // To go to step 4, must have completed basic user details
    const isPhoneValid = /^[0-9]{9,10}$/.test(
      bookingData.phone.replace(/[-\s]/g, ""),
    );
    if (
      !bookingData.firstName.trim() ||
      !bookingData.lastName.trim() ||
      !isPhoneValid
    )
      return false;
    if (targetStep === 4) return true;

    return false;
  };

  const serviceId = searchParams.get("serviceId");
  const stepProps = {
    data: bookingData,
    onUpdate: updateData,
    onNext: goNext,
    onBack: goBack,
    autoOpenPicker: !serviceId,
  };

  if (isAuthenticating) {
    return (
      <main className="flex-1 w-full flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </main>
    );
  }

  return (
    <main className="flex-1 w-full">
      {/* Subtle background motif */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-1/2 -right-60 h-[400px] w-[400px] rounded-full bg-secondary/30 blur-3xl" />
      </div>

      <div className="w-full max-w-5xl mx-auto px-4 md:px-8 pt-8 pb-24 print:p-0">
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
          <BookingProgress
            currentStep={currentStep}
            onStepClick={goToStep}
            canGoToStep={canGoToStep}
          />
        </div>

        {/* Divider */}
        <div className="h-px bg-border/40 mb-8 print:hidden" />

        {/* Step content */}
        <div className="min-h-[420px] print:min-h-0">
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
