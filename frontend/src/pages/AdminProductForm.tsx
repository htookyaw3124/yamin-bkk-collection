import { useForm } from "react-hook-form";
import { Upload, Plus } from "lucide-react";
// import axios from 'axios';

interface ProductFormInputs {
  name_en: string;
  name_mm: string;
  description_en: string;
  description_mm: string;
  price: number;
  stock: number;
  categoryId: string;
  images: FileList;
}

export const AdminProductForm = () => {
  // useTranslation hook removed due to unused vars
  const isBurmese = false;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormInputs>();

  const onSubmit = async (data: ProductFormInputs) => {
    const formData = new FormData();
    formData.append("name_en", data.name_en);
    formData.append("name_mm", data.name_mm);
    // ... append other fields ...
    // ... loop through data.images and append them ...

    console.log("Submitting:", data);
    // await axios.post('http://localhost:3000/products', formData);
    alert("Product created! (Check console for data)");
  };

  return (
    <div
      className={`max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-slate-100 my-10 ${isBurmese ? "font-myanmar" : "font-sans"}`}
    >
      <h2 className="text-2xl font-bold text-slate-900 mb-6">
        Create New Product
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Bilingual Names */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Name (English)
            </label>
            <input
              {...register("name_en", { required: true })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
              placeholder="e.g. Silk Dress"
            />
            {errors.name_en && (
              <span className="text-xs text-red-500">Required</span>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Name (Burmese)
            </label>
            <input
              {...register("name_mm", { required: true })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all font-myanmar"
              placeholder="ဥပမာ - ပိုးသားဂါဝန်"
            />
            {errors.name_mm && (
              <span className="text-xs text-red-500">Required</span>
            )}
          </div>
        </div>

        {/* Bilingual Descriptions */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description (English)
            </label>
            <textarea
              {...register("description_en")}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description (Burmese)
            </label>
            <textarea
              {...register("description_mm")}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all font-myanmar"
            />
          </div>
        </div>

        {/* Meta Data */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Price (THB)
            </label>
            <input
              type="number"
              {...register("price", { required: true, min: 0 })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Stock
            </label>
            <input
              type="number"
              {...register("stock", { required: true, min: 0 })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Category
            </label>
            <select
              {...register("categoryId", { required: true })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none bg-white"
            >
              <option value="clothes-woman">Woman</option>
              <option value="clothes-man">Man</option>
              {/* Map other categories here */}
            </select>
          </div>
        </div>

        {/* Image Upload */}
        <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
          <input
            type="file"
            multiple
            accept="image/*"
            {...register("images")}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 bg-slate-100 rounded-full">
              <Upload className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-600">
              Click to upload product images
            </p>
            <p className="text-xs text-slate-400">JPG, PNG up to 5MB</p>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Product
        </button>
      </form>
    </div>
  );
};
