import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ActiveCouponCardProps {
  coupon: {
    coupon_id: number;
    coupon_name: string;
    discount_percent: number;
    description: string;
  };
}

export function ActiveCouponCard({ coupon }: ActiveCouponCardProps) {
  return (
    <Card className="border-primary/20 bg-background/80 backdrop-blur-sm overflow-hidden relative flex flex-col transition-all hover:shadow-md">
      <div className="absolute top-4 right-4 z-10">
        <Badge variant="default" className="text-xs bg-primary/10 text-primary border-0 shadow-none">
          พร้อมใช้
        </Badge>
      </div>

      <CardContent className="p-0 flex items-center h-[120px]">
        <div className="w-1/3 bg-primary/5 flex flex-col items-center justify-center h-full relative">
          <span className="text-2xl font-bold tracking-tighter text-primary">
            {coupon.discount_percent}%
          </span>
          <div className="absolute -right-[1px] top-0 bottom-0 w-[2px] border-r-2 border-dashed border-border/70 z-10" />
        </div>
        <div className="w-2/3 p-5 flex flex-col justify-center">
          <h3 className="font-semibold text-base line-clamp-1 mb-1">{coupon.coupon_name}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {coupon.description || "ใช้เป็นส่วนลดในการจองบริการ"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
