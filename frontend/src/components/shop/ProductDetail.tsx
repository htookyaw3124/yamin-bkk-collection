import { useState } from "react";
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
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    product?.variants?.[0]?.id ?? null,
  );

  const selectedVariant = product?.variants?.find(
    (variant) => variant.id === selectedVariantId,
  );
  const isMM = lang === "mm";
  const name = isMM ? product?.name_mm : (product?.name_en ?? "");
  const description = isMM
    ? product?.description_mm
    : (product?.description_en ?? "");
  const imageUrl = product?.images?.[0]?.url ?? "";
  const displayImage = imageUrl.includes("cloudinary")
    ? imageUrl.replace("/upload/", "/upload/f_auto,q_auto,w_1200/")
    : imageUrl;
  const activePrice = selectedVariant?.priceOverride ?? product?.price ?? 0;
  const inStock = getProductInStock(product);
  const brandLabel = getBrandLabel(product?.brand);

  const getOrderMessage = () => {
    const itemName = isMM ? product.name_mm : product.name_en;
    const variantName = selectedVariant
      ? ` - ${isMM ? selectedVariant.name_mm : selectedVariant.name_en}`
      : "";
    const type = inStock ? "Order" : "Pre-Order";
    return encodeURIComponent(
      `Hello! I would like to ${type}: ${itemName}${variantName}`,
    );
  };

  return (
    <div className="max-w-screen-2xl mx-auto py-12 px-6 lg:px-12 animate-in fade-in duration-700">
      <div className="mb-12">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors text-[10px] uppercase tracking-[0.2em] font-bold"
        >
          <ArrowLeft size={14} />{" "}
          {isMM ? "ဆိုင်သို့ပြန်သွားရန်" : "Back to Shop"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
        {/* Gallery */}
        <div className="space-y-6">
          <div className="aspect-[3/4] overflow-hidden bg-slate-50">
            <img
              src={displayImage}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((img, idx) => (
              <div
                key={idx}
                className="aspect-square bg-slate-100 overflow-hidden cursor-pointer opacity-60 hover:opacity-150 transition-opacity"
              >
                <img src={img.url} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col justify-center max-w-lg">
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
                {activePrice.toLocaleString()} USD
              </p>
            </header>

            <div className="space-y-4 pt-8 border-t border-slate-100">
              <p className="text-[10px] tracking-[0.2em] uppercase text-slate-400 font-bold">
                {isMM ? "အသေးစိတ်အချက်အလက်များ" : "Details"}
              </p>
              <p
                className={`text-slate-600 leading-relaxed ${
                  isMM ? "text-lg font-myanmar" : "text-sm font-light"
                }`}
              >
                {description}
              </p>
            </div>

            {product.variants?.length ? (
              <div className="space-y-4 pt-8 border-t border-slate-100">
                <p className="text-[10px] tracking-[0.2em] uppercase text-slate-400 font-bold">
                  {isMM ? "အမျိုးမျိုး ရွေးချယ်မှုများ" : "Available Variants"}
                </p>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariantId(variant.id)}
                      className={`px-4 py-2 rounded-full text-[11px] tracking-[0.1em] uppercase border transition-all ${
                        variant.id === selectedVariantId
                          ? "bg-slate-900 text-white border-slate-900"
                          : "border-slate-200 text-slate-500 hover:border-slate-400"
                      }`}
                    >
                      {isMM ? variant.name_mm : variant.name_en}
                    </button>
                  ))}
                </div>
                {selectedVariant?.options?.length ? (
                  <div className="text-xs text-slate-500 space-y-1">
                    {selectedVariant.options.map((option) => (
                      <div key={option.id} className="flex items-center gap-2">
                        <span className="uppercase tracking-[0.2em] text-[10px] text-slate-400">
                          {option.type}
                        </span>
                        <span className={isMM ? "font-myanmar" : ""}>
                          {isMM ? option.value_mm : option.value_en}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="space-y-6 pt-12 border-t border-slate-100">
              <div className="space-y-4">
                <p className="text-[10px] tracking-[0.2em] uppercase text-slate-400 font-bold">
                  {isMM ? "ယခုပင်မှာယူလိုက်ပါ" : "Order Now via Social"}
                </p>
                <div className="flex gap-4">
                  <a
                    href={`${MESSENGER_URL}?text=${getOrderMessage()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-blue-600 text-white py-4 rounded-full flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-lg text-[10px] font-bold uppercase tracking-widest"
                  >
                    <MessageCircle size={18} /> Messenger
                  </a>
                  <a
                    href={`${TELEGRAM_URL}?text=${getOrderMessage()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-sky-500 text-white py-4 rounded-full flex items-center justify-center gap-3 hover:bg-sky-600 transition-all shadow-lg text-[10px] font-bold uppercase tracking-widest"
                  >
                    <Send size={18} /> Telegram
                  </a>
                </div>
                <div className="flex gap-4 mt-4">
                  <a
                    href={`viber://forward?text=${getOrderMessage()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-purple-600 text-white py-4 rounded-full flex items-center justify-center gap-3 hover:bg-purple-700 transition-all shadow-lg text-[10px] font-bold uppercase tracking-widest"
                  >
                    <Phone size={18} /> Viber
                  </a>
                  <a
                    href={TIKTOK_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-black text-white py-4 rounded-full flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all shadow-lg text-[10px] font-bold uppercase tracking-widest"
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
                {inStock ? "In Stock" : "Pre-Order"}
              </div>
              <div className="flex items-center gap-2">
                <Globe size={12} /> Shipping from BKK
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
