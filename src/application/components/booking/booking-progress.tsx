"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { STEPS, BookingStep } from "./types";

interface BookingProgressProps {
  currentStep: BookingStep;
}

export function BookingProgress({ currentStep }: BookingProgressProps) {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      <div className="relative flex items-start justify-between">
        {/* Progress background line */}
        <div
          className="absolute top-5 h-[2px] bg-border -translate-y-1/2 z-0"
          style={{
            left: `${100 / (2 * STEPS.length)}%`,
            right: `${100 / (2 * STEPS.length)}%`
          }}
        />
        {/* Progress fill line */}
        <div
          className="absolute top-5 h-[2px] bg-primary transition-all duration-700 ease-out -translate-y-1/2 z-0"
          style={{
            left: `${100 / (2 * STEPS.length)}%`,
            width: `calc(${((currentStep - 1) / (STEPS.length - 1)) * 100}% - ${((currentStep - 1) / (STEPS.length - 1)) * (100 / STEPS.length)}%)`
          }}
        />

        {/* Step circles */}
        {STEPS.map((step) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;
          const isUpcoming = currentStep < step.id;

          return (
            <div
              key={step.id}
              className="relative flex flex-col items-center gap-3 z-10"
              style={{ width: `${100 / STEPS.length}%` }}
            >
              {/* Circle */}
              <div
                className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-500 border-2 font-mitr",
<<<<<<< HEAD
                  isCompleted && 
=======
                  isCompleted &&
>>>>>>> 0924b41 (fix: Resolve merge conflict in booking progress styling, updating active step background color.)
                    "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/20",
<<<<<<< HEAD
                  isActive && 
                    "bg-background border-primary text-primary scale-110 shadow-lg shadow-primary/20 ring-4 ring-primary/10",
                  isUpcoming && 
=======
                  isActive &&
                    "bg-background border-primary text-primary scale-110 shadow-lg shadow-primary/20 ring-4 ring-primary/10",
                  isUpcoming &&
>>>>>>> 52774cc (feat: Implement automatic therapist and room assignment in booking API and dynamic time slot availability based on service duration.)
                    "bg-background border-border text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4 stroke-[2.5]" />
                ) : (
                  <span>{step.id}</span>
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  "text-xs font-medium text-center leading-tight transition-colors duration-300 font-sans",
                  isActive && "text-primary font-semibold",
                  isCompleted && "text-primary/70",
                  isUpcoming && "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
