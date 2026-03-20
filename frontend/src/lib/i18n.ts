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
      color: 'Color',
      size: 'Size',
      sizeGuide: 'Size Guide',
      continueShopping: 'Continue Shopping',

      // Category Filters
      categories: 'Categories',
      'category.all': 'All',
      'category.clothes': 'Clothes',
      'category.watches': 'Watches',
      'category.shoes': 'Shoes',
      'category.bags': 'Bags',
      'category.accessories': 'Accessories',
      category: 'Category',

      // Gender Filters
      gender: 'For',
      'gender.all': 'All',
      'gender.man': 'Man',
      'gender.woman': 'Woman',
      'gender.child': 'Child',
      man: 'Men',
      woman: 'Women',
      kid: 'Kids',

      // Shop View
      noProductsFound: 'No items found for selected filters.',
      loadingProducts: 'Loading products...',
      loadingProduct: 'Loading product...',
      productNotFound: 'Product not found',
      itemCount: '{{count}} item',
      itemCount_other: '{{count}} items',
      showingItems: 'Showing {{count}} items',
      clearFilters: 'Clear all filters',
      sale: 'Sale',
      saleItemsOnly: 'Sale Items Only',
      filters: 'Filters',

      // Home View
      featuredBrands: 'Featured Brands',
      seeDetail: 'See Detail',
      endOfSeason: 'Order Bangkok’s Highlights, Delivered to Myanmar',
      seeSalesItem: 'See Sales Item',
      newArrivals: 'New Arrivals',
      home: 'Home',

      // Navigation & Header
      shop: 'Shop',
      admin: 'Admin',
      collections: 'Collections',
      back: 'Back',

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
      copyright: '© 2026 TWIN Bangkok Collections. All Rights Reserved.',
      allRightsReserved: 'All rights reserved.',
      quickLinks: 'Quick Links',
      customerCare: 'Customer Care',
      aboutUs: 'About Us',
      contact: 'Contact',
      trackOrder: 'Track Order',
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Terms of Service',
      shippingReturns: 'Shipping & Returns',
      faq: 'FAQ',
      descriptionText: 'Curated fashion from top brands in Bangkok. Quality, style, and comfort delivered to your doorstep.'
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
      color: 'အရောင်',
      size: 'အရွယ်အစား',
      sizeGuide: 'အရွယ်အစား လမ်းညွှန်',
      continueShopping: 'ဆက်လက် စျေးဝယ်မည်',

      // Category Filters
      categories: 'အမျိုးအစားများ',
      'category.all': 'အားလုံး',
      'category.clothes': 'အဝတ်အစား',
      'category.watches': 'နာရီ',
      'category.shoes': 'ဖိနပ်',
      'category.bags': 'အိတ်များ',
      'category.accessories': 'အဆင့်အလှဆင်',
      category: 'အမျိုးအစား',

      // Gender Filters
      gender: 'အတွက်',
      'gender.all': 'အားလုံး',
      'gender.man': 'အမျိုးသား',
      'gender.woman': 'အမျိုးသမီး',
      'gender.child': 'ကလေး',
      man: 'အမျိုးသား',
      woman: 'အမျိုးသမီး',
      kid: 'ကလေး',

      // Shop View
      noProductsFound: 'ရွေးချယ်ထားသော အချက်အလက်များနှင့် ကိုက်ညီသော ပစ္စည်းမရှိပါ။',
      loadingProducts: 'ပစ္စည်းများ ဖတ်နေသည်...',
      loadingProduct: 'ပစ္စည်း ဖတ်နေသည်...',
      productNotFound: 'ပစ္စည်းရှာမတွေ့ပါ',
      itemCount: '{{count}} ခု',
      itemCount_other: '{{count}} ခု',
      showingItems: 'ပစ္စည်း {{count}} ခု ပြသနေသည်',
      clearFilters: 'စစ်ထုတ်မှုများကို ရှင်းလင်းရန်',
      sale: 'လျှော့စျေး',
      saleItemsOnly: 'လျှော့စျေးပစ္စည်းများသာ',
      filters: 'စစ်ထုတ်ရန်',

      // Home View
      featuredBrands: 'လူကြိုက်များသော အမှတ်တံဆိပ်များ',
      seeDetail: 'အသေးစိတ်ကြည့်ရန်',
      endOfSeason: 'ဘန်ကောက်မှ ကြိုက်နှစ်သက်ရာများကို မြန်မာပြည်သို့ မှာယူလိုက်ပါ',
      seeSalesItem: 'ပရိုမိုးရှင်းပစ္စည်းများ ကြည့်ရန်',
      newArrivals: 'အသစ်ရောက်ရှိလာသောပစ္စည်းများ',
      home: 'ပင်မစာမျက်နှာ',

      // Navigation & Header
      shop: 'ဆိုင်',
      admin: 'Admin',
      collections: 'စုစည်းမှုများ',
      back: 'နောက်သို့',

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
      copyright: '© 2026 TWIN Bangkok Collections. All Rights Reserved.',
      allRightsReserved: 'မူပိုင်ခွင့်များအားလုံး ရယူထားသည်။',
      quickLinks: 'အမြန်လင့်ခ်များ',
      customerCare: 'ဝယ်ယူသူ ဝန်ဆောင်မှု',
      aboutUs: 'ကျွန်ုပ်တို့အကြောင်း',
      contact: 'ဆက်သွယ်ရန်',
      trackOrder: 'အော်ဒါ ခြေရာခံရန်',
      privacyPolicy: 'ကိုယ်ရေးကိုယ်တာ မူဝါဒ',
      termsOfService: 'ဝန်ဆောင်မှု စည်းမျဉ်းများ',
      shippingReturns: 'ပို့ဆောင်ခြင်း နှင့် ပြန်လည်ပေးပို့ခြင်း',
      faq: 'အမေးများသော မေးခွန်းများ',
      descriptionText: 'ထိပ်တန်းအမှတ်တံဆိပ်များမှ ဖက်ရှင်များကို ရွေးချယ်တင်ဆက်ထားပါသည်။ အရည်အသွေး၊ စတိုင်လ်နှင့် သက်တောင့်သက်သာရှိမှုကို သင့်အိမ်တိုင်ရာရောက် ပို့ဆောင်ပေးပါသည်။'
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
