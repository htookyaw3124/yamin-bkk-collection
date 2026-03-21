import { useState } from "react";
import { NavLink, Routes, Route, Navigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Tag,
  ClipboardList,
  Menu,
  X,
  Award,
} from "lucide-react";
import type { Product, Lang, Category, Brand } from "../../types";
import { AdminDashboard } from "./AdminDashboard";
import { AdminProductsPanel } from "./AdminProductsPanel";
import { AdminCategoriesPanel } from "./AdminCategoriesPanel";
import { AdminBrandsPanel } from "./AdminBrandsPanel";
import { AdminOrdersPanel } from "./AdminOrdersPanel";

interface AdminLayoutProps {
  lang: Lang;
  products: Product[];
  categories: Category[];
  brands: Brand[];
  categoriesLoading: boolean;
  categoriesError: string | null;
  brandsLoading: boolean;
  brandsError: string | null;
}

export const AdminLayout = ({
  lang,
  products,
  categories,
  brands,
  categoriesLoading,
  categoriesError,
  brandsLoading,
  brandsError,
}: AdminLayoutProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/products", label: "Products", icon: Package },
    { path: "/admin/categories", label: "Categories", icon: Tag },
    { path: "/admin/brands", label: "Brands", icon: Award },
    { path: "/admin/orders", label: "Orders", icon: ClipboardList },
  ];

  const sidebarInner = (
    <>
      <div className="flex items-center gap-3 pb-6 border-b border-slate-100/60">
        <div className="h-10 w-10 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center text-xs font-bold tracking-widest shadow-sm">
          YS
        </div>
        <div>
          <p className="text-base font-bold text-slate-800">
            My Shop
          </p>
          <p className="text-[10px] text-slate-400 font-medium">
            Dashboard
          </p>
        </div>
      </div>

      <nav className="mt-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setDrawerOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-full px-5 py-3 text-sm font-bold transition-all duration-300 ${
                  isActive
                    ? "bg-pink-100/50 text-pink-600"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={18}
                    className={`transition-colors ${
                      isActive
                        ? "text-pink-500"
                        : "text-slate-400 group-hover:text-slate-500"
                    }`}
                  />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-6 rounded-xl bg-slate-50 p-4 text-xs text-slate-500">
        <p className="font-semibold text-slate-700">Quick tips</p>
        <p className="mt-1">
          Manage products, categories, and orders from the sidebar.
        </p>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-admin-bg">
      <div className="flex flex-col md:flex-row min-h-screen">
        <aside className="hidden md:block md:w-64 bg-white border-r border-slate-100 flex-shrink-0">
          <div className="p-6 sticky top-0 h-screen overflow-y-auto">
            {sidebarInner}
          </div>
        </aside>

        <main className="flex-1 w-full max-w-[100vw] md:max-w-[calc(100vw-256px)] p-6 md:p-10">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-8">
            <div className="flex items-center justify-between md:hidden w-full bg-white p-4 rounded-2xl shadow-sm mb-4">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-500 shadow-sm"
                  aria-label="Open navigation menu"
                >
                  <Menu size={16} />
                  Menu
                </button>
                <span className="rounded-full bg-pink-50 px-4 py-2 text-[10px] uppercase tracking-widest font-bold text-pink-500">
                  Admin Active
                </span>
              </div>

            </div>

            <div className="w-full">
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
                      brands={brands}
                      lang={lang}
                      categoriesLoading={categoriesLoading}
                      categoriesError={categoriesError}
                    />
                  }
                />
                <Route
                  path="categories"
                  element={<AdminCategoriesPanel categories={categories} />}
                />
                <Route
                  path="brands"
                  element={
                    <AdminBrandsPanel
                      brands={brands}
                      isLoading={brandsLoading}
                      error={brandsError}
                    />
                  }
                />
                <Route path="orders" element={<AdminOrdersPanel lang={lang} />} />
              </Routes>
            </div>
          </main>
        </div>

      <div
        className={`fixed inset-0 z-40 md:hidden ${
          drawerOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          className={`absolute inset-0 bg-slate-900/40 transition-opacity ${
            drawerOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
        <div
          className={`absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-xl transition-transform ${
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Admin navigation"
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Navigation
            </p>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="rounded-full border border-slate-200 p-2 text-slate-500 hover:text-slate-700"
              aria-label="Close navigation menu"
            >
              <X size={16} />
            </button>
          </div>
          <div className="p-6">{sidebarInner}</div>
        </div>
      </div>
    </div>
  );
};
