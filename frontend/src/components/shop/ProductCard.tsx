import { useTranslation } from "react-i18next";
import {
  CheckCircle,
  MessageCircle,
  Send,
  Phone,
  Music2,
  XCircle,
} from "lucide-react";
import type { Product, Lang } from "../../types";
import { getProductInStock, getBrandLabel } from "../../utils/helpers";
import { SocialButton } from "../common/SocialButton";
import { MESSENGER_URL, TELEGRAM_URL, TIKTOK_URL } from "../../constants";

interface ProductCardProps {
  product: Product;
  lang: Lang;
  onViewDetails: (productId: string) => void;
}

export const ProductCard = ({
  product,
  lang,
  onViewDetails,
}: ProductCardProps) => {
  const { t } = useTranslation();
  const isMM = lang === "mm";
  const name = isMM ? product.name_mm : product.name_en;
  const imageUrl = product.images[0]?.url ?? "";
  const displayImage = imageUrl.includes("cloudinary")
    ? imageUrl.replace("/upload/", "/upload/f_auto,q_auto,w_800/")
    : imageUrl;
  const inStock = getProductInStock(product);
  const brandLabel = getBrandLabel(product.brand);

  const variantCount = product.variants?.length ?? 0;

  return (
    <div className="group relative bg-white transition-all duration-700">
      <div className="relative aspect-[3/4] overflow-hidden bg-slate-100">
        <img
          src={displayImage}
          alt={name}
          className="h-full w-full object-cover object-center transition-transform duration-1000 group-hover:scale-110"
          loading="lazy"
        />
        {/* Stock badge */}
        <div className="absolute top-3 left-3 z-20">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] uppercase tracking-[0.2em] font-bold ${
              inStock
                ? "bg-emerald-500/90 text-white"
                : "bg-rose-500/90 text-white"
            }`}
          >
            {inStock ? <CheckCircle size={12} /> : <XCircle size={12} />}
            {t(inStock ? "inStock" : "preOrder")}
          </span>
        </div>

        {/* Desktop only: hover overlay with social links */}
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-500 hidden lg:flex flex-col items-center justify-center gap-6">
          <p className="text-white text-[10px] tracking-[0.3em] font-bold uppercase drop-shadow-md">
            {t("quickOrder")}
          </p>
          <div className="flex gap-4">
            <SocialButton
              href={MESSENGER_URL}
              color="hover:bg-blue-500"
              icon={<MessageCircle size={20} />}
              label={t("orderVia", { app: "Messenger" })}
            />
            <SocialButton
              href={TELEGRAM_URL}
              color="hover:bg-sky-500"
              icon={<Send size={20} />}
              label={t("orderVia", { app: "Telegram" })}
            />
            <SocialButton
              href={`viber://forward?text=${encodeURIComponent(`Hello! I would like to Order: ${product.name_en}`)}`}
              color="hover:bg-purple-600"
              icon={<Phone size={20} />}
              label={t("orderVia", { app: "Viber" })}
            />
            <SocialButton
              href={TIKTOK_URL}
              color="hover:bg-black"
              icon={<Music2 size={20} />}
              label={t("orderVia", { app: "TikTok" })}
            />
          </div>
          <button
            onClick={() => onViewDetails(product.id)}
            className="bg-white/90 backdrop-blur-sm text-slate-900 px-6 py-2 text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-500"
          >
            {t("viewDetails")}
          </button>
        </div>
      </div>

      {/* Mobile only: view details button below image */}
      <div className="mt-3 lg:hidden">
        <button
          onClick={() => onViewDetails(product.id)}
          className="w-full py-2 bg-slate-900 text-white text-[9px] font-bold uppercase tracking-[0.15em] rounded-full hover:bg-slate-800 transition-colors"
        >
          {t("viewDetails")}
        </button>
      </div>

      <div className="pt-4 lg:pt-6 pb-4 text-center">
        {brandLabel && (
          <p className="text-[9px] tracking-[0.3em] uppercase text-pink-500 font-bold mb-1.5">
            {brandLabel}
          </p>
        )}
        <h3
          className={`text-slate-900 font-light ${
            isMM
              ? "text-lg leading-relaxed mb-1 font-myanmar"
              : "text-md tracking-tight mb-0"
          }`}
        >
          {name}
        </h3>
        {variantCount > 0 && (
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mt-1">
            {t("variantsAvailable", { count: variantCount })}
          </p>
        )}
        <p className="text-slate-900 font-medium text-sm mt-1">
          {product.price.toLocaleString()} MMK
        </p>
      </div>
    </div>
  );
};
