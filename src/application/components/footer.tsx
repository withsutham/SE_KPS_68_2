import { Sparkles, MapPin, Phone, Mail, Clock } from "lucide-react";

export function Footer() {
  return (
    <footer id="contact" className="bg-gray-900 text-gray-300 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-emerald-500" />
              <span className="text-2xl font-semibold text-white">Feun-Jai (ฟื้นใจ)</span>
            </div>
            <p className="text-gray-400">
              สถานที่พักผ่อนและฟื้นฟูสุขภาพของคุณในใจกลางเมือง
            </p>
          </div>
          
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">ลิงก์ด่วน</h3>
            <ul className="space-y-2">
              <li><a href="#home" className="hover:text-emerald-500 transition-colors">หน้าแรก</a></li>
              <li><a href="#services" className="hover:text-emerald-500 transition-colors">บริการ</a></li>
              <li><a href="#about" className="hover:text-emerald-500 transition-colors">เกี่ยวกับ</a></li>
              <li><a href="#contact" className="hover:text-emerald-500 transition-colors">ติดต่อ</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">บริการ</h3>
            <ul className="space-y-2">
              <li className="hover:text-emerald-500 transition-colors cursor-pointer">นวดสวีดิช</li>
              <li className="hover:text-emerald-500 transition-colors cursor-pointer">นวดเนื้อเยื่อชั้นลึก</li>
              <li className="hover:text-emerald-500 transition-colors cursor-pointer">นวดด้วยหินร้อน</li>
              <li className="hover:text-emerald-500 transition-colors cursor-pointer">นวดอโรมาเธอราพี</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">ติดต่อเรา</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>123 ถนนสุขภาพดี<br />กรุงเทพมหานคร 10110</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span>02-123-4567</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span>info@feunjai.com</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>จันทร์-อาทิตย์: 09.00-20.00 น.</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>&copy; 2026 Feun-Jai (ฟื้นใจ). สงวนลิขสิทธิ์</p>
        </div>
      </div>
    </footer>
  );
}