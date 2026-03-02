"use client";

import { useEffect, useState } from "react";

export function CurrentYear() {
    const [year, setYear] = useState<number | string>("");

    useEffect(() => {
        setYear(new Date().getFullYear());
    }, []);

    return <>{year || "2026"}</>;
}
