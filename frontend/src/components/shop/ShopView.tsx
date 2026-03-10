import { useTranslation } from "react-i18next";
import type { Product, Lang, CategoryFilter, ForFilter } from "../../types";
import { CATEGORIES, FOR_FILTERS } from "../../types";
import { ProductCard } from "./ProductCard";

interface ShopViewProps {
  lang: Lang;
  category: CategoryFilter;
  forFilter: ForFilter;
  filteredProducts: Product[];
  onCategoryChange: (value: CategoryFilter) => void;
  onForChange: (value: ForFilter) => void;
  onViewDetails: (productId: string) => void;
  isLoading: boolean;
  error: string | null;
}

export const ShopView = ({
  lang,
  category,
  forFilter,
  filteredProducts,
  onCategoryChange,
  onForChange,
  onViewDetails,
  isLoading,
  error,
}: ShopViewProps) => {
  const { t } = useTranslation();

  return (
    <>
      {/* Filter Header */}
      <header className="max-w-screen-2xl mx-auto px-6 lg:px-12 mb-16 animate-in fade-in duration-1000">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 pb-12">
          <div className="space-y-10">
            {/* Categories */}
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-slate-400 font-bold mb-4 flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-pink-500" />
                {t("categories")}
              </p>
              <div className="flex flex-wrap gap-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => onCategoryChange(cat)}
                    className={`filter-chip px-5 py-2.5 rounded-full text-[11px] tracking-[0.15em] uppercase ${
                      category === cat
                        ? "filter-chip-active text-white font-medium shadow-lg shadow-slate-900/25"
                        : "bg-white/60 text-slate-500 border border-slate-200/50 hover:border-pink-300/50 hover:text-slate-900 hover:shadow-md hover:shadow-pink-100/50"
                    }`}
                  >
                    {t(`category.${cat.toLowerCase()}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* Gender / For */}
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-slate-400 font-bold mb-4 flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-pink-500" />
                {t("gender")}
              </p>
              <div className="flex flex-wrap gap-3">
                {FOR_FILTERS.map((filter) => {
                  const Icon = filter.icon;
                  return (
                    <button
                      key={filter.value}
                      onClick={() => onForChange(filter.value)}
                      className={`filter-chip px-5 py-2.5 rounded-full text-[11px] tracking-[0.15em] uppercase flex items-center gap-2 ${
                        forFilter === filter.value
                          ? "filter-chip-active text-white font-medium shadow-lg shadow-slate-900/25"
                          : "bg-white/60 text-slate-500 border border-slate-200/50 hover:border-pink-300/50 hover:text-slate-900 hover:shadow-md hover:shadow-pink-100/50"
                      }`}
                    >
                      <Icon size={14} />
                      {t(`gender.${filter.value.toLowerCase()}`)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Gradient separator */}
        <div className="gradient-separator" />

        {/* Product count */}
        {!isLoading && (
          <p className="mt-4 text-[10px] tracking-[0.2em] uppercase text-slate-400 font-medium">
            {t("itemCount", { count: filteredProducts.length })}
          </p>
        )}
      </header>

      {/* Main Grid */}
      <main className="max-w-screen-2xl mx-auto px-6 lg:px-12 pb-32">
        {isLoading ? (
          <div className="py-32 text-center">
            <div className="inline-block w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-400 tracking-widest uppercase text-xs">
              {t("loadingProducts")}
            </p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 lg:gap-x-12 gap-y-20">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                lang={lang}
                onViewDetails={onViewDetails}
              />
            ))}
          </div>
        ) : (
          <div className="py-32 text-center">
            <p className="text-slate-400 tracking-widest uppercase text-xs">
              {t("noProductsFound")}
            </p>
            {error && <p className="mt-4 text-xs text-red-500">{error}</p>}
          </div>
        )}
      </main>
    </>
  );
};
