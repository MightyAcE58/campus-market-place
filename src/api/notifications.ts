import { apiClient } from "./client";

export const notificationsApi = {
  async getNotifications() {
    return apiClient.request<any[]>("/notifications").catch(() => []);
  },
};
