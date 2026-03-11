import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      // Currency & Stock
      currency: 'THB',
      inStock: 'In Stock',
      outOfStock: 'Out of Stock',
      preOrder: 'Pre-Order',

      // Product Card
      addToCart: 'Add to Cart',
      quickOrder: 'Quick Order',
      orderVia: 'Order via {{app}}',
      viewDetails: 'View Details',
      variantsAvailable: '{{count}} Variant',
      variantsAvailable_other: '{{count}} Variants',

      // Product Detail
      backToShop: 'Back to Shop',
      details: 'Details',
      availableVariants: 'Available Variants',
      orderNowViaSocial: 'Order Now via Social',
      shippingFromBKK: 'Shipping from BKK',
      orderMessage: 'Hello! I would like to {{type}}: {{item}}',
      productVideo: 'Product Video',

      // Category Filters
      categories: 'Categories',
      'category.all': 'All',
      'category.clothes': 'Clothes',
      'category.watches': 'Watches',
      'category.shoes': 'Shoes',
      'category.bags': 'Bags',
      'category.accessories': 'Accessories',

      // Gender Filters
      gender: 'For',
      'gender.all': 'All',
      'gender.man': 'Man',
      'gender.woman': 'Woman',
      'gender.child': 'Child',

      // Shop View
      noProductsFound: 'No items found in this category',
      loadingProducts: 'Loading products...',
      loadingProduct: 'Loading product...',
      productNotFound: 'Product not found',
      itemCount: '{{count}} item',
      itemCount_other: '{{count}} items',

      // Navigation & Header
      shop: 'Shop',
      admin: 'Admin',
      collections: 'Collections',

      // Auth
      login: 'Login',
      logout: 'Logout',
      adminLogin: 'Admin Login',
      welcomeBack: 'Welcome back',
      email: 'Email',
      password: 'Password',
      signingIn: 'Signing in…',
      logIn: 'Log In',
      invalidCredentials: 'Invalid email or password',

      // Footer
      footerDescription:
        'Curated fashion and accessories from the heart of Bangkok. Premium quality delivered to your doorstep.',
      connect: 'Connect',
      newsletter: 'Newsletter',
      emailAddress: 'Email address',
      copyright: '© 2026 Yamin Bangkok Collections. All Rights Reserved.',
    },
  },
  mm: {
    translation: {
      // Currency & Stock
      currency: 'ဘတ်',
      inStock: 'Instock ရှိသည်',
      outOfStock: 'ပစ္စည်းကုန်နေသည်',
      preOrder: 'Pre-Order မှာယူရန်',

      // Product Card
      addToCart: 'စျေးခြင်းထဲထည့်မည်',
      quickOrder: 'အမြန်မှာယူရန်',
      orderVia: '{{app}} ဖြင့်မှာယူရန်',
      viewDetails: 'အသေးစိတ်ကြည့်ရန်',
      variantsAvailable: '{{count}} မျိုးစုံ ရွေးချယ်နိုင်',
      variantsAvailable_other: '{{count}} မျိုးစုံ ရွေးချယ်နိုင်',

      // Product Detail
      backToShop: 'ဆိုင်သို့ပြန်သွားရန်',
      details: 'အသေးစိတ်အချက်အလက်များ',
      availableVariants: 'အမျိုးမျိုး ရွေးချယ်မှုများ',
      orderNowViaSocial: 'ယခုပင်မှာယူလိုက်ပါ',
      shippingFromBKK: 'ဘန်ကောက်မှ ပို့ဆောင်ပေးပါသည်',
      orderMessage: 'မင်္ဂလာပါ! {{type}} လိုပါတယ်: {{item}}',
      productVideo: 'ပစ္စည်းဗီဒီယို',

      // Category Filters
      categories: 'အမျိုးအစားများ',
      'category.all': 'အားလုံး',
      'category.clothes': 'အဝတ်အစား',
      'category.watches': 'နာရီ',
      'category.shoes': 'ဖိနပ်',
      'category.bags': 'အိတ်များ',
      'category.accessories': 'အဆင့်အလှဆင်',

      // Gender Filters
      gender: 'အတွက်',
      'gender.all': 'အားလုံး',
      'gender.man': 'အမျိုးသား',
      'gender.woman': 'အမျိုးသမီး',
      'gender.child': 'ကလေး',

      // Shop View
      noProductsFound: 'ဤအမျိုးအစားတွင် ပစ္စည်းများမတွေ့ပါ',
      loadingProducts: 'ပစ္စည်းများ ဖတ်နေသည်...',
      loadingProduct: 'ပစ္စည်း ဖတ်နေသည်...',
      productNotFound: 'ပစ္စည်းရှာမတွေ့ပါ',
      itemCount: '{{count}} ခု',
      itemCount_other: '{{count}} ခု',

      // Navigation & Header
      shop: 'ဆိုင်',
      admin: 'Admin',
      collections: 'စုစည်းမှုများ',

      // Auth
      login: 'ဝင်ရောက်ရန်',
      logout: 'ထွက်ရန်',
      adminLogin: 'Admin ဝင်ရောက်ရန်',
      welcomeBack: 'ပြန်လာတာ ကြိုဆိုပါတယ်',
      email: 'အီးမေးလ်',
      password: 'စကားဝှက်',
      signingIn: 'ဝင်နေသည်…',
      logIn: 'ဝင်ရောက်ရန်',
      invalidCredentials: 'အီးမေးလ် သို့မဟုတ် စကားဝှက် မှားနေပါသည်',

      // Footer
      footerDescription:
        'ဘန်ကောက်မြို့လယ်မှ ဖက်ရှင်နှင့် အသုံးအဆောင်များ။ အရည်အသွေးမြင့် ပစ္စည်းများကို မှာယူနိုင်ပါသည်။',
      connect: 'ချိတ်ဆက်ရန်',
      newsletter: 'သတင်းလွှာ',
      emailAddress: 'အီးမေးလ်လိပ်စာ',
      copyright: '© 2026 Yamin Bangkok Collections. All Rights Reserved.',
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
