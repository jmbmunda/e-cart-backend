import { OrderResponseType } from "../utils/types";

export const mapUserToResponse = (data: any) => {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    profile_picture: data.profile_picture,
    is_mfa_enabled: data.is_mfa_enabled,
    mobile_number: data.mobile_number,
    role: data.role,
  };
};

export const mapOrdersToResponse = (data: OrderResponseType) => {
  return {
    id: data.id,
    user_id: data.user_id,
    total_amount: +data.total_amount,
    status: data.status,
    items: data.items,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
};
