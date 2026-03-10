import { ReactNode } from "react";

interface EmptyCouponStateProps {
  icon: ReactNode;
  message: string;
}

export function EmptyCouponState({ icon, message }: EmptyCouponStateProps) {
  return (
    <div className="bg-muted/30 border border-border/50 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
      <div className="text-muted-foreground mb-4 opacity-50 flex items-center justify-center">
        {icon}
      </div>
      <p className="text-lg text-muted-foreground">{message}</p>
    </div>
  );
}
