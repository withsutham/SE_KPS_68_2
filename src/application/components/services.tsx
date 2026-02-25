import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Clock, DollarSign, ChevronLeft, ChevronRight, Search, Sparkles, Flame, Droplets, Dumbbell, Baby, Footprints, Flower, Heart, Armchair, X } from "lucide-react";
import { useRef, useState } from "react";

interface Service {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: string;
  priceRange: number;
  image: string;
  iconName: string;
  category: string;
}

// Icon mapping
export const iconMap: Record<string, any> = {
  sparkles: Sparkles,
  flame: Flame,
  droplets: Droplets,
  dumbbell: Dumbbell,
  baby: Baby,
  footprints: Footprints,
  flower: Flower,
  heart: Heart,
  armchair: Armchair,
};

export const services: Service[] = [
  {
    id: "swedish",
    name: "นวดสวีดิช",
    description: "การนวดผ่อนคลายด้วยแรงกดอย่างอ่อนโยน ใช้เทคนิคการลูบคลึงยาว บีบนวดกล้ามเนื้อ และการเคลื่อนไหวแบบวงกลมเพื่อช่วยให้คุณผ่อนคลายและมีพลังงาน",
    duration: "60-90 นาที",
    price: "฿2,400-฿3,600",
    priceRange: 3000,
    image: "https://images.unsplash.com/photo-1673974943582-771d2b7ee30d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzd2VkaXNoJTIwbWFzc2FnZSUyMHJlbGF4YXRpb258ZW58MXx8fHwxNzcxODY3NTI5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    iconName: "sparkles",
    category: "ผ่อนคลาย"
  },
  {
    id: "deep-tissue",
    name: "นวดเนื้อเยื่อชั้นลึก",
    description: "เจาะลึกถึงปมกล้ามเนื้อและความตึงเครียดเรื้อรัง ใช้แรงกดช้าและแรงมากกว่าเพื่อเข้าถึงชั้นกล้ามเนื้อและเนื้อเยื่อเกี่ยวพันชั้นลึก",
    duration: "60-90 นาที",
    price: "฿2,700-฿3,900",
    priceRange: 3300,
    image: "https://images.unsplash.com/photo-1700882304335-34d47c682a4c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZWVwJTIwdGlzc3VlJTIwbWFzc2FnZSUyMHRoZXJhcHl8ZW58MXx8fHwxNzcxODUwNzI4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    iconName: "flame",
    category: "บำบัด"
  },
  {
    id: "hot-stone",
    name: "นวดด้วยหินร้อน",
    description: "ใช้หินที่ถูกอุ่นวางบนจุดต่างๆ ของร่างกายเพื่อคลายกล้ามเนื้อที่ตึงและปรับสมดุลพลังงาน",
    duration: "75-90 นาที",
    price: "฿3,000-฿4,200",
    priceRange: 3600,
    image: "https://images.unsplash.com/photo-1578413142862-c10be6467b8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXNzYWdlJTIwc3RvbmVzJTIwd2VsbG5lc3N8ZW58MXx8fHwxNzcxODY3NTI4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    iconName: "flame",
    category: "บำบัด"
  },
  {
    id: "aromatherapy",
    name: "นวดอโรมาเธอราพี",
    description: "ผสมผสานการนวดอย่างอ่อนโยนกับน้ำมันหอมระเหยเพื่อเสริมสร้างการผ่อนคลายและส่งเสริมการรักษาทางอารมณ์และความเป็นอยู่ที่ดี",
    duration: "60-90 นาที",
    price: "฿2,550-฿3,750",
    priceRange: 3150,
    image: "https://images.unsplash.com/photo-1537035448858-6d703dbc320f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcm9tYXRoZXJhcHklMjBlc3NlbnRpYWwlMjBvaWxzfGVufDF8fHx8MTc3MTc2OTI5Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    iconName: "droplets",
    category: "ผ่อนคลาย"
  },
  {
    id: "sports",
    name: "นวดสปอร์ต",
    description: "ออกแบบมาสำหรับนักกีฬาและผู้ที่ออกกำลังกายเป็นประจำ มุ่งเน้นการป้องกันและรักษาการบาดเจ็บพร้อมเพิ่มประสิทธิภาพการกีฬา",
    duration: "60-75 นาที",
    price: "฿2,850-฿4,050",
    priceRange: 3450,
    image: "https://images.unsplash.com/photo-1649751361457-01d3a696c7e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBtYXNzYWdlJTIwYXRobGV0aWN8ZW58MXx8fHwxNzcxODY5MDQ2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    iconName: "dumbbell",
    category: "บำบัด"
  },
  {
    id: "prenatal",
    name: "นวดสำหรับคุณแม่ตั้งครรภ์",
    description: "การนวดที่ปรับเปลี่ยนเป็นพิเศษสำหรับคุณแม่ตั้งครรภ์เพื่อบรรเทาอาการไม่สบายจากการตั้งครรภ์และลดความเครียดอย่างปลอดภัย",
    duration: "60 นาที",
    price: "฿2,700-฿3,600",
    priceRange: 3150,
    image: "https://images.unsplash.com/photo-1512291505839-65ba15729a48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVuYXRhbCUyMHByZWduYW5jeSUyMG1hc3NhZ2V8ZW58MXx8fHwxNzcxODY5MDQ2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    iconName: "baby",
    category: "พิเศษ"
  },
  {
    id: "reflexology",
    name: "นวดกดจุด (รีเฟล็กซอโลยี)",
    description: "กดจุดเฉพาะที่เท้า มือ และหูเพื่อส่งเสริมการรักษาและการผ่อนคลายทั่วร่างกาย",
    duration: "45-60 นาที",
    price: "฿2,100-฿3,000",
    priceRange: 2550,
    image: "https://images.unsplash.com/photo-1741932796580-9489cd8c5ac3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWZsZXhvbG9neSUyMGZvb3QlMjBtYXNzYWdlfGVufDF8fHx8MTc3MTg2OTA0Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    iconName: "footprints",
    category: "พิเศษ"
  },
  {
    id: "thai",
    name: "นวดไทย",
    description: "ระบบการรักษาโบราณที่ผสมผสานการกดจุด หลักการอายุรเวทของอินเดีย และท่าโยคะที่ช่วยเหลือเพื่อการผ่อนคลายอย่างลึกซึ้ง",
    duration: "90-120 นาที",
    price: "฿3,300-฿4,800",
    priceRange: 4050,
    image: "https://images.unsplash.com/photo-1664071186356-4276ad9a022a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGFpJTIwbWFzc2FnZSUyMHN0cmV0Y2hpbmd8ZW58MXx8fHwxNzcxODY5MDQ3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    iconName: "flower",
    category: "พิเศษ"
  },
  {
    id: "couples",
    name: "นวดคู่รัก",
    description: "แบ่งปันประสบการณ์การผ่อนคลายกับคู่ของคุณในห้องส่วนตัวพร้อมนักนวดสองคนทำงานพร้อมกัน",
    duration: "60-90 นาที",
    price: "฿4,800-฿7,200",
    priceRange: 6000,
    image: "https://images.unsplash.com/photo-1758524940893-9cff35800aed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VwbGVzJTIwbWFzc2FnZSUyMHJvbWFudGljfGVufDF8fHx8MTc3MTg2OTA0N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    iconName: "heart",
    category: "พิเศษ"
  },
  {
    id: "chair",
    name: "นวดนั่ง",
    description: "การนวดแบบนั่งรวดเร็วและสะดวก เน้นที่หลัง ไหล่ คอ และแขน - เหมาะสำหรับการคลายเครียดขณะเดินทาง",
    duration: "15-30 นาที",
    price: "฿900-฿1,500",
    priceRange: 1200,
    image: "https://images.unsplash.com/photo-1745327883508-b6cd32e5dde5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGElMjBtYXNzYWdlJTIwdGhlcmFweSUyMHJlbGF4aW5nfGVufDF8fHx8MTc3MTg2NzUyN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    iconName: "armchair",
    category: "ด่วน"
  }
];

const categories = ["ทั้งหมด", "ผ่อนคลาย", "บำบัด", "พิเศษ", "ด่วน"];
const priceFilters = [
  { label: "ทุกราคา", min: 0, max: Infinity },
  { label: "ต่ำกว่า ฿3,000", min: 0, max: 3000 },
  { label: "฿3,000-฿4,500", min: 3000, max: 4500 },
  { label: "฿4,500+", min: 4500, max: Infinity },
];

interface ServicesProps {
  onBookService: (serviceId: string) => void;
}

export function Services({ onBookService }: ServicesProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");
  const [selectedPriceFilter, setSelectedPriceFilter] = useState(0);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      const newScrollPosition = scrollContainerRef.current.scrollLeft + 
        (direction === 'left' ? -scrollAmount : scrollAmount);
      
      scrollContainerRef.current.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      });
    }
  };

  // Filter services based on search and filters
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "ทั้งหมด" || service.category === selectedCategory;
    const priceFilter = priceFilters[selectedPriceFilter];
    const matchesPrice = service.priceRange >= priceFilter.min && service.priceRange <= priceFilter.max;
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const hasActiveFilters = searchQuery || selectedCategory !== "ทั้งหมด" || selectedPriceFilter !== 0;

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("ทั้งหมด");
    setSelectedPriceFilter(0);
  };

  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl mb-4">บริการของเรา</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            เลือกจากบริการนวดมืออาชีพของเราที่ออกแบบมาเพื่อฟื้นฟูร่างกายและจิตใจของคุณ
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="ค้นหาบริการ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? "bg-emerald-600 hover:bg-emerald-700" : ""}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Price Filters */}
          <div className="flex flex-wrap justify-center gap-2">
            {priceFilters.map((filter, index) => (
              <Button
                key={filter.label}
                variant={selectedPriceFilter === index ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPriceFilter(index)}
                className={selectedPriceFilter === index ? "bg-emerald-600 hover:bg-emerald-700" : ""}
              >
                {filter.label}
              </Button>
            ))}
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-emerald-600 hover:text-emerald-700"
              >
                ล้างตัวกรองทั้งหมด
              </Button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-600">
            แสดง {filteredServices.length} บริการ
          </p>
        </div>
        
        <div className="relative">
          {/* Scroll buttons */}
          {filteredServices.length > 2 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg hover:bg-gray-100 rounded-full w-12 h-12 hidden md:flex"
                onClick={() => scroll('left')}
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg hover:bg-gray-100 rounded-full w-12 h-12 hidden md:flex"
                onClick={() => scroll('right')}
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </>
          )}

          {/* Scrollable container */}
          {filteredServices.length > 0 ? (
            <div 
              ref={scrollContainerRef}
              className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {filteredServices.map((service) => {
                const ServiceIcon = iconMap[service.iconName];
                return (
                  <Card 
                    key={service.id} 
                    className="flex-shrink-0 w-[350px] overflow-hidden hover:shadow-lg transition-shadow snap-start"
                  >
                    <div className="relative h-56">
                      <ImageWithFallback 
                        src={service.image}
                        alt={service.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2">
                        <ServiceIcon className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div className="absolute top-4 left-4 bg-emerald-600 text-white text-xs px-3 py-1 rounded-full">
                        {service.category}
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-2xl mb-3">{service.name}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-3">{service.description}</p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Clock className="w-5 h-5" />
                          <span>{service.duration}</span>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-600">
                          <DollarSign className="w-5 h-5" />
                          <span className="font-semibold">{service.price}</span>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={() => onBookService(service.id)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                      >
                        จองบริการนี้
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">ไม่พบบริการที่ตรงกับเกณฑ์ของคุณ</p>
              <Button onClick={clearFilters} variant="outline">
                ล้างตัวกรอง
              </Button>
            </div>
          )}
        </div>

        {/* Mobile scroll indicator */}
        {filteredServices.length > 1 && (
          <p className="text-center text-sm text-gray-500 mt-4 md:hidden">
            เลื่อนเพื่อดูบริการเพิ่มเติม →
          </p>
        )}
      </div>
    </section>
  );
}