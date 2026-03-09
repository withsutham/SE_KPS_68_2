"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

interface NavScrollLinkProps {
    href: string;
    children: React.ReactNode;
    className?: string;
}

export function NavScrollLink({ href, children, className }: NavScrollLinkProps) {
    const pathname = usePathname();

    const handleScroll = (e: React.MouseEvent) => {
        // If we are on the homepage and the link is an anchor on the same page
        if (pathname === "/" && href.startsWith("/#")) {
            const targetId = href.replace("/#", "");
            const elem = document.getElementById(targetId);

            if (elem) {
                e.preventDefault();
                elem.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }
        }
    };

    // If we are already on the target page (home), just use a button to avoid URL changes
    if (pathname === "/" && href.startsWith("/#")) {
        return (
            <Button variant="ghost" className={className} onClick={handleScroll}>
                <span className="text-sm">{children}</span>
            </Button>
        );
    }

    return (
        <Button variant="ghost" asChild className={className}>
            <Link href={href} className="text-sm">
                {children}
            </Link>
        </Button>
    );
}
