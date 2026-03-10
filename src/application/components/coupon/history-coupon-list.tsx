import { Badge } from "@/components/ui/badge";

interface HistoryCouponListProps {
  coupons: any[];
}

export function HistoryCouponList({ coupons }: HistoryCouponListProps) {
  return (
    <div className="flex flex-col gap-3">
      {coupons.map((mc, index) => {
        const coupon = mc.coupon;
        if (!coupon) return null;

        return (
          <div
            key={`history-${mc.member_coupon_id}-${index}`}
            className="flex items-center justify-between p-4 rounded-2xl border border-border/40 bg-muted/20 opacity-80 grayscale transition-all hover:opacity-100 hover:grayscale-0"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex flex-col items-center justify-center shrink-0 border border-primary/10">
                <span className="text-sm font-bold text-primary">{coupon.discount_percent}%</span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-sm text-foreground">{coupon.coupon_name}</span>
                <span className="text-xs text-muted-foreground">{coupon.description || "ใช้เป็นส่วนลดในการจองบริการ"}</span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1 shrink-0">
              <Badge variant="secondary" className="text-[10px] font-normal px-2 py-0 h-5">
                ใช้แล้ว
              </Badge>
              {mc.booking_id && (
                <span className="text-[10px] text-muted-foreground">
                  จอง: #{mc.booking_id}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
