import { useMemo, useState, useEffect } from "react";
import { Plus, X, Upload, Check, Trash2 } from "lucide-react";
import type { VariantDraft, VariantGroup, VariantGroupValue } from "../../types";

interface VariantBuilderProps {
  variantGroups: VariantGroup[];
  variants: VariantDraft[];
  onChangeGroups: (groups: VariantGroup[]) => void;
  onGenerate: (variants: VariantDraft[]) => void;
  makeId: () => string;
  bulkPrice: string;
  bulkStock: string;
  setBulkPrice: (v: string) => void;
  setBulkStock: (v: string) => void;
}

const SIZE_PRESETS = [
  { en: "S", mm: "S" },
  { en: "M", mm: "M" },
  { en: "L", mm: "L" },
  { en: "XL", mm: "XL" },
  { en: "XXL", mm: "XXL" },
  { en: "Free", mm: "Free" },
];

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
      })),
      imageFiles: combo.map(({ value }) => value.imageFile).filter((f): f is File => f instanceof File),
    } satisfies VariantDraft;
  });
}

interface AdderState {
  en: string;
  mm: string;
  color: string;
}

const PillButton = ({ active, onClick, children }: { active: boolean, onClick: () => void, children: React.ReactNode }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-full border transition-all flex items-center gap-2 ${
      active 
        ? "bg-brand/10 border-brand/20 text-brand content-center" 
        : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
    }`}
  >
    {active ? <Check size={14} className="text-brand" /> : null}
    {children}
  </button>
);

const ImagePreview = ({ file, url }: { file: File | null; url?: string }) => {
  const [preview, setPreview] = useState<string>("");

  useEffect(() => {
    if (!file || !(file instanceof Blob)) return;
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const isBlob = file instanceof Blob;
  const displayUrl = isBlob ? preview : url;

  if (!displayUrl) return null;
  return <img src={displayUrl} className="w-full h-full object-cover" />;
};

export const VariantBuilder = ({
  variantGroups,
  variants,
  onChangeGroups,
  onGenerate,
  makeId,
  bulkPrice,
  bulkStock,
  setBulkPrice,
  setBulkStock,
}: VariantBuilderProps) => {
  const [adder, setAdder] = useState<Record<string, AdderState>>({});

  // Memoize combination calculation with merging
  const currentCombos = useMemo(() => {
    const newCombos = buildCombinations(variantGroups, makeId, bulkPrice, bulkStock);
    
    // Merge price/stock/sku from existing variants if they match by option names
    return newCombos.map(newVer => {
      const existing = variants.find(oldVer => 
        oldVer.name_en === newVer.name_en && oldVer.name_mm === newVer.name_mm
      );
      if (existing) {
        return {
          ...newVer,
          sku: existing.sku || newVer.sku,
          priceOverride: existing.priceOverride || newVer.priceOverride,
          stock: existing.stock || newVer.stock,
        };
      }
      return newVer;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variantGroups, bulkPrice, bulkStock, makeId]);

  const totalCombos = currentCombos.length;

  // Automatically sync with parent when combinations change
  useEffect(() => {
     onGenerate(currentCombos);
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variantGroups, bulkPrice, bulkStock]);

  const hasColor = variantGroups.some((g) => g.name_en === "Color");
  const hasSize = variantGroups.some((g) => g.name_en === "Size");

  const toggleGroup = (nameEn: string, nameMm: string) => {
    const exists = variantGroups.some((g) => g.name_en === nameEn);
    if (exists) {
      onChangeGroups(variantGroups.filter((g) => g.name_en !== nameEn));
      setAdder((prev) => {
        const next = { ...prev };
        const id = variantGroups.find(g => g.name_en === nameEn)?.id;
        if (id) delete next[id];
        return next;
      });
    } else {
      const newId = makeId();
      onChangeGroups([
        ...variantGroups,
        {
          id: newId,
          name_en: nameEn,
          name_mm: nameMm,
          values: [],
        },
      ]);
      setAdder({ ...adder, [newId]: { en: "", mm: "", color: "#000000" } });
    }
  };

  const addCustomGroup = () => {
    const newId = makeId();
    onChangeGroups([
      ...variantGroups,
      {
        id: newId,
        name_en: `Custom ${variantGroups.length + 1}`,
        name_mm: `Custom ${variantGroups.length + 1}`,
        values: [],
      },
    ]);
    setAdder({ ...adder, [newId]: { en: "", mm: "", color: "#000000" } });
  };

  const updateGroupName = (groupId: string, field: "name_en" | "name_mm", val: string) => {
    onChangeGroups(
      variantGroups.map((g) => (g.id === groupId ? { ...g, [field]: val } : g))
    );
  };

  const handleAddOption = (groupId: string) => {
    const state = adder[groupId] || { en: "", mm: "", color: "#000000" };
    if (!state.en && !state.mm) return;

    onChangeGroups(
      variantGroups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              values: [
                ...group.values,
                {
                  id: makeId(),
                  value_en: state.en || state.mm,
                  value_mm: state.mm || state.en,
                  color: group.name_en === "Color" ? state.color : undefined,
                  imageFile: null,
                },
              ],
            }
          : group
      )
    );
    // Reset adder for this group
    setAdder({ ...adder, [groupId]: { en: "", mm: "", color: "#000000" } });
  };

  const addPresetOption = (groupId: string, presetEn: string, presetMm: string) => {
    onChangeGroups(
      variantGroups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              values: [
                ...group.values,
                {
                  id: makeId(),
                  value_en: presetEn,
                  value_mm: presetMm,
                  imageFile: null,
                },
              ],
            }
          : group
      )
    );
  };

  const removeOption = (groupId: string, valueId: string) => {
    onChangeGroups(
      variantGroups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              values: group.values.filter((val) => val.id !== valueId),
            }
          : group
      )
    );
  };

  const updateColorImage = (groupId: string, valueId: string, file: File | null, url: string = "") => {
    onChangeGroups(
      variantGroups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              values: group.values.map((val) =>
                val.id === valueId ? { ...val, imageFile: file, imageUrl: url } : val
              ),
            }
          : group
      )
    );
  };





  return (
    <div className="space-y-4">
      {/* 1. VARIANTS GROUP BUILDER */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100/50">
        <h3 className="text-sm font-extrabold text-slate-900 tracking-tight mb-2">Variants</h3>
        <div className="flex flex-wrap gap-3 mb-8">
          <PillButton active={hasColor} onClick={() => toggleGroup("Color", "အရောင်")}>Color</PillButton>
          <PillButton active={hasSize} onClick={() => toggleGroup("Size", "အရွယ်အစား")}>Size</PillButton>
          <button type="button" onClick={addCustomGroup} className="px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-full border border-dashed border-slate-300 text-slate-500 hover:text-slate-900 hover:border-slate-400 border-bg-white transition-all flex items-center gap-2">
            <Plus size={14} /> Custom
          </button>
        </div>

        <div className="space-y-4">
          {variantGroups.map((group) => {
            const isColor = group.name_en === "Color";
            const isSize = group.name_en === "Size";
            const state = adder[group.id] || { en: "", mm: "", color: "#000000" };

            return (
              <div key={group.id} className="flex flex-col md:flex-row gap-4 items-start relative">
                {/* Delete Group Button */}
                <button 
                  type="button"
                  onClick={() => toggleGroup(group.name_en, group.name_mm)}
                  className="absolute right-0 top-3 text-red-400 hover:text-red-500 hidden md:block"
                >
                  <X size={16} />
                </button>

                {/* Left Label */}
                <div className="w-full md:w-32 py-3 px-4 rounded-xl border border-slate-100 bg-slate-50/50 flex-shrink-0 flex items-center justify-between">
                   {isColor || isSize ? (
                      <span className="text-sm font-bold text-slate-800">{group.name_en}</span>
                   ) : (
                      <div className="flex flex-col gap-1 w-full">
                         <input className="text-sm font-bold bg-transparent outline-none w-full" value={group.name_en} onChange={(e) => updateGroupName(group.id, "name_en", e.target.value)} placeholder="Name (EN)" />
                         <input className="text-[10px] uppercase font-bold text-slate-400 bg-transparent outline-none w-full font-myanmar" value={group.name_mm} onChange={(e) => updateGroupName(group.id, "name_mm", e.target.value)} placeholder="Name (MM)" />
                      </div>
                   )}
                   <button onClick={() => toggleGroup(group.name_en, group.name_mm)} className="md:hidden text-red-400"><X size={14} /></button>
                </div>

                {/* Right Content */}
                <div className="flex-1 w-full flex flex-col gap-2 relative">
                   <div className="flex items-center gap-2 md:pr-8">
                       <input 
                          type="text" 
                          placeholder="Option Name (EN)" 
                          className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand"
                          value={state.en}
                          onChange={(e) => setAdder({...adder, [group.id]: {...state, en: e.target.value}})}
                          onKeyDown={(e) => e.key === "Enter" && handleAddOption(group.id)}
                       />
                       <input 
                          type="text" 
                          placeholder="Option Name (MM)" 
                          className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-myanmar outline-none focus:border-brand"
                          value={state.mm}
                          onChange={(e) => setAdder({...adder, [group.id]: {...state, mm: e.target.value}})}
                          onKeyDown={(e) => e.key === "Enter" && handleAddOption(group.id)}
                       />
                       {isColor && (
                          <div className="h-10 w-10 shrink-0 relative rounded-full overflow-hidden border border-slate-200 shadow-sm cursor-pointer">
                             <input 
                               type="color" 
                               className="absolute -inset-2 w-14 h-14 cursor-pointer" 
                               value={state.color}
                               onChange={(e) => setAdder({...adder, [group.id]: {...state, color: e.target.value}})}
                             />
                          </div>
                       )}
                       <button 
                          type="button" 
                          onClick={() => handleAddOption(group.id)}
                          disabled={!state.en && !state.mm}
                          className="h-10 px-4 rounded-xl bg-slate-900 text-white text-xs font-bold uppercase tracking-widest disabled:opacity-30 hover:bg-slate-800 transition-colors shrink-0"
                       >
                         Add
                       </button>
                   </div>

                   {/* Chips */}
                   {group.values.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2 md:pr-8">
                         {group.values.map(val => (
                            <div key={val.id} className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full shadow-sm border border-slate-200/50">
                               {isColor && (
                                  <div className="w-2.5 h-2.5 rounded-full shadow-inner" style={{backgroundColor: val.color || "#000"}} />
                               )}
                               <span className="text-xs font-bold text-slate-700">{val.value_en}</span>
                               <span className="text-[10px] font-bold text-slate-400 font-myanmar">({val.value_mm})</span>
                               <button onClick={() => removeOption(group.id, val.id)} className="ml-1 text-slate-400 hover:text-red-500 rounded-full hover:bg-white p-0.5"><X size={12}/></button>
                            </div>
                         ))}
                      </div>
                   )}

                   {/* Size Presets */}
                   {isSize && (
                      <div className="flex flex-wrap gap-2 pt-3 mt-2 border-t border-slate-100">
                         <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold self-center mr-1">Quick Add:</span>
                         {SIZE_PRESETS.map(preset => (
                            <button
                               key={preset.en}
                               type="button"
                               onClick={() => addPresetOption(group.id, preset.en, preset.mm)}
                               className="bg-white border border-slate-200 hover:border-slate-400 px-3 py-1 rounded-md text-[10px] font-bold transition-all text-slate-600"
                            >
                               {preset.en}
                            </button>
                         ))}
                      </div>
                   )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. COLOR PHOTOS */}
      {(() => {
         const colorGroup = variantGroups.find(g => g.name_en === "Color");
         if (!colorGroup || colorGroup.values.length === 0) return null;

         return (
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100/50 animate-in fade-in slide-in-from-bottom-4">
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight mb-1">Color Photos</h3>
              <p className="text-xs text-slate-500 mb-6 font-semibold">Upload a photo for each color so customers can see the exact product.</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                 {colorGroup.values.map(val => (
                    <div key={`photo-${val.id}`} className="flex flex-col gap-2">
                       <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full shadow-inner border border-black/10" style={{backgroundColor: val.color || "#000"}} />
                          <span className="text-xs font-bold text-slate-800 truncate">{val.value_en}</span>
                       </div>
                       
                       <label className="aspect-square border-2 border-dashed border-slate-200 hover:border-brand/40 bg-slate-50 hover:bg-brand/5 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group">
                           {val.imageFile || val.imageUrl ? (
                              <ImagePreview file={val.imageFile as File} url={val.imageUrl} />
                           ) : (
                              <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-brand">
                                 <Upload size={20} />
                                 <span className="text-[10px] uppercase font-bold tracking-widest">Upload</span>
                              </div>
                           )}
                           
                           <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => {
                                 if (e.target.files && e.target.files[0]) {
                                    updateColorImage(colorGroup.id, val.id, e.target.files[0]);
                                 }
                                 e.target.value = '';
                              }}
                           />

                           {(val.imageFile || val.imageUrl) && (
                              <button
                                 type="button"
                                 className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur shadow-sm flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                                 onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    updateColorImage(colorGroup.id, val.id, null, "");
                                 }}
                              >
                                 <Trash2 size={14} />
                              </button>
                           )}
                       </label>
                    </div>
                 ))}
              </div>
            </div>
         );
      })()}

      {/* 3. COMBINATION GENERATOR */}
      {variantGroups.length > 0 && variantGroups.some(g => g.values.length > 0) && (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100/50">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                 <h3 className="text-sm font-extrabold text-slate-900 tracking-tight mb-2">Default Rules (Optional)</h3>
                 <div className="flex flex-col md:flex-row gap-4">
                    <input 
                       type="number" 
                       placeholder="Override Price (MMK)" 
                       className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand w-48"
                       value={bulkPrice}
                       onChange={(e) => setBulkPrice(e.target.value)}
                    />
                    <input 
                       type="number" 
                       placeholder="Default Stock" 
                       className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand w-48"
                       value={bulkStock}
                       onChange={(e) => setBulkStock(e.target.value)}
                    />
                 </div>
              </div>
              
              <div className="flex flex-col items-end gap-2 text-right border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8">
                 <p className="text-2xl font-black text-slate-900 border-b-2 border-brand inline-block px-1">
                    {totalCombos}
                 </p>
                 <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Total Variations</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
