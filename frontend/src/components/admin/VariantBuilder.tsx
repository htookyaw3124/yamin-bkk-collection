import { useMemo, useState } from "react";
import { Plus, Trash2, Palette, Ruler } from "lucide-react";
import type { VariantDraft, VariantGroup, VariantGroupValue } from "../../types";

interface VariantBuilderProps {
  variantGroups: VariantGroup[];
  onChangeGroups: (groups: VariantGroup[]) => void;
  onGenerate: (variants: VariantDraft[]) => void;
  makeId: () => string;
}

const SIZE_PRESETS = ["S", "M", "L", "XL", "XXL", "F (Free)"];

function sanitizeSku(input: string) {
  return input
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildCombinations(
  groups: VariantGroup[],
  makeId: () => string,
  bulkPrice: string,
  bulkStock: string,
) {
  if (!groups.length) return [];
  const normalizedGroups = groups
    .map((group) => ({
      ...group,
      values: group.values.filter((value) => value.value_en || value.value_mm),
    }))
    .filter((group) => group.name_en || group.name_mm);

  if (!normalizedGroups.length) return [];
  if (normalizedGroups.some((group) => group.values.length === 0)) return [];

  const combos: Array<
    Array<{ group: VariantGroup; value: VariantGroupValue }>
  > = [];

  const walk = (
    index: number,
    current: Array<{ group: VariantGroup; value: VariantGroupValue }>,
  ) => {
    if (index >= normalizedGroups.length) {
      combos.push(current);
      return;
    }
    const group = normalizedGroups[index];
    group.values.forEach((value) => {
      walk(index + 1, [...current, { group, value }]);
    });
  };

  walk(0, []);

  return combos.map((combo, index) => {
    const nameEn = combo
      .map(({ value }) => value.value_en)
      .filter(Boolean)
      .join(" / ");
    const nameMm = combo
      .map(({ value }) => value.value_mm)
      .filter(Boolean)
      .join(" / ");
    const skuBase = sanitizeSku(
      combo.map(({ value }) => value.value_en || value.value_mm).join("-"),
    );
    const sku = skuBase ? `${skuBase}-${index + 1}` : `VAR-${index + 1}`;

    return {
      id: makeId(),
      sku,
      name_en: nameEn || `Variant ${index + 1}`,
      name_mm: nameMm || `Variant ${index + 1}`,
      priceOverride: bulkPrice,
      stock: bulkStock,
      options: combo.map(({ group, value }) => ({
        id: makeId(),
        type: group.name_en || group.name_mm || "option",
        value_en: value.value_en,
        value_mm: value.value_mm,
        color: value.color,
        imageUrl: value.imageUrl,
        imageFile: value.imageFile,
      })),
      imageFiles: [],
    } satisfies VariantDraft;
  });
}

export const VariantBuilder = ({
  variantGroups,
  onChangeGroups,
  onGenerate,
  makeId,
}: VariantBuilderProps) => {
  const [bulkPrice, setBulkPrice] = useState("");
  const [bulkStock, setBulkStock] = useState("");

  const totalCombos = useMemo(() => {
    if (!variantGroups.length) return 0;
    return variantGroups.reduce((acc, group) => {
      if (!group.values.length) return 0;
      return acc * group.values.length;
    }, 1);
  }, [variantGroups]);

  const addColorGroup = () => {
    onChangeGroups([
      ...variantGroups,
      {
        id: makeId(),
        name_en: "Color",
        name_mm: "အရောင်",
        values: [],
      },
    ]);
  };

  const addSizeGroup = () => {
    onChangeGroups([
      ...variantGroups,
      {
        id: makeId(),
        name_en: "Size",
        name_mm: "အရွယ်အစား",
        values: [],
      },
    ]);
  };

  const addValue = (groupId: string, defaultValueEn = "") => {
    onChangeGroups(
      variantGroups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              values: [
                ...group.values,
                { id: makeId(), value_en: defaultValueEn, value_mm: defaultValueEn, color: group.name_en === "Color" ? "#000000" : undefined, imageFile: null },
              ],
            }
          : group,
      ),
    );
  };

  const updateValue = (
    groupId: string,
    valueId: string,
    field: "value_en" | "value_mm" | "color" | "imageUrl" | "imageFile",
    value: string | File | null,
  ) => {
    onChangeGroups(
      variantGroups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              values: group.values.map((val) =>
                val.id === valueId ? { ...val, [field]: value } : val,
              ),
            }
          : group,
      ),
    );
  };

  const removeGroup = (groupId: string) => {
    onChangeGroups(variantGroups.filter((group) => group.id !== groupId));
  };

  const removeValue = (groupId: string, valueId: string) => {
    onChangeGroups(
      variantGroups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              values: group.values.filter((val) => val.id !== valueId),
            }
          : group,
      ),
    );
  };

  const handleGenerate = () => {
    const variants = buildCombinations(
      variantGroups,
      makeId,
      bulkPrice,
      bulkStock,
    );
    onGenerate(variants);
  };

  return (
    <div className="rounded-3xl border border-slate-200/60 bg-white/80 backdrop-blur-xl p-8 shadow-xl shadow-slate-200/40 space-y-8">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between pb-6 border-b border-slate-50">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-bold mb-1">
            Build Combinations
          </p>
          <h3 className="text-xl font-bold text-slate-900">
            Professional Variant Builder
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={addColorGroup}
            className="inline-flex items-center gap-2 rounded-xl bg-pink-50 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-pink-600 hover:bg-pink-100 transition-colors"
          >
            <Palette size={14} /> Add Color
          </button>
          <button
            type="button"
            onClick={addSizeGroup}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:bg-blue-100 transition-colors"
          >
            <Ruler size={14} /> Add Size
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Default Price (Optional)
          </label>
          <input
            type="number"
            step="0.01"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all"
            placeholder="MMK"
            value={bulkPrice}
            onChange={(event) => setBulkPrice(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Default Stock
          </label>
          <input
            type="number"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all"
            placeholder="0"
            value={bulkStock}
            onChange={(event) => setBulkStock(event.target.value)}
          />
        </div>
      </div>

      <div className="space-y-6">
        {variantGroups.map((group) => (
          <div
            key={group.id}
            className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-100 group/item relative"
          >
            <button
               type="button"
               onClick={() => removeGroup(group.id)}
               className="absolute -top-3 -right-3 h-8 w-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-500 shadow-sm opacity-0 group-hover/item:opacity-100 transition-all z-10"
            >
               <Plus size={14} className="rotate-45" />
            </button>

            <div className="flex items-center gap-4 mb-6">
               <div className={`p-2 rounded-lg ${group.name_en === 'Color' ? 'bg-pink-50 text-pink-600' : 'bg-blue-50 text-blue-600'}`}>
                  {group.name_en === 'Color' ? <Palette size={18} /> : <Ruler size={18} />}
               </div>
               <div>
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tight">{group.name_en}</h4>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">{group.name_mm}</p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
               {group.values.map((value) => (
                  <div key={value.id} className="relative bg-slate-50/50 border border-slate-100 rounded-xl p-3 pl-4 flex items-center gap-3">
                     {group.name_en === 'Color' && (
                        <>
                           <input 
                              type="color"
                              value={value.color || "#000000"}
                              onChange={(e) => updateValue(group.id, value.id, 'color', e.target.value)}
                              className="w-6 h-6 rounded-full border-none p-0 bg-transparent cursor-pointer overflow-hidden shadow-sm flex-shrink-0"
                           />
                           <div className="relative group/img flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 bg-white hover:border-pink-500 overflow-hidden cursor-pointer transition-colors shadow-sm shrink-0">
                               {value.imageFile instanceof File ? (
                                   <img src={URL.createObjectURL(value.imageFile)} className="w-full h-full object-cover" />
                               ) : value.imageUrl ? (
                                   <img src={value.imageUrl} className="w-full h-full object-cover" />
                               ) : (
                                   <span className="text-[10px] font-bold text-slate-300 group-hover/img:text-pink-500 transition-colors">+</span>
                               )}
                               <input 
                                   type="file"
                                   accept="image/*"
                                   className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                   onChange={(e) => {
                                      if (e.target.files && e.target.files[0]) {
                                         updateValue(group.id, value.id, 'imageFile', e.target.files[0]);
                                      }
                                      e.target.value = '';
                                   }}
                               />
                               {(value.imageFile || value.imageUrl) && (
                                   <button
                                     type="button"
                                     className="absolute top-0 right-0 bg-white/90 rounded-bl-lg p-0.5 opacity-0 group-hover/img:opacity-100 transition-opacity z-10"
                                     onClick={(e) => {
                                         e.stopPropagation();
                                         updateValue(group.id, value.id, 'imageFile', null);
                                         updateValue(group.id, value.id, 'imageUrl', "");
                                     }}
                                   >
                                     <Trash2 size={8} className="text-red-500" />
                                   </button>
                               )}
                           </div>
                        </>
                     )}
                     <div className="flex-1">
                        <input 
                           className="bg-transparent text-sm w-full outline-none font-semibold text-slate-800"
                           value={value.value_en}
                           onChange={(e) => updateValue(group.id, value.id, 'value_en', e.target.value)}
                           placeholder="Value..."
                        />
                     </div>
                     <button
                        type="button"
                        onClick={() => removeValue(group.id, value.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors"
                     >
                        <Trash2 size={12} />
                     </button>
                  </div>
               ))}
               <button
                  type="button"
                  onClick={() => addValue(group.id)}
                  className="rounded-xl border border-dashed border-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-400 py-3 hover:bg-slate-50 hover:border-slate-900 hover:text-slate-900 transition-all"
               >
                  + Add Value
               </button>
            </div>

            {group.name_en === "Size" && (
                <div className="mt-4 flex flex-wrap gap-2 pt-4 border-t border-slate-50">
                    <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold self-center mr-2">Presets:</span>
                    {SIZE_PRESETS.map(preset => (
                        <button
                            key={preset}
                            type="button"
                            onClick={() => addValue(group.id, preset)}
                            className="bg-slate-100 hover:bg-slate-900 hover:text-white px-3 py-1 rounded-md text-[10px] font-bold transition-all text-slate-600"
                        >
                            {preset}
                        </button>
                    ))}
                </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between pt-8 border-t border-slate-50 gap-4">
        <div>
           <p className="text-xl font-bold text-slate-900">
             {totalCombos} <span className="text-sm font-normal text-slate-400 lowercase italic">combinations</span>
           </p>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          className="w-full md:w-auto bg-slate-900 text-white rounded-xl px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50"
          disabled={totalCombos === 0}
        >
          Confirm & Create Variants
        </button>
      </div>
    </div>
  );
};
