import { apiClient, type ApiRecord } from "./client";

export interface NotificationPayload extends ApiRecord {
  id: string;
  title: string;
  message: string;
}

export const notificationsApi = {
  async getNotifications() {
    return apiClient.request<NotificationPayload[]>("/notifications").catch(() => []);
  },
};
