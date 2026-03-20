import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Carousel } from "./Carousel";
import { useGetBrandsQuery } from "../../lib/api";

interface HomeViewProps {
  onBrandSelect: (brandId: string) => void;
}

// Default images for specific brands to make the Home page look premium
const BRAND_IMAGES: Record<string, string> = {
  uniqlo: "https://images.unsplash.com/photo-1571867424488-4565932edb41?auto=format&fit=crop&q=80&w=800",
  zara: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=800",
  "h&m": "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=800",
  gentlewoman: "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&q=80&w=800",
  default: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800",
};

export const HomeView = ({ onBrandSelect }: HomeViewProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: brands = [], isLoading: isLoadingBrands } = useGetBrandsQuery();

  return (
    <main className="pb-32 animate-in fade-in duration-1000">
      <Carousel />

      <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 mt-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="space-y-4">
            <p className="text-[10px] tracking-[0.5em] uppercase text-pink-500 font-bold">
              Our Collections
            </p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
              {t("featuredBrands")}
            </h2>
          </div>
          <div className="gradient-separator flex-grow hidden md:block mb-4 mx-12"></div>
          <button 
            onClick={() => navigate("/shop")}
            className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 hover:text-slate-900 transition-colors border-b border-transparent hover:border-slate-900 pb-1 h-fit"
          >
            {t("shop")} All
          </button>
        </div>

        {isLoadingBrands ? (
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {brands.slice(0, 8).map((brand) => (
              <div
                key={brand.id}
                className="group relative h-[220px] sm:h-[280px] lg:h-[320px] rounded-3xl sm:rounded-[2.5rem] overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-700 hover:-translate-y-1"
                onClick={() => onBrandSelect(brand.id)}
              >
                <img
                  src={brand.logo_url || BRAND_IMAGES[brand.name.toLowerCase()] || BRAND_IMAGES.default}
                  alt={brand.name}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                
                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-700" />
                <div className="absolute inset-0 bg-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                <div className="absolute inset-0 p-6 sm:p-8 lg:p-10 flex flex-col justify-end items-center text-center">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700 ease-out">
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white mb-2 sm:mb-3 tracking-tighter drop-shadow-md">
                      {brand.name}
                    </h3>
                    <div className="w-8 h-1 bg-white mx-auto rounded-full mb-4 sm:mb-6 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 delay-100" />
                    
                    <span className="inline-block opacity-0 group-hover:opacity-100 transition-all duration-700 delay-200 text-white text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] border-b border-white pb-1">
                      {t("seeDetail")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </main>
  );
};
