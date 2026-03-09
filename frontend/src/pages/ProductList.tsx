import { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import {
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { ChevronRight, Menu, Plus, Search, ShoppingBag, X } from "lucide-react";

import { API_URL, TOKEN_KEY } from "../constants.ts";
import type {
  Lang,
  Product,
  Category,
  CategoryFilter,
  ForFilter,
} from "../types";
import { CATEGORIES, FOR_FILTERS } from "../types";
import { matchesCategoryFilter } from "../utils/helpers";

import { LanguageToggle } from "../components/common/LanguageToggle";
import { ShopView } from "../components/shop/ShopView";
import { ProductDetail } from "../components/shop/ProductDetail";
import { AdminGate } from "../components/admin/AdminGate";
import { AdminLayout } from "../components/admin/AdminLayout";

const ProductDetailRoute = ({
  products,
  lang,
  isLoading,
}: {
  products: Product[];
  lang: Lang;
  isLoading: boolean;
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const product = products.find((p) => p.id === id);

  if (isLoading) {
    return (
      <div className="py-32 text-center">
        <div className="inline-block w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-400 tracking-widest uppercase text-[10px] font-bold">
          Loading product...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-32 text-center">
        <p className="text-slate-400 tracking-widest uppercase text-xs">
          Product not found
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-8 text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-900 pb-1"
        >
          Back to Shop
        </button>
      </div>
    );
  }

  return (
    <ProductDetail
      product={product}
      lang={lang}
      onClose={() => navigate("/")}
    />
  );
};

export const ProductList = () => {
  const { t } = useTranslation();
  const [lang, setLang] = useState<Lang>("en");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productError, setProductError] = useState<string | null>(null);
  const [category, setCategory] = useState<CategoryFilter>("All");
  const [forFilter, setForFilter] = useState<ForFilter>("All");
  const [scrolled, setScrolled] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<Category[]>([]);
  const [isFetchingCategories, setIsFetchingCategories] = useState(true);
  const [categoryFetchError, setCategoryFetchError] = useState<string | null>(
    null,
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminView = location.pathname.startsWith("/admin");

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

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setAuthToken(null);
    if (isAdminView) {
      navigate("/");
    }
  };

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
  }, [lang]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchCategories = useCallback(async () => {
    setIsFetchingCategories(true);
    try {
      const { data } = await axios.get<Category[]>(`${API_URL}/categories`);
      setCategoryOptions(data);
      setCategoryFetchError(null);
    } catch (error) {
      console.error("Failed to load categories", error);
      setCategoryFetchError("Unable to load categories");
    } finally {
      setIsFetchingCategories(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setIsLoadingProducts(true);
    try {
      const { data } = await axios.get<Product[]>(`${API_URL}/products`);
      setProducts(data);
      setProductError(null);
    } catch (error) {
      console.error("Failed to load products", error);
      setProductError("Unable to load products.");
      setProducts([]);
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [fetchCategories, fetchProducts]);

  const handleLoginSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const { data } = await axios.post(`${API_URL}/auth/login`, loginForm);
      persistToken(data.accessToken, data.expiresIn ?? 1800);
      setLoginForm({ email: "", password: "" });
      closeLoginModal();
      if (!isAdminView) {
        navigate("/admin/dashboard");
      }
    } catch {
      setLoginError("Invalid email or password");
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
      return catMatch && forMatch;
    });
  }, [category, forFilter, products]);

  const handleAddProduct = (newProduct: Product) => {
    setProducts((current) => [newProduct, ...current]);
    if (!isAdminView) {
      navigate("/");
    }
  };

  const handleViewDetails = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="min-h-screen bg-white selection:bg-pink-100 selection:text-pink-900">
      <nav
        className={`fixed top-0 inset-x-0 z-[100] transition-all duration-500 ${
          scrolled || isAdminView
            ? "bg-white/90 backdrop-blur-md py-4 shadow-sm"
            : "bg-transparent py-8"
        }`}
      >
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 grid grid-cols-3 items-center">
          <div className="flex items-center gap-6 justify-self-start">
            <button
              className="lg:hidden text-slate-900"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
            <Search
              size={18}
              className="hidden lg:block text-slate-900 cursor-pointer hover:text-pink-600 transition-colors"
            />
            <button
              onClick={handleAdminNavigation}
              className="hidden lg:flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-slate-400 hover:text-slate-900 transition-colors border-l pl-6 border-slate-100"
            >
              {isAdminView ? (
                <>
                  <ShoppingBag size={14} /> Shop
                </>
              ) : (
                <>
                  <Plus size={14} /> Admin
                </>
              )}
            </button>
          </div>

          <div className="flex flex-col items-center justify-self-center">
            <h1 className="text-xl lg:text-3xl tracking-[0.5em] font-bold text-slate-900 uppercase whitespace-nowrap">
              Yamin BKK
            </h1>
            <p className="text-[8px] tracking-[0.4em] uppercase text-slate-400 font-medium mt-1 whitespace-nowrap">
              Collections
            </p>
          </div>

          <div className="flex items-center gap-4 lg:gap-8 justify-self-end">
            <LanguageToggle
              current={lang}
              onToggle={() =>
                setLang((current) => (current === "en" ? "mm" : "en"))
              }
            />
            {authToken ? (
              <button
                onClick={handleLogout}
                className="hidden lg:inline-flex text-[10px] uppercase tracking-[0.3em] text-slate-400 hover:text-slate-900"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={openLoginModal}
                className="hidden lg:inline-flex text-[10px] uppercase tracking-[0.3em] text-slate-400 hover:text-slate-900"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="h-32 lg:h-48"></div>

      <Routes>
        <Route
          path="/"
          element={
            <ShopView
              lang={lang}
              category={category}
              forFilter={forFilter}
              filteredProducts={filteredProducts}
              onCategoryChange={setCategory}
              onForChange={setForFilter}
              onViewDetails={handleViewDetails}
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
                authToken={authToken}
                onSaveProduct={handleAddProduct}
                onRefreshProducts={fetchProducts}
                onRefreshCategories={fetchCategories}
                categoriesLoading={isFetchingCategories}
                categoriesError={categoryFetchError}
                apiUrl={API_URL}
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
            <ShopView
              lang={lang}
              category={category}
              forFilter={forFilter}
              filteredProducts={filteredProducts}
              onCategoryChange={setCategory}
              onForChange={setForFilter}
              onViewDetails={handleViewDetails}
              isLoading={isLoadingProducts}
              error={productError}
            />
          }
        />
      </Routes>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[200] lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute top-0 left-0 bottom-0 w-4/5 max-w-sm bg-white shadow-2xl flex flex-col pt-8 pb-12 px-6 animate-in slide-in-from-left duration-300">
            <div className="flex justify-between items-center mb-12">
              <div className="flex flex-col">
                <h2 className="text-xl tracking-[0.5em] font-bold text-slate-900 uppercase">
                  Yamin BKK
                </h2>
                <p className="text-[8px] tracking-[0.4em] uppercase text-slate-400 font-medium mt-1">
                  Collections
                </p>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 -mr-2 text-slate-400 hover:text-slate-900 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 space-y-8 overflow-y-auto">
              <div className="space-y-4">
                <p className="text-[10px] tracking-[0.3em] font-bold text-pink-500 uppercase">
                  {t("categories")}
                </p>
                <ul className="space-y-4">
                  <li
                    className="text-sm font-medium tracking-wide uppercase text-slate-600 hover:text-pink-600 cursor-pointer transition-colors"
                    onClick={() => {
                      setCategory("All");
                      setIsMobileMenuOpen(false);
                      navigate("/");
                    }}
                  >
                    {t("category.all")}
                  </li>
                  {CATEGORIES.filter((c) => c !== "All").map((c) => (
                    <li
                      key={c}
                      className="text-sm font-medium tracking-wide uppercase text-slate-600 hover:text-pink-600 cursor-pointer transition-colors"
                      onClick={() => {
                        setCategory(c);
                        setIsMobileMenuOpen(false);
                        navigate("/");
                      }}
                    >
                      {t(`category.${c.toLowerCase()}`)}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8 border-t border-slate-100 space-y-4">
                <p className="text-[10px] tracking-[0.3em] font-bold text-pink-500 uppercase">
                  {t("gender")}
                </p>
                <ul className="space-y-4">
                  {FOR_FILTERS.map((f) => (
                    <li
                      key={f.value}
                      className="text-sm font-medium tracking-wide uppercase text-slate-600 hover:text-pink-600 cursor-pointer transition-colors"
                      onClick={() => {
                        setForFilter(f.value);
                        setIsMobileMenuOpen(false);
                        navigate("/");
                      }}
                    >
                      {t(`gender.${f.value.toLowerCase()}`)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-8 mt-auto space-y-4">
              {authToken ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-3 bg-slate-100 text-slate-900 rounded-full text-xs font-bold tracking-widest uppercase hover:bg-slate-200"
                >
                  Logout
                </button>
              ) : (
                <button
                  onClick={() => {
                    openLoginModal();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-3 bg-slate-900 text-white rounded-full text-xs font-bold tracking-widest uppercase hover:bg-slate-800"
                >
                  Admin Login
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <footer className="bg-slate-50 py-24 px-6 border-t border-slate-100">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 border-t border-slate-200 pt-16">
          <div className="space-y-6">
            <h4 className="text-xs font-bold tracking-[0.4em] uppercase">
              Yamin BKK
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
              Curated fashion and accessories from the heart of Bangkok. Premium
              quality delivered to your doorstep.
            </p>
          </div>
          <div className="space-y-6">
            <h4 className="text-xs font-bold tracking-[0.4em] uppercase">
              Connect
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
          <div className="space-y-6">
            <h4 className="text-xs font-bold tracking-[0.4em] uppercase">
              Newsletter
            </h4>
            <div className="flex border-b border-slate-300 pb-2">
              <input
                type="email"
                placeholder="Email address"
                className="bg-transparent border-none outline-none text-xs w-full"
              />
              <ChevronRight size={14} className="text-slate-400" />
            </div>
          </div>
        </div>
        <div className="max-w-screen-2xl mx-auto mt-24 text-center">
          <p className="text-[10px] text-slate-300 tracking-[0.3em] uppercase">
            © 2026 Yamin Bangkok Collections. All Rights Reserved.
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
              Admin Login
            </p>
            <h2 className="text-2xl font-light tracking-wider text-slate-900 mt-2">
              Welcome back
            </h2>
            <form onSubmit={handleLoginSubmit} className="mt-6 space-y-5">
              <div>
                <label className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
                  Email
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
                  Password
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
                {isLoggingIn ? "Signing in…" : "Log In"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
