import { apiClient } from "./client";

export interface BookingItem {
  id: string;
  category: "ride" | "laundry" | "food";
  title: string;
  vendor: string;
  date: string;
  price: string;
  status: string;
  summary: string;
  rider?: {
    name: string;
    phone: string;
    vehicleIdentifier: string;
  } | null;
  bookingData?: any;
  customer?: any;
}

export const bookingsApi = {
  async getRideQuote(params: {
    serviceId?: string;
    pickup: string;
    dropoff: string;
    passengers: number;
  }) {
    return apiClient.request<{
      quotedFare: number;
      currency: string;
      breakdown: any;
    }>("/bookings/ride/quote", {
      method: "POST",
      body: JSON.stringify(params),
    });
  },

  async createRideBooking(data: {
    serviceId: string;
    pickup: string;
    dropoff: string;
    date: string;
    time: string;
    passengers: number;
    idempotencyKey?: string;
  }) {
    return apiClient.request<any>("/bookings", {
      method: "POST",
      body: JSON.stringify({ ...data, serviceType: "BIKE_RIDE" }),
    });
  },

  async createLaundryBooking(data: {
    serviceId: string;
    laundryService: string;
    clothingItems: Record<string, number>;
    bagPhotoUrl?: string;
    idempotencyKey?: string;
  }) {
    return apiClient.request<any>("/bookings", {
      method: "POST",
      body: JSON.stringify({ ...data, serviceType: "LAUNDRY" }),
    });
  },

  async createFoodBooking(data: {
    serviceId: string;
    items: Array<{ name: string; quantity: number }>;
    collectionPoint?: string;
    idempotencyKey?: string;
  }) {
    return apiClient.request<any>("/bookings", {
      method: "POST",
      body: JSON.stringify({ ...data, serviceType: "FOOD" }),
    });
  },

  async getBookings(params: {
    status?: string;
    serviceType?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const query = new URLSearchParams();
    if (params.status && params.status !== "All") query.set("status", params.status);
    if (params.serviceType) query.set("serviceType", params.serviceType);
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));

    const qs = query.toString() ? `?${query.toString()}` : "";
    return apiClient.request<BookingItem[]>(`/bookings${qs}`);
  },

  async getBookingById(id: string) {
    return apiClient.request<any>(`/bookings/${id}`);
  },

  async cancelBooking(id: string) {
    return apiClient.request<any>(`/bookings/${id}/cancel`, {
      method: "POST",
    });
  },

  async updateStatus(id: string, status: string, notes?: string) {
    return apiClient.request<any>(`/bookings/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, notes }),
    });
  },

  async assignRider(id: string, riderId: string) {
    return apiClient.request<any>(`/bookings/${id}/assign-rider`, {
      method: "POST",
      body: JSON.stringify({ riderId }),
    });
  },
};
