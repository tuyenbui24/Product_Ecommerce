import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { listHomeProducts, getAllCategories } from "@/api/productApi";
import ProductCard from "@/components/product/ProductCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import "swiper/css";
import BannerSlider from "@pages/Home/BannerSlider";
import test from "@assets/test.webp";

function normalize(str = "") {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export default function Home() {
  const [homeData, setHomeData] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const [homeRes, cateRes] = await Promise.all([
          listHomeProducts(10),
          getAllCategories(),
        ]);
        setHomeData(homeRes?.data || {});
        setCategories(Array.isArray(cateRes?.data) ? cateRes.data : []);
      } catch (err) {
        console.error("Fetch home data failed:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const categoryMap = useMemo(() => {
    const map = new Map();
    categories.forEach((c) => {
      const key = normalize(c?.name || c?.slug || "");
      map.set(key, c.id);
    });
    return map;
  }, [categories]);

  if (loading)
    return <div className="p-6 text-center text-gray-500">Đang tải...</div>;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 space-y-6 sm:space-y-8">
      <div className="max-w-[1050px] mx-auto">
        <BannerSlider />
      </div>

      {Object.entries(homeData).map(([catName, products]) => {
        const normalized = normalize(catName);
        const catId = categoryMap.get(normalized);
        if (!catId || !products?.length) return null;

        return (
          <section key={catId} className="space-y-3 sm:space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-indigo-900">
                {catName}
              </h2>
              <Link
                to={`/category/${catId}?page=1&size=12`}
                className="text-sm sm:text-base text-indigo-600 hover:underline"
              >
                Xem thêm &gt;
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <div
                onClick={() => navigate(`/category/${catId}?page=1&size=12`)}
                className="cursor-pointer w-full sm:w-[140px] md:w-[160px] rounded-lg overflow-hidden relative group flex-shrink-0"
              >
                <img
                  src={test}
                  alt={catName}
                  className="w-full h-[160px] sm:h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <div className="flex-1 min-w-0">
                <Swiper
                  modules={[FreeMode]}
                  freeMode={{
                    enabled: true,
                    momentum: true,
                    momentumRatio: 1.2,
                  }}
                  speed={700}
                  grabCursor={true}
                  spaceBetween={12}
                  slidesPerView="auto"
                  breakpoints={{
                    0: { spaceBetween: 12 },
                    640: { spaceBetween: 16 },
                    768: { spaceBetween: 20 },
                    1024: { spaceBetween: 30 },
                  }}
                  className="overflow-visible px-1 select-none"
                >
                  {products.map((p) => (
                    <SwiperSlide
                      key={p.id}
                      className="!w-[160px] sm:!w-[200px] md:!w-[220px]"
                    >
                      <ProductCard p={p} showAddButton />
                    </SwiperSlide>
                  ))}
                  <SwiperSlide className="!w-[12px]" />
                </Swiper>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
