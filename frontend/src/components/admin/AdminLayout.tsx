import { NavLink, Routes, Route, Navigate } from "react-router-dom";
import { LayoutDashboard, Package, Tag, ClipboardList } from "lucide-react";
import type { Product, Lang, Category } from "../../types";
import { AdminDashboard } from "./AdminDashboard";
import { AdminProductsPanel } from "./AdminProductsPanel";
import { AdminCategoriesPanel } from "./AdminCategoriesPanel";
import { AdminOrdersPanel } from "./AdminOrdersPanel";

interface AdminLayoutProps {
  lang: Lang;
  products: Product[];
  categories: Category[];
  categoriesLoading: boolean;
  categoriesError: string | null;
}

export const AdminLayout = ({
  lang,
  products,
  categories,
  categoriesLoading,
  categoriesError,
}: AdminLayoutProps) => {
  const navItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/products", label: "Products", icon: Package },
    { path: "/admin/categories", label: "Categories", icon: Tag },
    { path: "/admin/orders", label: "Orders", icon: ClipboardList },
  ];

  return (
    <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-12">
      <div className="flex flex-wrap gap-4 mb-10">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2 px-5 py-2 rounded-full text-xs uppercase tracking-widest border transition-all ${
                  isActive
                    ? "border-slate-900 text-slate-900"
                    : "border-slate-200 text-slate-400 hover:text-slate-600"
                }`
              }
            >
              <Icon size={14} />
              {item.label}
            </NavLink>
          );
        })}
      </div>

      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route
          path="dashboard"
          element={
            <AdminDashboard products={products} categories={categories} />
          }
        />
        <Route
          path="products"
          element={
            <AdminProductsPanel
              products={products}
              categories={categories}
              lang={lang}
              categoriesLoading={categoriesLoading}
              categoriesError={categoriesError}
            />
          }
        />
        <Route
          path="categories"
          element={
            <AdminCategoriesPanel
              categories={categories}
            />
          }
        />
        <Route
          path="orders"
          element={<AdminOrdersPanel lang={lang} />}
        />
      </Routes>
    </div>
  );
};
