"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import ListMassage from "@/components/massage/ListMassage";

export default function ManagerMassagePage() {
    return (
        <div className="w-full min-w-0 max-w-6xl mx-auto p-8 font-mitr">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">จัดการบริการนวด</h1>
                <Link href="/manager/massage/create">
                    <Button>+ สร้างบริการนวดใหม่</Button>
                </Link>
            </div>

            <ListMassage />
        </div>
    );
}
