import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  MessageCircle,
  Send,
  Globe,
  X,
  ArrowLeft,
} from "lucide-react";
import type { Lang } from "../../types";
import { getProductInStock, getCategoryLabel } from "../../utils/helpers";
import { MESSENGER_URL, TELEGRAM_URL } from "../../constants";
import { VideoEmbed } from "./VideoEmbed";
import { VariantSelector } from "./VariantSelector";

import { useGetProductQuery } from "../../lib/api";

interface ProductDetailProps {
  productId: string;
  lang: Lang;
  onClose: () => void;
  isPage?: boolean;
}

export const ProductDetail = ({
  productId,
  lang,
  onClose,
  isPage = false,
}: ProductDetailProps) => {
  const { data: product, isLoading, error } = useGetProductQuery(productId);
  const { t } = useTranslation();
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null,
  );

  const selectedVariant = useMemo(
    () => product?.variants?.find((v) => v.id === selectedVariantId),
    [product?.variants, selectedVariantId],
  );

  const allImages = useMemo(() => {
    if (!product) return [];
    const imgs = [...(product.images || [])];
    
    // Add all unique images from variants and their options
    product.variants?.forEach(v => {
      v.images?.forEach(vImg => {
        if (!imgs.some(img => img.url === vImg.url)) {
          imgs.push(vImg);
        }
      });
      v.options?.forEach(opt => {
        if (opt.imageUrl && !imgs.some(img => img.url === opt.imageUrl)) {
          imgs.push({ url: opt.imageUrl, isMain: false });
        }
      });
    });

    return imgs;
  }, [product]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-md">
        <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-md">
        <div className="text-center space-y-4">
          <p className="text-slate-500">Failed to load product details</p>
          <button
            onClick={onClose}
            className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-900 pb-1"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const targetProduct = product!;
  const isMM = lang === "mm";
  const name = isMM ? targetProduct.name_mm : targetProduct.name_en;
  const description = isMM ? targetProduct.description_mm : targetProduct.description_en;
  const activeImage = allImages[activeImageIdx]?.url ?? "";
  const displayImage = activeImage.includes("cloudinary")
    ? activeImage.replace("/upload/", "/upload/f_auto,q_auto,w_1200/")
    : activeImage;
  const activePrice = selectedVariant?.priceOverride ?? targetProduct.price ?? 0;
  const inStock = getProductInStock(targetProduct);
  const brandName = typeof targetProduct.brand === 'string' ? targetProduct.brand : targetProduct.brand?.name;

  const getOrderMessage = () => {
    const itemName = isMM ? targetProduct.name_mm : targetProduct.name_en;
    const type = inStock ? "Order" : "Pre-Order";
    return encodeURIComponent(`Hello! I would like to ${type}: ${itemName}`);
  };

  return (
    <div className={isPage ? "w-full min-h-screen bg-white pb-20" : "fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 lg:p-8"}>
      {/* Sophisticated Backdrop - Only for Modal */}
      {!isPage && (
        <div 
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl transition-opacity animate-in fade-in duration-500"
          onClick={onClose}
        ></div>
      )}
      
      {/* Modal/Page Container */}
      <div className={`relative bg-white w-full flex flex-col md:flex-row overflow-hidden select-none ${
        isPage 
          ? "max-w-5xl mx-auto md:my-12 md:rounded-[3rem] md:shadow-2xl border border-slate-100" 
          : "max-w-5xl sm:rounded-3xl shadow-2xl h-[92vh] sm:h-auto sm:max-h-[90vh] lg:max-h-[85vh] animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-500 ease-out fill-mode-backwards"
      }`}>
        
        {/* Navigation - Conditional */}
        {isPage ? (
          <button 
            onClick={onClose}
            className="absolute top-6 left-6 md:top-10 md:left-10 z-50 p-4 bg-white/80 hover:bg-white text-slate-900 rounded-2xl backdrop-blur-md shadow-xl transition-all active:scale-95 group flex items-center gap-3 border border-slate-100"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">{t("back")}</span>
          </button>
        ) : (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-2.5 bg-white/80 hover:bg-white text-slate-900 rounded-full backdrop-blur-md shadow-lg transition-all active:scale-95 group"
          >
            <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        )}

        {/* Left: Image Section */}
        <div className={`w-full ${isPage ? "md:w-1/2" : "md:w-[55%]"} bg-slate-50 relative overflow-hidden group border-r border-slate-100/50`}>
          <div className={`relative ${isPage ? "aspect-square md:aspect-auto md:h-full" : "aspect-square sm:aspect-auto sm:h-full"} w-full overflow-hidden`}>
            {/* Desktop Thumbnails (Side) */}
            {isPage && allImages.length > 1 && (
              <div className="absolute left-6 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col gap-3">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-14 aspect-[4/5] rounded-xl overflow-hidden border-2 transition-all duration-300 hover:scale-110 shadow-lg ${
                      idx === activeImageIdx ? "border-white scale-110 shadow-white/20" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img.url} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            )}

            <img
              src={displayImage}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            
            {/* Gallery Navigation - Dots (Shown on Mobile or Non-Page) */}
            {allImages.length > 1 && (
              <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/10 backdrop-blur-md rounded-full shadow-lg z-20 ${isPage ? "lg:hidden" : ""}`}>
                {allImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`transition-all duration-300 ${
                      idx === activeImageIdx
                        ? "w-4 h-1.5 bg-white shadow-sm"
                        : "w-1.5 h-1.5 bg-white/50 hover:bg-white"
                    } rounded-full`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {targetProduct.videoUrl && (
          <div className="p-4 bg-slate-50 border-t border-slate-100">
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <VideoEmbed url={targetProduct.videoUrl} />
            </div>
          </div>
        )}

        <div className={`w-full ${isPage ? "md:w-1/2" : "md:w-1/2"} p-6 md:p-10 lg:p-12 flex flex-col overflow-y-auto bg-white`}>
          <div className="flex items-center space-x-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">
            {brandName && <span className="text-pink-500/80">{brandName}</span>}
            {brandName && <span className="opacity-30">•</span>}
            <span>{getCategoryLabel(targetProduct.category)}</span>
            {(targetProduct.isSale || (targetProduct.originalPrice && targetProduct.originalPrice > targetProduct.price)) && (
              <>
                <span className="opacity-30">•</span>
                <span className="text-emerald-500 font-black">{t("sale")}</span>
              </>
            )}
          </div>
          
          <h2 className={`font-black text-slate-900 mb-4 ${isMM ? 'text-2xl font-myanmar leading-tight' : 'text-3xl tracking-tight'}`}>{name}</h2>
          
          <div className="flex items-end space-x-3 mb-8">
            <p className="text-xl md:text-2xl font-black text-slate-900 uppercase">
              {activePrice.toLocaleString()} MMK
            </p>
            {targetProduct.originalPrice && targetProduct.originalPrice > targetProduct.price && (
              <p className="text-lg text-slate-400 line-through mb-0.5 uppercase font-medium">
                {targetProduct.originalPrice.toLocaleString()} MMK
              </p>
            )}
          </div>
          
          <div className="space-y-4 mb-10">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
              {t("details")}
            </h4>
            <p className={`text-slate-500 leading-relaxed ${isMM ? 'text-xl font-myanmar' : 'text-base font-light'}`}>
              {description}
            </p>
          </div>
          
          {/* Variant Selector */}
          <div className="mb-10">
            <VariantSelector
              product={targetProduct}
              lang={lang}
              onSelectVariant={(variantId) => {
                setSelectedVariantId(variantId || null);
                setActiveImageIdx(0);
              }}
              onOptionSelect={(imageUrl) => {
                if (imageUrl) {
                  const idx = allImages.findIndex(img => img.url === imageUrl);
                  if (idx !== -1) {
                    setActiveImageIdx(idx);
                  }
                }
              }}
            />
          </div>
          
          <div className="mt-auto space-y-4 pt-8 border-t border-slate-100">
            <div className="grid grid-cols-2 gap-4">
              <a
                href={`${MESSENGER_URL}?text=${getOrderMessage()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-blue-600 to-blue-500 text-white py-5 rounded-2xl flex flex-col items-center justify-center gap-1.5 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/30 transition-all active:scale-95 text-[9px] font-black uppercase tracking-[0.2em] shadow-xl"
              >
                <MessageCircle size={20} strokeWidth={2.5} />
                <span>Messenger</span>
              </a>
              <a
                href={`${TELEGRAM_URL}?text=${getOrderMessage()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-sky-500 to-sky-400 text-white py-5 rounded-2xl flex flex-col items-center justify-center gap-1.5 hover:-translate-y-1 hover:shadow-2xl hover:shadow-sky-500/30 transition-all active:scale-95 text-[9px] font-black uppercase tracking-[0.2em] shadow-xl"
              >
                <Send size={20} strokeWidth={2.5} />
                <span>Telegram</span>
              </a>
            </div>
            
            <button 
              onClick={onClose}
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-slate-800 transition-colors shadow-xl"
            >
              {t("continueShopping")}
            </button>

            <div className="flex items-center justify-between pt-4 text-[10px] uppercase tracking-widest text-slate-400">
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${inStock ? "bg-emerald-500 animate-pulse" : "bg-purple-500 animate-pulse"}`} />
                {t(inStock ? "inStock" : "preOrder")}
              </div>
              <div className="flex items-center gap-2 italic opacity-80">
                <Globe size={12} /> {t("shippingFromBKK")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
