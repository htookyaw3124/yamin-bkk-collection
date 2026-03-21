import { Check } from "lucide-react";
import type { Product, Lang } from "../../../types";

interface Props {
  product: Product;
  lang: Lang;
  selectedVariantId: string | null;
  onVariantSelect: (variantId: string) => void;
}

export const VariantGrid = ({ product, lang, selectedVariantId, onVariantSelect }: Props) => {
  const isMM = lang === "mm";

  if (!product.variants || product.variants.length === 0) return null;

  return (
    <div className="space-y-6 pt-8 border-t border-slate-100/60">
      <p className="text-[9px] tracking-[0.3em] uppercase text-slate-400 font-black">
        {isMM ? "ရရှိ နိုင်သည့် အမျိုးအစား" : "Available Variants"}
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {product.variants.map((variant) => {
          const isSelected = variant.id === selectedVariantId;
          const inStock = variant.stock > 0;
          const variantName = isMM ? variant.name_mm : variant.name_en;
          const variantSku = variant.sku;
          const displayPrice = Number(variant.priceOverride ?? product.price);

          return (
            <button
              key={variant.id}
              onClick={() => onVariantSelect(variant.id)}
              disabled={!inStock}
              className={`relative p-5 rounded-3xl border transition-all duration-500 group text-left ${
                isSelected
                  ? "border-slate-900 bg-slate-900 text-white shadow-2xl scale-[1.02] z-10"
                  : inStock
                    ? "border-slate-100 bg-white hover:border-slate-900/10 hover:shadow-xl hover:-translate-y-1"
                    : "border-slate-50 bg-slate-50/50 opacity-40 cursor-not-allowed"
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-white text-slate-900 rounded-full flex items-center justify-center shadow-md animate-in zoom-in duration-300">
                  <Check size={12} strokeWidth={3} />
                </div>
              )}

              <div className="space-y-2">
                <div className="flex flex-col gap-0.5 min-h-[40px]">
                  <p className={`text-xs font-bold leading-tight ${isSelected ? "text-white" : "text-slate-900"}`}>
                    {variantName}
                  </p>
                  <p className={`text-[8px] tracking-wide font-medium ${isSelected ? "text-white/60" : "text-slate-400"}`}>
                    {variantSku}
                  </p>
                </div>

                {variant.options && variant.options.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {variant.options.slice(0, 3).map((option, idx) => (
                      <span
                        key={idx}
                        className={`text-[8px] px-2 py-0.5 rounded-full flex items-center gap-1.5 ${
                          isSelected ? "bg-white/10 text-white" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {option.color && (
                          <span
                            className={`w-2 h-2 rounded-full border shadow-sm ${
                              isSelected ? "border-white/20" : "border-slate-200/50"
                            }`}
                            style={{ backgroundColor: option.color }}
                          />
                        )}
                        {(isMM ? option.value_mm : option.value_en).substring(0, 5)}
                      </span>
                    ))}
                  </div>
                )}

                <div className={`flex items-center justify-between pt-2 border-t mt-1 ${isSelected ? "border-white/10" : "border-slate-100"}`}>
                  <p className={`text-xs font-black ${isSelected ? "text-white" : "text-slate-900"}`}>
                    {displayPrice.toLocaleString()} {isMM ? "ကျပ်" : "MMK"}
                  </p>
                  <p className={`text-[9px] font-bold ${isSelected ? "text-white/80" : (inStock ? "text-emerald-500" : "text-slate-300")}`}>
                    {inStock ? `${variant.stock}` : "Out"}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
