import React from 'react';
// แก้ไข path ให้ตรงกับตำแหน่งที่คุณนำไฟล์ Leave.tsx ไปวาง
import Leave from '@/components/therapist/Leave';

export default function LeavePage() {
    return (
        <main>
            {/* คุณสามารถเพิ่ม layout wrapper หรือ title ของหน้านี้ได้ที่นี่ */}
            <Leave />
        </main>
    );
}