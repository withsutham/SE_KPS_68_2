"use client";

import Link from "next/link";
import { HandPlatter } from "lucide-react";

import { Button } from "@/components/ui/button";
import ListMassage from "@/components/massage/ListMassage";

export default function ManagerMassagePage() {
  return (
    <main className="relative flex-1 w-full font-mitr">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-32 -top-28 h-[420px] w-[420px] rounded-full bg-primary/6 blur-3xl" />
        <div className="absolute bottom-0 left-[-12rem] h-[360px] w-[360px] rounded-full bg-secondary/40 blur-3xl" />
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-8 md:py-10">
        <header className="flex flex-col gap-4">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10">
              <HandPlatter className="h-7 w-7 text-primary" />
            </div>
            <p className="mb-2 font-sans text-xs font-medium uppercase tracking-[0.32em] text-primary/60">
              ผู้จัดการ · Manager
            </p>
            <h1 className="text-3xl text-foreground md:text-4xl">จัดการบริการนวด</h1>
            <p className="mx-auto mt-3 max-w-2xl font-sans text-sm text-muted-foreground md:text-base">
              จัดการรายการบริการนวด รูปภาพ ราคา และเวลาในธีมเดียวกับแดชบอร์ดผู้จัดการ
            </p>
          </div>

          <div className="flex justify-center">
            <Link href="/manager/massage/create">
              <Button className="rounded-full px-5 font-sans">+ สร้างบริการนวดใหม่</Button>
            </Link>
          </div>
        </header>

        <ListMassage />
      </div>
    </main>
  );
}
