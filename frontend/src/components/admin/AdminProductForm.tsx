import { useState, useEffect, useRef } from "react";
import { useCreateProductMutation } from "../../lib/api";
import { ArrowLeft, Upload, X } from "lucide-react";
import type {
  Lang,
  AdminFormState,
  Category,
  VariantDraft,
  VariantOptionDraft,
  Audience,
  Brand,
} from "../../types";
import { VariantBuilder } from "./VariantBuilder";

interface AdminProductFormProps {
  onCancel: () => void;
  lang: Lang;
  categories: Category[];
  brands: Brand[];
  categoriesLoading?: boolean;
  categoriesError?: string | null;
}

export const AdminProductForm = ({
  onCancel,
  lang,
  categories,
  brands,
  categoriesLoading = false,
  categoriesError = null,
}: AdminProductFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMM = lang === "mm";
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [baseImageFiles, setBaseImageFiles] = useState<File[]>([]);
  const [createProduct] = useCreateProductMutation();

  const makeId = () =>
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  const [formData, setFormData] = useState<AdminFormState>({
    name_en: "",
    name_mm: "",
    description_en: "",
    description_mm: "",
    price: "",
    stock: "",
    brandId: "",
    categoryId: "",
    audience: "all",
    imageUrl: "",
    videoUrl: "",
    variants: [],
    variantGroups: [],
  });
  const inputBase =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";
  const textareaBase =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 resize-none";
  const selectBase = `${inputBase} pr-8`;
  const labelBase =
    "block text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 mb-2";
  const sectionCard = "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm";

  useEffect(() => {
    if (categoriesLoading || !categories.length) return;
    setFormData((current) =>
      current.categoryId
        ? current
        : {
            ...current,
            categoryId: categories[0].id,
          },
    );
  }, [categories, categoriesLoading]);

  const addVariant = () => {
    setFormData((current) => ({
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
    setFormData((current) => ({
      ...current,
      variants: current.variants.filter((variant) => variant.id !== variantId),
    }));
  };

  const updateVariantField = (
    variantId: string,
    field: keyof Omit<VariantDraft, "id" | "options">,
    value: string,
  ) => {
    setFormData((current) => ({
      ...current,
      variants: current.variants.map((variant) =>
        variant.id === variantId ? { ...variant, [field]: value } : variant,
      ),
    }));
  };

  const addVariantOption = (variantId: string) => {
    setFormData((current) => ({
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
    setFormData((current) => ({
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
    setFormData((current) => ({
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

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setBaseImageFiles((current) => [...current, ...newFiles]);
    }
  };

  const removeBaseImage = (indexToRemove: number) => {
    setBaseImageFiles((current) =>
      current.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleVariantImageSelect = (
    variantId: string,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setFormData((current) => ({
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
    setFormData((current) => ({
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (isSubmitting) return;

    const baseFiles = baseImageFiles;
    
    let hasAnyImages = baseFiles.length > 0;
    formData.variants.forEach(variant => {
         if (variant.imageFiles && variant.imageFiles.length > 0) hasAnyImages = true;
    });

    if (!hasAnyImages) {
      alert(
        isMM
          ? "ဓာတ်ပုံတစ်ပုံအနည်းဆုံး တင်ပေးပါ"
          : "Please attach at least one product image.",
      );
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);

    const price = Number.parseFloat(formData.price);
    const normalizedCategoryId = formData.categoryId || categories[0]?.id;
    const normalizedAudience = formData.audience ?? "all";
    const normalizedStock = Number.parseInt(formData.stock || "0", 10);

    if (!normalizedCategoryId) {
      alert(isMM ? "Category မရှိသေးပါ" : "Please select a category.");
      setIsSubmitting(false);
      return;
    }

    const validVariants = formData.variants.filter(
      (variant) => variant.sku && variant.name_en && variant.name_mm,
    );
    
    const allFilesToUpload: File[] = [...baseFiles];
    const variantImageMap: Record<string, number[]> = {};

    validVariants.forEach((variant, vIndex) => {
       if (variant.imageFiles && variant.imageFiles.length > 0) {
           const indices: number[] = [];
           variant.imageFiles.forEach(file => {
               indices.push(allFilesToUpload.length);
               allFilesToUpload.push(file);
           });
           variantImageMap[vIndex.toString()] = indices;
       }
    });

    const optionImageMap: Record<string, number[]> = {};
    const fileToIndexMap = new Map<File, number>();

    const variantPayload = validVariants.length
      ? validVariants
          .map((variant, vIndex) => ({
            sku: variant.sku,
            name_en: variant.name_en,
            name_mm: variant.name_mm,
            priceOverride: variant.priceOverride
              ? Number(variant.priceOverride)
              : undefined,
            stock: Number(variant.stock) || 0,
            options: variant.options
              .filter(
                (option) => option.type && option.value_en && option.value_mm,
              )
              .map((option, oIndex) => {
                if (option.imageFile) {
                  let fileIdx = fileToIndexMap.get(option.imageFile);
                  if (fileIdx === undefined) {
                    fileIdx = allFilesToUpload.length;
                    fileToIndexMap.set(option.imageFile, fileIdx);
                    allFilesToUpload.push(option.imageFile);
                  }
                  optionImageMap[`${vIndex}-${oIndex}`] = [fileIdx];
                }
                return {
                  type: option.type,
                  value_en: option.value_en,
                  value_mm: option.value_mm,
                  color: option.color,
                  imageUrl: option.imageUrl,
                };
              }),
          }))
      : undefined;

    try {
      const formPayload = new FormData();
      formPayload.append("name_en", formData.name_en);
      formPayload.append("name_mm", formData.name_mm);
      formPayload.append("description_en", formData.description_en);
      formPayload.append("description_mm", formData.description_mm);
      formPayload.append("price", price.toString());
      formPayload.append("stock", Number.isNaN(normalizedStock) ? "0" : normalizedStock.toString());
      formPayload.append("categoryId", normalizedCategoryId);
      if (formData.brandId) {
        formPayload.append("brandId", formData.brandId);
      }
      formPayload.append("audience", normalizedAudience);
      formPayload.append(
        "variantGroups",
        JSON.stringify(formData.variantGroups ?? []),
      );
      if (variantPayload) {
        formPayload.append("variants", JSON.stringify(variantPayload));
        if (Object.keys(variantImageMap).length > 0) {
           formPayload.append("variantImageMap", JSON.stringify(variantImageMap));
        }
        if (Object.keys(optionImageMap).length > 0) {
           formPayload.append("optionImageMap", JSON.stringify(optionImageMap));
        }
      }
      if (formData.videoUrl.trim()) {
        formPayload.append("videoUrl", formData.videoUrl.trim());
      }
      allFilesToUpload.forEach((file) => formPayload.append("images", file));

      await createProduct(formPayload).unwrap();
      setFormData({
        name_en: "",
        name_mm: "",
        description_en: "",
        description_mm: "",
        price: "",
        stock: "",
        brandId: "",
        categoryId: categories[0]?.id ?? "",
        audience: "all",
        imageUrl: "",
        videoUrl: "",
        variants: [],
        variantGroups: [],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-10">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors text-xs uppercase tracking-widest font-bold"
        >
          <ArrowLeft size={16} /> {isMM ? "ပြန်သွားရန်" : "Back"}
        </button>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
            Product Setup
          </p>
          <h2 className="text-2xl tracking-[0.3em] font-light uppercase">
            {isMM ? "ပစ္စည်းအသစ်ထည့်ရန်" : "Add New Product"}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Language Split Sections */}
        <div className={sectionCard}>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
                Product Details
              </p>
              <h3 className="text-base font-semibold text-slate-900">
                English and Burmese Information
              </h3>
            </div>
            <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Both required
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
                English
              </p>
              <div>
                <label className={labelBase}>Product Name</label>
                <input
                  required
                  placeholder="Product Name"
                  className={inputBase}
                  value={formData.name_en}
                  onChange={(event) =>
                    setFormData({ ...formData, name_en: event.target.value })
                  }
                />
              </div>
              <div>
                <label className={labelBase}>Description</label>
                <textarea
                  placeholder="Description"
                  rows={4}
                  className={textareaBase}
                  value={formData.description_en}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      description_en: event.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
                Burmese
              </p>
              <div>
                <label className={labelBase}>
                  {isMM ? "Product Name (Burmese)" : "Product Name (Burmese)"}
                </label>
                <input
                  required
                  placeholder="Product Name (Burmese)"
                  className={`${inputBase} font-myanmar`}
                  value={formData.name_mm}
                  onChange={(event) =>
                    setFormData({ ...formData, name_mm: event.target.value })
                  }
                />
              </div>
              <div>
                <label className={labelBase}>
                  {isMM ? "Description (Burmese)" : "Description (Burmese)"}
                </label>
                <textarea
                  placeholder="Description (Burmese)"
                  rows={4}
                  className={`${textareaBase} font-myanmar`}
                  value={formData.description_mm}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      description_mm: event.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>
        {/* Generic Info */}
        <div className={sectionCard}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
                Pricing & Inventory
              </p>
              <h3 className="text-base font-semibold text-slate-900">
                Core Product Settings
              </h3>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Pricing
              </h4>
              <div>
                <label className={labelBase}>Price (MMK)</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className={inputBase}
                  value={formData.price}
                  onChange={(event) =>
                    setFormData({ ...formData, price: event.target.value })
                  }
                />
              </div>
              <div>
                <label className={labelBase}>
                  {isMM ? "Stock" : "Stock"}
                </label>
                <input
                  type="number"
                  placeholder="0"
                  className={inputBase}
                  value={formData.stock}
                  onChange={(event) =>
                    setFormData({ ...formData, stock: event.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Classification
              </h4>
              <div>
                <label className={labelBase}>Brand</label>
                <select
                  className={selectBase}
                  value={formData.brandId}
                  onChange={(event) =>
                    setFormData({ ...formData, brandId: event.target.value })
                  }
                >
                  <option value="">{isMM ? "အမှတ်တံဆိပ် မရှိပါ" : "No Brand"}</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelBase}>Audience</label>
                <select
                  className={selectBase}
                  value={formData.audience}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      audience: event.target.value as Audience,
                    })
                  }
                >
                  <option value="all">{isMM ? "All" : "All"}</option>
                  <option value="man">{isMM ? "Man" : "Man"}</option>
                  <option value="woman">{isMM ? "Woman" : "Woman"}</option>
                  <option value="child">{isMM ? "Child" : "Child"}</option>
                </select>
              </div>
              <div>
                <label className={labelBase}>Category</label>
                <select
                  className={selectBase}
                  value={formData.categoryId}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      categoryId: event.target.value,
                    })
                  }
                  disabled={categoriesLoading || !categories.length}
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {isMM ? category.name_mm : category.name_en}
                    </option>
                  ))}
                </select>
                {categoriesLoading && (
                  <p className="text-xs text-slate-400 mt-2">
                    {isMM
                      ? "Loading categories..."
                      : "Loading categories..."}
                  </p>
                )}
                {!categoriesLoading && !categories.length && (
                  <p className="text-xs text-red-500 mt-2">
                    {isMM
                      ? "No categories available. Please seed categories first."
                      : "No categories available. Please seed categories first."}
                  </p>
                )}
                {categoriesError && (
                  <p className="text-xs text-red-500 mt-2">{categoriesError}</p>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Image / Links */}
        <div className={sectionCard}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
                Media
              </p>
              <h3 className="text-base font-semibold text-slate-900">
                Images and Video
              </h3>
            </div>
            <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Images required
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer group relative"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="text-slate-300 group-hover:text-slate-900 mb-4 transition-colors" />
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                {isMM ? "Click to Upload Images" : "Click to Upload Images"}
              </p>
              <p className="text-[10px] text-slate-400 mt-2">
                {isMM ? "JPEG/PNG up to 5MB" : "JPEG/PNG up to 5MB"}
              </p>
              {baseImageFiles.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2 justify-center w-full" onClick={(e) => e.stopPropagation()}>
                  {baseImageFiles.map((file, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden shadow-sm group border border-slate-200 bg-white">
                      <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        onClick={() => removeBaseImage(idx)}
                      >
                        <X size={12} className="text-red-500" />
                      </button>
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
                  handleImageSelect(event);
                  event.stopPropagation();
                }}
              />
            </div>
            <div className="space-y-4">
              <div>
                <label className={labelBase}>
                  {isMM ? "Cloudinary Image URL (Optional)" : "Cloudinary Image URL (Optional)"}
                </label>
                <input
                  type="text"
                  placeholder={
                    isMM
                      ? "Paste Cloudinary URL"
                      : "Paste Cloudinary URL"
                  }
                  className={inputBase}
                  value={formData.imageUrl}
                  onChange={(event) =>
                    setFormData({ ...formData, imageUrl: event.target.value })
                  }
                />
              </div>
              <div>
                <label className={labelBase}>
                  {isMM ? "Video Link (Optional)" : "Video Link (Optional)"}
                </label>
                <input
                  type="url"
                  placeholder={
                    isMM
                      ? "YouTube or TikTok URL"
                      : "YouTube or TikTok URL"
                  }
                  className={inputBase}
                  value={formData.videoUrl}
                  onChange={(event) =>
                    setFormData({ ...formData, videoUrl: event.target.value })
                  }
                />
                <p className="text-[10px] text-slate-400 mt-2">
                  {isMM
                    ? "Paste a YouTube or TikTok URL to embed a product video"
                    : "Paste a YouTube or TikTok URL to embed a product video"}
                </p>
              </div>
            </div>
          </div>
        </div>
        <VariantBuilder
          variantGroups={formData.variantGroups}
          onChangeGroups={(groups) =>
            setFormData({ ...formData, variantGroups: groups })
          }
          onGenerate={(variants) =>
            setFormData({ ...formData, variants })
          }
          makeId={makeId}
        />
        <div className="space-y-6">
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

          {formData.variants.length === 0 ? (
            <p className="text-xs text-slate-400">
              {isMM
                ? 'Variant များ မရှိသေးပါ။ ထည့်သွင်းချင်ပါက "Add Variant" ကိုနှိပ်ပါ။'
                : "No variants yet. Click “Add Variant” to define size/color combinations."}
            </p>
          ) : (
            <div className="space-y-6">
              {formData.variants.map((variant, index) => (
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
                      className="border-b border-slate-200 py-2 text-sm outline-none focus:border-brand"
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
                      className="border-b border-slate-200 py-2 text-sm outline-none focus:border-brand"
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
                      className="border-b border-slate-200 py-2 text-sm outline-none focus:border-brand"
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
                      className="border-b border-slate-200 py-2 text-sm outline-none focus:border-brand"
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
                      className="border-b border-slate-200 py-2 text-sm outline-none focus:border-brand font-myanmar"
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
                              className="border-b border-slate-200 py-2 text-sm outline-none focus:border-brand"
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
                              className="border-b border-slate-200 py-2 text-sm outline-none focus:border-brand"
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
                              className="border-b border-slate-200 py-2 text-sm outline-none focus:border-brand font-myanmar"
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

        <button
          type="submit"
          className="w-full bg-brand text-white py-4 rounded-full text-xs font-bold uppercase tracking-[0.3em] hover:bg-brand-hover transition-all shadow-xl btn-premium"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? isMM
              ? "Uploading…"
              : "Uploading…"
            : isMM
              ? "သိမ်းဆည်းမည်"
              : "Save Product"}
        </button>
      </form>
    </div>
  );
};




