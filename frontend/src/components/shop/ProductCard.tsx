import { useTranslation } from "react-i18next";
import type { Product, Lang } from "../../types";
import { getBrandLabel, getCategoryLabel } from "../../utils/helpers";

interface ProductCardProps {
  product: Product;
  lang: Lang;
  onViewDetails: (productId: string) => void;
}

export const ProductCard = ({
  product,
  lang,
  onViewDetails,
}: ProductCardProps) => {
  const { t } = useTranslation();
  const isMM = lang === "mm";
  const name = isMM ? product.name_mm : product.name_en;
  const imageUrl = product.images[0]?.url ?? "";
  const displayImage = imageUrl.includes("cloudinary")
    ? imageUrl.replace("/upload/", "/upload/f_auto,q_auto,w_800/")
    : imageUrl;
  const brandLabel = getBrandLabel(product.brand);

  return (
    <div 
      className="group relative flex flex-col animate-in fade-in duration-700"
      onClick={() => onViewDetails(product.id)}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-slate-100 shadow-sm group-hover:shadow-2xl group-hover:shadow-brand/10 transition-all duration-700">
        <img
          src={displayImage}
          alt={name}
          className="h-full w-full object-cover object-center transition-transform duration-1000 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
          <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[8px] font-bold uppercase tracking-wider text-slate-700 shadow-sm w-fit">
            {getCategoryLabel(product.category)}
          </div>
          {(product.isSale || (product.originalPrice && product.originalPrice > product.price)) && (
            <div className="bg-brand text-white px-2 py-1 rounded text-[8px] font-bold uppercase tracking-wider shadow-sm w-fit animate-pulse">
              {t("sale")}
            </div>
          )}
        </div>

        {/* Quick View Button (Desktop) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 translate-x-2">
           <div className="bg-slate-900/40 backdrop-blur-md text-white px-6 py-2.5 rounded-full text-[9px] font-bold tracking-[0.2em] uppercase shadow-xl transition-colors hover:bg-slate-900">
             {t("seeDetail")}
           </div>
        </div>
      </div>

      <div className="pt-8 text-left space-y-1">
        <div className="flex items-center justify-between">
          <h3
            className={`text-slate-900 font-bold line-clamp-1 transition-colors group-hover:text-brand-hover ${
              isMM
                ? "text-lg leading-relaxed font-myanmar"
                : "text-sm tracking-tight"
            }`}
          >
            {name}
          </h3>
          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </div>
        </div>
        
        <p className="text-[10px] text-slate-400 capitalize">{brandLabel}</p>
        
        <div className="flex items-center gap-2 mt-2">
          <span className="text-lg font-bold text-slate-900 uppercase tracking-tighter">
            {product.price.toLocaleString()} MMK
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-xs text-slate-400 line-through">
              {product.originalPrice.toLocaleString()} MMK
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
