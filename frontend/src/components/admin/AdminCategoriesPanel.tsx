import { useState, useEffect } from "react";
import { useCreateCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation } from "../../lib/api";
import { Pencil, Trash2, Tag, BookOpen } from "lucide-react";
import type { Category } from "../../types";
import { getApiErrorMessage, toSlug } from "../../utils/helpers";

interface AdminCategoriesPanelProps {
  categories: Category[];
}

export const AdminCategoriesPanel = ({
  categories,
}: AdminCategoriesPanelProps) => {
  const [newCategory, setNewCategory] = useState({
    name_en: "",
    name_mm: "",
    slug: "",
  });
  const [slugTouched, setSlugTouched] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editForm, setEditForm] = useState({
    name_en: "",
    name_mm: "",
    slug: "",
  });
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  useEffect(() => {
    if (!editingCategory) return;
    setEditForm({
      name_en: editingCategory.name_en,
      name_mm: editingCategory.name_mm,
      slug: editingCategory.slug,
    });
  }, [editingCategory]);

  const handleCreate = async () => {
    setIsSaving(true);
    setActionError(null);
    try {
      await createCategory(newCategory).unwrap();
      setNewCategory({ name_en: "", name_mm: "", slug: "" });
      setSlugTouched(false);
    } catch (error) {
      setActionError(getApiErrorMessage(error, "Failed to create category."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingCategory) return;
    setIsSaving(true);
    setActionError(null);
    try {
      await updateCategory({ id: editingCategory.id, payload: editForm }).unwrap();
      setEditingCategory(null);
    } catch (error) {
      setActionError(getApiErrorMessage(error, "Failed to update category."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!window.confirm("Delete this category?")) return;
    setActionError(null);
    try {
      await deleteCategory(categoryId).unwrap();
    } catch (error) {
      setActionError(getApiErrorMessage(error, "Failed to delete category."));
    }
  };

  return (
    <div className="space-y-12">
      {actionError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-semibold">
           {actionError}
        </div>
      )}

      <div className="rounded-3xl border border-slate-200/60 bg-white/80 backdrop-blur-xl p-8 shadow-xl shadow-slate-200/40 space-y-8">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-50">
           <div className="p-2.5 bg-slate-900 text-white rounded-xl">
              <Tag size={20} />
           </div>
           <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-bold mb-1">Architecture</p>
              <h3 className="text-xl font-bold text-slate-900">Create New Category</h3>
           </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">English Name</label>
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all"
              placeholder="e.g. T-Shirts"
              value={newCategory.name_en}
              onChange={(event) => {
                const value = event.target.value;
                setNewCategory((current) => ({
                  ...current,
                  name_en: value,
                  slug: slugTouched ? current.slug : toSlug(value),
                }));
              }}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Burmese Name</label>
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all font-myanmar"
              placeholder="ဥပမာ - တီရှပ်များ"
              value={newCategory.name_mm}
              onChange={(event) =>
                setNewCategory((current) => ({
                  ...current,
                  name_mm: event.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">URL Slug</label>
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all font-mono"
              placeholder="t-shirts"
              value={newCategory.slug}
              onChange={(event) => {
                setSlugTouched(true);
                setNewCategory((current) => ({
                  ...current,
                  slug: event.target.value,
                }));
              }}
            />
          </div>
        </div>
        <button
          onClick={handleCreate}
          disabled={
            isSaving ||
            !newCategory.name_en ||
            !newCategory.name_mm ||
            !newCategory.slug
          }
          className="bg-slate-900 text-white rounded-xl px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50"
        >
          {isSaving ? "Creating..." : "Add Category"}
        </button>
      </div>

      {editingCategory && (
        <div className="rounded-3xl border border-pink-100 bg-pink-50/30 p-8 shadow-xl space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="p-2.5 bg-pink-100 text-pink-600 rounded-xl">
                  <Pencil size={20} />
               </div>
               <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-pink-400 font-bold mb-1">Modification</p>
                  <h3 className="text-xl font-bold text-slate-900">Editing: {editingCategory.name_en}</h3>
               </div>
            </div>
            <button
              onClick={() => setEditingCategory(null)}
              className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 px-4 py-2 rounded-lg border border-slate-200 bg-white"
            >
              Cancel
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <input
              className="rounded-xl border border-pink-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-pink-500 transition-all"
              placeholder="Name (English)"
              value={editForm.name_en}
              onChange={(event) =>
                setEditForm((current) => ({
                  ...current,
                  name_en: event.target.value,
                }))
              }
            />
            <input
              className="rounded-xl border border-pink-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-pink-500 transition-all font-myanmar"
              placeholder="Name (Burmese)"
              value={editForm.name_mm}
              onChange={(event) =>
                setEditForm((current) => ({
                  ...current,
                  name_mm: event.target.value,
                }))
              }
            />
            <input
              className="rounded-xl border border-pink-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-pink-500 transition-all font-mono"
              placeholder="Slug"
              value={editForm.slug}
              onChange={(event) =>
                setEditForm((current) => ({
                  ...current,
                  slug: event.target.value,
                }))
              }
            />
          </div>
          <button
            onClick={handleUpdate}
            disabled={isSaving}
            className="bg-slate-900 text-white rounded-xl px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all hover:-translate-y-1 active:scale-95"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}

      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_160px] gap-4 text-[10px] uppercase tracking-[0.3em] text-slate-400 px-8 py-5 bg-slate-50/50 border-b border-slate-100 font-bold">
          <span>Category & Translation</span>
          <span>Slug Identifier</span>
          <span className="text-right">Actions</span>
        </div>
        <div className="divide-y divide-slate-50">
          {categories.length === 0 ? (
            <div className="px-8 py-20 text-sm text-slate-400 text-center italic">
              No categories established yet.
            </div>
          ) : (
            categories.map((category) => (
              <div
                key={category.id}
                className="grid grid-cols-1 md:grid-cols-[2fr_1fr_160px] gap-4 items-center px-8 py-6 text-sm group hover:bg-slate-50/50 transition-all"
              >
                <div className="flex items-center gap-4">
                   <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-slate-900 transition-all">
                      <BookOpen size={18} />
                   </div>
                   <div>
                     <p className="text-slate-900 font-bold uppercase tracking-tight">{category.name_en}</p>
                     <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">{category.name_mm}</p>
                   </div>
                </div>
                <div className="font-mono text-xs text-slate-400 px-2 py-1 bg-slate-50 rounded-md w-fit">{category.slug}</div>
                <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                  <button
                    onClick={() => setEditingCategory(category)}
                    className="p-2.5 rounded-full border border-slate-100 bg-white text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all shadow-sm active:scale-90"
                    title="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-2.5 rounded-full border border-slate-100 bg-white text-slate-400 hover:text-red-500 hover:border-red-500 transition-all shadow-sm active:scale-90"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
