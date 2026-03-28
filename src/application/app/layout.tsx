import type { Metadata } from "next";
import { Geist, Mitr, Sarabun } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: "ฟื้นใจ | Wellness Massage",
    template: "%s | ฟื้นใจ",
  },
  description: "ระบบจองคิวนวดออนไลน์ - Fuen Jai Wellness Massage Booking System",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

const mitr = Mitr({
  variable: "--font-mitr",
  weight: ["200", "300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  display: "swap",
});

const sarabun = Sarabun({
  variable: "--font-sarabun",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
  subsets: ["thai", "latin"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${mitr.variable} ${sarabun.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <div id="app-root" className="min-h-screen print:min-h-0 flex flex-col bg-background text-foreground font-sans selection:bg-primary/30">
            <Nav />
            {children}
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
