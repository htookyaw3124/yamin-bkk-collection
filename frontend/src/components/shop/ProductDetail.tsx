import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  MessageCircle,
  Send,
  Phone,
  Music2,
  Globe,
} from "lucide-react";
import type { Product, Lang } from "../../types";
import { getProductInStock, getBrandLabel } from "../../utils/helpers";
import { MESSENGER_URL, TELEGRAM_URL, TIKTOK_URL } from "../../constants";
import { VideoEmbed } from "./VideoEmbed";
import { VariantSelector } from "./VariantSelector";

interface ProductDetailProps {
  product: Product;
  lang: Lang;
  onClose: () => void;
}

export const ProductDetail = ({
  product,
  lang,
  onClose,
}: ProductDetailProps) => {
  const { t } = useTranslation();
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  const selectedVariant = useMemo(
    () => product.variants?.find((v) => v.id === selectedVariantId),
    [product.variants, selectedVariantId],
  );

  const allImages = useMemo(() => {
    let imgs = [...(product?.images || [])];
    // Show variant images only if a variant is selected AND has images
    if (selectedVariantId && selectedVariant?.images && selectedVariant.images.length > 0) {
      imgs = [...selectedVariant.images];
    }
    return imgs;
  }, [product, selectedVariant, selectedVariantId]);

  const isMM = lang === "mm";
  const name = isMM ? product?.name_mm : (product?.name_en ?? "");
  const description = isMM
    ? product?.description_mm
    : (product?.description_en ?? "");
  const activeImage = allImages[activeImageIdx]?.url ?? "";
  const displayImage = activeImage.includes("cloudinary")
    ? activeImage.replace("/upload/", "/upload/f_auto,q_auto,w_1200/")
    : activeImage;
  const activePrice = selectedVariant?.priceOverride ?? product?.price ?? 0;
  const inStock = getProductInStock(product);
  const brandLabel = getBrandLabel(product?.brand);

  const getOrderMessage = () => {
    const itemName = isMM ? product.name_mm : product.name_en;
    const type = inStock ? "Order" : "Pre-Order";
    return encodeURIComponent(`Hello! I would like to ${type}: ${itemName}`);
  };

  return (
    <div className="max-w-screen-2xl mx-auto py-12 px-6 lg:px-12 animate-in fade-in duration-700">
      <div className="mb-12">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors text-[10px] uppercase tracking-[0.2em] font-bold"
        >
          <ArrowLeft size={14} /> {t("backToShop")}
        </button>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-16 lg:gap-24 relative">
        {/* Gallery */}
        <div className="lg:col-span-7 flex flex-col gap-6 lg:sticky lg:top-32 h-max">
          <div className="aspect-[4/5] w-full overflow-hidden bg-slate-50 rounded-3xl shadow-sm relative group">
            <img
              src={displayImage}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x scrollbar-hide">
            {allImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIdx(idx)}
                className={`flex-none w-24 aspect-[4/5] rounded-xl overflow-hidden cursor-pointer transition-all snap-start ${
                  idx === activeImageIdx
                    ? "ring-2 ring-slate-900 opacity-100"
                    : "opacity-60 hover:opacity-100 hover:ring-2 hover:ring-slate-200"
                }`}
              >
                <img
                  src={img.url}
                  className="w-full h-full object-cover grayscale-0"
                />
              </button>
            ))}
          </div>
          {product.videoUrl && (
            <div className="mt-4">
              <VideoEmbed url={product.videoUrl} />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="lg:col-span-5 flex flex-col justify-start">
          <div className="space-y-8">
            <header className="space-y-4">
              {brandLabel && (
                <p className="text-[10px] tracking-[0.4em] uppercase text-pink-500 font-bold">
                  {brandLabel}
                </p>
              )}
              <h1
                className={`text-slate-900 font-light ${
                  isMM
                    ? "text-4xl leading-tight font-myanmar"
                    : "text-5xl tracking-tight"
                }`}
              >
                {name}
              </h1>
              <p className="text-2xl font-medium text-slate-900">
                {activePrice.toLocaleString()} MMK
              </p>
            </header>

            <div className="space-y-4 pt-8 border-t border-slate-100">
              <p className="text-[10px] tracking-[0.2em] uppercase text-slate-400 font-bold">
                {t("details")}
              </p>
              <p
                className={`text-slate-600 leading-relaxed ${
                  isMM ? "text-lg font-myanmar" : "text-sm font-light"
                }`}
              >
                {description}
              </p>
            </div>

            {/* Variant Selector - Beautiful variant display */}
            <VariantSelector
              product={product}
              lang={lang}
              onSelectVariant={(variantId) => {
                setSelectedVariantId(variantId || null);
                setActiveImageIdx(0); // Reset to first image when variant changes
              }}
            />

            <div className="space-y-6 pt-12 border-t border-slate-100">
              <div className="space-y-4">
                <p className="text-[10px] tracking-[0.2em] uppercase text-slate-400 font-bold">
                  {t("orderNowViaSocial")}
                </p>
                <div className="flex gap-4">
                  <a
                    href={`${MESSENGER_URL}?text=${getOrderMessage()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-blue-600 text-white py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-600/30 hover:-translate-y-1 text-[10px] font-bold uppercase tracking-widest"
                  >
                    <MessageCircle size={18} /> Messenger
                  </a>
                  <a
                    href={`${TELEGRAM_URL}?text=${getOrderMessage()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-sky-500 text-white py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-sky-600 transition-all shadow-lg hover:shadow-sky-500/30 hover:-translate-y-1 text-[10px] font-bold uppercase tracking-widest"
                  >
                    <Send size={18} /> Telegram
                  </a>
                </div>
                <div className="flex gap-4 mt-4">
                  <a
                    href={`viber://forward?text=${getOrderMessage()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-purple-600 text-white py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-purple-700 transition-all shadow-lg hover:shadow-purple-600/30 hover:-translate-y-1 text-[10px] font-bold uppercase tracking-widest"
                  >
                    <Phone size={18} /> Viber
                  </a>
                  <a
                    href={TIKTOK_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-black text-white py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all shadow-lg hover:shadow-black/30 hover:-translate-y-1 text-[10px] font-bold uppercase tracking-widest"
                  >
                    <Music2 size={18} /> TikTok
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-8 text-slate-400 text-[10px] uppercase tracking-widest flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div
                  className={`w-1.5 h-1.5 rounded-full ${inStock ? "bg-emerald-500" : "bg-purple-500"}`}
                />
                {t(inStock ? "inStock" : "preOrder")}
              </div>
              <div className="flex items-center gap-2">
                <Globe size={12} /> {t("shippingFromBKK")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
