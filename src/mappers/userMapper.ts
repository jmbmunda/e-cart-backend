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
