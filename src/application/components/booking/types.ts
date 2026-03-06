export type BookingStep = 1 | 2 | 3 | 4 | 5;

export interface MassageService {
  massage_id: string;
  massage_name: string;
  massage_price: number;
  // UI-only enrichments (not in DB)
  description?: string;
  duration?: number;
}

export interface BookingData {
  // Step 1
  selectedServices: MassageService[];
  // Step 2
  selectedDate: Date | null;
  selectedTime: string | null;
  // Step 3
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  // Step 4
  paymentMethod: "cash" | "qr" | "credit" | null;
  // Step 5
  bookingId: string | null;
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
  bookingId: null,
};

export interface StepProps {
  data: BookingData;
  onUpdate: (updates: Partial<BookingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const STEPS = [
  { id: 1, label: "เลือกบริการ" },
  { id: 2, label: "เลือกวัน/เวลา" },
  { id: 3, label: "ข้อมูลผู้จอง" },
  { id: 4, label: "ชำระเงิน" },
  { id: 5, label: "สรุปการจอง" },
] as const;
