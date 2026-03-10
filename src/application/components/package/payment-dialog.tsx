import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { QrCode, Lock, Loader2, Upload, Calendar } from "lucide-react";
import generatePayload from "promptpay-qr";
import { QRCodeSVG } from "qrcode.react";
import { createClient } from "@/lib/supabase/client";

const PAYMENT_METHODS = [
    {
        id: "qr",
        icon: QrCode,
        label: "QR PromptPay",
        sublabel: "โอนผ่าน QR Code",
    },
];

interface PaymentDialogProps {
    open: boolean;
    onClose: () => void;
    pkg: any;
    customerId: number | null;
    onSuccess: () => void;
}

export function PaymentDialog({ open, onClose, pkg, customerId, onSuccess }: PaymentDialogProps) {
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<string>("qr");
    const [paymentSlipFile, setPaymentSlipFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!pkg || !open) return null;

    const targetPromptPay = "0643981531"; // Adjust this promptpay number as logic
    const totalAmount = Number(pkg.package_price);
    const qrPayload = generatePayload(targetPromptPay, { amount: totalAmount });

    const handleConfirm = async () => {
        if (paymentMethod === "qr" && !paymentSlipFile) {
            alert("กรุณาอัปโหลดสลิปการโอนเงิน (Please upload payment slip)");
            return;
        }
        if (!customerId) return;
        setLoading(true);

        try {
            let slipUrl = null;
            if (paymentMethod === "qr" && paymentSlipFile) {
                const supabase = createClient();
                const fileExt = paymentSlipFile.name.split(".").pop();
                const fileName = `package_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from("payment_slips")
                    .upload(`public/${fileName}`, paymentSlipFile);

                if (uploadError) {
                    console.error("Upload error:", uploadError);
                    alert("เกิดข้อผิดพลาดในการอัปโหลดสลิป");
                    setLoading(false);
                    return;
                }

                const { data: publicUrlData } = supabase.storage
                    .from("payment_slips")
                    .getPublicUrl(`public/${fileName}`);

                slipUrl = publicUrlData.publicUrl;
            }

            const payload = {
                customer_id: customerId,
                package_id: pkg.package_id,
                total_price: totalAmount,
                payment_method: paymentMethod,
                payment_slip_url: slipUrl,
            };

            const res = await fetch("/api/package_order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                onSuccess();
                onClose();
            } else {
                const errorData = await res.json();
                console.error("Order submission error:", errorData);
                alert("พบข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
            }
        } catch (err: any) {
            console.error("Payment exception:", err);
            alert("พบข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && !loading && onClose()}>
            <DialogContent className="sm:max-w-md md:max-w-lg font-mitr overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="text-xl md:text-2xl font-medium">ชำระเงินแพคเกจ</DialogTitle>
                    <p className="font-sans text-sm text-foreground/80 mt-1">
                        ยืนยันการซื้อแพคเกจ {pkg.package_name}
                    </p>
                </DialogHeader>

                <div className="mt-4 flex flex-col gap-6">
                    {/* Summary */}
                    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium text-lg">{pkg.package_name}</h3>
                            <span className="text-2xl font-bold tracking-tight text-primary">฿{totalAmount.toLocaleString()}</span>
                        </div>
                        <ul className="space-y-1 text-sm text-muted-foreground font-sans mt-3">
                            <li className="flex justify-between border-b border-border/40 pb-2">
                                <span>ยอดชำระทั้งสิ้น</span>
                                <span className="text-foreground font-medium">฿{totalAmount.toLocaleString()}</span>
                            </li>
                        </ul>
                    </div>

                    {/* Payment methods */}
                    <div className="space-y-3">
                        <h4 className="font-medium text-sm text-muted-foreground">วิธีชำระเงิน</h4>
                        <div className="grid grid-cols-1 gap-3">
                            {PAYMENT_METHODS.map((method) => {
                                const Icon = method.icon;
                                const selected = paymentMethod === method.id;
                                return (
                                    <button
                                        key={method.id}
                                        onClick={() => setPaymentMethod(method.id)}
                                        className={cn(
                                            "flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200",
                                            selected
                                                ? "border-primary bg-primary/5 text-primary shadow-sm"
                                                : "border-border/40 bg-background/30 text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon className="h-5 w-5" />
                                            <div className="flex flex-col text-left">
                                                <span className="text-sm font-medium font-sans leading-tight text-foreground">{method.label}</span>
                                                <span className="text-xs text-muted-foreground font-sans">{method.sublabel}</span>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {paymentMethod === "qr" && (
                            <div className="mt-4 flex flex-col items-center gap-4 p-5 border border-primary/20 bg-background rounded-2xl shadow-sm animate-in fade-in slide-in-from-top-4">
                                <p className="text-sm font-medium text-foreground text-center">สแกน QR Code เพื่อชำระเงิน</p>
                                <div className="bg-white p-3 rounded-xl border border-black/5">
                                    <QRCodeSVG value={qrPayload} size={180} />
                                </div>
                                <p className="text-sm font-medium text-primary">ยอดชำระ: ฿{totalAmount.toLocaleString()}</p>

                                <div className="w-full mt-2">
                                    <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                                        <Upload className="h-4 w-4 text-muted-foreground" />
                                        อัปโหลดหลักฐานการโอนเงิน
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={fileInputRef}
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setPaymentSlipFile(file);
                                            }
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full border-dashed bg-muted/20 hover:bg-muted/40 font-sans h-12"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {paymentSlipFile ? paymentSlipFile.name : "เลือกรูปภาพสลิป หรือ ไฟล์ .pdf"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-sans justify-center mt-2">
                        <Lock className="h-3 w-3" />
                        <span>ข้อมูลของคุณได้รับการเข้ารหัสและปลอดภัย</span>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="outline" onClick={onClose} disabled={loading} className="font-sans px-6 border-border/60">
                            ยกเลิก
                        </Button>
                        <Button onClick={handleConfirm} disabled={!paymentMethod || loading} className="font-sans px-8 gap-2 shadow-md">
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                            ยืนยันการชำระเงิน
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
