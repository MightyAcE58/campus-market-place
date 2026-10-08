import { apiClient } from "./client";

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  hostel?: string;
  roomNumber?: string;
  role: "CUSTOMER" | "VENDOR_OWNER" | "ADMIN";
  notificationPreferences?: {
    serviceUpdatesWhatsApp?: boolean;
    serviceUpdatesInApp?: boolean;
    promoWhatsApp?: boolean;
    promoInApp?: boolean;
  };
  vendor?: {
    id: string;
    businessName: string;
    vendorType: string;
    accessStatus: string;
    plan: string;
    accessEnd: string;
  } | null;
}

export const authApi = {
  async requestOtp(phone: string) {
    return apiClient.request<{
      phone: string;
      cooldownSeconds: number;
      expiresInSeconds: number;
      devOtp?: string;
    }>("/auth/customer/request-otp", {
      method: "POST",
      body: JSON.stringify({ phone }),
    });
  },

  async verifyOtp(phone: string, code: string, name?: string, hostel?: string, roomNumber?: string) {
    const res = await apiClient.request<{
      user: UserProfile;
      accessToken: string;
      refreshToken: string;
    }>("/auth/customer/verify-otp", {
      method: "POST",
      body: JSON.stringify({ phone, code, name, hostel, roomNumber }),
    });
    apiClient.setTokens(res.accessToken, res.refreshToken);
    localStorage.setItem("ccm_user", JSON.stringify(res.user));
    return res;
  },

  async adminLogin(phone: string, password: string) {
    const res = await apiClient.request<{
      user: UserProfile;
      accessToken: string;
      refreshToken: string;
    }>("/auth/admin/login", {
      method: "POST",
      body: JSON.stringify({ phone, password }),
    });
    apiClient.setTokens(res.accessToken, res.refreshToken);
    localStorage.setItem("ccm_user", JSON.stringify(res.user));
    return res;
  },

  async vendorLogin(emailOrPhone: string, password: string) {
    const res = await apiClient.request<{
      user: UserProfile;
      vendor: Record<string, unknown>;
      accessToken: string;
      refreshToken: string;
    }>("/auth/vendor/login", {
      method: "POST",
      body: JSON.stringify({ emailOrPhone, password }),
    });
    apiClient.setTokens(res.accessToken, res.refreshToken);
    localStorage.setItem("ccm_user", JSON.stringify(res.user));
    return res;
  },

  async activateVendor(token: string, password: string) {
    const res = await apiClient.request<{
      user: UserProfile;
      accessToken: string;
      refreshToken: string;
    }>("/auth/vendor/activate", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });
    apiClient.setTokens(res.accessToken, res.refreshToken);
    localStorage.setItem("ccm_user", JSON.stringify(res.user));
    return res;
  },

  async getMe() {
    const user = await apiClient.request<UserProfile>("/auth/me");
    localStorage.setItem("ccm_user", JSON.stringify(user));
    return user;
  },

  async updateProfile(data: {
    name?: string;
    hostel?: string;
    roomNumber?: string;
    notificationPreferences?: Record<string, boolean>;
  }) {
    const updated = await apiClient.request<UserProfile>("/auth/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    localStorage.setItem("ccm_user", JSON.stringify(updated));
    return updated;
  },

  async logout() {
    try {
      const refreshToken = localStorage.getItem("ccm_refresh_token");
      await apiClient.request("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // Ignore network errors on logout
    } finally {
      apiClient.clearTokens();
    }
  },
};
