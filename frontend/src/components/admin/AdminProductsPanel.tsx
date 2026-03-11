import { useState, useEffect } from "react";
import { useUpdateProductMutation, useDeleteProductMutation } from "../../lib/api";
import { Search, CheckCircle, Globe, Pencil, Trash2, X, Upload } from "lucide-react";
import type { Product, Lang, Category, Audience, VariantDraft, VariantOptionDraft } from "../../types";
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
  categoriesLoading: boolean;
  categoriesError: string | null;
}

export const AdminProductsPanel = ({
  products,
  categories,
  lang,
  categoriesLoading,
  categoriesError,
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
    videoUrl: "",
    variants: [] as VariantDraft[],
  });
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

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
      videoUrl: editingProduct.videoUrl ?? "",
      variants:
        editingProduct.variants?.map((v) => ({
          id: v.id,
          sku: v.sku,
          name_en: v.name_en,
          name_mm: v.name_mm,
          priceOverride: v.priceOverride?.toString() ?? "",
          stock: v.stock?.toString() ?? "0",
          options:
            v.options?.map((opt) => ({
              id: opt.id,
              type: opt.type,
              value_en: opt.value_en,
              value_mm: opt.value_mm,
            })) ?? [],
          imageFiles: [],
        })) ?? [],
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

  const makeId = () =>
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  const addVariant = () => {
    setEditForm((current) => ({
      ...current,
      variants: [
        ...current.variants,
        {
          id: makeId(),
          sku: "",
          name_en: "",
          name_mm: "",
          priceOverride: "",
          stock: "",
          options: [],
          imageFiles: [],
        },
      ],
    }));
  };

  const removeVariant = (variantId: string) => {
    setEditForm((current) => ({
      ...current,
      variants: current.variants.filter((variant) => variant.id !== variantId),
    }));
  };

  const updateVariantField = (
    variantId: string,
    field: keyof Omit<VariantDraft, "id" | "options">,
    value: string,
  ) => {
    setEditForm((current) => ({
      ...current,
      variants: current.variants.map((variant) =>
        variant.id === variantId ? { ...variant, [field]: value } : variant,
      ),
    }));
  };

  const addVariantOption = (variantId: string) => {
    setEditForm((current) => ({
      ...current,
      variants: current.variants.map((variant) =>
        variant.id === variantId
          ? {
              ...variant,
              options: [
                ...variant.options,
                { id: makeId(), type: "", value_en: "", value_mm: "" },
              ],
            }
          : variant,
      ),
    }));
  };

  const updateVariantOption = (
    variantId: string,
    optionId: string,
    field: keyof Omit<VariantOptionDraft, "id">,
    value: string,
  ) => {
    setEditForm((current) => ({
      ...current,
      variants: current.variants.map((variant) =>
        variant.id === variantId
          ? {
              ...variant,
              options: variant.options.map((option) =>
                option.id === optionId ? { ...option, [field]: value } : option,
              ),
            }
          : variant,
      ),
    }));
  };

  const removeVariantOption = (variantId: string, optionId: string) => {
    setEditForm((current) => ({
      ...current,
      variants: current.variants.map((variant) =>
        variant.id === variantId
          ? {
              ...variant,
              options: variant.options.filter(
                (option) => option.id !== optionId,
              ),
            }
          : variant,
      ),
    }));
  };

  const handleVariantImageSelect = (
    variantId: string,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setEditForm((current) => ({
        ...current,
        variants: current.variants.map((v) =>
          v.id === variantId
            ? { ...v, imageFiles: [...(v.imageFiles || []), ...newFiles] }
            : v,
        ),
      }));
    }
  };

  const removeVariantImage = (variantId: string, fileIndex: number) => {
    setEditForm((current) => ({
      ...current,
      variants: current.variants.map((v) =>
        v.id === variantId
          ? {
              ...v,
              imageFiles: (v.imageFiles || []).filter(
                (_, index) => index !== fileIndex,
              ),
            }
          : v,
      ),
    }));
  };

  const handleUpdate = async () => {
    if (!editingProduct) return;
    setIsSaving(true);
    setActionError(null);
    try {
      const payload: Record<string, any> = {
        name_en: editForm.name_en,
        name_mm: editForm.name_mm,
        description_en: editForm.description_en,
        description_mm: editForm.description_mm,
        price: editForm.price,
        stock: editForm.stock,
        categoryId: editForm.categoryId,
        audience: editForm.audience,
        videoUrl: editForm.videoUrl,
      };

      const formPayload = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          formPayload.append(key, value);
        }
      });

      if (editForm.variants.length > 0) {
        const variantPayload = editForm.variants.map((v) => ({
          id: v.id.length > 20 ? v.id : undefined, // UUIDs are long, makeId is short
          sku: v.sku,
          name_en: v.name_en,
          name_mm: v.name_mm,
          priceOverride: v.priceOverride ? Number(v.priceOverride) : undefined,
          stock: Number(v.stock) || 0,
          options: v.options.map((opt) => ({
            type: opt.type,
            value_en: opt.value_en,
            value_mm: opt.value_mm,
          })),
        }));

        formPayload.append("variants", JSON.stringify(variantPayload));

        // Images
        const allFiles: File[] = [];
        const variantImageMap: Record<string, number[]> = {};
        editForm.variants.forEach((v, vIdx) => {
          if (v.imageFiles && v.imageFiles.length > 0) {
            const indices: number[] = [];
            v.imageFiles.forEach((file) => {
              indices.push(allFiles.length);
              allFiles.push(file);
            });
            variantImageMap[vIdx.toString()] = indices;
          }
        });

        if (allFiles.length > 0) {
          allFiles.forEach((file) => formPayload.append("images", file));
          formPayload.append("variantImageMap", JSON.stringify(variantImageMap));
        }
      }

      await updateProduct({ id: editingProduct.id, payload: formPayload }).unwrap();
      setEditingProduct(null);
    } catch (error) {
      setActionError(getApiErrorMessage(error, "Failed to update product."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm("Delete this product?")) return;
    setActionError(null);
    try {
      await deleteProduct(productId).unwrap();
    } catch (error) {
      setActionError(getApiErrorMessage(error, "Failed to delete product."));
    }
  };

  const isMM = lang === "mm";

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
            onCancel={() => setShowCreateForm(false)}
            categories={categories}
            categoriesLoading={categoriesLoading}
            categoriesError={categoriesError}
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
            <input
              type="url"
              className="border-b border-slate-200 py-2 text-sm outline-none focus:border-slate-900 md:col-span-2"
              placeholder="YouTube or TikTok Video URL"
              value={editForm.videoUrl}
              onChange={(event) =>
                setEditForm({ ...editForm, videoUrl: event.target.value })
              }
            />
          </div>

          {/* Variants Editing Section */}
          <div className="mt-10 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] tracking-[0.2em] uppercase font-bold text-slate-400 border-b pb-2 flex-1">
                {isMM ? "အမျိုးမျိုး အရွယ်အစား & အရောင်" : "Product Variants"}
              </h3>
              <button
                type="button"
                onClick={addVariant}
                className="ml-4 px-4 py-2 text-xs font-semibold tracking-[0.2em] uppercase border border-slate-200 rounded-full hover:border-slate-900 transition-colors"
              >
                {isMM ? "Variant ထည့်ရန်" : "Add Variant"}
              </button>
            </div>

            {editForm.variants.length === 0 ? (
              <p className="text-xs text-slate-400">
                {isMM
                  ? 'Variant များ မရှိသေးပါ။ ထည့်သွင်းချင်ပါက "Add Variant" ကိုနှိပ်ပါ။'
                  : "No variants yet. Click “Add Variant” to define size/color combinations."}
              </p>
            ) : (
              <div className="space-y-6">
                {editForm.variants.map((variant, index) => (
                  <div
                    key={variant.id}
                    className="border border-slate-100 rounded-2xl p-6 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xs uppercase tracking-[0.3em] text-slate-500">
                        {isMM ? `Variant ${index + 1}` : `Variant ${index + 1}`}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeVariant(variant.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        required
                        placeholder="SKU"
                        className="border-b border-slate-200 py-2 text-sm outline-none focus:border-slate-900"
                        value={variant.sku}
                        onChange={(event) =>
                          updateVariantField(
                            variant.id,
                            "sku",
                            event.target.value,
                          )
                        }
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder={
                          isMM ? "စျေးနှုန်း (အကွာအဝေး)" : "Price Override"
                        }
                        className="border-b border-slate-200 py-2 text-sm outline-none focus:border-slate-900"
                        value={variant.priceOverride}
                        onChange={(event) =>
                          updateVariantField(
                            variant.id,
                            "priceOverride",
                            event.target.value,
                          )
                        }
                      />
                      <input
                        type="number"
                        placeholder={isMM ? "စာရင်းရှိ ပမာဏ" : "Variant Stock"}
                        className="border-b border-slate-200 py-2 text-sm outline-none focus:border-slate-900"
                        value={variant.stock}
                        onChange={(event) =>
                          updateVariantField(
                            variant.id,
                            "stock",
                            event.target.value,
                          )
                        }
                      />
                    </div>

                    <div className="mt-4 border border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center hover:bg-slate-50 transition-colors">
                      <p className="text-[10px] tracking-widest uppercase font-bold text-slate-400 mb-2">
                        {isMM ? "Variant ပုံများ" : "Variant Images"}
                      </p>
                      
                      {variant.imageFiles && variant.imageFiles.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4 justify-center">
                          {variant.imageFiles.map((file, idx) => (
                            <div key={idx} className="relative w-16 h-16 rounded overflow-hidden shadow-sm group border border-slate-200">
                              <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                className="absolute top-1 right-1 bg-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                onClick={() => removeVariantImage(variant.id, idx)}
                              >
                                <X size={12} className="text-red-500" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="relative group cursor-pointer inline-flex flex-col items-center">
                        <Upload size={16} className="text-slate-300 mb-1 group-hover:text-pink-500 transition-colors" />
                        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold group-hover:text-pink-600 transition-colors">
                          {isMM ? "ဓာတ်ပုံထည့်ရန်" : "Add Images"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e) => handleVariantImageSelect(variant.id, e)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <input
                        placeholder={
                          isMM ? "အမည် (English)" : "Variant Name (English)"
                        }
                        className="border-b border-slate-200 py-2 text-sm outline-none focus:border-slate-900"
                        value={variant.name_en}
                        onChange={(event) =>
                          updateVariantField(
                            variant.id,
                            "name_en",
                            event.target.value,
                          )
                        }
                      />
                      <input
                        placeholder={
                          isMM ? "အမည် (မြန်မာ)" : "Variant Name (Burmese)"
                        }
                        className="border-b border-slate-200 py-2 text-sm outline-none focus:border-slate-900 font-myanmar"
                        value={variant.name_mm}
                        onChange={(event) =>
                          updateVariantField(
                            variant.id,
                            "name_mm",
                            event.target.value,
                          )
                        }
                      />
                    </div>

                    <div className="mt-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] tracking-[0.2em] uppercase text-slate-400 font-bold">
                          {isMM ? "ရွေးချယ်စရာ Option" : "Variant Options"}
                        </p>
                        <button
                          type="button"
                          onClick={() => addVariantOption(variant.id)}
                          className="text-xs uppercase tracking-[0.2em] text-pink-600"
                        >
                          {isMM ? "Option ထည့်ရန်" : "Add Option"}
                        </button>
                      </div>
                      {variant.options.length === 0 ? (
                        <p className="text-xs text-slate-400">
                          {isMM
                            ? "ဒီ Variant အတွက် option မရှိသေးပါ။"
                            : "No options yet for this variant."}
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {variant.options.map((option) => (
                            <div
                              key={option.id}
                              className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center"
                            >
                              <input
                                placeholder={
                                  isMM
                                    ? "အမျိုးအစား (size/color)"
                                    : "Type (size/color)"
                                }
                                className="border-b border-slate-200 py-2 text-sm outline-none focus:border-slate-900"
                                value={option.type}
                                onChange={(event) =>
                                  updateVariantOption(
                                    variant.id,
                                    option.id,
                                    "type",
                                    event.target.value,
                                  )
                                }
                              />
                              <input
                                placeholder={
                                  isMM ? "တန်ဖိုး (English)" : "Value (English)"
                                }
                                className="border-b border-slate-200 py-2 text-sm outline-none focus:border-slate-900"
                                value={option.value_en}
                                onChange={(event) =>
                                  updateVariantOption(
                                    variant.id,
                                    option.id,
                                    "value_en",
                                    event.target.value,
                                  )
                                }
                              />
                              <input
                                placeholder={
                                  isMM ? "တန်ဖိုး (မြန်မာ)" : "Value (Burmese)"
                                }
                                className="border-b border-slate-200 py-2 text-sm outline-none focus:border-slate-900 font-myanmar"
                                value={option.value_mm}
                                onChange={(event) =>
                                  updateVariantOption(
                                    variant.id,
                                    option.id,
                                    "value_mm",
                                    event.target.value,
                                  )
                                }
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  removeVariantOption(variant.id, option.id)
                                }
                                className="text-slate-300 hover:text-red-500 transition-colors justify-self-end"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
