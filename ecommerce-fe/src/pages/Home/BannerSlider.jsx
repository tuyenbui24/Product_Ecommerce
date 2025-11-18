import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import banner1 from "@assets/banners/banner1.jpg";
import banner2 from "@assets/banners/banner2.jpg";
import banner3 from "@assets/banners/banner3.jpg";
import banner4 from "@assets/banners/banner4.jpg";
import banner5 from "@assets/banners/banner5.jpg";

const banners = [banner1, banner2, banner3, banner4, banner5];

export default function BannerSlider() {
  return (
    <div className="w-full mx-auto mt-3 mb-6 rounded-xl overflow-hidden shadow-md relative">
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        loop={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        navigation={true}
        pagination={{ clickable: true }}
        spaceBetween={20}
        slidesPerView={2}
        slidesPerGroup={1}
        grabCursor
        effect="slide"
        speed={800}
        centeredSlides={false}
        className="relative h-[180px] sm:h-[240px] md:h-[300px] lg:h-[380px]"
        breakpoints={{
          0: { slidesPerView: 1, spaceBetween: 10 },
          640: { slidesPerView: 1.3, spaceBetween: 14 },
          768: { slidesPerView: 1.6, spaceBetween: 18 },
          1024: { slidesPerView: 2, spaceBetween: 20 },
        }}
      >
        {banners.map((img, idx) => (
          <SwiperSlide key={idx}>
            <img
              src={img}
              alt={`Banner ${idx + 1}`}
              className="w-full h-full object-cover rounded-lg transition-transform duration-300 hover:scale-[1.02]"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
