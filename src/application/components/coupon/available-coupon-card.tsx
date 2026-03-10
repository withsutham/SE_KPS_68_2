import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TicketPercent, CheckCircle2, Loader2, Clock } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface AvailableCouponCardProps {
  coupon: {
    coupon_id: number;
    coupon_name: string;
    discount_percent: number;
    description: string;
    collect_deadline?: string | null;
  };
  isClaimed: boolean;
  isUsed: boolean;
  isClaiming: boolean;
  onClaim: (couponId: number) => void;
}

export function AvailableCouponCard({ coupon, isClaimed, isUsed, isClaiming, onClaim }: AvailableCouponCardProps) {
  return (
    <Card className="border-primary/20 bg-background/50 backdrop-blur-sm overflow-hidden flex flex-col transition-all hover:shadow-md hover:border-primary/40 group">
      <div className="flex aspect-[3/1] bg-primary/5 border-b border-primary/10 relative overflow-hidden items-center justify-center">
        <div className="absolute -left-4 w-8 h-8 rounded-full bg-background border-r border-primary/10"></div>
        <div className="absolute -right-4 w-8 h-8 rounded-full bg-background border-l border-primary/10"></div>
        <TicketPercent className="h-12 w-12 text-primary/40 group-hover:scale-110 transition-transform duration-500" />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold tracking-tighter text-primary">
            {coupon.discount_percent}%
          </span>
          <span className="text-xs font-medium uppercase tracking-widest text-primary/70">ส่วนลด</span>
        </div>
      </div>
      <CardHeader className="pt-6">
        <CardTitle className="text-xl font-medium line-clamp-1">{coupon.coupon_name}</CardTitle>
        <CardDescription className="line-clamp-2 min-h-[40px] mt-2">
          {coupon.description || "ใช้เป็นส่วนลดในการจองบริการ"}
        </CardDescription>
        {coupon.collect_deadline && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-3 bg-muted/50 p-1.5 px-2.5 rounded-md w-fit">
            <Clock className="w-3.5 h-3.5" />
            <span>เก็บได้ถึง: {format(new Date(coupon.collect_deadline), "d MMM yyyy", { locale: th })}</span>
          </div>
        )}
      </CardHeader>
      <CardFooter className="pt-2 pb-6 mt-auto">
        <Button
          className={`w-full gap-2 relative overflow-hidden transition-all ${isClaimed ? 'bg-muted text-muted-foreground hover:bg-muted text-xs' : 'group/btn'}`}
          disabled={isClaimed || isClaiming}
          onClick={() => onClaim(coupon.coupon_id)}
          variant={isClaimed ? "secondary" : "default"}
        >
          {isClaiming ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isClaimed ? (
            <>
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">
                {isUsed ? 'คุณเคยเก็บและใช้คูปองนี้แล้ว' : 'คุณมีคูปองนี้แล้ว'}
              </span>
            </>
          ) : (
            "เก็บคูปอง"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
