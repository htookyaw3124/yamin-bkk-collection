import type { ReactNode } from "react";

interface SocialButtonProps {
  href: string;
  icon: ReactNode;
  color: string;
  label: string;
}

export const SocialButton = ({
  href,
  icon,
  color,
  label,
}: SocialButtonProps) => (
  <div className="relative group/social flex justify-center">
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`relative z-10 p-3 bg-white/95 text-slate-900 rounded-full shadow-2xl transition-all duration-300 transform group-hover/social:scale-110 group-hover/social:text-white ${color}`}
    >
      {icon}
    </a>
    <div className="absolute -top-10 opacity-0 group-hover/social:opacity-100 transition-all duration-300 transform translate-y-2 group-hover/social:-translate-y-1 bg-slate-900 text-white text-[9px] uppercase tracking-widest px-3 py-1.5 rounded whitespace-nowrap pointer-events-none drop-shadow-md z-20">
      {label}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
    </div>
  </div>
);
