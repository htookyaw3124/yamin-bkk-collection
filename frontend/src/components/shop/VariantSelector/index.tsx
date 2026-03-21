import { useState } from "react";
import type { Product, Lang } from "../../../types";
import { useVariantGroups } from "./useVariantGroups";
import { VariantGroupOptions } from "./VariantGroupOptions";
import { VariantGrid } from "./VariantGrid";
import { SelectedVariantSummary } from "./SelectedVariantSummary";

interface VariantSelectorProps {
  product: Product;
  lang: Lang;
  onSelectVariant?: (variantId: string | null) => void;
  onOptionSelect?: (imageUrl: string | null) => void;
}

export const VariantSelector = ({
  product,
  lang,
  onSelectVariant,
  onOptionSelect,
}: VariantSelectorProps) => {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const groupsToDisplay = useVariantGroups(product);

  const hasVariants = product.variants && product.variants.length > 0;
  if (!hasVariants && (!groupsToDisplay || groupsToDisplay.length === 0)) {
    return null;
  }

  const handleVariantSelect = (variantId: string) => {
    // Toggle: if clicking the same variant, deselect it
    const newVariantId = selectedVariantId === variantId ? null : variantId;
    setSelectedVariantId(newVariantId);
    onSelectVariant?.(newVariantId);
  };

  const selectedVariant = product.variants?.find(
    (v) => v.id === selectedVariantId,
  );

  return (
    <div className="space-y-10 pt-8 border-t border-slate-100/60">
      <VariantGroupOptions
        groups={groupsToDisplay}
        lang={lang}
        selectedVariant={selectedVariant}
        onOptionSelect={onOptionSelect}
      />

      <VariantGrid
        product={product}
        lang={lang}
        selectedVariantId={selectedVariantId}
        onVariantSelect={handleVariantSelect}
      />

      {selectedVariant && (
        <SelectedVariantSummary
          product={product}
          variant={selectedVariant}
          lang={lang}
        />
      )}
    </div>
  );
};
