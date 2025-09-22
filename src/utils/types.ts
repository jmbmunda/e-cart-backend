export type ProductType = {
  name: string;
  description: string;
  price: number;
  stock: number;
};

export type FiltersType = {
  min_price: number;
  max_price: number;
  sortBy: "name" | "price" | "created_at";
  order: "asc" | "desc";
};

export type BaseUserType = {
  id?: string;
  name: string;
  email: string;
  profile_picture: string;
  created_at?: string;
  updated_at?: string;
  is_mfa_enabled?: boolean;
  mobile_number?: string;
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
