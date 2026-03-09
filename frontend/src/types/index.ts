import type { ComponentType } from "react";

export type Lang = "en" | "mm";
export type ProductCategory = string;
export type Audience = "man" | "woman" | "child" | "all";

export type Category = {
  id: string;
  name_en: string;
  name_mm: string;
  slug: string;
};

export type ProductCategoryValue = ProductCategory | Category;

export type ProductImage = {
  url: string;
  isMain: boolean;
};

export type VariantOption = {
  id: string;
  type: string;
  value_en: string;
  value_mm: string;
};

export type ProductVariant = {
  id: string;
  sku: string;
  name_en: string;
  name_mm: string;
  priceOverride?: number;
  stock: number;
  options?: VariantOption[];
};

export type VariantOptionDraft = {
  id: string;
  type: string;
  value_en: string;
  value_mm: string;
};

export type VariantDraft = {
  id: string;
  sku: string;
  name_en: string;
  name_mm: string;
  priceOverride: string;
  stock: string;
  options: VariantOptionDraft[];
};

export type Product = {
  id: string;
  name_en: string;
  name_mm: string;
  description_en: string;
  description_mm: string;
  price: number;
  brand: string | { name?: string } | null;
  category: ProductCategoryValue;
  stock: number;
  audience: Audience;
  images: ProductImage[];
  variants?: ProductVariant[];
};

export type CategoryFilter =
  | "All"
  | "Clothes"
  | "Watches"
  | "Shoes"
  | "Bags"
  | "Accessories";

export type ForFilter = "All" | "Man" | "Woman" | "Child";

export type ForFilterOption = {
  value: ForFilter;
  label_en: string;
  label_mm: string;
  icon: ComponentType<{ size?: number; className?: string }>;
};

export type AdminFormState = {
  name_en: string;
  name_mm: string;
  description_en: string;
  description_mm: string;
  price: string;
  stock: string;
  brand: string;
  categoryId: string;
  audience: Audience;
  imageUrl: string;
  variants: VariantDraft[];
};
// --- Constants (Centralized) ---

export const CATEGORIES: CategoryFilter[] = [
  "All",
  "Clothes",
  "Watches",
  "Shoes",
  "Bags",
  "Accessories",
];

import { Users, User, UserRound, Baby } from "lucide-react";

export const FOR_FILTERS: ForFilterOption[] = [
  { value: "All", label_en: "All", label_mm: "အားလုံး", icon: Users },
  { value: "Man", label_en: "Man", label_mm: "အမျိုးသား", icon: User },
  {
    value: "Woman",
    label_en: "Woman",
    label_mm: "အမျိုးသမီး",
    icon: UserRound,
  },
  { value: "Child", label_en: "Child", label_mm: "ကလေး", icon: Baby },
];
