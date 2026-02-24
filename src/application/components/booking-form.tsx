"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar } from "../components/ui/calendar";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Progress } from "../components/ui/progress";
import { Sparkles, Check, Briefcase, Calendar as CalendarIcon, User, FileText, ChevronLeft, ChevronRight, X, Clock, PartyPopper, MapPin, Phone, Mail, Printer, Download, CreditCard, QrCode, Banknote } from "lucide-react";
import { toast } from "sonner";
import { services, iconMap } from "./services";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

const timeSlots = [
  "09.00 น.", "10.00 น.", "11.00 น.", "12.00 น.",
  "13.00 น.", "14.00 น.", "15.00 น.", "16.00 น.",
  "17.00 น.", "18.00 น.", "19.00 น.", "20.00 น."
];

const durations = ["60 นาที", "75 นาที", "90 นาที", "120 นาที"];

interface SelectedService {
  serviceId: string;
  duration: string;
}

interface BookingData {
  // Step 1: Service Selection
  selectedServices: SelectedService[];

  // Step 2: Date & Time
  date: Date | undefined;
  time: string;

  // Step 3: Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  // Step 4: Additional Details
  specialRequests: string;
}

const steps = [
  { id: 1, name: "เลือกบริการ", icon: Briefcase },
  { id: 2, name: "เลือกวันและเวลา", icon: CalendarIcon },
  { id: 3, name: "ข้อมูลของคุณ", icon: User },
  { id: 4, name: "สรุปการจอง", icon: FileText },
  { id: 5, name: "ชำระเงินมัดจำ", icon: Banknote },
];

export function BookingForm({ serviceId }: { serviceId?: string }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData>({
    selectedServices: [{ serviceId: serviceId || "", duration: "" }],
    date: undefined,
    time: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialRequests: "",
  });

  useEffect(() => {
    if (serviceId) {
      setBookingData(prev => ({
        ...prev,
        selectedServices: [{ serviceId, duration: "" }]
      }));
    }
  }, [serviceId]);

  const progress = (currentStep / steps.length) * 100;

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (bookingData.selectedServices.length === 0) {
          toast.error("กรุณาเลือกอย่างน้อยหนึ่งบริการ");
          return false;
        }
        const isValid = bookingData.selectedServices.every(s => s.serviceId && s.duration);
        if (!isValid) {
          toast.error("กรุณาเลือกบริการและระยะเวลาให้ครบทุกรายการ");
          return false;
        }
        return true;
      case 2:
        if (!bookingData.date || !bookingData.time) {
          toast.error("กรุณาเลือกวันที่และเวลา");
          return false;
        }
        return true;
      case 3:
        if (!bookingData.firstName || !bookingData.lastName || !bookingData.email || !bookingData.phone) {
          toast.error("กรุณากรอกข้อมูลส่วนตัวให้ครบถ้วน");
          return false;
        }
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(bookingData.email)) {
          toast.error("กรุณากรอกอีเมลให้ถูกต้อง");
          return false;
        }
        return true;
      case 4:
        return true;
      default:
        return true;
    }
  };

  const calculateTotalMinutes = () => {
    let total = 0;
    bookingData.selectedServices.forEach(s => {
      const mins = parseInt(s.duration.replace(/\D/g, ''));
      if (!isNaN(mins)) total += mins;
    });
    return total;
  };

  const calculateTotalPrice = () => {
    return bookingData.selectedServices.reduce((acc, s) => {
      const service = services.find(serv => serv.id === s.serviceId);
      return acc + (service?.priceRange || 0);
    }, 0);
  };

  const calculateDepositAmount = () => {
    return Math.floor(calculateTotalPrice() * 0.2); // 20% Deposit
  };

  const getAvailableTimeSlots = () => {
    const totalMins = calculateTotalMinutes();
    const blocksNeeded = Math.ceil(totalMins / 60);
    // Assuming shop closes at 21:00, last 60min slot is 20:00
    // If they need 120mins, last slot should be 19:00, etc.
    const maxIndex = timeSlots.length - blocksNeeded + 1;
    return timeSlots.slice(0, maxIndex > 0 ? maxIndex : 0);
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const addService = () => {
    setBookingData(prev => ({
      ...prev,
      selectedServices: [...prev.selectedServices, { serviceId: "", duration: "" }]
    }));
  };

  const removeService = (index: number) => {
    setBookingData(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.filter((_, i) => i !== index)
    }));
  };

  const updateService = (index: number, field: keyof SelectedService, value: string) => {
    setBookingData(prev => {
      const newServices = [...prev.selectedServices];
      newServices[index] = { ...newServices[index], [field]: value };
      return { ...prev, selectedServices: newServices };
    });
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.success("การจองเสร็จสมบูรณ์!");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-emerald-600" />
              <span className="text-2xl font-semibold text-gray-900">Feun-Jai (ฟื้นใจ)</span>
            </Link>
            <Button variant="ghost" onClick={() => router.push("/")}>
              ยกเลิก
            </Button>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      {!isSubmitted && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="mb-4">
              <Progress value={progress} className="h-2" />
            </div>

            {/* Step Indicators */}
            <div className="flex justify-between">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isCompleted = currentStep > step.id;
                const isCurrent = currentStep === step.id;

                return (
                  <div key={step.id} className="flex flex-col items-center flex-1">
                    <div className={`
                      flex items-center justify-center w-10 h-10 rounded-full mb-2 transition-colors
                      ${isCompleted ? 'bg-emerald-600 text-white' :
                        isCurrent ? 'bg-emerald-100 text-emerald-600 ring-2 ring-emerald-600' :
                          'bg-gray-200 text-gray-500'}
                    `}>
                      {isCompleted ? <Check className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                    </div>
                    <div className={`text-xs sm:text-sm text-center font-medium ${isCurrent ? 'text-emerald-600' : 'text-gray-500'
                      }`}>
                      <span className="hidden sm:inline">{step.name}</span>
                      <span className="sm:hidden">Step {step.id}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isSubmitted ? (
          <div className="animate-in fade-in zoom-in duration-500">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-100 rounded-full mb-6">
                <PartyPopper className="w-12 h-12 text-emerald-600" />
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">จองสำเร็จแล้ว!</h2>
              <p className="text-lg text-gray-600">ขอบคุณที่คุณเลือกฟื้นใจ (Feun-Jai) เราได้รับข้อมูลการจองของคุณแล้ว</p>
            </div>

            <Card className="overflow-hidden border-2 border-emerald-100 shadow-xl bg-white mb-8">
              <div className="bg-emerald-600 px-8 py-6 text-white flex justify-between items-center">
                <div>
                  <p className="text-emerald-100 text-sm uppercase tracking-wider font-semibold">Booking ID</p>
                  <p className="text-2xl font-mono font-bold">FJ-{Math.random().toString(36).substring(2, 9).toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <p className="text-emerald-100 text-sm uppercase tracking-wider font-semibold">สถานะ</p>
                  <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-sm font-bold">ยืนยันแล้ว</span>
                </div>
              </div>

              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    {/* Service Breakdown */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">รายการบริการ</h3>
                      <div className="space-y-4">
                        {bookingData.selectedServices.map((s, idx) => {
                          const info = services.find(serv => serv.id === s.serviceId);
                          return (
                            <div key={idx} className="flex gap-4">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                <ImageWithFallback src={info?.image || ""} alt="" className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900">{info?.name}</p>
                                <p className="text-sm text-gray-500">{s.duration}</p>
                              </div>
                              <p className="font-medium text-emerald-600">{info?.price.split('-')[0]}</p>
                            </div>
                          );
                        })}
                        <div className="pt-4 mt-4 border-t border-dashed border-gray-200">
                          <div className="flex justify-between items-center text-sm mb-2">
                            <span className="text-gray-600 uppercase tracking-tighter font-bold">ยอดสุทธิรวม</span>
                            <span className="font-bold text-gray-900">฿{calculateTotalPrice().toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center text-lg font-bold">
                            <span>มัดจำที่ชำระแล้ว (20%)</span>
                            <span className="text-2xl text-emerald-600">
                              ฿{calculateDepositAmount().toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Appointment Info */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">เวลานัดหมาย</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-xl">
                          <div className="flex items-center gap-2 text-emerald-600 mb-1">
                            <CalendarIcon className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase">วันที่</span>
                          </div>
                          <p className="font-semibold">{bookingData.date?.toLocaleDateString('th-TH', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl">
                          <div className="flex items-center gap-2 text-emerald-600 mb-1">
                            <Clock className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase">เวลา</span>
                          </div>
                          <p className="font-semibold text-xl">{bookingData.time}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-2 italic text-center">* กรุณามาถึงก่อนเวลานัด 15 นาที</p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {/* User Info */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">ข้อมูลผู้จอง</h3>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <User className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold">{bookingData.firstName} {bookingData.lastName}</p>
                            <p className="text-xs text-gray-500">ชื่อนามสกุล</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold">{bookingData.email}</p>
                            <p className="text-xs text-gray-500">อีเมลสำหรับส่งอีเมลยืนยัน</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold">{bookingData.phone}</p>
                            <p className="text-xs text-gray-500">เบอร์โทรศัพท์ติดต่อ</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Preferences */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">ความต้องการพิเศษ</h3>
                      {bookingData.specialRequests && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                          <p className="font-semibold text-gray-900 mb-1">หมายเหตุ:</p>
                          {bookingData.specialRequests}
                        </div>
                      )}
                      {!bookingData.specialRequests && (
                        <p className="text-sm text-gray-500 italic">ไม่มีความต้องการพิเศษ</p>
                      )}
                    </div>

                    {/* Location Placeholder */}
                    <div className="p-4 bg-gray-900 text-white rounded-2xl flex items-center justify-between shadow-lg">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-8 h-8 text-emerald-400" />
                        <div>
                          <p className="font-bold">สาขาสุขุมวิท 24</p>
                          <p className="text-xs text-gray-400 leading-tight">ชั้น 2, อาคารเดอะแมนเนอร์ สุขุมวิท</p>
                        </div>
                      </div>
                      <Link href="/" className="text-xs bg-white text-black px-3 py-1.5 rounded-full font-bold hover:bg-emerald-400 transition-colors">ดูแผนที่</Link>
                    </div>
                  </div>
                </div>
              </CardContent>

              <div className="bg-gray-50 p-6 flex flex-col sm:flex-row gap-4 border-t border-gray-200">
                <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 h-12 gap-2 text-lg" onClick={() => router.push("/")}>
                  กลับหน้าหลัก
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" className="h-12 w-12 p-0 rounded-full" title="พิมพ์">
                    <Printer className="w-5 h-5" />
                  </Button>
                  <Button variant="outline" className="h-12 w-12 p-0 rounded-full" title="ดาวน์โหลด PDF">
                    <Download className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </Card>

            <p className="text-center text-gray-400 text-sm">เราได้ส่งอีเมลยืนยันการจองไปที่ {bookingData.email} แล้ว และเจ้าหน้าที่จะติดต่อกลับก่อนวันนัดหมาย</p>
          </div>
        ) : (
          <Card>
            <CardContent className="p-8">
              {/* Step 1: Service Selection */}
              {currentStep === 1 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl mb-2 text-emerald-900 font-bold">เลือกบริการของคุณ</h2>
                    <p className="text-gray-600">คุณสามารถเลือกบริการเพิ่มได้ตามต้องการเพื่อเซสชั่นที่สมบูรณ์แบบ</p>
                  </div>

                  <div className="space-y-6">
                    {bookingData.selectedServices.map((selected, index) => {
                      const serviceInfo = services.find(s => s.id === selected.serviceId);
                      return (
                        <div key={index} className="p-6 border-2 border-emerald-100 rounded-2xl bg-white shadow-sm relative space-y-4">
                          {bookingData.selectedServices.length > 1 && (
                            <button
                              onClick={() => removeService(index)}
                              className="absolute -top-3 -right-3 bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200 transition-colors shadow-sm"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}

                          <div className="space-y-4">
                            <Label htmlFor={`service-${index}`} className="text-emerald-800 font-semibold">บริการที่ {index + 1}</Label>
                            <Select
                              value={selected.serviceId}
                              onValueChange={(value) => updateService(index, "serviceId", value)}
                            >
                              <SelectTrigger id={`service-${index}`} className="h-12 border-emerald-200 focus:ring-emerald-500">
                                <SelectValue placeholder="เลือกบริการ" />
                              </SelectTrigger>
                              <SelectContent>
                                {services.map((service) => (
                                  <SelectItem key={service.id} value={service.id}>
                                    {service.name} - {service.price}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            {serviceInfo && (
                              <div className="flex gap-4 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                                <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border border-emerald-200">
                                  <ImageWithFallback
                                    src={serviceInfo.image}
                                    alt={serviceInfo.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    {(() => {
                                      const ServiceIcon = iconMap[serviceInfo.iconName];
                                      return <ServiceIcon className="w-4 h-4 text-emerald-600" />;
                                    })()}
                                    <h4 className="font-semibold text-emerald-900">{serviceInfo.name}</h4>
                                  </div>
                                  <p className="text-xs text-emerald-700/80 line-clamp-2">{serviceInfo.description}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="space-y-3">
                            <Label className="text-emerald-800 font-semibold">ระยะเวลา</Label>
                            <RadioGroup
                              value={selected.duration}
                              onValueChange={(value) => updateService(index, "duration", value)}
                            >
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {durations.map((duration) => (
                                  <div key={duration}>
                                    <RadioGroupItem
                                      value={duration}
                                      id={`duration-${index}-${duration}`}
                                      className="peer sr-only"
                                    />
                                    <Label
                                      htmlFor={`duration-${index}-${duration}`}
                                      className="flex items-center justify-center p-3 border-2 rounded-xl cursor-pointer text-sm font-medium transition-all peer-data-[state=checked]:border-emerald-600 peer-data-[state=checked]:bg-emerald-600 peer-data-[state=checked]:text-white hover:border-emerald-200 hover:bg-emerald-50/50"
                                    >
                                      {duration}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </RadioGroup>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    onClick={addService}
                    className="w-full h-14 border-dashed border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300 rounded-2xl flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    เพิ่มบริการอีกรายการ
                  </Button>
                </div>
              )}

              {/* Step 2: Date & Time */}
              {currentStep === 2 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl mb-2 text-emerald-900 font-bold">เลือกวันและเวลา</h2>
                    <p className="text-gray-600">เลือกช่วงเวลานัดหมายที่คุณต้องการ</p>
                  </div>

                  {/* Spa Journey Visualizer */}
                  <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 mb-8">
                    <h3 className="text-lg font-semibold text-emerald-900 mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      รายละเอียดเซสชั่นของคุณ
                    </h3>

                    <div className="space-y-3 mb-6 relative pl-4 border-l-2 border-emerald-200 ml-2">
                      {bookingData.selectedServices.map((s, idx) => {
                        const serviceInfo = services.find(serv => serv.id === s.serviceId);
                        return (
                          <div key={idx} className="relative">
                            <div className="absolute -left-[23px] top-1 w-3 h-3 bg-emerald-500 rounded-full ring-4 ring-emerald-50" />
                            <div className="bg-white p-3 rounded-xl shadow-sm border border-emerald-50 flex justify-between items-center ml-2">
                              <span className="font-medium text-emerald-900">{serviceInfo?.name}</span>
                              <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{s.duration}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-emerald-200">
                      <span className="text-emerald-800 font-medium">ระยะเวลารวม:</span>
                      <span className="text-xl font-bold text-emerald-700">
                        {Math.floor(calculateTotalMinutes() / 60) > 0 && `${Math.floor(calculateTotalMinutes() / 60)} ชั่วโมง `}
                        {calculateTotalMinutes() % 60 > 0 && `${calculateTotalMinutes() % 60} นาที`}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-emerald-800 font-semibold text-lg">1. เลือกวันที่</Label>
                    <div className="flex justify-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                      <Calendar
                        mode="single"
                        selected={bookingData.date}
                        onSelect={(date) => {
                          setBookingData({ ...bookingData, date, time: "" }); // Reset time when date changes
                        }}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today;
                        }}
                        className="rounded-md"
                      />
                    </div>
                  </div>

                  {bookingData.date && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                      <Label className="text-emerald-800 font-semibold text-lg">2. เลือกเวลาเริ่มต้น</Label>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {getAvailableTimeSlots().map((slot) => {
                          const isSelected = bookingData.time === slot;
                          return (
                            <Button
                              key={slot}
                              variant={isSelected ? "default" : "outline"}
                              className={`h-12 transition-all ${isSelected
                                ? "bg-emerald-600 hover:bg-emerald-700 shadow-md scale-105"
                                : "hover:border-emerald-300 hover:bg-emerald-50"
                                }`}
                              onClick={() => setBookingData({ ...bookingData, time: slot })}
                            >
                              {slot}
                            </Button>
                          );
                        })}
                        {getAvailableTimeSlots().length === 0 && (
                          <div className="col-span-full text-center p-4 text-red-500 bg-red-50 rounded-lg">
                            ไม่มีช่วงเวลาที่เพียงพอสำหรับเซสชั่นของคุณในวันนี้ กรุณาเลือกวันอื่น
                          </div>
                        )}
                      </div>
                      {getAvailableTimeSlots().length > 0 && (
                        <p className="text-sm text-gray-500 mt-2 text-center">
                          * แสดงเฉพาะเวลาที่เพียงพอสำหรับระยะเวลา {calculateTotalMinutes()} นาที
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Personal Information */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl mb-2">ข้อมูลของคุณ</h2>
                    <p className="text-gray-600">กรุณากรอกข้อมูลติดต่อของคุณ</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">ชื่อ</Label>
                      <Input
                        id="firstName"
                        placeholder="สมชาย"
                        value={bookingData.firstName}
                        onChange={(e) => setBookingData({ ...bookingData, firstName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">นามสกุล</Label>
                      <Input
                        id="lastName"
                        placeholder="ใจดี"
                        value={bookingData.lastName}
                        onChange={(e) => setBookingData({ ...bookingData, lastName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">อีเมล</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@email.com"
                      value={bookingData.email}
                      onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="08-1234-5678"
                      value={bookingData.phone}
                      onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialRequests">คำขอพิเศษหรือข้อกังวลด้านสุขภาพ (ถ้ามี)</Label>
                    <Textarea
                      id="specialRequests"
                      placeholder="กรุณาแจ้งให้เราทราบหากคุณมีบาดเจ็บ, แพ้ภูมิแพ้ หรือจุดที่ต้องการให้เราเน้น..."
                      value={bookingData.specialRequests}
                      onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Booking Summary */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div>
                    <h2 className="text-3xl mb-2 text-emerald-900 font-bold">สรุปรายการจองของคุณ</h2>
                    <p className="text-gray-600">กรุณาตรวจสอบข้อมูลการจองของคุณก่อนดำเนินขั้นตอนการชำระเงิน</p>
                  </div>

                  <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-emerald-900 flex items-center gap-2">
                        <Briefcase className="w-5 h-5" />
                        บริการที่เลือก
                      </h3>
                      <div className="space-y-3">
                        {bookingData.selectedServices.map((s, i) => {
                          const info = services.find(serv => serv.id === s.serviceId);
                          return (
                            <div key={i} className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-emerald-50">
                              <div className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                                <div>
                                  <p className="font-bold text-emerald-900">{info?.name || "ไม่ได้เลือก"}</p>
                                  <p className="text-xs text-emerald-600">{s.duration}</p>
                                </div>
                              </div>
                              <span className="font-bold text-emerald-700">{info?.price.split('-')[0]}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-emerald-100">
                      <div className="space-y-2">
                        <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4" />
                          วันที่และเวลา
                        </h3>
                        <div className="bg-white/50 p-3 rounded-xl border border-emerald-50">
                          <p className="font-semibold text-emerald-900">
                            {bookingData.date?.toLocaleDateString('th-TH', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                          <p className="text-lg font-bold text-emerald-600">{bookingData.time}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-2">
                          <User className="w-4 h-4" />
                          ข้อมูลผู้จอง
                        </h3>
                        <div className="bg-white/50 p-3 rounded-xl border border-emerald-50">
                          <p className="font-semibold text-emerald-900">{bookingData.firstName} {bookingData.lastName}</p>
                          <p className="text-xs text-emerald-700/70">{bookingData.phone}</p>
                          <p className="text-xs text-emerald-700/70 truncate">{bookingData.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-4 border-t border-emerald-100">
                      <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wider">คำขอพิเศษ</h3>
                      <div className="bg-white/50 p-4 rounded-xl border border-emerald-50">
                        {bookingData.specialRequests ? (
                          <p className="text-sm text-emerald-900 leading-relaxed">{bookingData.specialRequests}</p>
                        ) : (
                          <p className="text-sm text-emerald-700/50 italic">ไม่มีคำขอพิเศษ</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-emerald-600 rounded-xl p-4 text-white">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-emerald-100 text-sm">ยอดรวมทั้งหมด</span>
                        <span className="font-bold text-lg">฿{calculateTotalPrice().toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-white/20">
                        <span className="text-base font-bold text-white">ยอดมัดจำที่ต้องชำระ (20%)</span>
                        <span className="text-2xl font-black">฿{calculateDepositAmount().toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Step 5: Deposit Payment Mockup */}
              {currentStep === 5 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                  <div>
                    <h2 className="text-3xl mb-2 text-emerald-900 font-bold">ชำระเงินมัดจำ</h2>
                    <p className="text-gray-600">กรุณาชำระเงินมัดจำเพื่อยืนยันวันเวลานัดหมายของคุณ</p>
                  </div>

                  <div className="bg-emerald-900 rounded-2xl p-6 text-white overflow-hidden relative">
                    <div className="relative z-10">
                      <p className="text-emerald-300 text-sm font-semibold uppercase tracking-wider mb-1">ยอดมัดจำที่ต้องชำระ (20%)</p>
                      <h3 className="text-5xl font-bold mb-4">฿{calculateDepositAmount().toLocaleString()}</h3>
                      <div className="flex gap-6 text-sm">
                        <div>
                          <p className="text-emerald-300 mb-1">ยอดรวมทั้งหมด</p>
                          <p className="font-semibold text-lg">฿{calculateTotalPrice().toLocaleString()}</p>
                        </div>
                        <div className="w-px bg-white/20" />
                        <div>
                          <p className="text-emerald-300 mb-1">จำนวนบริการ</p>
                          <p className="font-semibold text-lg">{bookingData.selectedServices.length} รายการ</p>
                        </div>
                      </div>
                    </div>
                    <Banknote className="absolute -right-10 -bottom-10 w-64 h-64 text-white/5 rotate-12" />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-lg font-bold text-gray-900">ช่องทางการชำระเงิน</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 border-2 border-emerald-600 bg-emerald-50 rounded-2xl flex items-center gap-4 cursor-pointer relative">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                          <QrCode className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-emerald-900">Thai QR Payment</p>
                          <p className="text-xs text-emerald-600">PromptPay ฟรีค่าธรรมเนียม</p>
                        </div>
                        <div className="absolute top-3 right-3">
                          <div className="w-5 h-5 bg-emerald-600 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        </div>
                      </div>

                      <div className="p-4 border-2 border-gray-200 rounded-2xl flex items-center gap-4 cursor-pointer hover:border-emerald-200 transition-colors opacity-60">
                        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                          <CreditCard className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-400">Credit / Debit Card</p>
                          <p className="text-xs text-gray-400">รองรับ Visa, Mastercard</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border-2 border-emerald-100 rounded-3xl p-8 flex flex-col items-center shadow-lg">
                      <img
                        src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PROMPTPAY_MOCK_PAYMENT"
                        alt="Payment QR"
                        className="w-48 h-48 mb-6 p-2 border border-gray-100 rounded-xl"
                      />
                      <div className="text-center space-y-2">
                        <p className="font-bold text-xl text-emerald-900 leading-none">Feun-Jai Spa Co., Ltd.</p>
                        <p className="text-gray-500">บริษัท ฟื้นใจ สปา จำกัด</p>
                        <div className="inline-block bg-emerald-100 px-4 py-1 rounded-full text-emerald-700 font-bold text-sm">
                          Ref: FJ-{Math.random().toString(36).substring(2, 6).toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <p className="text-center text-sm text-gray-400">เมื่อชำระเงินแล้ว ระบบจะตรวจสอบและยืนยันการจองทันที</p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    ย้อนกลับ
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  className={`bg-emerald-600 hover:bg-emerald-700 ${currentStep === 1 ? 'flex-1' : 'flex-1'}`}
                >
                  {currentStep === steps.length ? "ยืนยันการจอง" : "ถัดไป"}
                  {currentStep < steps.length && <ChevronRight className="w-4 h-4 ml-2" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}