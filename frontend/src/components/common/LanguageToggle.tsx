import { Globe } from "lucide-react";
import type { Lang } from "../../types";

interface LanguageToggleProps {
  current: Lang;
  onToggle: () => void;
}

export const LanguageToggle = ({ current, onToggle }: LanguageToggleProps) => (
  <button
    onClick={onToggle}
    className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 hover:border-slate-900 transition-all duration-300 group"
  >
    <Globe size={14} className="group-hover:text-pink-600" />
    <span className="text-[11px] font-bold tracking-widest uppercase">
      {current === "en" ? "MM" : "EN"}
    </span>
  </button>
);
