"use client";

import { useEffect } from "react";

export function ManagerChromeToggle() {
  useEffect(() => {
    document.body.classList.add("manager-shell");
    return () => {
      document.body.classList.remove("manager-shell");
    };
  }, []);

  return null;
}
