import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const from = url.searchParams.get("from"); // YYYY-MM-DD
    const to = url.searchParams.get("to");     // YYYY-MM-DD

    const supabase = await createAdminClient();

    // ─── Parallel Fetch ──────────────────────────────────────────────────
    const [
        { data: bookings },
        { data: bookingDetails },
        { data: payments },
        { data: customers },
        { data: employees },
        { data: rooms },
        { data: massages },
        { data: workSchedules },
        { data: leaveRecords },
        { data: memberCoupons },
        { data: memberPackages },
        { data: packages },
        { data: packageDetails },
    ] = await Promise.all([
        supabase.from("booking").select("*"),
        supabase.from("booking_detail").select("*"),
        supabase.from("payment").select("*"),
        supabase.from("customer").select("*"),
        supabase.from("employee").select("*"),
        supabase.from("room").select("*"),
        supabase.from("massage").select("*"),
        supabase.from("work_schedule").select("*"),
        supabase.from("leave_record").select("*"),
        supabase.from("member_coupon").select("*, coupon(*)"),
        supabase.from("member_package").select("*"),
        supabase.from("package").select("*"),
        supabase.from("package_detail").select("*"),
    ]);

    const allBookings = bookings ?? [];
    const allDetails = bookingDetails ?? [];
    const allPayments = payments ?? [];
    const allCustomers = customers ?? [];
    const allEmployees = employees ?? [];
    const allRooms = rooms ?? [];
    const allMassages = massages ?? [];
    const allSchedules = workSchedules ?? [];
    const allLeaves = leaveRecords ?? [];
    const allMemberCoupons = memberCoupons ?? [];
    const allMemberPackages = memberPackages ?? [];
    const allPackages = packages ?? [];
    const allPackageDetails = packageDetails ?? [];

    // ─── Date range filtering ────────────────────────────────────────────
    const now = new Date();
    const fromDate = from ? new Date(`${from}T00:00:00+07:00`) : new Date(0);
    const toDate = to ? new Date(`${to}T23:59:59+07:00`) : new Date("2099-12-31");

    const filteredBookings = allBookings.filter((b: any) => {
        const d = new Date(b.booking_dateTime);
        return d >= fromDate && d <= toDate;
    });

    const filteredBookingIds = new Set(filteredBookings.map((b: any) => b.booking_id));

    const filteredDetails = allDetails.filter((d: any) => filteredBookingIds.has(d.booking_id));

    const filteredPayments = allPayments.filter((p: any) => filteredBookingIds.has(p.booking_id));

    // ─── 1. KPI: Total Revenue ───────────────────────────────────────────
    const completedPayments = filteredPayments.filter((p: any) => p.payment_status === "completed");
    const totalRevenue = completedPayments.reduce((sum: number, p: any) => sum + Number(p.amount ?? 0), 0);

    // ─── 2. KPI: Total Bookings ──────────────────────────────────────────
    const totalBookings = filteredBookings.length;

    // ─── 3. KPI: New Customers ───────────────────────────────────────────
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const newCustomersThisMonth = allCustomers.filter((c: any) => {
        const d = new Date(c.regis_dateTime);
        return d >= currentMonthStart;
    }).length;

    const newCustomersLastMonth = allCustomers.filter((c: any) => {
        const d = new Date(c.regis_dateTime);
        return d >= prevMonthStart && d < currentMonthStart;
    }).length;

    // ─── 4. KPI: Average Transaction Value ───────────────────────────────
    const currentMonthCompletedPayments = allPayments.filter((p: any) => {
        const booking = allBookings.find((b: any) => b.booking_id === p.booking_id);
        if (!booking) return false;
        const d = new Date(booking.booking_dateTime);
        return d >= currentMonthStart && p.payment_status === "completed";
    });
    const avgTransactionValue = currentMonthCompletedPayments.length > 0
        ? currentMonthCompletedPayments.reduce((s: number, p: any) => s + Number(p.amount ?? 0), 0) / currentMonthCompletedPayments.length
        : 0;

    // ─── 5. KPI: Today Available Therapists ──────────────────────────────
    const todayWeekday = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][now.getDay()];
    const todayStr = now.toLocaleDateString("en-CA"); // YYYY-MM-DD

    const therapistProfiles = allEmployees;
    const scheduledToday = allSchedules.filter((s: any) => s.weekday === todayWeekday);
    const scheduledEmployeeIds = new Set(scheduledToday.map((s: any) => s.employee_id));

    const onLeaveToday = allLeaves.filter((l: any) => {
        if (l.approval_status !== "approved") return false;
        const start = new Date(l.start_dateTime);
        const end = new Date(l.end_dateTime);
        return start <= now && end >= now;
    });
    const onLeaveIds = new Set(onLeaveToday.map((l: any) => l.employee_id));

    const availableTherapists = therapistProfiles
        .filter((e: any) => scheduledEmployeeIds.has(e.employee_id) && !onLeaveIds.has(e.employee_id))
        .sort((a: any, b: any) => (a.first_name + a.last_name).localeCompare(b.first_name + b.last_name, "th"))
        .map((e: any) => ({ employee_id: e.employee_id, name: `${e.first_name} ${e.last_name}` }));

    // ─── 6. Revenue By Day (Line Chart) ──────────────────────────────────
    const revenueByDayMap: Record<string, number> = {};
    for (const p of completedPayments) {
        const booking = allBookings.find((b: any) => b.booking_id === p.booking_id);
        if (!booking) continue;
        const dateKey = new Date(booking.booking_dateTime).toLocaleDateString("en-CA");
        revenueByDayMap[dateKey] = (revenueByDayMap[dateKey] ?? 0) + Number(p.amount ?? 0);
    }
    const revenueByDay = Object.entries(revenueByDayMap)
        .map(([date, revenue]) => ({ date, revenue }))
        .sort((a, b) => a.date.localeCompare(b.date));

    // ─── 7. Popular Services (Bar Chart) ─────────────────────────────────
    const serviceCountMap: Record<number, number> = {};
    for (const d of filteredDetails) {
        if (d.massage_id) {
            serviceCountMap[d.massage_id] = (serviceCountMap[d.massage_id] ?? 0) + 1;
        }
    }
    const popularServices = Object.entries(serviceCountMap)
        .map(([massageId, count]) => {
            const m = allMassages.find((m: any) => m.massage_id === Number(massageId));
            return { name: m?.massage_name ?? `#${massageId}`, count };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    // ─── 8. Peak Hours (Bar Chart) ───────────────────────────────────────
    const hourCountMap: Record<number, number> = {};
    for (const d of filteredDetails) {
        const hour = new Date(d.massage_start_dateTime).getHours();
        hourCountMap[hour] = (hourCountMap[hour] ?? 0) + 1;
    }
    const peakHours = Array.from({ length: 15 }, (_, i) => i + 7).map((h) => ({
        hour: `${String(h).padStart(2, "0")}:00`,
        count: hourCountMap[h] ?? 0,
    }));

    // ─── 9. Room Usage Rate ──────────────────────────────────────────────
    const roomUsage = allRooms.map((room: any) => {
        const roomDetails = filteredDetails.filter((d: any) => d.room_id === room.room_id);
        const totalMinutes = roomDetails.reduce((sum: number, d: any) => {
            const start = new Date(d.massage_start_dateTime);
            const end = new Date(d.massage_end_dateTime);
            return sum + (end.getTime() - start.getTime()) / 60000;
        }, 0);
        // Assume 10 hours operating per day, multiply by number of days in range
        const dayCount = Math.max(1, Math.ceil((toDate.getTime() - fromDate.getTime()) / 86400000));
        const maxMinutes = dayCount * 600; // 10 hours * 60 min
        const rate = maxMinutes > 0 ? Math.min(100, Math.round((totalMinutes / maxMinutes) * 100)) : 0;
        return { name: room.room_name, rate };
    });

    // ─── 10. Therapist Utilization Rate ──────────────────────────────────
    const therapistUtilization = allEmployees.map((emp: any) => {
        const empDetails = filteredDetails.filter((d: any) => d.employee_id === emp.employee_id);
        const totalMinutes = empDetails.reduce((sum: number, d: any) => {
            const start = new Date(d.massage_start_dateTime);
            const end = new Date(d.massage_end_dateTime);
            return sum + (end.getTime() - start.getTime()) / 60000;
        }, 0);
        const dayCount = Math.max(1, Math.ceil((toDate.getTime() - fromDate.getTime()) / 86400000));
        const maxMinutes = dayCount * 480; // 8 hours * 60 min
        const rate = maxMinutes > 0 ? Math.min(100, Math.round((totalMinutes / maxMinutes) * 100)) : 0;
        return { name: `${emp.first_name} ${emp.last_name}`, rate };
    }).sort((a: any, b: any) => b.rate - a.rate);

    // ─── 11. Coupon Redemption Rate ──────────────────────────────────────
    const totalCoupons = allMemberCoupons.length;
    const usedCoupons = allMemberCoupons.filter((c: any) => c.is_used).length;
    const couponRedemptionRate = totalCoupons > 0 ? Math.round((usedCoupons / totalCoupons) * 100) : 0;

    // ─── 12. Package Sales vs. Usage ─────────────────────────────────────
    const packageSalesUsage = allPackages.map((pkg: any) => {
        const pkgDetailIds = allPackageDetails
            .filter((pd: any) => pd.package_id === pkg.package_id)
            .map((pd: any) => pd.package_detail_id);
        const sold = allMemberPackages.filter((mp: any) => pkgDetailIds.includes(mp.package_detail_id)).length;
        const used = allMemberPackages.filter((mp: any) => pkgDetailIds.includes(mp.package_detail_id) && mp.is_used).length;
        return { name: pkg.package_name, sold, used };
    });

    // ─── 13. Therapist Status Board ──────────────────────────────────────
    const todayStart = new Date(`${todayStr}T00:00:00+07:00`);
    const todayEnd = new Date(`${todayStr}T23:59:59+07:00`);

    const therapistStatus = allEmployees.map((emp: any) => {
        // Check if on leave today
        const isOnLeave = onLeaveIds.has(emp.employee_id);
        // Check if currently in a booking
        const currentBooking = allDetails.find((d: any) => {
            if (d.employee_id !== emp.employee_id) return false;
            const start = new Date(d.massage_start_dateTime);
            const end = new Date(d.massage_end_dateTime);
            return start <= now && end >= now;
        });
        // Check if scheduled today
        const isScheduled = scheduledEmployeeIds.has(emp.employee_id);

        let status: "on_leave" | "in_service" | "available" | "off_duty" = "off_duty";
        if (isOnLeave) status = "on_leave";
        else if (currentBooking) status = "in_service";
        else if (isScheduled) status = "available";

        return {
            employee_id: emp.employee_id,
            name: `${emp.first_name} ${emp.last_name}`,
            status,
            currentService: currentBooking
                ? allMassages.find((m: any) => m.massage_id === currentBooking.massage_id)?.massage_name ?? null
                : null,
            serviceEndTime: currentBooking?.massage_end_dateTime ?? null,
        };
    }).sort((a: any, b: any) => {
        const order: Record<string, number> = { in_service: 0, available: 1, on_leave: 2, off_duty: 3 };
        return (order[a.status] ?? 4) - (order[b.status] ?? 4);
    });

    // ─── 14. Room Status Board ───────────────────────────────────────────
    const roomStatus = allRooms.map((room: any) => {
        const currentBooking = allDetails.find((d: any) => {
            if (d.room_id !== room.room_id) return false;
            const start = new Date(d.massage_start_dateTime);
            const end = new Date(d.massage_end_dateTime);
            return start <= now && end >= now;
        });

        return {
            room_id: room.room_id,
            name: room.room_name,
            status: currentBooking ? "occupied" as const : "available" as const,
            currentService: currentBooking
                ? allMassages.find((m: any) => m.massage_id === currentBooking.massage_id)?.massage_name ?? null
                : null,
            serviceEndTime: currentBooking?.massage_end_dateTime ?? null,
            therapistName: currentBooking
                ? (() => {
                    const emp = allEmployees.find((e: any) => e.employee_id === currentBooking.employee_id);
                    return emp ? `${emp.first_name} ${emp.last_name}` : null;
                })()
                : null,
        };
    });

    // ─── Response ────────────────────────────────────────────────────────
    return NextResponse.json({
        success: true,
        data: {
            // KPIs
            totalRevenue,
            totalBookings,
            newCustomersThisMonth,
            newCustomersLastMonth,
            avgTransactionValue,
            availableTherapists,
            // Charts
            revenueByDay,
            popularServices,
            peakHours,
            roomUsage,
            therapistUtilization,
            couponRedemption: { total: totalCoupons, used: usedCoupons, rate: couponRedemptionRate },
            packageSalesUsage,
            // Status Boards
            therapistStatus,
            roomStatus,
        },
    }, { status: 200 });
}
