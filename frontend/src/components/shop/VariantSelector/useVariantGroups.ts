import { useMemo } from "react";
import type { Product, VariantGroup } from "../../../types";

export const useVariantGroups = (product: Product): VariantGroup[] => {
  return useMemo(() => {
    // Determine groups from existing variants 
    const groups: Record<string, VariantGroup> = {};
    if (product.variants && product.variants.length > 0) {
      product.variants.forEach((v) => {
        v.options?.forEach((opt) => {
          if (!groups[opt.type]) {
            groups[opt.type] = {
              id: opt.type,
              name_en: opt.type,
              name_mm: opt.type,
              values: [],
            };
          }
          const existingVal = groups[opt.type].values.find(
            (val) => val.value_en === opt.value_en
          );
          if (!existingVal) {
            groups[opt.type].values.push({ ...opt, id: opt.value_en });
          } else if (!existingVal.imageUrl && opt.imageUrl) {
            existingVal.imageUrl = opt.imageUrl;
          }
        });
      });
      return Object.values(groups);
    }

    // Fallback to legacy variantGroups
    return product.variantGroups || [];
  }, [product.variants, product.variantGroups]);
};
