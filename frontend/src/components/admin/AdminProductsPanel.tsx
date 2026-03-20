import { useState, useEffect, useRef } from "react";
import { useUpdateProductMutation, useDeleteProductMutation } from "../../lib/api";
import { Search, CheckCircle, Globe, Pencil, Trash2, X, Upload } from "lucide-react";
import type {
  Product,
  Lang,
  Category,
  Audience,
  VariantDraft,
  VariantOptionDraft,
  VariantGroup,
  Brand,
} from "../../types";
import {
  getProductInStock,
  getCategoryLabel,
  getApiErrorMessage,
} from "../../utils/helpers";
import { AdminProductForm } from "./AdminProductForm";
import { VariantBuilder } from "./VariantBuilder";

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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [editBaseImageFiles, setEditBaseImageFiles] = useState<File[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({
    name_en: "",
    name_mm: "",
    description_en: "",
    description_mm: "",
    price: "",
    stock: "",
    brandId: "",
    categoryId: "",
    audience: "all" as Audience,
    videoUrl: "",
    variants: [] as VariantDraft[],
    variantGroups: [] as VariantGroup[],
  });
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  useEffect(() => {
    if (!editingProduct) {
      setEditBaseImageFiles([]);
      setImagesToDelete([]);
      return;
    }
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
      brandId: editingProduct.brandId ?? editingProduct.brand?.id ?? "",
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
      variantGroups: Array.isArray(editingProduct.variantGroups)
        ? (editingProduct.variantGroups as VariantGroup[])
        : [],
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

  const handleBaseImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setEditBaseImageFiles((current) => [...current, ...newFiles]);
    }
  };

  const removeBaseImage = (indexToRemove: number) => {
    setEditBaseImageFiles((current) =>
      current.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleRemoveExistingImage = (imageUrl: string) => {
    if (!window.confirm("Are you sure you want to delete this image? It will be removed when you save changes.")) return;
    setImagesToDelete((current) => [...current, imageUrl]);
  };

  const handleUpdate = async () => {
    if (!editingProduct) return;
    setIsSaving(true);
    setActionError(null);
    try {
      const payload: Record<string, string | number | boolean | undefined | null> = {
        name_en: editForm.name_en,
        name_mm: editForm.name_mm,
        description_en: editForm.description_en,
        description_mm: editForm.description_mm,
        price: editForm.price,
        stock: editForm.stock,
        brandId: editForm.brandId,
        categoryId: editForm.categoryId,
        audience: editForm.audience,
        videoUrl: editForm.videoUrl,
      };

      const formPayload = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          formPayload.append(key, String(value));
        }
      });
      formPayload.append(
        "variantGroups",
        JSON.stringify(editForm.variantGroups ?? []),
      );
      if (imagesToDelete.length > 0) {
        formPayload.append("imagesToDelete", JSON.stringify(imagesToDelete));
      }

      const allFiles: File[] = [...editBaseImageFiles];
      const variantImageMap: Record<string, number[]> = {};

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
      }

      if (allFiles.length > 0) {
        allFiles.forEach((file) => formPayload.append("images", file));
        if (Object.keys(variantImageMap).length > 0) {
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
    <div className="space-y-12">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-8 border-b border-slate-50">
        <div className="flex flex-1 items-center gap-4 bg-white border border-slate-100 rounded-2xl px-5 py-4 shadow-sm focus-within:ring-4 focus-within:ring-slate-900/5 focus-within:border-slate-900 transition-all">
          <Search size={20} className="text-slate-400" />
          <input
            className="w-full text-sm font-semibold outline-none text-slate-900 placeholder:text-slate-300 placeholder:font-normal"
            placeholder="Search our collection..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <select
            className="h-14 bg-white border border-slate-100 rounded-2xl px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 outline-none focus:border-slate-900 hover:bg-slate-50 transition-all cursor-pointer shadow-sm"
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
            className="h-14 bg-white border border-slate-100 rounded-2xl px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 outline-none focus:border-slate-900 hover:bg-slate-50 transition-all cursor-pointer shadow-sm"
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
            className="h-14 bg-slate-900 text-white rounded-2xl px-8 text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-3"
          >
            {showCreateForm ? (
               <>
                 <X size={16} /> Close Form
               </>
            ) : (
               <>
                 <Upload size={16} /> Add Product
               </>
            )}
          </button>
        </div>
      </div>

      {actionError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-semibold">
           {actionError}
        </div>
      )}

      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_120px_120px_100px_140px_100px] gap-4 text-[10px] uppercase tracking-[0.3em] text-slate-400 px-8 py-5 bg-slate-50/50 border-b border-slate-100 font-bold">
          <span>Product Artifact</span>
          <span>Brand</span>
          <span>Category</span>
          <span>Target</span>
          <span>Inventory Status</span>
          <span className="text-right">Actions</span>
        </div>
        <div className="divide-y divide-slate-50">
          {filteredProducts.length === 0 ? (
            <div className="px-8 py-24 text-sm text-slate-400 text-center italic">
              No products match your specified search parameters.
            </div>
          ) : (
            filteredProducts.map((product) => {
              const inStock = getProductInStock(product);
              const audienceLabel = product.audience ?? "all";
              const stockValue = Number(product.stock ?? 0);
              const mainImageUrl = product.images?.find(img => img.isMain)?.url || product.images?.[0]?.url;
              
              return (
                <div
                  key={product.id}
                  className="grid grid-cols-1 md:grid-cols-[2fr_120px_120px_100px_140px_100px] gap-4 items-center px-8 py-6 text-sm group hover:bg-slate-50/50 transition-all"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center group-hover:bg-white group-hover:ring-2 group-hover:ring-slate-900/5 transition-all">
                      {mainImageUrl ? (
                        <img src={mainImageUrl} className="w-full h-full object-cover" />
                      ) : (
                        <Globe size={20} className="text-slate-200" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-slate-900 font-bold uppercase tracking-tight text-base truncate">{product.name_en}</p>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest truncate">{product.name_mm}</p>
                    </div>
                  </div>
                  
                  <div className="text-slate-500 font-bold italic text-xs uppercase opacity-70">
                    {product.brand?.name || "Generic"}
                  </div>
                  
                  <div className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                    {getCategoryLabel(product.category)}
                  </div>
                  
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border border-slate-100 bg-white px-2 py-1 rounded-md w-fit">
                    {audienceLabel}
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest w-fit ${
                        inStock
                          ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100"
                          : "bg-purple-50 text-purple-600 ring-1 ring-purple-100"
                      }`}
                    >
                      {inStock ? <CheckCircle size={10} /> : <Globe size={10} />}
                      {inStock ? "Live" : "Pre-Order"}
                    </span>
                    <p className="text-[10px] font-bold text-slate-900 pl-1">
                      {stockValue} <span className="text-slate-300 font-normal">Units</span>
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                    <button
                      onClick={() => setEditingProduct(product)}
                      className="p-2.5 rounded-full border border-slate-100 bg-white text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all shadow-sm active:scale-90"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2.5 rounded-full border border-slate-100 bg-white text-slate-400 hover:text-red-500 hover:border-red-500 transition-all shadow-sm active:scale-90"
                      title="Delete"
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
            brands={brands}
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
              value={editForm.brandId}
              onChange={(event) =>
                setEditForm({ ...editForm, brandId: event.target.value })
              }
            >
              <option value="">{isMM ? "အမှတ်တံဆိပ် မရှိပါ" : "No Brand"}</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
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

          <div className="mt-8 border border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer group relative"
               onClick={() => fileInputRef.current?.click()}>
            <Upload className="text-slate-300 group-hover:text-slate-900 mb-4 transition-colors" />
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
              {isMM ? "ဓာတ်ပုံအသစ်များ ထည့်ရန်" : "Add New Images"}
            </p>
            <p className="text-[10px] text-slate-400 mt-2">
              {isMM ? "JPEG/PNG up to 5MB" : "JPEG/PNG up to 5MB"}
            </p>
            
            {(editBaseImageFiles.length > 0 || (editingProduct?.images && editingProduct.images.length > 0)) && (
              <div className="mt-4 flex flex-wrap gap-2 justify-center w-full" onClick={(e) => e.stopPropagation()}>
                {editingProduct?.images?.filter(img => !imagesToDelete.includes(img.url)).map((img, idx) => (
                  <div key={`existing-${idx}`} className="relative w-20 h-20 rounded-xl overflow-hidden shadow-sm group/img border border-slate-200 bg-white">
                    <img src={img.url} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-white rounded-full p-1 opacity-0 group-hover/img:opacity-100 transition-opacity shadow-sm"
                      onClick={() => handleRemoveExistingImage(img.url)}
                      title="Delete Image"
                    >
                      <Trash2 size={12} className="text-red-500" />
                    </button>
                    {img.isMain && (
                      <span className="absolute bottom-0 left-0 right-0 bg-slate-900/50 text-white text-[8px] text-center py-0.5 uppercase tracking-wider">
                        Main
                      </span>
                    )}
                  </div>
                ))}
                {editBaseImageFiles.map((file, idx) => (
                  <div key={`new-${idx}`} className="relative w-20 h-20 rounded-xl overflow-hidden shadow-sm group/img border border-slate-200 bg-white">
                    <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-white rounded-full p-1 opacity-0 group-hover/img:opacity-100 transition-opacity shadow-sm"
                      onClick={() => removeBaseImage(idx)}
                    >
                      <X size={12} className="text-red-500" />
                    </button>
                    <span className="absolute bottom-0 left-0 right-0 bg-pink-500/80 text-white text-[8px] text-center py-0.5 uppercase tracking-wider">
                      New
                    </span>
                  </div>
                ))}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => {
                handleBaseImageSelect(event);
                event.stopPropagation();
              }}
            />
          </div>

          <div className="mt-8">
            <VariantBuilder
              variantGroups={editForm.variantGroups}
              onChangeGroups={(groups) =>
                setEditForm({ ...editForm, variantGroups: groups })
              }
              onGenerate={(variants) =>
                setEditForm({ ...editForm, variants })
              }
              makeId={makeId}
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
