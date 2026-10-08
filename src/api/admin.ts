import { apiClient, type ApiRecord } from "./client";

/** Admin-facing vendor record (subset of fields returned by the backend). */
export interface AdminVendor extends ApiRecord {
  id: string;
  name: string;
}

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
    return apiClient.request<AdminVendor>("/admin/vendors", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getVendors(search?: string) {
    const qs = search ? `?search=${encodeURIComponent(search)}` : "";
    return apiClient.request<AdminVendor[]>(`/admin/vendors${qs}`);
  },

  async getVendorById(id: string) {
    return apiClient.request<AdminVendor>(`/admin/vendors/${id}`);
  },

  async suspendVendor(id: string) {
    return apiClient.request<AdminVendor>(`/admin/vendors/${id}/suspend`, {
      method: "POST",
    });
  },

  async activateVendor(id: string) {
    return apiClient.request<AdminVendor>(`/admin/vendors/${id}/activate`, {
      method: "POST",
    });
  },

  async removeVendor(id: string) {
    return apiClient.request<AdminVendor>(`/admin/vendors/${id}/remove`, {
      method: "POST",
    });
  },

  async getUsers(search?: string) {
    const qs = search ? `?search=${encodeURIComponent(search)}` : "";
    return apiClient.request<ApiRecord[]>(`/admin/users${qs}`);
  },

  async getStats() {
    return apiClient.request<ApiRecord>("/admin/stats");
  },

  async getActivityLogs() {
    return apiClient.request<ApiRecord[]>("/admin/activity");
  },
};
