import { useState, useRef, useEffect } from "react";
import { Conversation, UserProfile, VendorItem, BookingItem, Role } from "../types";

interface ChatModalProps {
  conversation: Conversation;
  currentUser: UserProfile;
  currentRole?: Role;
  vendor?: VendorItem;
  booking?: BookingItem;
  onClose: () => void;
  onSendMessage: (conversationId: string, content: string) => void;
  onSendOffer: (conversationId: string, offerAmount: number, note?: string) => void;
  onRespondOffer: (conversationId: string, action: "ACCEPT" | "REJECT" | "COUNTER", counterAmount?: number) => void;
}

export function ChatModal({
  conversation,
  currentUser,
  currentRole = "customer",
  vendor,
  booking,
  onClose,
  onSendMessage,
  onSendOffer,
  onRespondOffer,
}: ChatModalProps) {
  const [inputText, setInputText] = useState("");
  const [offerInput, setOfferInput] = useState("");
  const [counterInput, setCounterInput] = useState("");
  const [showOfferDrawer, setShowOfferDrawer] = useState(false);
  const [showCounterDrawer, setShowCounterDrawer] = useState(false);
  const streamRef = useRef<HTMLDivElement>(null);

  const isCustomer = currentRole === "customer";
  const negotiationAllowed = vendor ? vendor.negotiationEnabled : conversation.serviceType !== "ride";

  // Auto-scroll to bottom on message updates
  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.scrollTop = streamRef.current.scrollHeight;
    }
  }, [conversation.messages.length]);

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(conversation.id, inputText.trim());
    setInputText("");
  };

  const handleMakeOffer = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(offerInput);
    if (isNaN(amount) || amount <= 0) return;
    onSendOffer(conversation.id, amount, `Student price proposal: ₹${amount}`);
    setOfferInput("");
    setShowOfferDrawer(false);
  };

  const handleCounterOffer = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(counterInput);
    if (isNaN(amount) || amount <= 0) return;
    onRespondOffer(conversation.id, "COUNTER", amount);
    setCounterInput("");
    setShowCounterDrawer(false);
  };

  const quickMessages = isCustomer
    ? [
        "Can you pick up today?",
        "Is steam ironing included?",
        "Bag is at hostel reception",
        "Can we negotiate on 5+ kg?",
      ]
    : [
        "Yes, our pickup boy is on campus now!",
        "Handled with care, ready in 48h.",
        "Your bag has been weighed and tagged.",
        "Delivered at designated gate point.",
      ];

  const quickOfferChips = [150, 160, 175, 185];

  const otherPartyName = isCustomer ? conversation.vendorName : conversation.customerName;
  const avatarInitials = otherPartyName ? otherPartyName.slice(0, 2).toUpperCase() : "CC";

  return (
    <div className="overlay" onMouseDown={onClose}>
      <div className="modal chat-modal" onMouseDown={(e) => e.stopPropagation()}>
        {/* Chat Header */}
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="chat-avatar-ring">
              <div className="chat-avatar">{avatarInitials}</div>
              <span className="chat-online-dot" />
            </div>
            <div>
              <div className="chat-title-row">
                <strong>{otherPartyName}</strong>
                {isCustomer && vendor?.verified && <span className="verified-badge">✓ Verified Partner</span>}
                {!isCustomer && <span className="verified-badge">🎓 Student</span>}
              </div>
              <small className="chat-service-context">
                {isCustomer
                  ? `${conversation.serviceTitle} · Listed: ${conversation.listedPrice}`
                  : `Customer: ${conversation.customerName} · ${conversation.serviceTitle}`}
              </small>
            </div>
          </div>
          <div className="chat-header-actions">
            {conversation.agreedPrice ? (
              <span className="agreed-pill">🤝 Price Locked: ₹{conversation.agreedPrice}</span>
            ) : negotiationAllowed ? (
              <span className="negotiable-pill">💬 Bargaining Open</span>
            ) : (
              <span className="locked-pill">🔒 Fixed Fare</span>
            )}
            <button className="chat-close-btn" onClick={onClose} aria-label="Close chat">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Booking Banner if linked */}
        {booking && (
          <div className="chat-booking-banner">
            <div>
              <small>LINKED SERVICE REQUEST</small>
              <strong>{booking.id} · {booking.title} ({booking.status})</strong>
            </div>
            <span>{booking.agreedPrice || booking.finalPrice}</span>
          </div>
        )}

        {/* Message Stream */}
        <div className="chat-stream" ref={streamRef}>
          {conversation.messages.map((msg) => {
            const isMe =
              (isCustomer && msg.senderRole === "customer") ||
              (!isCustomer && msg.senderRole === "vendor");
            const isSystem = msg.senderRole === "system";

            if (isSystem) {
              return (
                <div key={msg.id} className="system-bubble">
                  <span>ℹ️ {msg.content}</span>
                  <small>{msg.timestamp}</small>
                </div>
              );
            }

            if (msg.type === "OFFER" || msg.type === "COUNTER_OFFER") {
              const isOfferByMe = isMe;
              return (
                <div
                  key={msg.id}
                  className={`message-bubble offer-bubble ${isOfferByMe ? "sent" : "received"}`}
                >
                  <div className="bubble-sender">{msg.senderName}</div>
                  <div className="offer-badge-title">
                    {msg.type === "OFFER" ? "💰 PRICE OFFER SUBMITTED" : "🔄 COUNTER-OFFER PROPOSED"}
                  </div>
                  <div className="offer-amount-highlight">₹{msg.offerAmount}</div>
                  <div className="offer-note">{msg.content}</div>

                  {/* Actions for receiver */}
                  {!isOfferByMe && conversation.negotiationStatus !== "AGREED" && (
                    <div className="offer-actions">
                      <button
                        className="btn-accept"
                        onClick={() => onRespondOffer(conversation.id, "ACCEPT", msg.offerAmount)}
                      >
                        ✓ Accept ₹{msg.offerAmount}
                      </button>
                      <button
                        className="btn-counter"
                        onClick={() => {
                          setCounterInput(String(Math.round(msg.offerAmount * 1.1)));
                          setShowCounterDrawer(true);
                        }}
                      >
                        Counter-Offer
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() => onRespondOffer(conversation.id, "REJECT")}
                      >
                        Decline
                      </button>
                    </div>
                  )}

                  <div className="bubble-timestamp">{msg.timestamp}</div>
                </div>
              );
            }

            if (msg.type === "OFFER_ACCEPTED") {
              return (
                <div key={msg.id} className="message-bubble deal-bubble">
                  <div className="deal-mark">🎉 🤝</div>
                  <strong>Deal Agreed at ₹{msg.offerAmount}!</strong>
                  <p>{msg.content}</p>
                  <small>{msg.timestamp}</small>
                </div>
              );
            }

            if (msg.type === "OFFER_REJECTED") {
              return (
                <div key={msg.id} className="message-bubble reject-bubble">
                  <span>❌ Offer was declined.</span>
                  <small>{msg.timestamp}</small>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`message-bubble ${isMe ? "sent" : "received"}`}
              >
                {!isMe && <div className="bubble-sender">{msg.senderName}</div>}
                <div className="bubble-text">{msg.content}</div>
                <div className="bubble-timestamp">{msg.timestamp}</div>
              </div>
            );
          })}
        </div>

        {/* Quick Message Chips */}
        <div className="chat-quick-chips">
          {quickMessages.map((text) => (
            <button
              key={text}
              type="button"
              className="quick-chip-btn"
              onClick={() => onSendMessage(conversation.id, text)}
            >
              {text}
            </button>
          ))}
        </div>

        {/* Bargaining Action Bar */}
        {negotiationAllowed && conversation.negotiationStatus !== "AGREED" && (
          <div className="bargaining-bar">
            <span>
              💡 <strong>Direct Bargaining:</strong> Propose a price to reach an agreed rate.
            </span>
            {isCustomer ? (
              <button
                className="btn-make-offer"
                onClick={() => setShowOfferDrawer(!showOfferDrawer)}
              >
                {showOfferDrawer ? "Close Offer Drawer" : "Submit Price Offer"}
              </button>
            ) : (
              <button
                className="btn-make-offer"
                onClick={() => setShowCounterDrawer(!showCounterDrawer)}
              >
                {showCounterDrawer ? "Close Drawer" : "Send Counter-Offer"}
              </button>
            )}
          </div>
        )}

        {/* Offer Drawer for Student */}
        {showOfferDrawer && (
          <form className="offer-drawer" onSubmit={handleMakeOffer}>
            <div className="drawer-title">Propose a Discounted Rate to {conversation.vendorName}</div>
            <div className="quick-offer-row">
              <span style={{ fontSize: 11, color: "var(--muted)", alignSelf: "center" }}>Quick select:</span>
              {quickOfferChips.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  className="quick-amt-chip"
                  onClick={() => setOfferInput(String(amt))}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
            <div className="drawer-input-row">
              <span className="currency-symbol">₹</span>
              <input
                type="number"
                placeholder="Enter custom amount (e.g. 160)"
                value={offerInput}
                onChange={(e) => setOfferInput(e.target.value)}
                autoFocus
                min={1}
                required
              />
              <button type="submit" className="button tiny">
                Send Offer
              </button>
              <button
                type="button"
                className="secondary-button tiny"
                onClick={() => setShowOfferDrawer(false)}
              >
                Cancel
              </button>
            </div>
            <small style={{ color: "var(--muted)", fontSize: 10 }}>
              Listed reference: {conversation.listedPrice}. Final payment is made directly upon delivery.
            </small>
          </form>
        )}

        {/* Counter-Offer Drawer */}
        {showCounterDrawer && (
          <form className="offer-drawer counter" onSubmit={handleCounterOffer}>
            <div className="drawer-title">Submit Counter-Offer</div>
            <div className="drawer-input-row">
              <span className="currency-symbol">₹</span>
              <input
                type="number"
                placeholder="Enter counter amount (e.g. 175)"
                value={counterInput}
                onChange={(e) => setCounterInput(e.target.value)}
                autoFocus
                min={1}
                required
              />
              <button type="submit" className="button tiny">
                Send Counter
              </button>
              <button
                type="button"
                className="secondary-button tiny"
                onClick={() => setShowCounterDrawer(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Chat Input Bar */}
        <form className="chat-input-bar" onSubmit={handleSendText}>
          <input
            type="text"
            placeholder={
              isCustomer
                ? `Message ${conversation.vendorName}...`
                : `Reply to ${conversation.customerName}...`
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button type="submit" className="button chat-send-btn" disabled={!inputText.trim()}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m22 2-7 20-4-9-9-4zM22 2 11 13" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
