import { useState, useEffect } from "react";
import axios from "axios";
import { Search, CheckCircle, Globe, Pencil, Trash2 } from "lucide-react";
import type { Product, Lang, Category, Audience } from "../../types";
import {
  getProductInStock,
  getCategoryLabel,
  getApiErrorMessage,
} from "../../utils/helpers";
import { AdminProductForm } from "./AdminProductForm";

type StockFilter = "All" | "In Stock" | "Pre-Order";

interface AdminProductsPanelProps {
  products: Product[];
  categories: Category[];
  lang: Lang;
  authToken: string | null;
  onSaveProduct: (product: Product) => void;
  onRefresh: () => void;
  categoriesLoading: boolean;
  categoriesError: string | null;
  apiUrl: string;
}

export const AdminProductsPanel = ({
  products,
  categories,
  lang,
  authToken,
  onSaveProduct,
  onRefresh,
  categoriesLoading,
  categoriesError,
  apiUrl,
}: AdminProductsPanelProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [stockFilter, setStockFilter] = useState<StockFilter>("All");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({
    name_en: "",
    name_mm: "",
    description_en: "",
    description_mm: "",
    price: "",
    stock: "",
    categoryId: "",
    audience: "all" as Audience,
  });
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!editingProduct) return;
    const categoryId =
      typeof editingProduct.category === "string"
        ? editingProduct.category
        : editingProduct.category.id;
    setEditForm({
      name_en: editingProduct.name_en ?? "",
      name_mm: editingProduct.name_mm ?? "",
      description_en: editingProduct.description_en ?? "",
      description_mm: editingProduct.description_mm ?? "",
      price: editingProduct.price?.toString() ?? "",
      stock: editingProduct.stock?.toString() ?? "0",
      categoryId,
      audience: editingProduct.audience ?? "all",
    });
  }, [editingProduct]);

  const filteredProducts = products.filter((product) => {
    const term = searchTerm.trim().toLowerCase();
    const nameMatch =
      !term ||
      product.name_en.toLowerCase().includes(term) ||
      product.name_mm.toLowerCase().includes(term);
    const productCategoryKey =
      typeof product.category === "string"
        ? product.category
        : product.category.slug;
    const categoryMatch =
      categoryFilter === "All" || productCategoryKey === categoryFilter;
    const inStock = getProductInStock(product);
    const stockMatch =
      stockFilter === "All" ||
      (stockFilter === "In Stock" ? inStock : !inStock);
    return nameMatch && categoryMatch && stockMatch;
  });

  const handleUpdate = async () => {
    if (!editingProduct || !authToken) return;
    setIsSaving(true);
    setActionError(null);
    try {
      const payload: Record<string, string> = {
        name_en: editForm.name_en,
        name_mm: editForm.name_mm,
        description_en: editForm.description_en,
        description_mm: editForm.description_mm,
        price: editForm.price,
        stock: editForm.stock,
        categoryId: editForm.categoryId,
        audience: editForm.audience,
      };
      if (editForm.price === "") delete payload.price;
      if (editForm.stock === "") delete payload.stock;
      if (!editForm.categoryId) delete payload.categoryId;

      await axios.patch(`${apiUrl}/products/${editingProduct.id}`, payload, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setEditingProduct(null);
      onRefresh();
    } catch (error) {
      setActionError(getApiErrorMessage(error, "Failed to update product."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!authToken) return;
    if (!window.confirm("Delete this product?")) return;
    setActionError(null);
    try {
      await axios.delete(`${apiUrl}/products/${productId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      onRefresh();
    } catch (error) {
      setActionError(getApiErrorMessage(error, "Failed to delete product."));
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex flex-1 items-center gap-3 border border-slate-200 rounded-full px-4 py-2">
          <Search size={16} className="text-slate-400" />
          <input
            className="w-full text-sm outline-none"
            placeholder="Search by product name"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            className="border border-slate-200 rounded-full px-4 py-2 text-xs uppercase tracking-widest bg-white"
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
            className="border border-slate-200 rounded-full px-4 py-2 text-xs uppercase tracking-widest bg-white"
            value={stockFilter}
            onChange={(event) =>
              setStockFilter(event.target.value as StockFilter)
            }
          >
            <option value="All">All Items</option>
            <option value="In Stock">In Stock</option>
            <option value="Pre-Order">Pre-Orders</option>
          </select>
          <button
            onClick={() => setShowCreateForm((current) => !current)}
            className="px-5 py-2 rounded-full text-xs uppercase tracking-widest font-bold bg-slate-900 text-white hover:bg-pink-600 transition-colors"
          >
            {showCreateForm ? "Hide Form" : "Add Product"}
          </button>
        </div>
      </div>

      {actionError && <p className="text-xs text-red-500">{actionError}</p>}

      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_120px] gap-4 text-[10px] uppercase tracking-[0.3em] text-slate-400 px-6 py-4 border-b border-slate-100">
          <span>Product</span>
          <span>Category</span>
          <span>Audience</span>
          <span>Status</span>
          <span className="text-right">Actions</span>
        </div>
        <div className="divide-y divide-slate-100">
          {filteredProducts.length === 0 ? (
            <div className="px-6 py-12 text-sm text-slate-500 text-center">
              No products match your filters.
            </div>
          ) : (
            filteredProducts.map((product) => {
              const inStock = getProductInStock(product);
              const audienceLabel = product.audience ?? "all";
              const stockValue = Number(product.stock ?? 0);
              return (
                <div
                  key={product.id}
                  className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_120px] gap-4 items-center px-6 py-4 text-sm"
                >
                  <div>
                    <p className="text-slate-900">{product.name_en}</p>
                    <p className="text-xs text-slate-400">{product.name_mm}</p>
                  </div>
                  <div className="text-slate-500">
                    {getCategoryLabel(product.category)}
                  </div>
                  <div className="text-slate-500 capitalize">
                    {audienceLabel}
                  </div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em]">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full ${
                        inStock
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-purple-100 text-purple-600"
                      }`}
                    >
                      {inStock ? (
                        <CheckCircle size={12} />
                      ) : (
                        <Globe size={12} />
                      )}
                      {inStock ? "In Stock" : "Pre-Order"}
                    </span>
                    <span className="text-slate-400">{stockValue}</span>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setEditingProduct(product)}
                      className="p-2 rounded-full border border-slate-200 hover:border-slate-900 transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 rounded-full border border-slate-200 hover:border-rose-500 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {showCreateForm && (
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
          <AdminProductForm
            lang={lang}
            onSave={onSaveProduct}
            onCancel={() => setShowCreateForm(false)}
            authToken={authToken ?? ""}
            categories={categories}
            categoriesLoading={categoriesLoading}
            categoriesError={categoriesError}
            apiUrl={apiUrl}
          />
        </div>
      )}

      {editingProduct && (
        <div className="bg-white border border-slate-100 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Edit Product
              </p>
              <p className="text-lg font-light text-slate-900">
                {editingProduct.name_en}
              </p>
            </div>
            <button
              onClick={() => setEditingProduct(null)}
              className="text-xs uppercase tracking-[0.3em] text-slate-400 hover:text-slate-900"
            >
              Cancel
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              className="border-b border-slate-200 py-2 text-sm outline-none focus:border-slate-900"
              placeholder="Name (English)"
              value={editForm.name_en}
              onChange={(event) =>
                setEditForm({ ...editForm, name_en: event.target.value })
              }
            />
            <input
              className="border-b border-slate-200 py-2 text-sm outline-none focus:border-slate-900 font-myanmar"
              placeholder="Name (Burmese)"
              value={editForm.name_mm}
              onChange={(event) =>
                setEditForm({ ...editForm, name_mm: event.target.value })
              }
            />
            <textarea
              className="border-b border-slate-200 py-2 text-sm outline-none focus:border-slate-900 md:col-span-2"
              placeholder="Description (English)"
              rows={2}
              value={editForm.description_en}
              onChange={(event) =>
                setEditForm({ ...editForm, description_en: event.target.value })
              }
            />
            <textarea
              className="border-b border-slate-200 py-2 text-sm outline-none focus:border-slate-900 md:col-span-2 font-myanmar"
              placeholder="Description (Burmese)"
              rows={2}
              value={editForm.description_mm}
              onChange={(event) =>
                setEditForm({ ...editForm, description_mm: event.target.value })
              }
            />
            <input
              type="number"
              step="0.01"
              className="border-b border-slate-200 py-2 text-sm outline-none focus:border-slate-900"
              placeholder="Price"
              value={editForm.price}
              onChange={(event) =>
                setEditForm({ ...editForm, price: event.target.value })
              }
            />
            <input
              type="number"
              className="border-b border-slate-200 py-2 text-sm outline-none focus:border-slate-900"
              placeholder="Stock"
              value={editForm.stock}
              onChange={(event) =>
                setEditForm({ ...editForm, stock: event.target.value })
              }
            />
            <select
              className="border-b border-slate-200 py-2 text-sm outline-none focus:border-slate-900 bg-transparent"
              value={editForm.categoryId}
              onChange={(event) =>
                setEditForm({ ...editForm, categoryId: event.target.value })
              }
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name_en}
                </option>
              ))}
            </select>
            <select
              className="border-b border-slate-200 py-2 text-sm outline-none focus:border-slate-900 bg-transparent"
              value={editForm.audience}
              onChange={(event) =>
                setEditForm({
                  ...editForm,
                  audience: event.target.value as Audience,
                })
              }
            >
              <option value="all">All</option>
              <option value="man">Man</option>
              <option value="woman">Woman</option>
              <option value="child">Child</option>
            </select>
          </div>
          <div className="mt-8 flex justify-end gap-3">
            <button
              onClick={() => setEditingProduct(null)}
              className="px-5 py-2 rounded-full text-xs uppercase tracking-widest border border-slate-200"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={isSaving}
              className="px-5 py-2 rounded-full text-xs uppercase tracking-widest bg-slate-900 text-white hover:bg-pink-600 transition-colors"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
