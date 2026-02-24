import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Award, Heart, Users } from "lucide-react";

export function About() {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl mb-6">เกี่ยวกับ Feun-Jai (ฟื้นใจ)</h2>
            <p className="text-lg text-gray-600 mb-6">
              เรามีประสบการณ์กว่า 15 ปีในการให้บริการนวดและสปาคุณภาพสูง 
              ในบรรยากาศที่สงบและอบอุ่น ทีมนักนวดมืออาชีพของเราได้รับการรับรอง 
              พร้อมมอบความเชี่ยวชาญ ความใส่ใจ และการดูแลเฉพาะบุคคลในทุกเซสชั่น
            </p>
            <p className="text-lg text-gray-600 mb-8">
              เราเชื่อในพลังแห่งการบำบัดด้วยการสัมผัส และมุ่งมั่นที่จะช่วยให้คุณได้รับสุขภาพที่ดีที่สุด 
              ผ่านบริการนวดและสปาครบวงจรของเรา
            </p>
            
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-3">
                  <Award className="w-8 h-8 text-emerald-600" />
                </div>
                <div className="text-2xl font-semibold mb-1">15+</div>
                <div className="text-sm text-gray-600">ปีประสบการณ์</div>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-3">
                  <Users className="w-8 h-8 text-emerald-600" />
                </div>
                <div className="text-2xl font-semibold mb-1">10K+</div>
                <div className="text-sm text-gray-600">ลูกค้าพึงพอใจ</div>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-3">
                  <Heart className="w-8 h-8 text-emerald-600" />
                </div>
                <div className="text-2xl font-semibold mb-1">100%</div>
                <div className="text-sm text-gray-600">ความพึงพอใจ</div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden shadow-xl">
              <ImageWithFallback 
                src="https://images.unsplash.com/photo-1769253523308-f7bff35c60b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGElMjBpbnRlcmlvciUyMHBlYWNlZnVsfGVufDF8fHx8MTc3MTg2NzUyOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Peaceful spa interior"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}