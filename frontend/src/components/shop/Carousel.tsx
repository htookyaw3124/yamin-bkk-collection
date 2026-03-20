import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

const CAROUSEL_IMAGES = [
  "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=1600",
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1600",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1600",
];

export const Carousel = () => {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === CAROUSEL_IMAGES.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const next = () =>
    setCurrent(current === CAROUSEL_IMAGES.length - 1 ? 0 : current + 1);
  const prev = () =>
    setCurrent(current === 0 ? CAROUSEL_IMAGES.length - 1 : current - 1);

  return (
    <div className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden bg-slate-900 group">
      {CAROUSEL_IMAGES.map((img, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <img
            src={img}
            alt="Banner"
            className="w-full h-full object-cover opacity-70"
          />
        </div>
      ))}

      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
        <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000 ease-out flex flex-col items-center">
          <p className="text-[9px] md:text-[11px] lg:text-[12px] font-black uppercase tracking-[0.6em] text-pink-400 mb-6 drop-shadow-lg opacity-90">
            Exclusive Selection
          </p>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-[-0.05em] leading-[1.05] text-white drop-shadow-2xl max-w-4xl mx-auto mb-12">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/60">
              {t("endOfSeason")}
            </span>
          </h1>
          <div className="flex items-center justify-center gap-6">
            <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-white/40"></div>
            <div className="w-2.5 h-2.5 rounded-full border border-pink-500 bg-pink-500/20 shadow-[0_0_15px_rgba(236,72,153,0.5)] animate-pulse"></div>
            <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-white/40"></div>
          </div>
        </div>
      </div>

      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronRight size={24} />
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
        {CAROUSEL_IMAGES.map((_, idx) => (
          <div
            key={idx}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === current ? "bg-white w-6" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};
