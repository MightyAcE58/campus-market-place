import { apiClient } from "./client";

export const vendorApi = {
  async getProfile() {
    return apiClient.request<any>("/vendor/profile");
  },

  async updateProfile(data: any) {
    return apiClient.request<any>("/vendor/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async getDashboardStats() {
    return apiClient.request<any>("/vendor/stats");
  },

  async getRiders() {
    return apiClient.request<any[]>("/vendor/riders");
  },

  async createRider(data: { name: string; phone: string; vehicleIdentifier: string }) {
    return apiClient.request<any>("/vendor/riders", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async deleteRider(id: string) {
    return apiClient.request<any>(`/vendor/riders/${id}`, {
      method: "DELETE",
    });
  },

  async getMenu() {
    return apiClient.request<any[]>("/vendor/menu");
  },

  async createMenuItem(data: any) {
    return apiClient.request<any>("/vendor/menu", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateMenuItem(id: string, data: any) {
    return apiClient.request<any>(`/vendor/menu/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async getOffers() {
    return apiClient.request<any[]>("/vendor/offers");
  },

  async createOffer(data: any) {
    return apiClient.request<any>("/vendor/offers", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async toggleOfferPublish(id: string, published: boolean) {
    return apiClient.request<any>(`/vendor/offers/${id}/toggle-publish`, {
      method: "POST",
      body: JSON.stringify({ published }),
    });
  },
};
