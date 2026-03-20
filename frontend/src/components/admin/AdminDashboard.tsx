import { AlertTriangle, Package, Tag, ArrowUpRight, TrendingUp, ShoppingBag } from "lucide-react";
import type { Product, Category } from "../../types";
import { getProductInStock, getCategoryLabel } from "../../utils/helpers";

interface AdminDashboardProps {
  products: Product[];
  categories: Category[];
}

export const AdminDashboard = ({
  products,
  categories,
}: AdminDashboardProps) => {
  const inStockCount = products.filter(getProductInStock).length;
  const outOfStockCount = products.length - inStockCount;
  const lowStockItems = products
    .filter(
      (product) =>
        Number(product.stock ?? 0) > 0 && Number(product.stock ?? 0) <= 3,
    )
    .sort((a, b) => Number(a.stock ?? 0) - Number(b.stock ?? 0))
    .slice(0, 6);

  return (
    <div className="space-y-12">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Package size={20} />
            </div>
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">
              <TrendingUp size={12} /> +12%
            </span>
          </div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold">
            Total Products
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900 tracking-tight">
            {products.length}
          </p>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Tag size={20} />
            </div>
          </div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold">
            Active Categories
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900 tracking-tight">
            {categories.length}
          </p>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <ArrowUpRight size={20} />
            </div>
          </div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold">
            In Stock
          </p>
          <p className="mt-2 text-3xl font-bold text-emerald-600 tracking-tight">
            {inStockCount}
          </p>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <ShoppingBag size={20} />
            </div>
          </div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold">
            Pre-Orders
          </p>
          <p className="mt-2 text-3xl font-bold text-purple-600 tracking-tight">
            {outOfStockCount}
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Low Stock Section */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-bold mb-1">
                Inventory Check
              </p>
              <h3 className="text-xl font-bold text-slate-900">Low Stock Alert</h3>
            </div>
            <div className="h-10 w-10 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center">
              <AlertTriangle size={20} />
            </div>
          </div>

          {lowStockItems.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-slate-400">All products are well stocked.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lowStockItems.map((product) => {
                const stockValue = Number(product.stock ?? 0);
                const mainImg = product.images?.[0]?.url;
                return (
                  <div
                    key={product.id}
                    className="group flex items-center gap-4 border border-slate-50 bg-slate-50/30 rounded-2xl p-4 hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all"
                  >
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                      {mainImg ? (
                        <img src={mainImg} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Package size={16} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate uppercase tracking-tight">
                        {product.name_en}
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">
                        {getCategoryLabel(product.category)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-md uppercase tracking-tighter">
                        {stockValue} left
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Activity / Tips */}
        <div className="bg-slate-900 text-white rounded-2xl p-8 shadow-xl">
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-bold mb-4">
            Pro Guidance
          </p>
          <h3 className="text-xl font-bold mb-6">Optimization Tips</h3>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 text-white">
                <Package size={16} />
              </div>
              <div>
                <p className="text-sm font-bold mb-1">Update Inventory</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Regular stock updates keep customers matched with available items.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 text-white">
                <TrendingUp size={16} />
              </div>
              <div>
                <p className="text-sm font-bold mb-1">Check Trends</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Monitor peak shopping times to adjust your highlighted collections.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-white/10">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">System Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs font-semibold">Live & Synchronized</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
