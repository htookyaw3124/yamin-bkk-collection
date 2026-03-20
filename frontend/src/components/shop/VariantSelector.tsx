import { useState, useMemo } from "react";
import { Check } from "lucide-react";
import type { Product, Lang } from "../../types";

interface VariantSelectorProps {
  product: Product;
  lang: Lang;
  onSelectVariant?: (variantId: string | null) => void;
  onOptionSelect?: (imageUrl: string | null) => void;
}

interface LegacyVariantValue {
  id: string;
  value_en: string;
  value_mm: string;
  color?: string;
}

interface LegacyVariantGroup {
  id: string;
  type: string;
  name_en: string;
  name_mm: string;
  values: LegacyVariantValue[];
}

export const VariantSelector = ({
  product,
  lang,
  onSelectVariant,
  onOptionSelect,
}: VariantSelectorProps) => {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const isMM = lang === "mm";

  const groupsToDisplay = useMemo(() => {
    // If we have derived groups from variants, use those (more accurate as they come from DB relations)
    const groups: Record<string, LegacyVariantGroup> = {};
    if (product.variants && product.variants.length > 0) {
      product.variants.forEach((v) => {
        v.options?.forEach((opt) => {
          if (!groups[opt.type]) {
            groups[opt.type] = { id: opt.type, type: opt.type, name_en: opt.type, name_mm: opt.type, values: [] };
          }
          if (!groups[opt.type].values.find((val) => val.id === opt.id)) {
            groups[opt.type].values.push(opt);
          }
        });
      });
      return Object.values(groups);
    }

    // Fallback to variantGroups JSON if variants are empty (e.g. legacy or partial data)
    return (product.variantGroups as LegacyVariantGroup[]) || [];
  }, [product.variants, product.variantGroups]);

  // Remove early return if we have either variants OR groups to display
  const hasVariants = product.variants && product.variants.length > 0;
  if (!hasVariants && (!groupsToDisplay || groupsToDisplay.length === 0)) {
    return null;
  }

  const handleVariantSelect = (variantId: string) => {
    // Toggle: if clicking the same variant, deselect it
    if (selectedVariantId === variantId) {
      setSelectedVariantId(null);
      onSelectVariant?.(null);
    } else {
      setSelectedVariantId(variantId);
      onSelectVariant?.(variantId);
    }
  };

  const selectedVariant = product.variants?.find(
    (v) => v.id === selectedVariantId,
  );

  return (
    <div className="space-y-10 pt-8 border-t border-slate-100/60">
      {/* Variant Groups */}
      {groupsToDisplay.length > 0 && (
        <div className="space-y-6 pb-2">
          <p className="text-[9px] tracking-[0.3em] uppercase text-slate-400 font-black">
            {isMM ? "အမျိုးအစား ရွေးချယ်ရန်" : "Select Options"}
          </p>
          <div className="space-y-6">
            {groupsToDisplay.map((group, gIdx) => (
              <div key={gIdx} className="space-y-3">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">
                  {group.type === "Color" || group.name_en === "Color" ? (isMM ? "အရောင်" : "Color") : 
                   (group.type === "Size" || group.name_en === "Size" ? (isMM ? "ဆိုဒ်" : "Size") : 
                   (isMM ? (group.name_mm || group.type) : (group.name_en || group.type)))}
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {group.values?.map((value) => {
                    const isSelected = selectedVariant?.options?.some(opt => opt.id === value.id);
                    const label = isMM ? value.value_mm : value.value_en;
                    return (
                      <div
                        key={value.id}
                        onClick={() => {
                          if (value.imageUrl) {
                            onOptionSelect?.(value.imageUrl);
                          }
                        }}
                        className={`px-5 py-2.5 rounded-2xl border transition-all duration-300 flex items-center gap-3 text-[11px] font-bold tracking-tight select-none cursor-pointer ${
                          isSelected 
                            ? "border-slate-900 bg-slate-900 text-white shadow-xl shadow-slate-200/50 scale-105" 
                            : "border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white"
                        }`}
                      >
                        {value.color && (
                          <span 
                            className={`w-5 h-5 rounded-full border-2 ${isSelected ? "border-white/20" : "border-white shadow-sm"}`} 
                            style={{ backgroundColor: value.color }}
                          />
                        )}
                        {label || (value.color ? "" : "N/A")}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Variants Grid */}
      <div className="space-y-6 pt-8 border-t border-slate-100/60">
        <p className="text-[9px] tracking-[0.3em] uppercase text-slate-400 font-black">
          {isMM ? "ရရှိ နိုင်သည့် အမျိုးအစား" : "Available Variants"}
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {product.variants?.map((variant) => {
            const isSelected = variant.id === selectedVariantId;
            const inStock = variant.stock > 0;
            const variantName = isMM ? variant.name_mm : variant.name_en;
            const variantSku = variant.sku;
            const displayPrice = Number(variant.priceOverride ?? product.price);

            return (
              <button
                key={variant.id}
                onClick={() => handleVariantSelect(variant.id)}
                disabled={!inStock}
                className={`relative p-5 rounded-3xl border transition-all duration-500 group ${
                  isSelected
                    ? "border-slate-900 bg-slate-900 text-white shadow-2xl scale-[1.02] z-10"
                    : inStock
                      ? "border-slate-100 bg-white hover:border-slate-900/10 hover:shadow-xl hover:-translate-y-1"
                      : "border-slate-50 bg-slate-50/50 opacity-40 cursor-not-allowed"
                }`}
              >
                {/* Selected Indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-white text-slate-900 rounded-full flex items-center justify-center shadow-md animate-in zoom-in duration-300">
                    <Check size={12} strokeWidth={3} />
                  </div>
                )}

                {/* Content */}
                <div className="text-left space-y-2">
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
                              className={`w-2 h-2 rounded-full border shadow-sm ${isSelected ? "border-white/20" : "border-slate-200/50"}`} 
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

      {/* Selected Variant Details */}
      {selectedVariant && (
        <div className="mt-6 pt-6 border-t border-slate-100 animate-in slide-in-from-top-4 duration-500">
          <div className="p-6 md:p-8 bg-slate-900 text-white rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 to-rose-500/30 opacity-50 blur-2xl transition-opacity duration-700 translate-x-1/2 translate-y-1/2" />
            
            <div className="relative z-10 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] tracking-[0.4em] uppercase text-white/40 font-black mb-2">
                    {isMM ? "ရွေးချယ်ထားသည့်" : "Selected Model"}
                  </p>
                  <h3 className="text-xl md:text-2xl font-black tracking-tight">
                    {isMM ? selectedVariant.name_mm : selectedVariant.name_en}
                  </h3>
                  <p className="text-xs text-white/40 font-mono mt-1 tracking-wider uppercase opacity-70">{selectedVariant.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black">
                    {Number(selectedVariant.priceOverride ?? product.price).toLocaleString()}
                    <span className="text-[10px] ml-1 font-bold text-white/60">{isMM ? "ကျပ်" : "MMK"}</span>
                  </p>
                </div>
              </div>

              {selectedVariant.options && selectedVariant.options.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {selectedVariant.options.map((opt, idx) => (
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
      )}
    </div>
  );
};
