import { apiClient } from "./client";

export const adminApi = {
  async onboardVendor(data: {
    businessName: string;
    ownerName: string;
    email: string;
    phone: string;
    whatsappNumber: string;
    vendorType: string;
    accessPlan: string;
    accessStartDate: string;
    accessEndDate: string;
    monthlyPrice: number;
  }) {
    return apiClient.request<any>("/admin/vendors", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getVendors(search?: string) {
    const qs = search ? `?search=${encodeURIComponent(search)}` : "";
    return apiClient.request<any[]>(`/admin/vendors${qs}`);
  },

  async getVendorById(id: string) {
    return apiClient.request<any>(`/admin/vendors/${id}`);
  },

  async suspendVendor(id: string) {
    return apiClient.request<any>(`/admin/vendors/${id}/suspend`, {
      method: "POST",
    });
  },

  async activateVendor(id: string) {
    return apiClient.request<any>(`/admin/vendors/${id}/activate`, {
      method: "POST",
    });
  },

  async removeVendor(id: string) {
    return apiClient.request<any>(`/admin/vendors/${id}/remove`, {
      method: "POST",
    });
  },

  async getUsers(search?: string) {
    const qs = search ? `?search=${encodeURIComponent(search)}` : "";
    return apiClient.request<any[]>(`/admin/users${qs}`);
  },

  async getStats() {
    return apiClient.request<any>("/admin/stats");
  },

  async getActivityLogs() {
    return apiClient.request<any[]>("/admin/activity");
  },
};
