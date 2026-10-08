export interface WhatsAppMessageResult {
  messageId: string;
  status: "SENT" | "QUEUED" | "FAILED";
  timestamp: Date;
}

export interface IWhatsAppProvider {
  sendTransactionalMessage(
    toPhone: string,
    message: string
  ): Promise<WhatsAppMessageResult>;

  sendTemplateMessage(
    toPhone: string,
    templateName: string,
    parameters: Record<string, string>
  ): Promise<WhatsAppMessageResult>;

  sendPromotion(
    toPhone: string,
    title: string,
    body: string
  ): Promise<WhatsAppMessageResult>;
}
