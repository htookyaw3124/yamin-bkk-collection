import { useState, useEffect } from "react";
import { useCreateBrandMutation, useUpdateBrandMutation, useDeleteBrandMutation } from "../../lib/api";
import { Pencil, Trash2, Award, Link, Image as ImageIcon } from "lucide-react";
import type { Brand } from "../../types";
import { getApiErrorMessage } from "../../utils/helpers";

interface AdminBrandsPanelProps {
  brands: Brand[];
  isLoading?: boolean;
  error?: string | null;
}

export const AdminBrandsPanel = ({
  brands,
  isLoading = false,
  error = null,
}: AdminBrandsPanelProps) => {
  const [newBrand, setNewBrand] = useState({
    name: "",
    logo_url: "",
  });
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    logo_url: "",
  });
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [createBrand] = useCreateBrandMutation();
  const [updateBrand] = useUpdateBrandMutation();
  const [deleteBrand] = useDeleteBrandMutation();

  useEffect(() => {
    if (!editingBrand) return;
    setEditForm({
      name: editingBrand.name,
      logo_url: editingBrand.logo_url || "",
    });
  }, [editingBrand]);

  const handleCreate = async () => {
    setIsSaving(true);
    setActionError(null);
    try {
      await createBrand(newBrand).unwrap();
      setNewBrand({ name: "", logo_url: "" });
    } catch (error) {
      setActionError(getApiErrorMessage(error, "Failed to create brand."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingBrand) return;
    setIsSaving(true);
    setActionError(null);
    try {
      await updateBrand({ id: editingBrand.id, payload: editForm }).unwrap();
      setEditingBrand(null);
    } catch (error) {
      setActionError(getApiErrorMessage(error, "Failed to update brand."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (brandId: string) => {
    if (!window.confirm("Delete this brand? This may affect products linked to it.")) return;
    setActionError(null);
    try {
      await deleteBrand(brandId).unwrap();
    } catch (error) {
      setActionError(getApiErrorMessage(error, "Failed to delete brand."));
    }
  };

  return (
    <div className="space-y-12">
      {(actionError || error) && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-semibold">
           {actionError || error}
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900"></div>
        </div>
      )}

      <div className="rounded-3xl border border-slate-200/60 bg-white/80 backdrop-blur-xl p-8 shadow-xl shadow-slate-200/40 space-y-8">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-50">
           <div className="p-2.5 bg-slate-900 text-white rounded-xl">
              <Award size={20} />
           </div>
           <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-bold mb-1">Partnership</p>
              <h3 className="text-xl font-bold text-slate-900">Onboard New Brand</h3>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Brand Identity</label>
            <div className="relative">
              <input
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all font-semibold"
                placeholder="e.g. Nike"
                value={newBrand.name}
                onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
              />
              <Award className="absolute left-3.5 top-3.5 text-slate-300" size={16} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Visual Asset URL</label>
            <div className="relative">
              <input
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all font-mono"
                placeholder="https://logo-source.com/nike.png"
                value={newBrand.logo_url}
                onChange={(e) => setNewBrand({ ...newBrand, logo_url: e.target.value })}
              />
              <Link className="absolute left-3.5 top-3.5 text-slate-300" size={16} />
            </div>
          </div>
        </div>
        <button
          onClick={handleCreate}
          disabled={isSaving || !newBrand.name}
          className="bg-slate-900 text-white rounded-xl px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50"
        >
          {isSaving ? "Registering..." : "Add Brand"}
        </button>
      </div>

      {editingBrand && (
        <div className="rounded-3xl border border-pink-100 bg-pink-50/30 p-8 shadow-xl space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="p-2.5 bg-pink-100 text-pink-600 rounded-xl">
                  <Pencil size={20} />
               </div>
               <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-pink-400 font-bold mb-1">Modification</p>
                  <h3 className="text-xl font-bold text-slate-900">Editing: {editingBrand.name}</h3>
               </div>
            </div>
            <button
              onClick={() => setEditingBrand(null)}
              className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 px-4 py-2 rounded-lg border border-slate-200 bg-white"
            >
              Cancel
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              className="rounded-xl border border-pink-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-pink-500 transition-all font-bold"
              placeholder="Brand Name"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            />
            <input
              className="rounded-xl border border-pink-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-pink-500 transition-all font-mono"
              placeholder="Logo URL"
              value={editForm.logo_url}
              onChange={(e) => setEditForm({ ...editForm, logo_url: e.target.value })}
            />
          </div>
          <button
            onClick={handleUpdate}
            disabled={isSaving || !editForm.name}
            className="bg-slate-900 text-white rounded-xl px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all hover:-translate-y-1 active:scale-95"
          >
            {isSaving ? "Updating..." : "Save Changes"}
          </button>
        </div>
      )}

      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-[100px_2fr_160px] gap-4 text-[10px] uppercase tracking-[0.3em] text-slate-400 px-8 py-5 bg-slate-50/50 border-b border-slate-100 font-bold">
          <span>Identity</span>
          <span>Brand Detail</span>
          <span className="text-right">Actions</span>
        </div>
        <div className="divide-y divide-slate-50">
          {brands.length === 0 ? (
            <div className="px-8 py-20 text-sm text-slate-400 text-center italic">
              No brands registered yet.
            </div>
          ) : (
            brands.map((brand) => (
              <div
                key={brand.id}
                className="grid grid-cols-1 md:grid-cols-[100px_2fr_160px] gap-4 items-center px-8 py-6 text-sm group hover:bg-slate-50/50 transition-all"
              >
                <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center p-2 group-hover:bg-white group-hover:ring-2 group-hover:ring-slate-900/5 transition-all">
                  {brand.logo_url ? (
                    <img src={brand.logo_url} alt={brand.name} className="max-w-full max-h-full object-contain" />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-slate-300">
                       <Award size={20} />
                       <span className="text-[8px] font-bold">BRND</span>
                    </div>
                  )}
                </div>
                <div>
                   <p className="text-slate-900 font-bold uppercase tracking-tight text-base">{brand.name}</p>
                   <div className="flex items-center gap-2 mt-1">
                      <ImageIcon size={12} className="text-slate-300" />
                      <p className="text-[10px] text-slate-400 font-mono truncate max-w-xs">{brand.logo_url || 'No visual asset assigned'}</p>
                   </div>
                </div>
                <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                  <button
                    onClick={() => setEditingBrand(brand)}
                    className="p-2.5 rounded-full border border-slate-100 bg-white text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all shadow-sm active:scale-90"
                    title="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(brand.id)}
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
