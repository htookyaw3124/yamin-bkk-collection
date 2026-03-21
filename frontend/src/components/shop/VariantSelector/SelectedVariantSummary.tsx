import type { Product, ProductVariant, Lang } from "../../../types";

interface Props {
  product: Product;
  variant: ProductVariant;
  lang: Lang;
}

export const SelectedVariantSummary = ({ product, variant, lang }: Props) => {
  const isMM = lang === "mm";

  return (
    <div className="mt-6 pt-6 border-t border-slate-100 animate-in slide-in-from-top-4 duration-500">
      <div className="p-6 md:p-8 bg-brand text-white rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 to-rose-500/30 opacity-50 blur-2xl transition-opacity duration-700 translate-x-1/2 translate-y-1/2" />
        
        <div className="relative z-10 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] tracking-[0.4em] uppercase text-white/40 font-black mb-2">
                {isMM ? "ရွေးချယ်ထားသည့်" : "Selected Model"}
              </p>
              <h3 className="text-xl md:text-2xl font-black tracking-tight">
                {isMM ? variant.name_mm : variant.name_en}
              </h3>
              <p className="text-xs text-white/40 font-mono mt-1 tracking-wider uppercase opacity-70">
                {variant.sku}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-black">
                {Number(variant.priceOverride ?? product.price).toLocaleString()}
                <span className="text-[10px] ml-1 font-bold text-white/60">{isMM ? "ကျပ်" : "MMK"}</span>
              </p>
            </div>
          </div>

          {variant.options && variant.options.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {variant.options.map((opt, idx) => (
                <span key={idx} className="px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-xl text-[10px] font-bold flex items-center gap-2 border border-white/5">
                  {opt.color && (
                    <span 
                      className="w-2.5 h-2.5 rounded-full border border-white/20 shadow-sm" 
                      style={{ backgroundColor: opt.color }}
                    />
                  )}
                  {isMM ? opt.value_mm : opt.value_en}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
