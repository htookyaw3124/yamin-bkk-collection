import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { VariantDraft, VariantGroup, VariantGroupValue } from "../../types";

interface VariantBuilderProps {
  variantGroups: VariantGroup[];
  onChangeGroups: (groups: VariantGroup[]) => void;
  onGenerate: (variants: VariantDraft[]) => void;
  makeId: () => string;
  isMM: boolean;
}

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
  isMM,
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

  const addGroup = () => {
    onChangeGroups([
      ...variantGroups,
      {
        id: makeId(),
        name_en: "",
        name_mm: "",
        values: [],
      },
    ]);
  };

  const removeGroup = (groupId: string) => {
    onChangeGroups(variantGroups.filter((group) => group.id !== groupId));
  };

  const updateGroupField = (
    groupId: string,
    field: "name_en" | "name_mm",
    value: string,
  ) => {
    onChangeGroups(
      variantGroups.map((group) =>
        group.id === groupId ? { ...group, [field]: value } : group,
      ),
    );
  };

  const addValue = (groupId: string) => {
    onChangeGroups(
      variantGroups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              values: [
                ...group.values,
                { id: makeId(), value_en: "", value_mm: "" },
              ],
            }
          : group,
      ),
    );
  };

  const updateValue = (
    groupId: string,
    valueId: string,
    field: "value_en" | "value_mm",
    value: string,
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
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
            Variant Builder
          </p>
          <h3 className="text-base font-semibold text-slate-900">
            Define option groups and generate combinations
          </h3>
        </div>
        <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
          {isMM ? "Regenerate replaces variants" : "Regenerate replaces variants"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 mb-2">
            Bulk Price Override
          </label>
          <input
            type="number"
            step="0.01"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            placeholder="Leave blank to keep empty"
            value={bulkPrice}
            onChange={(event) => setBulkPrice(event.target.value)}
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 mb-2">
            Bulk Stock
          </label>
          <input
            type="number"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            placeholder="0"
            value={bulkStock}
            onChange={(event) => setBulkStock(event.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {variantGroups.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            No groups yet. Add a group like Size or Color to get started.
          </div>
        ) : (
          variantGroups.map((group) => (
            <div
              key={group.id}
              className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-4"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                    placeholder="Group name (English) e.g. Size"
                    value={group.name_en}
                    onChange={(event) =>
                      updateGroupField(group.id, "name_en", event.target.value)
                    }
                  />
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                    placeholder="Group name (Burmese)"
                    value={group.name_mm}
                    onChange={(event) =>
                      updateGroupField(group.id, "name_mm", event.target.value)
                    }
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeGroup(group.id)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:border-rose-200 hover:text-rose-600 hover:bg-rose-50"
                  aria-label="Remove group"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="space-y-3">
                {group.values.map((value) => (
                  <div
                    key={value.id}
                    className="grid grid-cols-1 md:grid-cols-[1fr_1fr_40px] gap-3 items-center"
                  >
                    <input
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                      placeholder="Value (English) e.g. S"
                      value={value.value_en}
                      onChange={(event) =>
                        updateValue(
                          group.id,
                          value.id,
                          "value_en",
                          event.target.value,
                        )
                      }
                    />
                    <input
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                      placeholder="Value (Burmese)"
                      value={value.value_mm}
                      onChange={(event) =>
                        updateValue(
                          group.id,
                          value.id,
                          "value_mm",
                          event.target.value,
                        )
                      }
                    />
                    <button
                      type="button"
                      onClick={() => removeValue(group.id, value.id)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:border-rose-200 hover:text-rose-600 hover:bg-rose-50"
                      aria-label="Remove value"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addValue(group.id)}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-slate-600 hover:border-slate-900 hover:text-slate-900"
                >
                  <Plus size={14} /> Add Value
                </button>
              </div>
            </div>
          ))
        )}
        <button
          type="button"
          onClick={addGroup}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-slate-600 hover:border-slate-900 hover:text-slate-900"
        >
          <Plus size={14} /> Add Group
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <p className="text-xs text-slate-400">
          Total combinations: <span className="font-semibold">{totalCombos}</span>
        </p>
        <button
          type="button"
          onClick={handleGenerate}
          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-xs uppercase tracking-[0.3em] text-white hover:bg-slate-800"
        >
          Generate Variants
        </button>
      </div>
    </div>
  );
};
