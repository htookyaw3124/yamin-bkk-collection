import { AlertTriangle } from "lucide-react";
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
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Products
          </p>
          <p className="mt-4 text-3xl font-light text-slate-900">
            {products.length}
          </p>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Categories
          </p>
          <p className="mt-4 text-3xl font-light text-slate-900">
            {categories.length}
          </p>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            In Stock
          </p>
          <p className="mt-4 text-3xl font-light text-emerald-600">
            {inStockCount}
          </p>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Pre-Orders
          </p>
          <p className="mt-4 text-3xl font-light text-purple-600">
            {outOfStockCount}
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Low Stock
            </p>
            <p className="text-lg font-light text-slate-900 mt-2">
              Items to restock soon
            </p>
          </div>
          <AlertTriangle size={18} className="text-amber-500" />
        </div>
        {lowStockItems.length === 0 ? (
          <p className="mt-6 text-sm text-slate-500">
            No low stock items right now.
          </p>
        ) : (
          <div className="mt-6 space-y-3">
            {lowStockItems.map((product) => {
              const stockValue = Number(product.stock ?? 0);
              return (
                <div
                  key={product.id}
                  className="flex items-center justify-between border border-slate-100 rounded-xl px-4 py-3"
                >
                  <div>
                    <p className="text-sm text-slate-900">{product.name_en}</p>
                    <p className="text-xs text-slate-400">
                      {getCategoryLabel(product.category)}
                    </p>
                  </div>
                  <span className="text-xs uppercase tracking-[0.2em] text-amber-600">
                    {stockValue} left
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
