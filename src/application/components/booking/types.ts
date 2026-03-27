export type BookingStep = 1 | 2 | 3 | 4 | 5;

export interface MassageService {
  massage_id: string;
  massage_name: string;
  massage_price: number;
  image_src?: string | null;
  // UI-only enrichments (not in DB)
  description?: string;
  duration?: number;
  // Package tracking (optional - only set when service comes from user's package)
  fromPackage?: boolean;
  member_package_id?: number;
  package_name?: string;
}

export interface BookingData {
  // Step 1
  selectedServices: MassageService[];
  // Step 2
  selectedDate: Date | null;
  selectedTime: string | null;
  // Step 3
  customerId?: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  // Step 4
  paymentMethod: "cash" | "qr" | "credit" | null;
  selectedCouponId?: number | null;
  discountAmount?: number;
  paymentSlipFile?: File | null;
  // Step 5
  bookingId: string | null;
  bookingDetails: any[] | null;
}

export const INITIAL_BOOKING_DATA: BookingData = {
  selectedServices: [],
  selectedDate: null,
  selectedTime: null,
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  paymentMethod: null,
  selectedCouponId: null,
  discountAmount: 0,
  paymentSlipFile: null,
  bookingId: null,
  bookingDetails: null,
};

export interface StepProps {
  data: BookingData;
  onUpdate: (updates: Partial<BookingData>) => void;
  onNext: () => void;
  onBack: () => void;
  autoOpenPicker?: boolean;
}

export const STEPS = [
  { id: 1, label: "เลือกบริการ" },
  { id: 2, label: "เลือกวัน/เวลา" },
  { id: 3, label: "ข้อมูลผู้จอง" },
  { id: 4, label: "ชำระเงิน" },
  { id: 5, label: "สรุปการจอง" },
] as const;
