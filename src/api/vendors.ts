import { apiClient, type ApiRecord } from "./client";

export interface RiderPayload {
  id: string;
  name: string;
  phone: string;
  vehicleIdentifier: string;
}

export const vendorApi = {
  async getProfile() {
    return apiClient.request<ApiRecord>("/vendor/profile");
  },

  async updateProfile(data: ApiRecord) {
    return apiClient.request<ApiRecord>("/vendor/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async getDashboardStats() {
    return apiClient.request<ApiRecord>("/vendor/stats");
  },

  async getRiders() {
    return apiClient.request<RiderPayload[]>("/vendor/riders");
  },

  async createRider(data: { name: string; phone: string; vehicleIdentifier: string }) {
    return apiClient.request<RiderPayload>("/vendor/riders", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async deleteRider(id: string) {
    return apiClient.request<RiderPayload>(`/vendor/riders/${id}`, {
      method: "DELETE",
    });
  },

  async getMenu() {
    return apiClient.request<ApiRecord[]>("/vendor/menu");
  },

  async createMenuItem(data: ApiRecord) {
    return apiClient.request<ApiRecord>("/vendor/menu", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateMenuItem(id: string, data: ApiRecord) {
    return apiClient.request<ApiRecord>(`/vendor/menu/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async getOffers() {
    return apiClient.request<ApiRecord[]>("/vendor/offers");
  },

  async createOffer(data: ApiRecord) {
    return apiClient.request<ApiRecord>("/vendor/offers", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async toggleOfferPublish(id: string, published: boolean) {
    return apiClient.request<ApiRecord>(`/vendor/offers/${id}/toggle-publish`, {
      method: "POST",
      body: JSON.stringify({ published }),
    });
  },
};
