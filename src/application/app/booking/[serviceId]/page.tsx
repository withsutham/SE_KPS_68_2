import { BookingForm } from "@/components/booking-form";

export default async function BookingServicePage({
    params,
}: {
    params: Promise<{ serviceId: string }>;
}) {
    const serviceId = (await params).serviceId;
    return <BookingForm serviceId={serviceId} />;
}
