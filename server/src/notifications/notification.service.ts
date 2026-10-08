import { prisma } from "../db/prisma.js";
import { MockWhatsAppProvider } from "./mock.whatsapp.js";
import { IWhatsAppProvider } from "./whatsapp.interface.js";
import { logger } from "../utils/logger.js";

export class NotificationService {
  private whatsappProvider: IWhatsAppProvider;

  constructor() {
    this.whatsappProvider = new MockWhatsAppProvider();
  }

  async sendNotification(params: {
    userId: string;
    type: string;
    title: string;
    message: string;
    isPromotional?: boolean;
    metadata?: Record<string, unknown>;
  }) {
    const { userId, type, title, message, isPromotional = false, metadata } = params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { phone: true, notificationPreferences: true },
    });

    if (!user) return;

    let prefs = {
      serviceUpdatesWhatsApp: true,
      serviceUpdatesInApp: true,
      promoWhatsApp: false,
      promoInApp: true,
    };

    if (user.notificationPreferences && typeof user.notificationPreferences === "object") {
      prefs = { ...prefs, ...(user.notificationPreferences as Record<string, boolean>) };
    }

    const shouldSendInApp = isPromotional ? prefs.promoInApp : prefs.serviceUpdatesInApp;
    const shouldSendWhatsApp = isPromotional ? prefs.promoWhatsApp : prefs.serviceUpdatesWhatsApp;

    // 1. In-app notification record
    if (shouldSendInApp) {
      await prisma.notification.create({
        data: {
          userId,
          type,
          title,
          message,
          channel: "IN_APP",
          metadata: metadata ? JSON.stringify(metadata) : undefined,
        },
      });
    }

    // 2. Asynchronous WhatsApp notification
    if (shouldSendWhatsApp && user.phone) {
      // Fire-and-forget async execution so booking creation is never blocked
      setImmediate(async () => {
        try {
          if (isPromotional) {
            await this.whatsappProvider.sendPromotion(user.phone, title, message);
          } else {
            await this.whatsappProvider.sendTransactionalMessage(
              user.phone,
              `*${title}*\n${message}\n\n- Campus Commerce`
            );
          }
        } catch (err) {
          logger.error(`Failed to send WhatsApp message to ${user.phone}`, {
            error: err instanceof Error ? err.message : String(err),
          });
        }
      });
    }
  }
}

export const notificationService = new NotificationService();
