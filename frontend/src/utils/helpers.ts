import axios from "axios";
import type { ProductCategoryValue, Product, CategoryFilter } from "../types";

export const normalizeCategoryKey = (value: string) => value.trim().toLowerCase();

export const matchesCategoryFilter = (
  categoryValue: ProductCategoryValue | null | undefined,
  filter: CategoryFilter,
) => {
  if (filter === "All") return true;
  if (!categoryValue) return false;

  const normalizedFilter = normalizeCategoryKey(filter);

  if (typeof categoryValue === "string") {
    const slug = normalizeCategoryKey(categoryValue);
    return (
      slug === normalizedFilter ||
      slug.startsWith(`${normalizedFilter}-`) ||
      slug.includes(normalizedFilter)
    );
  }

  const slug = (categoryValue.slug ?? "").trim().toLowerCase();
  const name = (categoryValue.name_en || categoryValue.name_mm || "")
    .trim()
    .toLowerCase();

  return (
    slug === normalizedFilter ||
    slug.startsWith(`${normalizedFilter}-`) ||
    slug.includes(normalizedFilter) ||
    name.includes(normalizedFilter)
  );
};

export const getProductInStock = (product: Product) => {
  const productStock = Number(product.stock ?? 0);
  const variantStock =
    product.variants?.some((variant) => Number(variant.stock ?? 0) > 0) ??
    false;
  return productStock > 0 || variantStock;
};

export const getCategoryLabel = (
  categoryValue: ProductCategoryValue | null | undefined,
) => {
  if (!categoryValue) return "Unknown";
  if (typeof categoryValue === "string") return categoryValue;
  return categoryValue.name_en || categoryValue.slug || "Unknown";
};

export const getBrandLabel = (brand: Product["brand"]) => {
  if (!brand) return "";
  if (typeof brand === "string") return brand;
  return brand.name ?? "";
};

export const toSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) {
      return message.join(", ");
    }
    if (typeof message === "string" && message.trim().length) {
      return message;
    }
  }
  return fallback;
};
