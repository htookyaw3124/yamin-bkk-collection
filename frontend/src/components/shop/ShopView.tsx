import { useTranslation } from "react-i18next";
import type { Product, Lang, CategoryFilter, ForFilter } from "../../types";
import { FOR_FILTERS } from "../../types";
import { ProductCard } from "./ProductCard";

interface ShopViewProps {
  lang: Lang;
  forFilter: ForFilter;
  showSaleOnly: boolean;
  filteredProducts: Product[];
  onCategoryChange: (value: CategoryFilter) => void;
  onForChange: (value: ForFilter) => void;
  onToggleSale: () => void;
  onViewDetails: (productId: string) => void;
  activeBrandName: string | null;
  isLoading: boolean;
  error: string | null;
}

export const ShopView = ({
  lang,
  forFilter,
  showSaleOnly,
  filteredProducts,
  onCategoryChange,
  onForChange,
  onToggleSale,
  onViewDetails,
  activeBrandName,
  isLoading,
  error,
}: ShopViewProps) => {
  const { t } = useTranslation();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8 min-h-[80vh] flex-grow w-full animate-in fade-in duration-700">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 flex-shrink-0">
        <div className="sticky top-24 bg-white/60 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center space-x-2 mb-6 text-slate-800">
            <div className="p-2 bg-pink-50 rounded-lg">
               <span className="text-pink-500 font-bold block bg-pink-500 w-1.5 h-1.5 rounded-full" />
            </div>
            <h3 className="font-semibold text-lg">{t("filters")}</h3>
          </div>
          
          <div className="space-y-8">
            {/* Gender */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{t("gender")}</h4>
              <div className="flex flex-wrap gap-2">
                {FOR_FILTERS.map(filter => {
                  const Icon = filter.icon;
                  return (
                    <button
                      key={filter.value}
                      onClick={() => onForChange(filter.value)}
                      className={`filter-chip px-4 py-2 rounded-full border text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm transition-all ${
                        forFilter === filter.value
                          ? "filter-chip-active shadow-md"
                          : "bg-white/50 text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <Icon size={12} />
                      {t(`gender.${filter.value.toLowerCase()}`)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sale Items Toggle */}
            <div className="pt-6 border-t border-slate-200">
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-600 group-hover:text-pink-500 transition-colors">
                  {t("saleItemsOnly")}
                </span>
                <div className="relative">
                  <input 
                    type="checkbox" 
                    checked={showSaleOnly}
                    onChange={onToggleSale}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-pink-500"></div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Grid */}
      <div className="flex-1">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">
              {activeBrandName ? `${activeBrandName} Collection` : t("shop")}
            </h2>
            {!isLoading && (
              <p className="text-[10px] tracking-[0.3em] uppercase text-slate-400 font-bold">
                {t("showingItems", { count: filteredProducts.length })}
              </p>
            )}
          </div>
          <div className="gradient-separator w-full sm:w-48" />
        </div>

        {isLoading ? (
          <div className="py-40 text-center space-y-6">
            <div className="inline-block w-10 h-10 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 tracking-[0.4em] uppercase text-[10px] font-bold">
              {t("loadingProducts")}
            </p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-8 lg:gap-x-12 gap-y-24">
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
          <div className="py-40 text-center space-y-8 bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
            <div className="space-y-4">
              <p className="text-slate-300 tracking-[0.3em] uppercase text-[10px] font-bold">
                No Results
              </p>
              <p className="text-slate-400 text-sm font-light max-w-xs mx-auto px-6">
                {t("noProductsFound")}
              </p>
            </div>
            <button 
              onClick={() => {
                onCategoryChange("All");
                onForChange("All");
                if (showSaleOnly) onToggleSale();
              }}
              className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-900 border-b border-slate-900 pb-1 hover:text-pink-600 hover:border-pink-600 transition-colors"
            >
              {t("clearFilters")}
            </button>
            {error && <p className="mt-4 text-xs text-red-500 font-mono tracking-tighter opacity-50">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
};
