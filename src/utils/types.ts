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

export type ProductType = {
  sku: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  thumbnail: string;
};

export type CategoryType = {
  id?: string;
  name: string;
  slug: string;
  is_active?: boolean;
  thumbnail?: string;
  created_at?: string;
  updated_at?: string;
};

export type ProductFiltersType = {
  q?: string;
  min_price?: number;
  max_price?: number;
  sort_by?: "name" | "price" | "created_at";
  order?: "asc" | "desc";
} & PaginationType;

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
