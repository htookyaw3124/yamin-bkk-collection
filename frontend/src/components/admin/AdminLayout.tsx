import { useState } from "react";
import { NavLink, Routes, Route, Navigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Tag,
  ClipboardList,
  Menu,
  X,
} from "lucide-react";
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/products", label: "Products", icon: Package },
    { path: "/admin/categories", label: "Categories", icon: Tag },
    { path: "/admin/orders", label: "Orders", icon: ClipboardList },
  ];

  const sidebarInner = (
    <>
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
        <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-semibold tracking-widest">
          YA
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
            Admin Panel
          </p>
          <p className="text-base font-semibold text-slate-900">
            Yamin Collection
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
                `group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={18}
                    className={`transition-colors ${
                      isActive
                        ? "text-white"
                        : "text-slate-400 group-hover:text-slate-700"
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
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-screen-2xl px-4 md:px-8 py-8">
        <div className="flex flex-col gap-6 md:flex-row">
          <aside className="hidden md:block md:w-72 md:sticky md:top-8 self-start">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
              {sidebarInner}
            </div>
          </aside>

          <main className="flex-1">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
              <div className="flex items-center justify-between md:hidden">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-500 shadow-sm"
                  aria-label="Open navigation menu"
                >
                  <Menu size={16} />
                  Menu
                </button>
                <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-slate-400">
                  Secure Access
                </span>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
                  Overview
                </p>
                <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
                  Administration
                </h1>
                <p className="text-sm text-slate-500">
                  Professional control center for content and operations.
                </p>
              </div>
              <div className="hidden md:flex items-center gap-3">
                <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-slate-400">
                  Secure Access
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 md:p-8">
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
                  element={<AdminCategoriesPanel categories={categories} />}
                />
                <Route path="orders" element={<AdminOrdersPanel lang={lang} />} />
              </Routes>
            </div>
          </main>
        </div>
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
