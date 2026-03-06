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
        {/* Connecting lines */}
        {STEPS.map((step, index) => {
          if (index === STEPS.length - 1) return null;
          const isCompleted = currentStep > step.id;
          return (
            <div
              key={`line-${step.id}`}
              className="absolute top-5 left-0 right-0 flex"
              style={{
                left: `calc(${(index / (STEPS.length - 1)) * 100}% + 20px)`,
                width: `calc(${(1 / (STEPS.length - 1)) * 100}% - 40px)`,
              }}
            >
              <div className="relative w-full h-[2px] bg-border overflow-hidden rounded-full">
                <div
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out",
                    isCompleted ? "bg-primary w-full" : "bg-primary w-0"
                  )}
                />
              </div>
            </div>
          );
        })}

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
                  isCompleted &&
                    "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/20",
                  isActive &&
                    "bg-primary/10 border-primary text-primary scale-110 shadow-lg shadow-primary/20 ring-4 ring-primary/10",
                  isUpcoming &&
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
