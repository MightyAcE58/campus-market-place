import { v4 as uuidv4 } from "uuid";
import { IWhatsAppProvider, WhatsAppMessageResult } from "./whatsapp.interface.js";
import { logger } from "../utils/logger.js";

export class MockWhatsAppProvider implements IWhatsAppProvider {
  async sendTransactionalMessage(
    toPhone: string,
    message: string
  ): Promise<WhatsAppMessageResult> {
    logger.info(`[Mock WhatsApp] Transactional message to ${toPhone}: "${message}"`);
    return {
      messageId: `wamid_${uuidv4()}`,
      status: "SENT",
      timestamp: new Date(),
    };
  }

  async sendTemplateMessage(
    toPhone: string,
    templateName: string,
    parameters: Record<string, string>
  ): Promise<WhatsAppMessageResult> {
    logger.info(
      `[Mock WhatsApp] Template "${templateName}" to ${toPhone} with params: ${JSON.stringify(parameters)}`
    );
    return {
      messageId: `wamid_${uuidv4()}`,
      status: "SENT",
      timestamp: new Date(),
    };
  }

  async sendPromotion(
    toPhone: string,
    title: string,
    body: string
  ): Promise<WhatsAppMessageResult> {
    logger.info(`[Mock WhatsApp] Promo "${title}" to ${toPhone}: "${body}"`);
    return {
      messageId: `wamid_${uuidv4()}`,
      status: "SENT",
      timestamp: new Date(),
    };
  }
}
