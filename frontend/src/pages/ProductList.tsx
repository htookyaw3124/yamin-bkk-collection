import { useEffect, useMemo, useState, useCallback } from "react";
import { useGetProductsQuery, useGetCategoriesQuery, useGetBrandsQuery, useLoginMutation } from "../lib/api";
import { useTranslation } from "react-i18next";
import i18n from "../lib/i18n";
import {
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { ShoppingBag, X, ArrowLeft } from "lucide-react";

import { TOKEN_KEY } from "../constants.ts";
import type {
  Lang,
  Product,
  CategoryFilter,
  ForFilter,
} from "../types";
import { matchesCategoryFilter } from "../utils/helpers";


import { ShopView } from "../components/shop/ShopView";
import { ProductDetail } from "../components/shop/ProductDetail";
import { AdminGate } from "../components/admin/AdminGate";
import { AdminLayout } from "../components/admin/AdminLayout";
import { HomeView } from "../components/shop/HomeView";

const ProductDetailRoute = ({
  products,
  lang,
  isLoading,
}: {
  products: Product[];
  lang: Lang;
  isLoading: boolean;
}) => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const product = products.find((p) => p.id === id);

  if (isLoading) {
    return (
      <div className="py-32 text-center">
        <div className="inline-block w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-400 tracking-widest uppercase text-[10px] font-bold">
          {t("loadingProduct")}
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-32 text-center">
        <p className="text-slate-400 tracking-widest uppercase text-xs">
          {t("productNotFound")}
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-8 text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-900 pb-1"
        >
          {t("backToShop")}
        </button>
      </div>
    );
  }

  return (
    <ProductDetail
      productId={id!}
      lang={lang}
      onClose={() => navigate(-1)}
      isPage={true}
    />
  );
};

export const ProductList = () => {
  const { t } = useTranslation();
  const [lang, setLang] = useState<Lang>(() =>
    i18n.language === "mm" ? "mm" : "en",
  );

  const {
    data: categoryOptions = [],
    isLoading: isFetchingCategories,
    error: categoryFetchErrorData
  } = useGetCategoriesQuery();
  const categoryFetchError = categoryFetchErrorData ? "Unable to load categories" : null;

  const {
    data: brands = [],
    isLoading: isFetchingBrands,
    error: brandsFetchErrorData
  } = useGetBrandsQuery();
  const brandsFetchError = brandsFetchErrorData ? "Unable to load brands" : null;

  const [category, setCategory] = useState<CategoryFilter>("All");
  const [forFilter, setForFilter] = useState<ForFilter>("All");
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [login] = useLoginMutation();
  const [showSaleOnly, setShowSaleOnly] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminView = location.pathname.startsWith("/admin");
  const [searchParams, setSearchParams] = useSearchParams();
  const activeBrandFilter = searchParams.get("brand");

  const {
    data: products = [],
    isLoading: isLoadingProducts,
    error: productErrorData
  } = useGetProductsQuery(isAdminView ? undefined : (activeBrandFilter || undefined));
  const productError = productErrorData ? "Unable to load products." : null;

  const persistToken = useCallback(
    (token: string, expiresInSeconds: number) => {
      const expiresAt = Date.now() + expiresInSeconds * 1000;
      localStorage.setItem(TOKEN_KEY, JSON.stringify({ token, expiresAt }));
      setAuthToken(token);
    },
    [],
  );

  const openLoginModal = useCallback(() => {
    setShowLoginModal(true);
    setLoginError(null);
  }, []);

  const closeLoginModal = useCallback(() => {
    setShowLoginModal(false);
    setLoginError(null);
  }, []);


  useEffect(() => {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.expiresAt && parsed?.token && parsed.expiresAt > Date.now()) {
        setAuthToken(parsed.token as string);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, []);

  useEffect(() => {
    if (isAdminView && !authToken) {
      openLoginModal();
    }
  }, [isAdminView, authToken, openLoginModal]);

  useEffect(() => {
    document.documentElement.lang = lang;
    i18n.changeLanguage(lang);
  }, [lang]);



  // Removed old manual fetching functions

  const handleLoginSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const data = await login(loginForm).unwrap();
      persistToken(data.accessToken, data.expiresIn ?? 1800);
      setLoginForm({ email: "", password: "" });
      closeLoginModal();
      if (!isAdminView) {
        navigate("/admin/dashboard");
      }
    } catch {
      setLoginError(t("invalidCredentials"));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAdminNavigation = () => {
    if (isAdminView) {
      navigate("/");
      return;
    }
    if (!authToken) {
      openLoginModal();
      return;
    }
    navigate("/admin/dashboard");
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const catMatch = matchesCategoryFilter(product.category, category);
      const audienceValue = (product.audience ?? "all").toLowerCase();
      const forMatch =
        forFilter === "All" ||
        audienceValue === forFilter.toLowerCase() ||
        audienceValue === "all";

      const brandMatch =
        !activeBrandFilter ||
        product.brandId === activeBrandFilter ||
        product.brand?.id === activeBrandFilter;

      const saleMatch = !showSaleOnly || product.isSale || (product.price < (product.originalPrice ?? 0));

      return catMatch && forMatch && brandMatch && saleMatch;
    });
  }, [category, forFilter, products, activeBrandFilter, showSaleOnly]);



  const handleViewDetails = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const handleBrandSelect = (brandId: string) => {
    setSearchParams({ brand: brandId });
    setCategory("All");
    setForFilter("All");
    if (location.pathname !== "/shop") {
      navigate(`/shop?brand=${brandId}`);
    }
    window.scrollTo(0, 0);
  };

  const activeBrandName = useMemo(() => {
    if (!activeBrandFilter) return null;
    const brand = brands.find(b => b.id === activeBrandFilter);
    return brand ? brand.name : null;
  }, [activeBrandFilter, brands]);

  return (
    <div className="min-h-screen bg-white selection:bg-pink-100 selection:text-pink-900">
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {location.pathname !== "/" && (
              <button
                onClick={() => navigate("/")}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors flex items-center text-slate-600"
              >
                <ArrowLeft size={20} />
                <span className="ml-2 hidden sm:inline text-sm font-medium">
                  {t("back")}
                </span>
              </button>
            )}
            <h1
              onClick={() => {
                setSearchParams({});
                navigate("/");
              }}
              className="text-xl font-bold tracking-tighter cursor-pointer text-slate-900 flex items-center"
            >
              TWIN BKK
              <span className="text-slate-400 font-light ml-1 hidden sm:inline">
                Collection
              </span>
            </h1>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 rounded-full p-1 border border-slate-200">
              <button
                onClick={() => setLang("mm")}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all duration-200 ${
                  lang === "mm"
                    ? "bg-white shadow-sm text-pink-500"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                MM
              </button>
              <button
                onClick={() => setLang("en")}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all duration-200 ${
                  lang === "en"
                    ? "bg-white shadow-sm text-pink-500"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                EN
              </button>
            </div>

            <button
              onClick={handleAdminNavigation}
              className="p-2 hover:bg-slate-100 rounded-full relative"
              title={isAdminView ? "Back to Shop" : "Admin Panel"}
            >
              {isAdminView ? (
                <ShoppingBag size={20} className="text-pink-500" />
              ) : (
                <ShoppingBag size={20} className="text-slate-700" />
              )}
              {!isAdminView && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full"></span>
              )}
            </button>
          </div>
        </div>
      </nav>

      <div className="h-0"></div>

      <Routes>
        <Route
          path="/"
          element={
            <HomeView
              onBrandSelect={handleBrandSelect}
            />
          }
        />
        <Route
          path="/shop"
          element={
            <ShopView
              lang={lang}
              forFilter={forFilter}
              showSaleOnly={showSaleOnly}
              filteredProducts={filteredProducts}
              onCategoryChange={setCategory}
              onForChange={setForFilter}
              onToggleSale={() => setShowSaleOnly(!showSaleOnly)}
              onViewDetails={handleViewDetails}
              activeBrandName={activeBrandName}
              isLoading={isLoadingProducts}
              error={productError}
            />
          }
        />
        <Route
          path="/admin/*"
          element={
            <AdminGate authToken={authToken} onRequestLogin={openLoginModal}>
              <AdminLayout
                lang={lang}
                products={products}
                categories={categoryOptions}
                brands={brands}
                categoriesLoading={isFetchingCategories}
                categoriesError={categoryFetchError}
                brandsLoading={isFetchingBrands}
                brandsError={brandsFetchError}
              />
            </AdminGate>
          }
        />
        <Route
          path="/product/:id"
          element={
            <ProductDetailRoute
              products={products}
              lang={lang}
              isLoading={isLoadingProducts}
            />
          }
        />
        <Route
          path="*"
          element={
            <HomeView
              onBrandSelect={handleBrandSelect}
            />
          }
        />
      </Routes>

      <footer className="bg-slate-50 py-24 px-6 border-t border-slate-100">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 border-t border-slate-200 pt-16">
          <div className="space-y-6">
            <h4 className="text-xs font-bold tracking-[0.4em] uppercase">
              TWIN BKK
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
              {t("footerDescription")}
            </p>
          </div>
          <div className="space-y-6">
            <h4 className="text-xs font-bold tracking-[0.4em] uppercase">
              {t("connect")}
            </h4>
            <ul className="text-xs text-slate-500 space-y-3 uppercase tracking-widest">
              <li className="hover:text-pink-600 cursor-pointer transition-colors">
                Facebook
              </li>
              <li className="hover:text-pink-600 cursor-pointer transition-colors">
                TikTok Shop
              </li>
              <li className="hover:text-pink-600 cursor-pointer transition-colors">
                Telegram Channel
              </li>
            </ul>
          </div>
          {/* <div className="space-y-6">
            <h4 className="text-xs font-bold tracking-[0.4em] uppercase">
              {t('newsletter')}
            </h4>
            <div className="flex border-b border-slate-300 pb-2">
              <input
                type="email"
                placeholder={t('emailAddress')}
                className="bg-transparent border-none outline-none text-xs w-full"
              />
              <ChevronRight size={14} className="text-slate-400" />
            </div>
          </div> */}
        </div>
        <div className="max-w-screen-2xl mx-auto mt-24 text-center">
          <p className="text-[10px] text-slate-300 tracking-[0.3em] uppercase">
            {t("copyright")}
          </p>
        </div>
      </footer>

      {showLoginModal && (
        <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-8 shadow-2xl relative">
            <button
              onClick={closeLoginModal}
              className="absolute top-4 right-4 text-slate-300 hover:text-slate-600"
            >
              <X size={16} />
            </button>
            <p className="text-[10px] tracking-[0.4em] uppercase text-slate-400 font-bold">
              {t("adminLogin")}
            </p>
            <h2 className="text-2xl font-light tracking-wider text-slate-900 mt-2">
              {t("welcomeBack")}
            </h2>
            <form onSubmit={handleLoginSubmit} className="mt-6 space-y-5">
              <div>
                <label className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
                  {t("email")}
                </label>
                <input
                  type="email"
                  required
                  className="mt-1 w-full border-b border-slate-200 py-2 text-sm outline-none focus:border-slate-900"
                  value={loginForm.email}
                  onChange={(event) =>
                    setLoginForm((prev) => ({
                      ...prev,
                      email: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
                  {t("password")}
                </label>
                <input
                  type="password"
                  required
                  className="mt-1 w-full border-b border-slate-200 py-2 text-sm outline-none focus:border-slate-900"
                  value={loginForm.password}
                  onChange={(event) =>
                    setLoginForm((prev) => ({
                      ...prev,
                      password: event.target.value,
                    }))
                  }
                />
              </div>
              {loginError && (
                <p className="text-xs text-red-500">{loginError}</p>
              )}
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-slate-900 text-white py-3 rounded-full text-xs font-bold uppercase tracking-[0.3em] hover:bg-pink-600 transition-colors"
              >
                {isLoggingIn ? t("signingIn") : t("logIn")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
