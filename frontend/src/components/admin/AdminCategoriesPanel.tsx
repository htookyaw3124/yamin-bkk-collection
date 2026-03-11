import { useState, useEffect } from "react";
import { useCreateCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation } from "../../lib/api";
import { Pencil, Trash2 } from "lucide-react";
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
    <div className="space-y-10">
      {actionError && <p className="text-xs text-red-500">{actionError}</p>}

      <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
          Create Category
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            className="border-b border-slate-200 py-2 text-sm outline-none focus:border-slate-900"
            placeholder="Name (English)"
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
          <input
            className="border-b border-slate-200 py-2 text-sm outline-none focus:border-slate-900 font-myanmar"
            placeholder="Name (Burmese)"
            value={newCategory.name_mm}
            onChange={(event) =>
              setNewCategory((current) => ({
                ...current,
                name_mm: event.target.value,
              }))
            }
          />
          <input
            className="border-b border-slate-200 py-2 text-sm outline-none focus:border-slate-900"
            placeholder="Slug"
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
        <button
          onClick={handleCreate}
          disabled={
            isSaving ||
            !newCategory.name_en ||
            !newCategory.name_mm ||
            !newCategory.slug
          }
          className="px-5 py-2 rounded-full text-xs uppercase tracking-widest bg-slate-900 text-white hover:bg-pink-600 transition-colors"
        >
          {isSaving ? "Saving..." : "Add Category"}
        </button>
      </div>

      {editingCategory && (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Edit Category
              </p>
              <p className="text-lg font-light text-slate-900">
                {editingCategory.name_en}
              </p>
            </div>
            <button
              onClick={() => setEditingCategory(null)}
              className="text-xs uppercase tracking-widest text-slate-400 hover:text-slate-900"
            >
              Cancel
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              className="border-b border-slate-200 py-2 text-sm outline-none focus:border-slate-900"
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
              className="border-b border-slate-200 py-2 text-sm outline-none focus:border-slate-900 font-myanmar"
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
              className="border-b border-slate-200 py-2 text-sm outline-none focus:border-slate-900"
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
            className="px-5 py-2 rounded-full text-xs uppercase tracking-widest bg-slate-900 text-white hover:bg-pink-600 transition-colors"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}

      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_160px] gap-4 text-[10px] uppercase tracking-[0.3em] text-slate-400 px-6 py-4 border-b border-slate-100">
          <span>Category</span>
          <span>Slug</span>
          <span className="text-right">Actions</span>
        </div>
        <div className="divide-y divide-slate-100">
          {categories.length === 0 ? (
            <div className="px-6 py-12 text-sm text-slate-500 text-center">
              No categories found.
            </div>
          ) : (
            categories.map((category) => (
              <div
                key={category.id}
                className="grid grid-cols-1 md:grid-cols-[2fr_1fr_160px] gap-4 items-center px-6 py-4 text-sm"
              >
                <div>
                  <p className="text-slate-900">{category.name_en}</p>
                  <p className="text-xs text-slate-400">{category.name_mm}</p>
                </div>
                <div className="text-slate-500">{category.slug}</div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setEditingCategory(category)}
                    className="p-2 rounded-full border border-slate-200 hover:border-slate-900 transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-2 rounded-full border border-slate-200 hover:border-rose-500 hover:text-rose-500 transition-colors"
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
