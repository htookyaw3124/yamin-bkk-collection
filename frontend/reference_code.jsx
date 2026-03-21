import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowLeft, X, Filter, ShoppingBag, Globe } from 'lucide-react';

// --- TRANSLATIONS ---
const translations = {
  mm: {
    endOfSeason: "ရာသီကုန် အထူးပရိုမိုးရှင်း",
    seeSalesItem: "ပရိုမိုးရှင်းပစ္စည်းများ ကြည့်ရန်",
    featuredBrands: "လူကြိုက်များသော အမှတ်တံဆိပ်များ",
    seeDetail: "အသေးစိတ်ကြည့်ရန်",
    back: "နောက်သို့",
    filters: "စစ်ထုတ်ရန်",
    category: "အမျိုးအစား",
    man: "အမျိုးသား",
    woman: "အမျိုးသမီး",
    kid: "ကလေး",
    saleItemsOnly: "လျှော့စျေးပစ္စည်းများသာ",
    showingItems: (count) => `ပစ္စည်း ${count} ခု ပြသနေသည်`,
    noItemsFound: "ရွေးချယ်ထားသော အချက်အလက်များနှင့် ကိုက်ညီသော ပစ္စည်းမရှိပါ။",
    clearFilters: "စစ်ထုတ်မှုများကို ရှင်းလင်းရန်",
    sale: "လျှော့စျေး",
    color: "အရောင်",
    size: "အရွယ်အစား",
    sizeGuide: "အရွယ်အစား လမ်းညွှန်",
    addToCart: "စျေးခြင်းထဲသို့ ထည့်ရန်",
    continueShopping: "ဆက်လက် စျေးဝယ်မည်",
    quickLinks: "အမြန်လင့်ခ်များ",
    customerCare: "ဝယ်ယူသူ ဝန်ဆောင်မှု",
    home: "ပင်မစာမျက်နှာ",
    shop: "စျေးဝယ်ရန်",
    aboutUs: "ကျွန်ုပ်တို့အကြောင်း",
    contact: "ဆက်သွယ်ရန်",
    shippingReturns: "ပို့ဆောင်ခြင်း နှင့် ပြန်လည်ပေးပို့ခြင်း",
    faq: "အမေးများသော မေးခွန်းများ",
    trackOrder: "အော်ဒါ ခြေရာခံရန်",
    privacyPolicy: "ကိုယ်ရေးကိုယ်တာ မူဝါဒ",
    termsOfService: "ဝန်ဆောင်မှု စည်းမျဉ်းများ",
    allRightsReserved: "မူပိုင်ခွင့်များအားလုံး ရယူထားသည်။",
    descriptionText: "ထိပ်တန်းအမှတ်တံဆိပ်များမှ ဖက်ရှင်များကို ရွေးချယ်တင်ဆက်ထားပါသည်။ အရည်အသွေး၊ စတိုင်လ်နှင့် သက်တောင့်သက်သာရှိမှုကို သင့်အိမ်တိုင်ရာရောက် ပို့ဆောင်ပေးပါသည်။"
  },
  en: {
    endOfSeason: "End of Season Event",
    seeSalesItem: "See Sales Item",
    featuredBrands: "Featured Brands",
    seeDetail: "See Detail",
    back: "Back",
    filters: "Filters",
    category: "Category",
    man: "Men",
    woman: "Women",
    kid: "Kids",
    saleItemsOnly: "Sale Items Only",
    showingItems: (count) => `Showing ${count} items`,
    noItemsFound: "No items found for selected filters.",
    clearFilters: "Clear all filters",
    sale: "Sale",
    color: "Color",
    size: "Size",
    sizeGuide: "Size Guide",
    addToCart: "Add to Cart",
    continueShopping: "Continue Shopping",
    quickLinks: "Quick Links",
    customerCare: "Customer Care",
    home: "Home",
    shop: "Shop",
    aboutUs: "About Us",
    contact: "Contact",
    shippingReturns: "Shipping & Returns",
    faq: "FAQ",
    trackOrder: "Track Order",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    allRightsReserved: "All rights reserved.",
    descriptionText: "Curated fashion from top brands in Bangkok. Quality, style, and comfort delivered to your doorstep."
  }
};

// --- MOCK DATA ---
const BRANDS = [
  { id: 'uniqlo', name: 'Uniqlo', image: 'https://images.unsplash.com/photo-1571867424488-4565932edb41?auto=format&fit=crop&q=80&w=800' },
  { id: 'zara', name: 'Zara', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=800' },
  { id: 'hm', name: 'H&M', image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=800' }
];

const CAROUSEL_IMAGES = [
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=1600',
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1600',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1600'
];

const ITEMS = [
  // Uniqlo
  { id: 1, brand: 'uniqlo', category: 'man', name: 'Supima Cotton T-Shirt', price: 14.90, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600', description: 'Premium cotton t-shirt for everyday wear. Exceptionally soft and durable.', isSale: false, colors: [{name: 'White', class: 'bg-white'}, {name: 'Black', class: 'bg-slate-900'}, {name: 'Navy', class: 'bg-blue-900'}], sizes: ['SM', 'MD', 'L', 'XL'] },
  { id: 2, brand: 'uniqlo', category: 'woman', name: 'Rayon Blouse', price: 19.90, originalPrice: 29.90, image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=600', description: 'Wrinkle-resistant blouse perfect for the office or casual outings.', isSale: true, colors: [{name: 'White', class: 'bg-white'}, {name: 'Pink', class: 'bg-pink-300'}], sizes: ['XS', 'SM', 'MD', 'L'] },
  { id: 3, brand: 'uniqlo', category: 'kid', name: 'Fleece Jacket', price: 19.90, image: 'https://images.unsplash.com/photo-1519238263530-99abad111f14?auto=format&fit=crop&q=80&w=600', description: 'Warm and lightweight fleece for active kids.', isSale: false, colors: [{name: 'Yellow', class: 'bg-yellow-400'}, {name: 'Blue', class: 'bg-blue-500'}], sizes: ['XS', 'SM', 'MD'] },
  { id: 4, brand: 'uniqlo', category: 'man', name: 'Ultra Light Down', price: 49.90, originalPrice: 59.90, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=600', description: 'Incredibly lightweight and warm. Packs down small.', isSale: true, colors: [{name: 'Black', class: 'bg-slate-900'}, {name: 'Olive', class: 'bg-emerald-800'}, {name: 'Gray', class: 'bg-slate-500'}], sizes: ['SM', 'MD', 'L', 'XL', 'XXL'] },
  
  // Zara
  { id: 5, brand: 'zara', category: 'woman', name: 'Pleated Midi Skirt', price: 45.90, image: 'https://images.unsplash.com/photo-1582142301185-11531393630d?auto=format&fit=crop&q=80&w=600', description: 'Elegant pleated skirt in seasonal colors.', isSale: false, colors: [{name: 'Beige', class: 'bg-orange-100'}, {name: 'Black', class: 'bg-slate-900'}], sizes: ['XS', 'SM', 'MD', 'L'] },
  { id: 6, brand: 'zara', category: 'man', name: 'Textured Suit Jacket', price: 119.00, image: 'https://images.unsplash.com/photo-1593030761757-71fae46af508?auto=format&fit=crop&q=80&w=600', description: 'Modern fit suit jacket with subtle texture.', isSale: false, colors: [{name: 'Navy', class: 'bg-blue-900'}, {name: 'Charcoal', class: 'bg-slate-800'}], sizes: ['MD', 'L', 'XL'] },
  { id: 7, brand: 'zara', category: 'kid', name: 'Denim Overalls', price: 25.90, originalPrice: 35.90, image: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&q=80&w=600', description: 'Durable and stylish denim for playtime.', isSale: true, colors: [{name: 'Light Blue', class: 'bg-blue-300'}, {name: 'Indigo', class: 'bg-blue-800'}], sizes: ['SM', 'MD', 'L'] },
  { id: 8, brand: 'zara', category: 'woman', name: 'Knit Cropped Sweater', price: 39.90, image: 'https://images.unsplash.com/photo-1434389678232-0675a68dadf4?auto=format&fit=crop&q=80&w=600', description: 'Cozy cropped sweater for layering.', isSale: false, colors: [{name: 'Cream', class: 'bg-orange-50'}, {name: 'Camel', class: 'bg-orange-300'}], sizes: ['SM', 'MD', 'L'] },

  // H&M
  { id: 9, brand: 'hm', category: 'man', name: 'Slim Fit Jeans', price: 29.99, image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=600', description: 'Classic slim fit denim with stretch for comfort.', isSale: false, colors: [{name: 'Black', class: 'bg-slate-900'}, {name: 'Dark Wash', class: 'bg-blue-900'}], sizes: ['28', '30', '32', '34', '36'] },
  { id: 10, brand: 'hm', category: 'woman', name: 'Ribbed Knit Dress', price: 24.99, originalPrice: 34.99, image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=600', description: 'Form-fitting ribbed dress for day-to-night transitions.', isSale: true, colors: [{name: 'Burgundy', class: 'bg-red-900'}, {name: 'Black', class: 'bg-slate-900'}], sizes: ['XS', 'SM', 'MD', 'L'] },
  { id: 11, brand: 'hm', category: 'kid', name: 'Printed Cotton Tees (3-pack)', price: 17.99, image: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&q=80&w=600', description: 'Value pack of fun graphic tees.', isSale: false, colors: [{name: 'Multi', class: 'bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400'}], sizes: ['XS', 'SM', 'MD', 'L'] },
  { id: 12, brand: 'hm', category: 'man', name: 'Cotton Hoodie', price: 24.99, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=600', description: 'Essential basic hoodie in soft cotton blend.', isSale: false, colors: [{name: 'Grey Marl', class: 'bg-slate-300'}, {name: 'Black', class: 'bg-slate-900'}, {name: 'Navy', class: 'bg-blue-900'}], sizes: ['SM', 'MD', 'L', 'XL'] },
];

// --- COMPONENTS ---

const CUSTOM_STYLES = `
@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  --font-myanmar: "Noto Sans Myanmar", ui-sans-serif, system-ui;
}

@layer base {
  html {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-family: var(--font-sans, ui-sans-serif, system-ui, sans-serif);
  }

  html[lang="mm"], [lang="mm"] {
    font-family: var(--font-myanmar, "Noto Sans Myanmar", ui-sans-serif, system-ui);
  }

  body {
    background-color: #f8fafc; /* slate-50 */
    color: #0f172a; /* slate-900 */
  }
}

@layer utilities {
  .font-myanmar {
    font-family: var(--font-myanmar);
  }
}

/* Gradient separator line */
.gradient-separator {
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(236, 72, 153, 0.3) 30%,
    rgba(236, 72, 153, 0.5) 50%,
    rgba(236, 72, 153, 0.3) 70%,
    transparent 100%
  );
}

/* Filter chip glassmorphism */
.filter-chip {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.filter-chip:hover {
  transform: translateY(-1px);
}

.filter-chip-active {
  background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
  position: relative;
  color: white;
  border-color: transparent;
}

.filter-chip-active::after {
  content: "";
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #ec4899, transparent);
  border-radius: 2px;
}
`;

// 1. Carousel Component
const Carousel = ({ t }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === CAROUSEL_IMAGES.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrent(current === CAROUSEL_IMAGES.length - 1 ? 0 : current + 1);
  const prev = () => setCurrent(current === 0 ? CAROUSEL_IMAGES.length - 1 : current - 1);

  return (
    <div className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden bg-slate-900 group">
      {CAROUSEL_IMAGES.map((img, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <img src={img} alt="Banner" className="w-full h-full object-cover opacity-70" />
        </div>
      ))}
      
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight drop-shadow-lg">
          {t('endOfSeason')}
        </h1>
        <button className="bg-white text-slate-900 px-8 py-3 rounded-full font-semibold uppercase tracking-wide hover:bg-slate-100 transition-colors shadow-lg hover:scale-105 transform duration-200">
          {t('seeSalesItem')}
        </button>
      </div>

      <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100">
        <ChevronLeft size={24} />
      </button>
      <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100">
        <ChevronRight size={24} />
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
        {CAROUSEL_IMAGES.map((_, idx) => (
          <div key={idx} className={`w-2 h-2 rounded-full transition-all ${idx === current ? 'bg-white w-6' : 'bg-white/50'}`} />
        ))}
      </div>
    </div>
  );
};

// 2. Main App Component
export default function App() {
  // Set default language to 'mm' (Burmese)
  const [language, setLanguage] = useState('mm');
  const [view, setView] = useState('home'); // 'home' or 'detail'
  const [activeBrand, setActiveBrand] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showSaleOnly, setShowSaleOnly] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  // Translation helper
  const t = (key, params) => {
    const val = translations[language]?.[key] || translations['en']?.[key] || key;
    if (typeof val === 'function') return val(params);
    return val;
  };

  // Sync language with document for styling rules
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // Navigation handlers
  const goToDetail = (brandId) => {
    setActiveBrand(brandId);
    setView('detail');
    setSelectedCategories([]); // Reset filters on new brand
    setShowSaleOnly(false); // Reset sale filter
    window.scrollTo(0, 0);
  };

  const goToHome = () => {
    setView('home');
    setActiveBrand(null);
    setSelectedItem(null);
  };

  const openItemDetail = (item) => {
    setSelectedItem(item);
    // Pre-select first color and size if available
    setSelectedColor(item.colors?.[0] || null);
    setSelectedSize(item.sizes?.[0] || null);
  };

  const closeItemDetail = () => {
    setSelectedItem(null);
    setSelectedColor(null);
    setSelectedSize(null);
  };

  // Filter handlers
  const toggleCategory = (cat) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  // Data selection
  const currentBrandDetails = BRANDS.find(b => b.id === activeBrand);
  const filteredItems = ITEMS.filter(item => {
    const matchBrand = item.brand === activeBrand;
    const matchCategory = selectedCategories.length === 0 || selectedCategories.includes(item.category);
    const matchSale = showSaleOnly ? item.isSale : true;
    return matchBrand && matchCategory && matchSale;
  });

  return (
    <div lang={language} className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <style dangerouslySetInnerHTML={{ __html: CUSTOM_STYLES }} />
      
      {/* Header Navigation */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {view === 'detail' && (
              <button onClick={goToHome} className="p-2 hover:bg-slate-100 rounded-full transition-colors flex items-center text-slate-600">
                <ArrowLeft size={20} />
                <span className="ml-2 hidden sm:inline text-sm font-medium">{t('back')}</span>
              </button>
            )}
            <h1 onClick={goToHome} className="text-xl font-bold tracking-tighter cursor-pointer text-slate-900 flex items-center">
              YAMIN BKK<span className="text-slate-400 font-light ml-1 hidden sm:inline">Collection</span>
            </h1>
          </div>
          <div className="flex items-center space-x-3 sm:space-x-4">
            
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 rounded-full p-1 border border-slate-200">
              <button 
                onClick={() => setLanguage('mm')}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all duration-200 ${language === 'mm' ? 'bg-white shadow-sm text-pink-500' : 'text-slate-500 hover:text-slate-700'}`}
              >
                MM
              </button>
              <button 
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all duration-200 ${language === 'en' ? 'bg-white shadow-sm text-pink-500' : 'text-slate-500 hover:text-slate-700'}`}
              >
                EN
              </button>
            </div>

            <button className="p-2 hover:bg-slate-100 rounded-full relative">
              <ShoppingBag size={20} className="text-slate-700" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full"></span>
            </button>
          </div>
        </div>
      </nav>

      {/* --- HOME VIEW --- */}
      {view === 'home' && (
        <main className="pb-20 flex-grow">
          <Carousel t={t} />
          
          <div className="max-w-7xl mx-auto px-4 mt-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">{t('featuredBrands')}</h2>
              {/* Added the gradient separator here */}
              <div className="gradient-separator flex-grow ml-8"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {BRANDS.map(brand => (
                <div 
                  key={brand.id}
                  className="group relative h-80 md:h-[400px] rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300"
                  onClick={() => goToDetail(brand.id)}
                >
                  <img 
                    src={brand.image} 
                    alt={brand.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Default Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>
                  
                  {/* Hover Overlay Background */}
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px]"></div>
                  
                  <div className="absolute inset-0 p-6 flex flex-col justify-end items-center text-center">
                    <h3 className="text-3xl font-bold text-white mb-2 transform translate-y-4 group-hover:-translate-y-2 transition-transform duration-300">
                      {brand.name}
                    </h3>
                    
                    {/* Button that slides up on hover */}
                    <button className="opacity-0 translate-y-8 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 bg-white text-slate-900 px-6 py-2 rounded-full font-medium mt-2">
                      {t('seeDetail')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* --- BRAND DETAIL VIEW --- */}
      {view === 'detail' && currentBrandDetails && (
        <main className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8 min-h-[80vh] flex-grow w-full">
          
          {/* Sidebar Filters */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="sticky top-24 bg-white/60 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center space-x-2 mb-6 text-slate-800">
                <Filter size={20} className="text-pink-500" />
                <h3 className="font-semibold text-lg">{t('filters')}</h3>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">{t('category')}</h4>
                <div className="flex flex-wrap gap-2">
                  {/* Applied the new filter chips styling here */}
                  {['man', 'woman', 'kid'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`filter-chip px-4 py-2 rounded-full border text-sm font-medium capitalize shadow-sm ${
                        selectedCategories.includes(cat)
                          ? 'filter-chip-active shadow-md'
                          : 'bg-white/50 text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {t(cat)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sale Items Toggle */}
              <div className="mt-8 pt-6 border-t border-slate-200">
                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-sm font-medium text-slate-700 group-hover:text-pink-500 transition-colors">{t('saleItemsOnly')}</span>
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      checked={showSaleOnly}
                      onChange={() => setShowSaleOnly(!showSaleOnly)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                  </div>
                </label>
              </div>
            </div>
          </aside>

          {/* Main Content Grid */}
          <div className="flex-1">
            <div className="mb-8">
              <h2 className="text-3xl font-bold capitalize mb-2 text-slate-900">{currentBrandDetails.name} Collection</h2>
              <p className="text-slate-500">{t('showingItems', filteredItems.length)}</p>
            </div>

            {filteredItems.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                <p className="text-slate-500 text-lg">{t('noItemsFound')}</p>
                <button 
                  onClick={() => {
                    setSelectedCategories([]);
                    setShowSaleOnly(false);
                  }}
                  className="mt-4 text-slate-900 underline hover:text-slate-600"
                >
                  {t('clearFilters')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map(item => (
                  <div 
                    key={item.id} 
                    className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col"
                    onClick={() => openItemDetail(item)}
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider text-slate-700 shadow-sm w-fit">
                          {t(item.category)}
                        </div>
                        {item.isSale && (
                          <div className="bg-pink-500 text-white px-2 py-1 rounded text-xs font-bold uppercase tracking-wider shadow-sm w-fit">
                            {t('sale')}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-900 group-hover:text-pink-500 transition-colors line-clamp-1">{item.name}</h4>
                        <p className="text-sm text-slate-500 capitalize mt-1">{item.brand}</p>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-lg font-bold text-slate-900">MMK {item.price.toFixed(2)}</span>
                          {item.isSale && item.originalPrice && (
                            <span className="text-xs text-slate-400 line-through">MMK {item.originalPrice.toFixed(2)}</span>
                          )}
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
                          <ChevronRight size={16} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      )}

      {/* --- FOOTER --- */}
      <footer className="bg-slate-900 text-slate-400 py-12 mt-auto w-full">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-white text-lg font-bold mb-4 tracking-tighter">
              YAMIN BKK<span className="text-pink-500 font-light ml-1">Collection</span>
            </h3>
            <p className="text-sm max-w-sm mb-6 leading-relaxed">
              {t('descriptionText')}
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">{t('quickLinks')}</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={goToHome} className="hover:text-pink-400 transition-colors">{t('home')}</button></li>
              <li><a href="#" className="hover:text-pink-400 transition-colors">{t('shop')}</a></li>
              <li><a href="#" className="hover:text-pink-400 transition-colors">{t('aboutUs')}</a></li>
              <li><a href="#" className="hover:text-pink-400 transition-colors">{t('contact')}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">{t('customerCare')}</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-pink-400 transition-colors">{t('shippingReturns')}</a></li>
              <li><a href="#" className="hover:text-pink-400 transition-colors">{t('faq')}</a></li>
              <li><a href="#" className="hover:text-pink-400 transition-colors">{t('sizeGuide')}</a></li>
              <li><a href="#" className="hover:text-pink-400 transition-colors">{t('trackOrder')}</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-sm">
          <p>&copy; {new Date().getFullYear()} Yamin BKK Collection. {t('allRightsReserved')}</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">{t('privacyPolicy')}</a>
            <a href="#" className="hover:text-white transition-colors">{t('termsOfService')}</a>
          </div>
        </div>
      </footer>

      {/* --- ITEM DETAIL MODAL --- */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={closeItemDetail}
          ></div>
          
          <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={closeItemDetail}
              className="absolute top-4 right-4 z-10 p-2 bg-white/50 hover:bg-white rounded-full text-slate-800 backdrop-blur-md transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="w-full md:w-1/2 h-64 md:h-auto bg-slate-100 relative">
              <img 
                src={selectedItem.image} 
                alt={selectedItem.name} 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col overflow-y-auto">
              <div className="flex items-center space-x-2 text-sm text-slate-500 uppercase tracking-wider mb-3">
                <span>{selectedItem.brand}</span>
                <span>•</span>
                <span>{t(selectedItem.category)}</span>
                {selectedItem.isSale && (
                  <>
                    <span>•</span>
                    <span className="text-pink-500 font-bold">{t('sale')}</span>
                  </>
                )}
              </div>
              
              <h2 className="text-3xl font-bold text-slate-900 mb-4">{selectedItem.name}</h2>
              <div className="flex items-end space-x-3 mb-6">
                <p className="text-2xl font-semibold text-slate-900">${selectedItem.price.toFixed(2)}</p>
                {selectedItem.isSale && selectedItem.originalPrice && (
                  <p className="text-lg text-slate-400 line-through mb-0.5">${selectedItem.originalPrice.toFixed(2)}</p>
                )}
              </div>
              
              <div className="prose prose-sm text-slate-600 mb-8">
                <p>{selectedItem.description}</p>
              </div>
              
              {/* Color Picker */}
              {selectedItem.colors && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-slate-900 mb-3">
                    {t('color')} <span className="text-slate-500 font-normal ml-1">{selectedColor?.name}</span>
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {selectedItem.colors.map(color => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 rounded-full border-2 focus:outline-none transition-all ${
                          selectedColor?.name === color.name ? 'border-pink-500 scale-110 shadow-md' : 'border-slate-200 hover:border-slate-400'
                        } ${color.class}`}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Size Picker */}
              {selectedItem.sizes && (
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-medium text-slate-900">{t('size')}</h4>
                    <button className="text-xs text-slate-500 underline hover:text-slate-900">{t('sizeGuide')}</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[3rem] px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                          selectedSize === size
                            ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-auto space-y-4 pt-6 border-t border-slate-200">
                <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center space-x-2">
                  <ShoppingBag size={20} />
                  <span>{t('addToCart')}</span>
                </button>
                <button 
                  onClick={closeItemDetail}
                  className="w-full bg-slate-100 text-slate-800 py-4 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
                >
                  {t('continueShopping')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}