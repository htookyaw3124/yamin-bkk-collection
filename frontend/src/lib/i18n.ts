import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      currency: 'THB',
      addToCart: 'Add to Cart',
      outOfStock: 'Out of Stock',
      inStock: 'In Stock',
      preOrder: 'Pre-Order',
      quickOrder: 'Quick Order',
      orderVia: 'Order via {{app}}',
      categories: 'Categories',
      gender: 'For',
      noProductsFound: 'No products match your filters.',
      'category.all': 'All',
      'category.clothes': 'Clothes',
      'category.watches': 'Watches',
      'category.shoes': 'Shoes',
      'category.bags': 'Bags',
      'category.accessories': 'Accessories',
      'gender.all': 'All',
      'gender.man': 'Man',
      'gender.woman': 'Woman',
      'gender.child': 'Child',
    },
  },
  mm: {
    translation: {
      currency: 'ဘတ်',
      addToCart: 'စျေးခြင်းထဲထည့်မည်',
      outOfStock: 'ပစ္စည်းကုန်နေသည်',
      inStock: 'ရှိ',
      preOrder: 'Pre-Order မှာယူရန်',
      quickOrder: 'အမြန်မှာယူရန်',
      orderVia: '{{app}} ဖြင့်မှာယူရန်',
      categories: 'အမျိုးအစားများ',
      gender: 'အတွက်',
      noProductsFound:
        'သင်၏စစ်ထုတ်မှုများနှင့်ကိုက်ညီသော ထုတ်ကုန်များမရှိပါ။',
      'category.all': 'အားလုံး',
      'category.clothes': 'အဝတ်အစား',
      'category.watches': 'နာရီ',
      'category.shoes': 'ဖိနပ်',
      'category.bags': 'အိတ်များ',
      'category.accessories': 'အဆင့်အလှဆင်',
      'gender.all': 'အားလုံး',
      'gender.man': 'အမျိုးသား',
      'gender.woman': 'အမျိုးသမီး',
      'gender.child': 'ကလေး',
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
