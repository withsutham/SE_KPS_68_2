import { Button } from "./ui/button";
import { Sparkles } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  onBookNowClick: () => void;
}

export function Header({ onBookNowClick }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-emerald-600" />
            <span className="text-2xl font-semibold text-gray-900">Feun-Jai (ฟื้นใจ)</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#home" className="text-gray-700 hover:text-emerald-600 transition-colors">หน้าแรก</a>
            <a href="#services" className="text-gray-700 hover:text-emerald-600 transition-colors">บริการ</a>
            <a href="#about" className="text-gray-700 hover:text-emerald-600 transition-colors">เกี่ยวกับ</a>
            <a href="#contact" className="text-gray-700 hover:text-emerald-600 transition-colors">ติดต่อ</a>
          </nav>

          <Button
            onClick={onBookNowClick}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            จองคิว
          </Button>
        </div>
      </div>
    </header>
  );
}