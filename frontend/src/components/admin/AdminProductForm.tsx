import { useState, useEffect, useRef } from "react";
import {
  useCreateProductMutation,
  useUpdateProductMutation,
} from "../../lib/api";
import { ArrowLeft, Upload, Trash2, X } from "lucide-react";
import type {
  Lang,
  AdminFormState,
  Category,
  VariantDraft,
  Audience,
  Brand,
  Product,
} from "../../types";
import { VariantBuilder } from "./VariantBuilder";

interface AdminProductFormProps {
  onCancel: () => void;
  onSuccess?: () => void;
  lang: Lang;
  categories: Category[];
  brands: Brand[];
  categoriesLoading?: boolean;
  categoriesError?: string | null;
  initialData?: Product;
}

export const AdminProductForm = ({
  onCancel,
  onSuccess,
  lang,
  categories,
  brands,
  initialData,
}: AdminProductFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMM = lang === "mm";
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  const [baseImageFiles, setBaseImageFiles] = useState<File[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [bulkPrice, setBulkPrice] = useState("");
  const [bulkStock, setBulkStock] = useState("");
  
  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();

  const isEditing = !!initialData;

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

  useEffect(() => {
    if (initialData) {
      const categoryId =
        typeof initialData.category === "string"
          ? initialData.category
          : initialData.category.id;
          
      setFormData({
        name_en: initialData.name_en ?? "",
        name_mm: initialData.name_mm ?? "",
        description_en: initialData.description_en ?? "",
        description_mm: initialData.description_mm ?? "",
        price: initialData.price?.toString() ?? "",
        stock: initialData.stock?.toString() ?? "0",
        brandId: initialData.brandId ?? initialData.brand?.id ?? "",
        categoryId,
        audience: initialData.audience ?? "all",
        videoUrl: initialData.videoUrl ?? "",
        imageUrl: "", // Handled via existing images in editing state
        variants:
          initialData.variants?.map((v) => ({
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
                color: opt.color,
                imageUrl: opt.imageUrl,
              })) ?? [],
            imageFiles: [],
          })) ?? [],
        variantGroups: Array.isArray(initialData.variantGroups)
          ? initialData.variantGroups
          : [],
      });
    } else if (categories.length && !formData.categoryId) {
      setFormData((current) => ({
        ...current,
        categoryId: categories[0].id,
      }));
    }
  }, [initialData, categories, formData.categoryId]);

  // STYLES
  const inputBase =
    "w-full rounded-xl border border-transparent bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:bg-white focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all placeholder:text-slate-400";
  const textareaBase = `${inputBase} resize-none min-h-[120px]`;
  const labelBase = "block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2";
  const cardBase = "bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100/50";

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

  const handleBaseImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
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
  
  const handleRemoveExistingImage = (url: string) => {
    if (!window.confirm(isMM ? "ဖျက်ရန် သေချာပါသလား?" : "Are you sure you want to delete this image?")) return;
    setImagesToDelete(curr => [...curr, url]);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    let hasAnyImages = baseImageFiles.length > 0 || (initialData?.images?.filter(img => !imagesToDelete.includes(img.url)).length ?? 0) > 0;
    
    if (!isEditing && formData.imageUrl) {
        hasAnyImages = true;
    }
    
    formData.variants.forEach(variant => {
         if (variant.imageFiles && variant.imageFiles.length > 0) hasAnyImages = true;
    });

    if (!hasAnyImages) {
      alert(isMM ? "ဓာတ်ပုံတစ်ပုံအနည်းဆုံး တင်ပေးပါ" : "Please attach at least one product image.");
      return;
    }

    const price = Number.parseFloat(formData.price) || 0;
    const normalizedCategoryId = formData.categoryId || categories[0]?.id;
    const normalizedAudience = formData.audience ?? "all";
    const normalizedStock = Number.parseInt(formData.stock || "0", 10);

    if (!normalizedCategoryId) {
      alert(isMM ? "Category မရှိသေးပါ" : "Please select a category.");
      return;
    }

    setIsSubmitting(true);
    
    const validVariants = formData.variants.filter(
      (variant) => variant.sku && variant.name_en && variant.name_mm,
    );
    
    const allFilesToUpload: File[] = [...baseImageFiles];
    const variantImageMap: Record<string, number[]> = {};
    const optionImageMap: Record<string, number[]> = {};
    
    // Track unique files to avoid duplicate uploads
    const fileToIndexMap = new Map<File, number>();
    baseImageFiles.forEach((file, idx) => fileToIndexMap.set(file, idx));

    validVariants.forEach((variant, vIndex) => {
       // Check variant-level images (legacy or direct)
       if (variant.imageFiles && variant.imageFiles.length > 0) {
           const indices: number[] = [];
           variant.imageFiles.forEach(file => {
               let idx = fileToIndexMap.get(file);
               if (idx === undefined) {
                   idx = allFilesToUpload.length;
                   allFilesToUpload.push(file);
                   fileToIndexMap.set(file, idx);
               }
               indices.push(idx);
           });
           variantImageMap[vIndex.toString()] = indices;
       }

       // Check option-level images (the new way)
       variant.options.forEach((option, oIndex) => {
          if (option.imageFile) {
            let idx = fileToIndexMap.get(option.imageFile);
            if (idx === undefined) {
              idx = allFilesToUpload.length;
              allFilesToUpload.push(option.imageFile);
              fileToIndexMap.set(option.imageFile, idx);
            }
            optionImageMap[`${vIndex}-${oIndex}`] = [idx];
          }
       });
    });

    const variantPayload = validVariants.length
      ? validVariants.map((variant) => ({
             id: variant.id.length > 20 ? variant.id : undefined,
             sku: variant.sku,
             name_en: variant.name_en,
             name_mm: variant.name_mm,
             priceOverride: variant.priceOverride ? Number(variant.priceOverride) : undefined,
             stock: Number(variant.stock) || 0,
             options: variant.options.map((option) => ({
                type: option.type,
                value_en: option.value_en,
                value_mm: option.value_mm,
                color: option.color,
                imageUrl: option.imageUrl,
             })),
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
      formPayload.append("variantGroups", JSON.stringify(formData.variantGroups ?? []));
      
      if (variantPayload) {
        formPayload.append("variants", JSON.stringify(variantPayload));
        if (Object.keys(variantImageMap).length > 0) formPayload.append("variantImageMap", JSON.stringify(variantImageMap));
        if (Object.keys(optionImageMap).length > 0) formPayload.append("optionImageMap", JSON.stringify(optionImageMap));
      }
      
      if (formData.videoUrl.trim()) formPayload.append("videoUrl", formData.videoUrl.trim());
      if (isEditing && imagesToDelete.length > 0) formPayload.append("imagesToDelete", JSON.stringify(imagesToDelete));
      
      allFilesToUpload.forEach((file) => formPayload.append("images", file));

      if (isEditing) {
         await updateProduct({ id: initialData.id, payload: formPayload }).unwrap();
      } else {
         await createProduct(formPayload).unwrap();
      }
      
      if (onSuccess) onSuccess();
      else onCancel();
      
    } catch (e) {
      console.error(e);
      alert(isMM ? "လုပ်ဆောင်ချက် မအောင်မြင်ပါ။" : "Action failed. Check console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50/50 min-h-[50vh] animate-in fade-in zoom-in-[0.98] duration-300">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 py-4 px-6 md:px-8 mb-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="h-10 w-10 bg-slate-50 border border-slate-100 text-slate-500 hover:text-slate-900 rounded-full flex items-center justify-center transition-all hover:bg-slate-100">
            <ArrowLeft size={18} />
          </button>
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400">
               {isEditing ? "Product Management" : "Back to Products"}
            </p>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
               {isEditing ? (isMM ? "ပစ္စည်းအချက်အလက်ပြင်ရန်" : "Edit Product") : (isMM ? "ပစ္စည်းအသစ်ထည့်ရန်" : "Add New Product")}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={onCancel} className="hidden md:block px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-colors">
             Cancel
          </button>
          <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest bg-brand text-white hover:bg-brand-hover shadow-lg shadow-brand/20 transition-all btn-premium disabled:opacity-50">
            {isSubmitting ? "Saving..." : (isEditing ? "Save Changes" : "Create Product")}
          </button>
        </div>
      </div>

      <div className="px-4 md:px-8 max-w-7xl mx-auto pb-24">
         <form id="product-form" onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* LEFT COLUMN - MAIN DETAILS */}
            <div className="flex-1 w-full space-y-8">
               {/* BASIC INFO */}
               <div className={cardBase}>
                  <div className="mb-6">
                     <h3 className="text-base font-extrabold text-slate-900 tracking-tight">{isMM ? "အခြေခံ အချက်အလက်" : "Basic Information"}</h3>
                     <p className="text-xs text-slate-500 mt-1">{isMM ? "အမည်နှင့် အကြောင်းအရာများ" : "Product name and description in both languages."}</p>
                  </div>
                  
                  <div className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                           <label className={labelBase}>Name (English) *</label>
                           <input required placeholder="E.g. Summer Floral Dress" className={inputBase} value={formData.name_en} onChange={(e) => setFormData({...formData, name_en: e.target.value})} />
                         </div>
                         <div>
                           <label className={labelBase}>Name (Burmese) *</label>
                           <input required placeholder="E.g. နွေရာသီ ပန်းပွင့်ဂါဝန်" className={`${inputBase} font-myanmar`} value={formData.name_mm} onChange={(e) => setFormData({...formData, name_mm: e.target.value})} />
                         </div>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                           <label className={labelBase}>Description (English)</label>
                           <textarea placeholder="Write a detailed description..." className={textareaBase} value={formData.description_en} onChange={(e) => setFormData({...formData, description_en: e.target.value})} />
                         </div>
                         <div>
                           <label className={labelBase}>Description (Burmese)</label>
                           <textarea placeholder="အကြောင်းအရာ ရေးရန်..." className={`${textareaBase} font-myanmar`} value={formData.description_mm} onChange={(e) => setFormData({...formData, description_mm: e.target.value})} />
                         </div>
                     </div>
                  </div>
               </div>

               {/* MEDIA */}
               <div className={cardBase}>
                  <div className="mb-6 flex items-center justify-between">
                     <div>
                        <h3 className="text-base font-extrabold text-slate-900 tracking-tight">{isMM ? "ဓာတ်ပုံများ" : "Media"}</h3>
                        <p className="text-xs text-slate-500 mt-1">{isMM ? "ပစ္စည်းပုံများ တင်ပါ" : "Upload product images."}</p>
                     </div>
                     <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-pink-500 bg-pink-50 px-3 py-1 rounded-full">Required</span>
                  </div>
                  
                  <div 
                     className="border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 rounded-2xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer group"
                     onClick={() => fileInputRef.current?.click()}
                  >
                     <Upload className="text-slate-300 group-hover:text-slate-500 mb-4 transition-colors" size={32} />
                     <p className="text-sm font-bold text-slate-700 mb-1">{isMM ? "ဓာတ်ပုံများ ဆွဲထည့်ပါ သို့မဟုတ် ရွေးချယ်ပါ" : "Click to Upload Images"}</p>
                     <p className="text-[10px] tracking-widest uppercase font-bold text-slate-400">JPEG, PNG up to 5MB</p>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { handleBaseImageSelect(e); e.stopPropagation(); }} />

                  {/* Image Previews */}
                  {(baseImageFiles.length > 0 || (isEditing && initialData?.images && initialData.images.length > 0)) && (
                     <div className="mt-6 flex flex-wrap gap-4">
                        {isEditing && initialData?.images?.filter(img => !imagesToDelete.includes(img.url)).map((img, idx) => (
                           <div key={`existing-${idx}`} className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-sm border border-slate-200 group/img">
                              <img src={img.url} className="w-full h-full object-cover" />
                              <button type="button" className="absolute top-2 right-2 bg-white/90 backdrop-blur rounded-full p-1.5 opacity-0 group-hover/img:opacity-100 transition-all hover:bg-red-50" onClick={() => handleRemoveExistingImage(img.url)}>
                                 <Trash2 size={14} className="text-red-500" />
                              </button>
                           </div>
                        ))}
                        {baseImageFiles.map((file, idx) => (
                           <div key={`new-${idx}`} className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-sm border border-slate-200 group/img">
                              <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                              <button type="button" className="absolute top-2 right-2 bg-white/90 backdrop-blur rounded-full p-1.5 opacity-0 group-hover/img:opacity-100 transition-all hover:bg-red-50" onClick={() => removeBaseImage(idx)}>
                                 <X size={14} className="text-red-500" />
                              </button>
                              <span className="absolute bottom-0 left-0 right-0 bg-brand/90 text-white text-[9px] font-bold text-center py-1 uppercase tracking-widest backdrop-blur">New</span>
                           </div>
                        ))}
                     </div>
                  )}

                  {!isEditing && (
                     <div className="mt-6">
                        <label className={labelBase}>Or provide Image URL (Optional)</label>
                        <input type="text" placeholder="https://..." className={inputBase} value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} />
                     </div>
                  )}
               </div>

               {/* VARIANTS BUILDER */}
               <VariantBuilder
                  variantGroups={formData.variantGroups}
                  variants={formData.variants}
                  onChangeGroups={(groups) => setFormData({ ...formData, variantGroups: groups })}
                  onGenerate={(variants) => setFormData({ ...formData, variants })}
                  makeId={makeId}
                  bulkPrice={bulkPrice}
                  bulkStock={bulkStock}
                  setBulkPrice={setBulkPrice}
                  setBulkStock={setBulkStock}
               />

               {/* RENDERED VARIANTS */}
               {formData.variants.length > 0 && (
                  <div className={cardBase}>
                     <div className="flex items-center justify-between mb-6">
                        <div>
                           <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Active Variants</h3>
                           <p className="text-xs text-slate-500 mt-1">{formData.variants.length} combinations generated.</p>
                        </div>
                        <button type="button" onClick={addVariant} className="px-4 py-2 text-[10px] font-bold tracking-widest uppercase bg-slate-50 text-slate-600 rounded-full hover:bg-slate-100 transition-all border border-slate-200">
                           + Add Manual
                        </button>
                     </div>
                     
                     <div className="space-y-4">
                        {formData.variants.map((variant, index) => (
                           <div key={variant.id} className="border border-slate-100 bg-slate-50/50 rounded-2xl p-5">
                              <div className="flex flex-col md:flex-row md:items-center gap-4">
                                 <div className="w-[40px] h-[40px] bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center font-bold text-slate-400 text-xs">{index + 1}</div>
                                 <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                       <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 ml-1">SKU</label>
                                       <input required className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand" value={variant.sku} onChange={(e) => updateVariantField(variant.id, "sku", e.target.value)} />
                                    </div>
                                    <div>
                                       <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 ml-1">Price (+/-)</label>
                                       <input type="number" step="0.01" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand" placeholder="Override" value={variant.priceOverride} onChange={(e) => updateVariantField(variant.id, "priceOverride", e.target.value)} />
                                    </div>
                                    <div>
                                       <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 ml-1">Stock</label>
                                       <input type="number" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand" value={variant.stock} onChange={(e) => updateVariantField(variant.id, "stock", e.target.value)} />
                                    </div>
                                 </div>
                                 <button type="button" onClick={() => removeVariant(variant.id)} className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-300 hover:text-red-500 hover:border-red-200 flex items-center justify-center transition-all">
                                    <Trash2 size={16} />
                                 </button>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               )}
            </div>
            
            {/* RIGHT COLUMN - SIDEBAR */}
            <div className="w-full lg:w-[320px] xl:w-[380px] space-y-8 lg:sticky lg:top-32">
               {/* PRICING & INVENTORY */}
               <div className={cardBase}>
                  <h3 className="text-sm font-extrabold text-slate-900 tracking-tight mb-5">Pricing & Inventory</h3>
                  <div className="space-y-5">
                     <div>
                        <label className={labelBase}>Base Price (MMK) *</label>
                        <div className="relative">
                           <input required type="number" step="0.01" placeholder="0.00" className={inputBase} value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
                           <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">MMK</span>
                        </div>
                     </div>
                     <div>
                        <label className={labelBase}>Default Stock</label>
                        <input type="number" placeholder="0" className={inputBase} value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} />
                     </div>
                  </div>
               </div>

               {/* ORGANIZATION */}
               <div className={cardBase}>
                  <h3 className="text-sm font-extrabold text-slate-900 tracking-tight mb-5">Organization</h3>
                  <div className="space-y-5">
                     <div>
                        <label className={labelBase}>Category *</label>
                        <select className={`${inputBase} appearance-none`} value={formData.categoryId} onChange={(e) => setFormData({...formData, categoryId: e.target.value})}>
                           {categories.map((c) => <option key={c.id} value={c.id}>{isMM ? c.name_mm : c.name_en}</option>)}
                        </select>
                     </div>
                     <div>
                        <label className={labelBase}>Brand</label>
                        <select className={`${inputBase} appearance-none`} value={formData.brandId} onChange={(e) => setFormData({...formData, brandId: e.target.value})}>
                           <option value="">{isMM ? "အမှတ်တံဆိပ် မရှိပါ" : "No Brand Link"}</option>
                           {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                     </div>
                     <div>
                        <label className={labelBase}>Audience</label>
                        <select className={`${inputBase} appearance-none`} value={formData.audience} onChange={(e) => setFormData({...formData, audience: e.target.value as Audience})}>
                           <option value="all">All Genders</option>
                           <option value="man">Men</option>
                           <option value="woman">Women</option>
                           <option value="child">Kids</option>
                        </select>
                     </div>
                  </div>
               </div>
               
               {/* VIDEO */}
               <div className={cardBase}>
                  <div className="mb-5">
                     <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Product Media Link</h3>
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">TikTok / YouTube</p>
                  </div>
                  <div>
                     <input type="url" placeholder="https://..." className={inputBase} value={formData.videoUrl} onChange={(e) => setFormData({...formData, videoUrl: e.target.value})} />
                  </div>
               </div>
               
               {/* Fixed bottom padding for mobile save button */}
               <div className="md:hidden pt-4 pb-8">
                  <button type="submit" disabled={isSubmitting} className="w-full py-4 rounded-full text-xs font-bold uppercase tracking-widest bg-brand text-white shadow-xl shadow-brand/20 btn-premium disabled:opacity-50">
                     {isSubmitting ? "Saving..." : (isEditing ? "Save Changes" : "Create Product")}
                  </button>
               </div>
            </div>

         </form>
      </div>
    </div>
  );
};
