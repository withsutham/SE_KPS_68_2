import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface HeroProps {
  onBookNowClick: () => void;
}

export function Hero({ onBookNowClick }: HeroProps) {
  return (
    <section id="home" className="relative h-screen flex items-center justify-center">
      <div className="absolute inset-0 z-0">
        <ImageWithFallback 
          src="https://images.unsplash.com/photo-1745327883508-b6cd32e5dde5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGElMjBtYXNzYWdlJTIwdGhlcmFweSUyMHJlbGF4aW5nfGVufDF8fHx8MTc3MTg2NzUyN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Relaxing spa massage therapy"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <h1 className="text-5xl sm:text-6xl md:text-7xl mb-6">
          เริ่มต้นการเดินทางสู่สุขภาพที่ดี
        </h1>
        <p className="text-xl sm:text-2xl mb-8 text-gray-200">
          สัมผัสการผ่อนคลายสุดพรีเมียมกับบริการนวดและสปาของเรา
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg"
            onClick={onBookNowClick}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-lg px-8 py-6"
          >
            จองเวลาของคุณ
          </Button>
          <Button 
            size="lg"
            variant="outline"
            className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-white text-lg px-8 py-6"
            onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
          >
            ดูบริการ
          </Button>
        </div>
      </div>
    </section>
  );
}