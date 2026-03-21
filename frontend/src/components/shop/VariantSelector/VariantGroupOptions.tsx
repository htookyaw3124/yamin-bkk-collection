import type { VariantGroup, Lang, ProductVariant } from "../../../types";

interface Props {
  groups: VariantGroup[];
  lang: Lang;
  selectedVariant?: ProductVariant;
  onOptionSelect?: (imageUrl: string | null) => void;
}

export const VariantGroupOptions = ({ groups, lang, selectedVariant, onOptionSelect }: Props) => {
  const isMM = lang === "mm";

  if (groups.length === 0) return null;

  return (
    <div className="space-y-6 pb-2">
      <p className="text-[9px] tracking-[0.3em] uppercase text-slate-400 font-black">
        {isMM ? "အမျိုးအစား ရွေးချယ်ရန်" : "Select Options"}
      </p>
      <div className="space-y-6">
        {groups.map((group, gIdx) => {
          const typeName = group.name_en || group.id;
          const isColor = typeName === "Color";
          const isSize = typeName === "Size";

          let displayName = typeName;
          if (isMM) {
            if (isColor) displayName = "အရောင်";
            else if (isSize) displayName = "ဆိုဒ်";
            else displayName = group.name_mm || typeName;
          }

          return (
            <div key={gIdx} className="space-y-3">
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">
                {displayName}
              </p>
              <div className="flex flex-wrap gap-2.5">
                {group.values?.map((value) => {
                  const isSelected = selectedVariant?.options?.some((opt) => opt.id === value.id);
                  const label = isMM ? value.value_mm : value.value_en;
                  
                  return (
                    <div
                      key={value.id}
                      onClick={() => {
                        if (value.imageUrl) {
                          onOptionSelect?.(value.imageUrl);
                        }
                      }}
                      className={`px-5 py-2.5 rounded-2xl border transition-all duration-300 flex items-center gap-3 text-[11px] font-bold tracking-tight select-none cursor-pointer ${
                        isSelected
                          ? "border-brand bg-brand text-white shadow-xl shadow-slate-200/50 scale-105"
                          : "border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white"
                      }`}
                    >
                      {value.color && (
                        <span
                          className={`w-5 h-5 rounded-full border-2 ${
                            isSelected ? "border-white/20" : "border-white shadow-sm"
                          }`}
                          style={{ backgroundColor: value.color }}
                        />
                      )}
                      {label || (value.color ? "" : "N/A")}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
