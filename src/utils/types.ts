import { Request } from "express";

export type BaseJsonType = { statusCode: number; message: string };

export type ResponseType<T extends BaseJsonType = BaseJsonType> = {
  status: number;
  json: T;
};

export type PaginationType = {
  page?: number;
  limit?: number;
};

export type RoleType = {
  id?: string;
  name: string;
  description: string;
  created_at?: string;
  updated_at?: string;
};

export type CartType = {
  id?: string;
  cart_id?: string;
  product_id?: string;
  quantity?: number;
  price?: number;
  is_selected?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type ProductType = {
  sku: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  thumbnail: string;
};

export type ProductDetailsType = {
  id: number;
  sku: string;
  name: string;
  description: string;
  price: string;
  stock: number;
  category: string;
  thumbnail: string;
  created_at: string;
  updated_at: string;
  images: Array<{
    id: number;
    url: string;
    is_thumbnail: boolean;
  }>;
  categories: Array<Pick<CategoryType, "id" | "name" | "slug">>;
};

export type ProductFiltersType = {
  q?: string;
  min_price?: number;
  max_price?: number;
  sort_by?: "name" | "price" | "created_at";
  order?: "asc" | "desc";
} & PaginationType;

export type CategoryType = {
  id?: string;
  name: string;
  slug: string;
  is_active?: boolean;
  thumbnail?: string;
  created_at?: string;
  updated_at?: string;
};

export type CategoriesFiltersType = {
  is_active?: boolean;
  order?: "asc" | "desc";
} & PaginationType;

export type BaseUserType = {
  id?: string;
  name: string;
  email: string;
  profile_picture: string;
  created_at?: string;
  updated_at?: string;
  is_mfa_enabled?: boolean;
  mobile_number?: string;
  role?: { id: string; name: string };
};

export type SensitiveUserType = {
  password?: string;
  mfa_secret?: string;
  mfa_method?: MfaMethodType;
};

export type UserType<T extends boolean = false> = T extends true
  ? BaseUserType & SensitiveUserType
  : BaseUserType;

export type MfaTokenType = {
  id: string;
  user_id: string;
  otp: string;
  used?: boolean;
  created_at?: string;
  expires_at?: string;
};

export type MfaMethodType = "authenticator" | "email" | "sms";

export type JWTUserDataType = {
  id?: string;
  email?: string;
  role?: { id: string; name: string };
};

export type AuthRequestType = Request & { user: Required<JWTUserDataType> };
