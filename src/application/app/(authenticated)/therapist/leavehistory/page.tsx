import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { getEmployeeByUserId, getLeaveRecordsByEmployeeId } from '@/components/therapist/employee_actions';
import LeaveHistoryClient from '@/components/therapist/LeaveHistory';

export default async function LeaveHistoryPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let records: any[] = [];
    if (user) {
        const emp = await getEmployeeByUserId(user.id);
        if (emp) {
            records = await getLeaveRecordsByEmployeeId(emp.employee_id);
        }
    }

    return <LeaveHistoryClient initialRecords={records} />;
}
