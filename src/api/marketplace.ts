import { apiClient, type ApiRecord } from "./client";

export interface CategoryItem {
  id: "ride" | "laundry" | "food";
  name: string;
  description: string;
  detail: string;
  icon: string;
  className: string;
}

export interface VendorItem {
  id: string;
  name: string;
  type: string;
  category: "ride" | "laundry" | "food";
  description: string;
  area: string;
  status: string;
  price: string;
  color: string;
  mark: string;
  offer: string;
  tags: string[];
  services: string[];
  serviceArea?: string;
  operatingHours?: string;
  dietaryClassification?: string;
}

export const marketplaceApi = {
  async getCategories() {
    return apiClient.request<CategoryItem[]>("/marketplace/categories");
  },

  async getVendors(params: {
    search?: string;
    category?: string;
    serviceType?: string;
    dietaryClassification?: string;
    available?: boolean;
  } = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.category && params.category !== "All") query.set("category", params.category.toLowerCase());
    if (params.serviceType) query.set("serviceType", params.serviceType);
    if (params.dietaryClassification) query.set("dietaryClassification", params.dietaryClassification);
    if (params.available) query.set("available", "true");

    const qs = query.toString() ? `?${query.toString()}` : "";
    return apiClient.request<VendorItem[]>(`/marketplace/vendors${qs}`);
  },

  async getVendorById(vendorId: string) {
    return apiClient.request<VendorItem>(`/marketplace/vendors/${vendorId}`);
  },

  async getServiceConfig(serviceId: string) {
    return apiClient.request<ApiRecord>(`/marketplace/services/${serviceId}`);
  },

  async getOffers() {
    return apiClient.request<ApiRecord[]>("/marketplace/offers");
  },
};
