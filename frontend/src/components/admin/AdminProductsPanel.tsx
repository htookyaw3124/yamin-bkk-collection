import { useState } from "react";
import { useDeleteProductMutation } from "../../lib/api";
import { Search, CheckCircle, Globe, Pencil, Trash2, X } from "lucide-react";
import type { Product, Lang, Category, Brand } from "../../types";
import { getProductInStock, getCategoryLabel, getApiErrorMessage } from "../../utils/helpers";
import { AdminProductForm } from "./AdminProductForm";

type StockFilter = "All" | "In Stock" | "Pre-Order";

interface AdminProductsPanelProps {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  lang: Lang;
  categoriesLoading: boolean;
  categoriesError: string | null;
}

export const AdminProductsPanel = ({
  products,
  categories,
  brands,
  lang,
  categoriesLoading,
  categoriesError,
}: AdminProductsPanelProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [stockFilter, setStockFilter] = useState<StockFilter>("All");
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [deleteProduct] = useDeleteProductMutation();
  const [actionError, setActionError] = useState<string | null>(null);

  const isMM = lang === "mm";

  const filteredProducts = products.filter((product) => {
    const term = searchTerm.trim().toLowerCase();
    const nameMatch = !term || product.name_en.toLowerCase().includes(term) || product.name_mm.toLowerCase().includes(term);
    const productCategoryKey = typeof product.category === "string" ? product.category : product.category.slug;
    const categoryMatch = categoryFilter === "All" || productCategoryKey === categoryFilter;
    const inStock = getProductInStock(product);
    const stockMatch = stockFilter === "All" || (stockFilter === "In Stock" ? inStock : !inStock);
    return nameMatch && categoryMatch && stockMatch;
  });

  const handleDelete = async (productId: string) => {
    if (!window.confirm(isMM ? "ဖျက်ရန် သေချာပါသလား?" : "Are you sure you want to delete this product?")) return;
    setActionError(null);
    try {
      await deleteProduct(productId).unwrap();
    } catch (error) {
      setActionError(getApiErrorMessage(error, "Failed to delete product."));
    }
  };

  if (showCreateForm || editingProduct) {
    return (
      <AdminProductForm
        lang={lang}
        categories={categories}
        brands={brands}
        categoriesLoading={categoriesLoading}
        categoriesError={categoriesError}
        initialData={editingProduct || undefined}
        onCancel={() => { setShowCreateForm(false); setEditingProduct(null); }}
        onSuccess={() => { setShowCreateForm(false); setEditingProduct(null); }}
      />
    );
  }

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-300">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <p className="text-[10px] tracking-[0.3em] font-bold uppercase text-slate-400 mb-1">Inventory Management</p>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-myanmar">
            {isMM ? "ပစ္စည်းစာရင်း" : "Products"}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowCreateForm(true)}
            className="h-12 bg-brand hover:bg-brand-hover text-white rounded-full px-8 text-xs font-bold uppercase tracking-widest shadow-xl shadow-brand/20 transition-all active:scale-95 flex items-center gap-2 btn-premium"
          >
            + {isMM ? "ပစ္စည်းအသစ် ထည့်ရန်" : "Add Product"}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
        <div className="flex flex-1 items-center gap-3 bg-white rounded-2xl px-5 py-3 shadow-sm border border-slate-100 max-w-sm focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10 transition-all">
          <Search size={18} className="text-slate-400" />
          <input
            className="w-full text-sm font-semibold outline-none bg-transparent text-slate-800 placeholder:text-slate-400 placeholder:font-myanmar"
            placeholder={isMM ? "ပစ္စည်း ရှာဖွေရန်..." : "Search products..."}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          {searchTerm && (
             <button onClick={() => setSearchTerm("")} className="text-slate-400 hover:text-slate-900">
                <X size={14} />
             </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            className="h-12 bg-white border border-slate-100 rounded-2xl px-5 text-xs font-bold uppercase tracking-widest text-slate-600 outline-none hover:bg-slate-50 focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all cursor-pointer shadow-sm appearance-none"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            <option value="All">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name_en}
              </option>
            ))}
          </select>

          <select
            className="h-12 bg-white border border-slate-100 rounded-2xl px-5 text-xs font-bold uppercase tracking-widest text-slate-600 outline-none hover:bg-slate-50 focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all cursor-pointer shadow-sm appearance-none"
            value={stockFilter}
            onChange={(event) => setStockFilter(event.target.value as StockFilter)}
          >
            <option value="All">All Items</option>
            <option value="In Stock">In Stock</option>
            <option value="Pre-Order">Pre-Orders</option>
          </select>
        </div>
      </div>

      {actionError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold uppercase tracking-widest">
          {actionError}
        </div>
      )}

      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full py-32 text-sm text-slate-500 text-center font-bold bg-white rounded-3xl border border-dashed border-slate-200">
              {isMM ? "ရှာဖွေမှုနှင့် ကိုက်ညီသော ပစ္စည်းများ မရှိပါ။" : "No products match your specified search parameters."}
            </div>
          ) : (
            filteredProducts.map((product) => {
              const inStock = getProductInStock(product);
              const mainImageUrl = product.images?.find((img) => img.isMain)?.url || product.images?.[0]?.url;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-3xl shadow-sm hover:shadow-xl hover:shadow-slate-200/40 border border-slate-100 overflow-hidden transition-all duration-300 flex flex-col group relative"
                >
                  <div className="aspect-[4/3] bg-slate-50 relative overflow-hidden">
                    {mainImageUrl ? (
                      <img
                        src={mainImageUrl}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        alt={product.name_en}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-200">
                        <Globe size={32} />
                      </div>
                    )}

                    {/* Hover Actions overlay */}
                    <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px] flex items-center justify-center gap-3">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="h-12 w-12 bg-white text-slate-700 rounded-full shadow-xl flex items-center justify-center hover:bg-brand hover:text-white transition-all transform hover:scale-110 active:scale-95"
                        title="Edit Product"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="h-12 w-12 bg-white text-red-500 rounded-full shadow-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all transform hover:scale-110 active:scale-95"
                        title="Delete Product"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[9px] uppercase font-bold text-slate-400 tracking-[0.2em]">
                        {getCategoryLabel(product.category)}
                      </p>
                      <span
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-full ${inStock ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}
                      >
                        {inStock ? <CheckCircle size={10} /> : <Globe size={10} />}
                        {inStock ? "In Stock" : "Pre-Order"}
                      </span>
                    </div>
                    <h3 className="text-slate-900 font-extrabold text-base truncate mb-1">
                      {product.name_en}
                    </h3>
                    <p className="text-slate-500 font-semibold text-xs font-myanmar truncate mb-5">
                      {product.name_mm}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Price</span>
                      <p className="text-brand font-black text-sm tracking-wide">
                        {product.price > 0 ? `${product.price.toLocaleString()} MMK` : "FREE"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
