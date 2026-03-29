import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { getEmployeeByUserId, getLeaveRecordsByEmployeeId } from '@/components/therapist/employee_actions';
import DashboardClient from '@/components/therapist/Dashboard';

export default async function HRDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let employee = null;
  let allLeaves: any[] = [];
  let recentLeaves: any[] = [];

  if (user) {
    employee = await getEmployeeByUserId(user.id);
    
    if (employee) {
      allLeaves = await getLeaveRecordsByEmployeeId(employee.employee_id);
      recentLeaves = allLeaves.slice(0, 2);
    }
  }

  return (
    <DashboardClient 
      employee={employee} 
      allLeaves={allLeaves} 
      recentLeaves={recentLeaves} 
    />
  );
}
