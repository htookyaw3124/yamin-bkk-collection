import { useState } from "react";
import { Check } from "lucide-react";
import type { Product, Lang } from "../../types";

interface VariantSelectorProps {
  product: Product;
  lang: Lang;
  onSelectVariant?: (variantId: string) => void;
}

export const VariantSelector = ({
  product,
  lang,
  onSelectVariant,
}: VariantSelectorProps) => {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const isMM = lang === "mm";

  if (!product.variants || product.variants.length === 0) {
    return null;
  }

  const handleVariantSelect = (variantId: string) => {
    // Toggle: if clicking the same variant, deselect it
    if (selectedVariantId === variantId) {
      setSelectedVariantId(null);
      onSelectVariant?.(null as any); // Clear selection to show original images
    } else {
      setSelectedVariantId(variantId);
      onSelectVariant?.(variantId);
    }
  };

  const selectedVariant = product.variants.find(
    (v) => v.id === selectedVariantId,
  );

  return (
    <div className="space-y-6 pt-8">
      {/* Variant Groups */}
      {product.variantGroups && product.variantGroups.length > 0 && (
        <div className="space-y-2 pb-4 border-b border-slate-100">
          <p className="text-[10px] tracking-[0.2em] uppercase text-slate-400 font-bold">
            {isMM ? "အမျိုးအစား" : "Options"}
          </p>
          <div className="space-y-2">
            {product.variantGroups.map((group) => (
              <div key={group.id} className="space-y-1.5">
                <p className="text-[11px] font-semibold text-slate-700">
                  {isMM ? group.name_mm : group.name_en}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {group.values?.map((value) => (
                    <button
                      key={value.id}
                      className="px-3 py-1.5 rounded-full border border-slate-200 text-[11px] font-medium text-slate-600 hover:border-slate-400 hover:bg-slate-50 transition-all"
                    >
                      {isMM ? value.value_mm : value.value_en}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Variants Grid */}
      <div className="space-y-3">
        <p className="text-[10px] tracking-[0.2em] uppercase text-slate-400 font-bold">
          {isMM ? "ရရှိ နိုင်သည့် အမျိုးအစား" : "Available Variants"}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {product.variants.map((variant) => {
            const isSelected = variant.id === selectedVariantId;
            const inStock = variant.stock > 0;
            const variantName = isMM ? variant.name_mm : variant.name_en;
            const variantSku = variant.sku;
            const displayPrice = variant.priceOverride ?? product.price;

            return (
              <button
                key={variant.id}
                onClick={() => handleVariantSelect(variant.id)}
                disabled={!inStock}
                className={`relative p-2.5 rounded-xl border transition-all duration-300 group ${
                  isSelected
                    ? "border-slate-900 bg-gradient-to-br from-slate-50 to-slate-100 shadow-md scale-105"
                    : inStock
                      ? "border-slate-200 bg-white hover:border-slate-400 hover:shadow-sm hover:-translate-y-0.5"
                      : "border-slate-100 bg-slate-50 opacity-40 cursor-not-allowed"
                }`}
              >
                {/* Selected Indicator */}
                {isSelected && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-slate-900 rounded-full flex items-center justify-center shadow-md">
                    <Check size={12} className="text-white" />
                  </div>
                )}

                {/* Content */}
                <div className="text-left space-y-1">
                  {/* Variant Name & SKU */}
                  <div className="flex flex-col gap-0.5 min-h-8">
                    <p className="text-xs font-bold text-slate-900 leading-tight">
                      {variantName}
                    </p>
                    <p className="text-[8px] text-slate-400 tracking-wide font-medium">
                      {variantSku}
                    </p>
                  </div>

                  {/* Options (compact) */}
                  {variant.options && variant.options.length > 0 && (
                    <div className="flex gap-0.5 flex-wrap">
                      {variant.options.slice(0, 2).map((option, idx) => (
                        <span
                          key={idx}
                          className="text-[7px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-sm"
                          title={isMM ? option.value_mm : option.value_en}
                        >
                          {(isMM ? option.value_mm : option.value_en).substring(0, 4)}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Price and Stock */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <p className="text-xs font-bold text-slate-900">
                      ${displayPrice}
                    </p>
                    <p
                      className={`text-[8px] font-medium ${
                        inStock ? "text-emerald-600" : "text-slate-400"
                      }`}
                    >
                      {inStock ? variant.stock : "–"}
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
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="p-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200">
            <p className="text-[9px] tracking-[0.2em] uppercase text-slate-400 font-bold mb-2">
              {isMM ? "ရွေးချယ်ထားသည့်" : "Selected"}
            </p>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-650 font-medium">{isMM ? "အမည်" : "Name"}:</span>
                <span className="font-semibold text-slate-900">
                  {isMM ? selectedVariant.name_mm : selectedVariant.name_en}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-650 font-medium">{isMM ? "SKU" : "SKU"}:</span>
                <span className="font-mono text-slate-900 text-[11px]">
                  {selectedVariant.sku}
                </span>
              </div>
              {selectedVariant.options && selectedVariant.options.length > 0 && (
                <div className="flex justify-between items-start text-xs pt-1">
                  <span className="text-slate-650 font-medium">
                    {isMM ? "အမျိုးအစား" : "Options"}:
                  </span>
                  <div className="flex flex-wrap gap-1 justify-end max-w-xs">
                    {selectedVariant.options.map((opt, idx) => (
                      <span key={idx} className="text-slate-900 font-medium text-[11px]">
                        {isMM ? opt.value_mm : opt.value_en}
                        {idx < selectedVariant.options!.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-slate-300 mt-2">
                <span className="text-slate-650 font-semibold text-xs">
                  {isMM ? "စျေး" : "Price"}:
                </span>
                <span className="font-bold text-slate-900 text-sm">
                  ${(selectedVariant.priceOverride ?? product.price).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
