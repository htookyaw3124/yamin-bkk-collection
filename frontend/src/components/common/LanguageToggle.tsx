import { Globe } from "lucide-react";
import type { Lang } from "../../types";

interface LanguageToggleProps {
  current: Lang;
  onToggle: () => void;
}

export const LanguageToggle = ({ current, onToggle }: LanguageToggleProps) => {
  // Assuming 'toggleLang' in the provided snippet was a typo and should be 'onToggle'
  // or that 'toggleLang' would be defined within the component.
  // Sticking to 'onToggle' as it's the prop provided.
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white shadow-sm hover:border-slate-300 hover:shadow transition-all group"
      aria-label="Toggle language"
    >
      <Globe size={14} className="group-hover:text-brand-hover transition-colors" />
    <span className="text-[11px] font-bold tracking-widest uppercase">
      {current === "en" ? "MM" : "EN"}
    </span>
  </button>
);
}
