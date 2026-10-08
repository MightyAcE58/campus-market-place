import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Role,
  CategoryId,
  UserProfile,
  VendorItem,
  BookingItem,
  Conversation,
  OfferItem,
  NotificationItem,
  ReportItem,
  Rider,
  BookingStatus,
} from "./types";
import {
  loadSavedState,
  saveState,
  defaultStudentUser,
  defaultPilotVendorUser,
  defaultFoodVendorUser,
  defaultAdminUser,
} from "./store/marketplaceStore";
import { ChatModal } from "./components/ChatModal";
import { PilotCaseStudyModal } from "./components/PilotCaseStudyModal";
import { ProfileOnboardingModal } from "./components/ProfileOnboardingModal";
import { AssignRiderModal } from "./components/AssignRiderModal";
import { ReportModal } from "./components/ReportModal";
import { onFirebaseAuthStateChanged } from "./lib/firebase";

type IconName =
  | "arrow" | "back" | "bell" | "bike" | "calendar" | "check" | "chevron"
  | "clock" | "close" | "filter" | "food" | "home" | "laundry" | "location"
  | "offer" | "search" | "settings" | "store" | "upload" | "user" | "users"
  | "chat" | "shield" | "star";

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    back: <><path d="M19 12H5" /><path d="m11 18-6-6 6-6" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    bike: <><circle cx="5.5" cy="16.5" r="3.5" /><circle cx="18.5" cy="16.5" r="3.5" /><path d="m9 16.5 3-7h3l3.5 7M8 8h4M5.5 16.5 9 11l4 5.5" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    close: <><path d="m6 6 12 12" /><path d="M18 6 6 18" /></>,
    filter: <><path d="M4 6h16M7 12h10M10 18h4" /></>,
    food: <><path d="M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10M17 3v18M17 3c3 2 3 8 0 10" /></>,
    home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10M9 20v-6h6v6" /></>,
    laundry: <><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="12" cy="13" r="5" /><path d="M7 7h.01M11 7h6" /></>,
    location: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    offer: <><path d="M20 12 12 20l-9-9V4h7l10 8Z" /><circle cx="7.5" cy="8.5" r="1" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19 13.5v-3l-2-.7-.7-1.7.9-1.9-2.1-2.1-1.9.9-1.7-.7L10.5 2h-3l-.7 2-1.7.7-1.9-.9-2.1 2.1.9 1.9-.7 1.7L0 10.5v3l2 .7.7 1.7-.9 1.9 2.1 2.1 1.9-.9 1.7.7.7 2.3h3l.7-2 1.7-.7 1.9.9 2.1-2.1-.9-1.9.7-1.7Z" transform="translate(2)" /></>,
    store: <><path d="M4 10v10h16V10M3 10l2-6h14l2 6" /><path d="M3 10a3 3 0 0 0 5 2 3 3 0 0 0 4 0 3 3 0 0 0 4 0 3 3 0 0 0 5-2M9 20v-5h6v5" /></>,
    upload: <><path d="M12 16V4m0 0L7 9m5-5 5 5" /><path d="M4 15v5h16v-5" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    users: <><circle cx="9" cy="8" r="4" /><path d="M2 21a7 7 0 0 1 14 0M16 5a4 4 0 0 1 0 7M18 15a6 6 0 0 1 4 6" /></>,
    chat: <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></>,
    star: <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></>,
  };
  return (
    <svg aria-hidden="true" className="icon" fill="none" height={size} viewBox="0 0 24 24" width={size}>
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
        {paths[name]}
      </g>
    </svg>
  );
}

const categoriesMeta = [
  { id: "ride" as CategoryId, name: "Bike Ride", description: "Quick rides across campus", detail: "From ₹30", icon: "bike" as IconName, className: "blue" },
  { id: "laundry" as CategoryId, name: "Laundry", description: "Pickup, wash and iron", detail: "From ₹60/kg", icon: "laundry" as IconName, className: "violet" },
  { id: "food" as CategoryId, name: "Food", description: "Fresh meals around campus", detail: "From ₹70", icon: "food" as IconName, className: "orange" },
];

const navByRole: Record<Role, string[]> = {
  customer: ["Home", "Marketplace", "Bookings", "Messages", "Offers"],
  vendor: ["Dashboard", "Requests", "Services", "Messages", "Business Profile", "Offers", "Account"],
  admin: ["Dashboard", "Vendors", "Services", "Users", "Bookings", "Reports", "Disputes"],
};

function Button({ children, className = "", onClick, disabled = false, type = "button" }: { children: ReactNode; className?: string; onClick?: () => void; disabled?: boolean; type?: "button" | "submit" }) {
  return <button className={`button ${className}`} disabled={disabled} onClick={onClick} type={type}>{children}</button>;
}

function StatusBadge({ value }: { value: string }) {
  const normalized = value.toLowerCase().replaceAll(" ", "-");
  return <span className={`status status-${normalized}`}>{value}</span>;
}

function Field({ label, value, onChange, placeholder, type = "text", locked = false }: { label: string; value: string; onChange?: (value: string) => void; placeholder?: string; type?: string; locked?: boolean }) {
  return (
    <label className={`field ${locked ? "locked" : ""}`}>
      <span>{label}{locked && <small> Auto-filled from profile</small>}</span>
      <input disabled={locked} onChange={(e) => onChange?.(e.target.value)} placeholder={placeholder} type={type} value={value} />
    </label>
  );
}

function Toggle({ label, detail, checked, onChange, disabled = false }: { label: string; detail?: string; checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button className="toggle-row" disabled={disabled} onClick={onChange} type="button">
      <span><strong>{label}</strong>{detail && <small>{detail}</small>}</span>
      <i className={checked ? "toggle on" : "toggle"}><b /></i>
    </button>
  );
}

function Modal({ title, children, onClose, wide = false }: { title: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <div className="overlay" onMouseDown={onClose}>
      <div className={`modal ${wide ? "wide" : ""}`} onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title">{title}</div>
          <button aria-label="Close" className="icon-button" onClick={onClose}><Icon name="close" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function PageHead({ title, subtitle, back, action }: { title: string; subtitle?: string; back?: () => void; action?: ReactNode }) {
  return (
    <div className="page-head">
      <div className="head-copy">
        {back && <button className="back-button" onClick={back}><Icon name="back" /></button>}
        <div>
          <div className="page-title">{title}</div>
          {subtitle && <div className="page-subtitle">{subtitle}</div>}
        </div>
      </div>
      {action}
    </div>
  );
}

function EmptyState({ icon = "search", title, text, action }: { icon?: IconName; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="empty-state">
      <div className="empty-icon"><Icon name={icon} size={25} /></div>
      <div className="empty-title">{title}</div>
      <div>{text}</div>
      {action}
    </div>
  );
}

function VendorCard({
  vendor,
  onDetails,
  onBook,
  onChat,
}: {
  vendor: VendorItem;
  onDetails: () => void;
  onBook: () => void;
  onChat: () => void;
}) {
  return (
    <article className="vendor-card">
      <div className={`vendor-cover ${vendor.color}`}>
        <div className="vendor-logo">{vendor.mark}</div>
        {vendor.offer && (
          <div className="offer-pill">
            <Icon name="offer" size={12} /> {vendor.offer}
          </div>
        )}
        <div className="open-pill"><span /> {vendor.status}</div>
      </div>
      <div className="vendor-content">
        <div className="vendor-title-row">
          <div className="vendor-title-info">
            <div className="vendor-name-row">
              <span className="vendor-name">{vendor.name}</span>
              {vendor.verified && <span className="verified-badge">✓ Verified</span>}
              {vendor.isPilotBusiness && <span className="pilot-badge">Pilot</span>}
            </div>
            <div className="vendor-type">{vendor.type}</div>
          </div>
          <button aria-label={`Open ${vendor.name}`} className="round-arrow" onClick={onDetails}>
            <Icon name="arrow" size={16} />
          </button>
        </div>
        <div className="vendor-description">{vendor.description}</div>
        <div className="tag-row">
          {vendor.tags
            .filter((tag) => {
              // Avoid duplicate veg pills: dietary badge already covers it for VEG_ONLY kitchens.
              if (vendor.dietaryClassification === "VEG_ONLY") {
                const n = tag.toLowerCase().replace(/[^a-z]/g, "");
                if (n === "vegonly" || n === "veg" || n === "vegonlyvendors") return false;
              }
              return true;
            })
            .slice(0, 4)
            .map((tag) => {
              const lower = tag.toLowerCase();
              const isNegotiable = (tag.includes("Negotiat") || tag.includes("Bargaining")) && !lower.includes("no bargain");
              const isFixed = lower.includes("no bargain") || lower.includes("fixed fare");
              return (
                <span key={tag} className={isNegotiable ? "tag-negotiable" : isFixed ? "tag-fixed" : ""}>
                  {tag}
                </span>
              );
            })}
          {vendor.dietaryClassification === "VEG_ONLY" && (
            <span className="dietary-tag dietary-veg">🌱 Veg Only</span>
          )}
        </div>
        <div className="vendor-meta">
          <Icon name="location" size={13} /> {vendor.area}
        </div>
        <div className="vendor-footer">
          <strong title={vendor.price}>{vendor.price}</strong>
          <div className="vendor-btn-pair">
            <button className="button tiny secondary" onClick={onChat} title="Chat & Bargain">
              <Icon name="chat" size={13} /> Chat
            </button>
            <Button className="tiny" onClick={onBook}>
              Book
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

function Timeline({ items, active }: { items: string[]; active: number }) {
  return (
    <div className="timeline">
      {items.map((item, index) => (
        <div className={`timeline-item ${index <= active ? "done" : ""} ${index === active ? "current" : ""}`} key={item}>
          <div className="timeline-mark">{index < active ? <Icon name="check" size={14} /> : index + 1}</div>
          <div>
            <strong>{item}</strong>
            <small>{index <= active ? (index === active ? "Current status" : "Completed step") : "Pending"}</small>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [store, setStore] = useState(() => loadSavedState());
  const [role, setRole] = useState<Role>(store.activeRole || "customer");
  const [screen, setScreen] = useState("home");
  const [category, setCategory] = useState<CategoryId>("laundry");
  const [vendorId, setVendorId] = useState("fresh-fold");
  const [service, setService] = useState("Wash + Iron");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState("");
  const [flowStep, setFlowStep] = useState(0);
  const [bookingTab, setBookingTab] = useState("All");
  const [notice, setNotice] = useState("");
  const [adminTab, setAdminTab] = useState("dashboard");
  const [filterOpen, setFilterOpen] = useState(false);
  const [vegOnlyFilter, setVegOnlyFilter] = useState(false);
  const [verifiedOnlyFilter, setVerifiedOnlyFilter] = useState(true);
  const [negotiableOnlyFilter, setNegotiableOnlyFilter] = useState(false);
  const [marketplaceTab, setMarketplaceTab] = useState<"All" | "Bike Ride" | "Laundry" | "Food">("All");

  // Bike flow state
  const [pickup, setPickup] = useState("Main Gate");
  const [dropoff, setDropoff] = useState("Maple Hostel");
  const [passengers, setPassengers] = useState(1);
  const [date, setDate] = useState("Today");
  const [time, setTime] = useState("14:30");

  // Laundry flow state
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({ Shirt: 3, Pant: 2, Bedsheet: 1, Shorts: 0 });

  // Food flow state
  const [foodQty, setFoodQty] = useState<Record<string, number>>({ "Paneer Rice Bowl": 2, "Garden Wrap": 0, "Masala Khichdi": 0, "Cold Coffee": 1 });
  const [foodCollectionPoint, setFoodCollectionPoint] = useState("Maple Hostel Gate");

  // Chat & Negotiation state
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string>("CCM-L-1042");

  // Report Modal state
  const [reportTarget, setReportTarget] = useState<{ type: "VENDOR" | "BOOKING"; id: string; name: string } | null>(null);

  // Assign Rider Modal state
  const [assignRiderBooking, setAssignRiderBooking] = useState<BookingItem | null>(null);

  // Remember customized student identity across role switches
  const [savedStudentUser, setSavedStudentUser] = useState<UserProfile>(() => {
    try {
      const raw = localStorage.getItem("ccm_saved_student");
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return store.currentUser.role === "CUSTOMER" ? store.currentUser : defaultStudentUser;
  });

  // Admin onboard form state
  const [onboardForm, setOnboardForm] = useState({
    name: "Campus Bike Express",
    owner: "Vikram Joshi",
    email: "vikram@campusexpress.in",
    phone: "+91 98999 11223",
    category: "ride" as CategoryId,
    plan: "PAID",
  });

  // Sync state to localStorage
  useEffect(() => {
    saveState(store);
  }, [store]);

  // Subscribe to live Firebase Authentication state changes
  useEffect(() => {
    const unsubscribe = onFirebaseAuthStateChanged((fbUser) => {
      if (fbUser) {
        setStore((prev) => ({
          ...prev,
          currentUser: {
            ...prev.currentUser,
            id: fbUser.uid,
            name: fbUser.displayName || prev.currentUser.name,
            email: fbUser.email || prev.currentUser.email,
            authProvider: "google",
          },
        }));
      }
    });
    return () => unsubscribe();
  }, []);

  const toast = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2800);
  };

  const selectedVendor = useMemo(() => {
    return store.vendors.find((v) => v.id === vendorId) || store.vendors[0];
  }, [store.vendors, vendorId]);

  const selectedBooking = useMemo(() => {
    return store.bookings.find((b) => b.id === selectedBookingId) || store.bookings[0];
  }, [store.bookings, selectedBookingId]);

  const activeConversation = useMemo(() => {
    if (!activeConversationId) return null;
    return store.conversations.find((c) => c.id === activeConversationId) || null;
  }, [store.conversations, activeConversationId]);

  const activeRideBooking = useMemo(() => {
    return store.bookings.find((b) => b.category === "ride" && b.status !== "COMPLETED" && b.status !== "CANCELLED");
  }, [store.bookings]);

  const activeLaundryBooking = useMemo(() => {
    return store.bookings.find((b) => b.category === "laundry" && b.status !== "COMPLETED" && b.status !== "CANCELLED");
  }, [store.bookings]);

  const unreadNotifCount = useMemo(() => {
    return store.notifications.filter((n) => !n.read).length;
  }, [store.notifications]);

  // Fare matrix calculator for bike ride
  const calculatedFare = useMemo(() => {
    const campusWheels = store.vendors.find((v) => v.id === "campus-wheels");
    const matrix = campusWheels?.fareMatrix;
    if (matrix && matrix[pickup] && matrix[pickup][dropoff]) {
      return matrix[pickup][dropoff][passengers] || (passengers === 2 ? 60 : 40);
    }
    return passengers === 2 ? 60 : 40;
  }, [store.vendors, pickup, dropoff, passengers]);

  // Food totals
  const foodItems = selectedVendor.menuItems || [];
  const foodTotal = foodItems.reduce((sum, item) => sum + item.price * (foodQty[item.name] ?? 0), 0);

  const navigate = (next: string) => {
    const aliases: Record<string, string> = {
      "customer-home": "home",
      "customer-marketplace": "marketplace",
      "customer-bookings": "bookings",
      "customer-offers": "offers",
      "customer-messages": "messages",
      "customer-notifications": "notifications",
    };
    // Handle admin sub-navigation
    if (next.startsWith("admin-")) {
      const sub = next.replace("admin-", "");
      setAdminTab(sub);
      setScreen("admin-dashboard");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setScreen(aliases[next] ?? next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const switchRole = (next: Role) => {
    setRole(next);
    let nextUser = store.currentUser;
    if (next === "vendor") {
      nextUser = defaultPilotVendorUser;
      toast("Switched to FreshFold Laundry (Pilot Vendor) session");
    } else if (next === "admin") {
      nextUser = defaultAdminUser;
      setAdminTab("dashboard");
      toast("Switched to Campus Marketplace Administrator session");
    } else {
      nextUser = savedStudentUser;
      toast(`Switched to ${savedStudentUser.name} (Student) session`);
    }
    setStore((prev) => ({ ...prev, currentUser: nextUser, activeRole: next }));
    navigate(next === "customer" ? "home" : `${next}-dashboard`);
  };

  const openCategory = (next: CategoryId) => {
    setCategory(next);
    setFlowStep(0);
    const vendorForCategory = store.vendors.find((v) => v.category === next);
    if (vendorForCategory) setVendorId(vendorForCategory.id);
    navigate("service-select");
  };

  const startFlow = (nextCategory: CategoryId = category) => {
    setCategory(nextCategory);
    setFlowStep(0);
    navigate(`${nextCategory === "ride" ? "bike" : nextCategory}-flow`);
  };

  const changeQuantity = (name: string, delta: number, isFood = false) => {
    const setter = isFood ? setFoodQty : setQuantities;
    setter((curr) => ({ ...curr, [name]: Math.max(0, (curr[name] ?? 0) + delta) }));
  };

  // Chat helper
  const openChatWithVendor = (targetVendor: VendorItem, bookingContext?: BookingItem) => {
    let existing = store.conversations.find((c) => c.vendorId === targetVendor.id && c.customerId === store.currentUser.id);
    if (!existing) {
      existing = {
        id: `conv-${targetVendor.id}-${Date.now()}`,
        bookingId: bookingContext?.id || null,
        customerId: store.currentUser.id,
        customerName: store.currentUser.name,
        vendorId: targetVendor.id,
        vendorName: targetVendor.name,
        serviceType: targetVendor.category,
        serviceTitle: bookingContext?.title || targetVendor.services[0] || targetVendor.name,
        listedPrice: targetVendor.price,
        agreedPrice: null,
        negotiationStatus: "NONE",
        currentOffer: null,
        updatedAt: "Just now",
        messages: [
          {
            id: `msg-sys-${Date.now()}`,
            conversationId: `conv-${targetVendor.id}-${Date.now()}`,
            senderId: "system",
            senderRole: "system",
            senderName: "System",
            timestamp: "Just now",
            type: "TEXT",
            content: `In-platform direct chat connected with ${targetVendor.name}.`,
          },
        ],
      };
      setStore((prev) => ({
        ...prev,
        conversations: [existing!, ...prev.conversations],
      }));
    }
    setActiveConversationId(existing.id);
  };

  const handleSendMessage = (conversationId: string, content: string) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const isCustomer = role === "customer";
    const newMessage: any = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: store.currentUser.id,
      senderRole: isCustomer ? "customer" : "vendor",
      senderName: store.currentUser.name,
      timestamp: timeNow,
      type: "TEXT",
      content,
    };

    setStore((prev) => {
      const updatedConversations = prev.conversations.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            updatedAt: "Just now",
            messages: [...c.messages, newMessage],
          };
        }
        return c;
      });
      return { ...prev, conversations: updatedConversations };
    });
  };

  const handleSendOffer = (conversationId: string, offerAmount: number, note?: string) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newOfferMessage: any = {
      id: `msg-offer-${Date.now()}`,
      conversationId,
      senderId: store.currentUser.id,
      senderRole: "customer",
      senderName: store.currentUser.name,
      timestamp: timeNow,
      type: "OFFER",
      content: note || `Student submitted offer: ₹${offerAmount}`,
      offerAmount,
    };

    setStore((prev) => {
      const updated = prev.conversations.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            negotiationStatus: "OFFER_MADE" as const,
            currentOffer: { by: "customer" as const, amount: offerAmount, note },
            messages: [...c.messages, newOfferMessage],
          };
        }
        return c;
      });
      // Also add in-app notification for vendor
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        userId: "vendor",
        title: "New Price Offer Received",
        message: `${store.currentUser.name} offered ₹${offerAmount} on service.`,
        timestamp: "Just now",
        read: false,
        category: "chat",
        targetType: "chat",
        targetId: conversationId,
      };
      return { ...prev, conversations: updated, notifications: [newNotif, ...prev.notifications] };
    });
    toast(`Offer of ₹${offerAmount} sent to vendor!`);
  };

  const handleRespondOffer = (conversationId: string, action: "ACCEPT" | "REJECT" | "COUNTER", counterAmount?: number) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setStore((prev) => {
      const conv = prev.conversations.find((c) => c.id === conversationId);
      if (!conv) return prev;

      let msg: any;
      let newAgreedPrice = conv.agreedPrice;
      let newStatus = conv.negotiationStatus;

      if (action === "ACCEPT") {
        const finalPrice = counterAmount || conv.currentOffer?.amount || 175;
        newAgreedPrice = finalPrice;
        newStatus = "AGREED";
        msg = {
          id: `msg-acc-${Date.now()}`,
          conversationId,
          senderId: store.currentUser.id,
          senderRole: role === "customer" ? "customer" : "vendor",
          senderName: store.currentUser.name,
          timestamp: timeNow,
          type: "OFFER_ACCEPTED",
          content: `Offer of ₹${finalPrice} accepted! Agreed price is stored.`,
          offerAmount: finalPrice,
        };

        // If there's an associated booking, update the booking's agreedPrice & finalPrice!
        const updatedBookings = prev.bookings.map((b) => {
          if (b.id === conv.bookingId || b.conversationId === conv.id) {
            return {
              ...b,
              agreedPrice: `₹${finalPrice} (Negotiated)`,
              finalPrice: `₹${finalPrice}`,
              statusHistory: [
                ...b.statusHistory,
                { status: b.status, changedAt: timeNow, changedBy: store.currentUser.name, note: `Price agreed at ₹${finalPrice}` },
              ],
            };
          }
          return b;
        });

        const updatedConversations = prev.conversations.map((c) => {
          if (c.id === conversationId) {
            return {
              ...c,
              agreedPrice: newAgreedPrice,
              negotiationStatus: newStatus,
              currentOffer: null,
              messages: [
                ...c.messages,
                msg,
                {
                  id: `msg-sys-${Date.now()}`,
                  conversationId,
                  senderId: "system",
                  senderRole: "system",
                  senderName: "System",
                  timestamp: timeNow,
                  type: "SYSTEM_STATUS",
                  content: `Agreed Price locked at ₹${finalPrice}. Payment is collected directly at service delivery.`,
                },
              ],
            };
          }
          return c;
        });

        toast(`🎉 Deal locked at ₹${finalPrice}!`);
        return { ...prev, bookings: updatedBookings, conversations: updatedConversations };
      } else if (action === "COUNTER") {
        newStatus = "COUNTER_OFFERED";
        msg = {
          id: `msg-cnt-${Date.now()}`,
          conversationId,
          senderId: store.currentUser.id,
          senderRole: role === "customer" ? "customer" : "vendor",
          senderName: store.currentUser.name,
          timestamp: timeNow,
          type: "COUNTER_OFFER",
          content: `Counter-offer: ₹${counterAmount}`,
          offerAmount: counterAmount,
        };
      } else {
        newStatus = "REJECTED";
        msg = {
          id: `msg-rej-${Date.now()}`,
          conversationId,
          senderId: store.currentUser.id,
          senderRole: role === "customer" ? "customer" : "vendor",
          senderName: store.currentUser.name,
          timestamp: timeNow,
          type: "OFFER_REJECTED",
          content: "Offer was declined.",
        };
      }

      const updatedConversations = prev.conversations.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            negotiationStatus: newStatus,
            currentOffer: action === "COUNTER" ? { by: "vendor" as const, amount: counterAmount || 0 } : null,
            messages: [...c.messages, msg],
          };
        }
        return c;
      });

      return { ...prev, conversations: updatedConversations };
    });
  };

  // Booking submissions
  const handleBikeSubmit = () => {
    const newId = `CCM-R-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking: BookingItem = {
      id: newId,
      customerId: store.currentUser.id,
      customerName: store.currentUser.name,
      customerPhone: store.currentUser.phone,
      hostel: store.currentUser.hostel,
      roomNumber: store.currentUser.roomNumber,
      vendorId: "campus-wheels",
      vendorName: "Campus Wheels",
      category: "ride",
      title: "Campus Bike Ride",
      summary: `${pickup} → ${dropoff} (${passengers} passenger${passengers > 1 ? "s" : ""})`,
      status: "REQUESTED",
      listedPrice: `₹${calculatedFare}`,
      finalPrice: `₹${calculatedFare}`,
      paymentNotice: "Payment is collected directly by the rider.",
      date: `${date}, ${time}`,
      time,
      bookingData: { pickup, dropoff, passengers, scheduledTime: time },
      statusHistory: [
        { status: "REQUESTED", changedAt: "Just now", changedBy: store.currentUser.name, note: "Request submitted" },
      ],
      createdAt: new Date().toISOString(),
    };

    setStore((prev) => ({
      ...prev,
      bookings: [newBooking, ...prev.bookings],
      notifications: [
        {
          id: `notif-${Date.now()}`,
          userId: store.currentUser.id,
          title: "Ride Request Submitted",
          message: `Your ride from ${pickup} to ${dropoff} was received by Campus Wheels.`,
          timestamp: "Just now",
          read: false,
          category: "booking",
          targetType: "booking",
          targetId: newId,
        },
        ...prev.notifications,
      ],
    }));
    setSelectedBookingId(newId);
    setModal("");
    toast("Bike ride requested successfully!");
    navigate("confirmation");
  };

  const handleLaundrySubmit = (withNegotiation = false) => {
    const newId = `CCM-L-${Math.floor(1000 + Math.random() * 9000)}`;
    const totalItems = Object.values(quantities).reduce((a, b) => a + b, 0);
    const weightEst = Math.max(1, +(totalItems * 0.35).toFixed(1));
    const baseRate = service === "Wash Only" ? 60 : service === "Iron Only" ? 40 : 80;
    const fee = service === "Wash + Iron" ? 30 : 20;
    const estimatedTotal = Math.round(weightEst * baseRate + fee);

    const newBooking: BookingItem = {
      id: newId,
      customerId: store.currentUser.id,
      customerName: store.currentUser.name,
      customerPhone: store.currentUser.phone,
      hostel: store.currentUser.hostel,
      roomNumber: store.currentUser.roomNumber,
      vendorId: "fresh-fold",
      vendorName: "FreshFold Laundry",
      category: "laundry",
      title: `${service} (Pilot Laundry)`,
      summary: `${totalItems} clothing items · ${store.currentUser.hostel} ${store.currentUser.roomNumber}`,
      status: "REQUESTED",
      listedPrice: `₹${estimatedTotal}`,
      finalPrice: `₹${estimatedTotal}`,
      paymentNotice: "Payment is collected directly by FreshFold upon return.",
      date: "Today, Just now",
      time: "Pickup today",
      bookingData: {
        serviceType: service,
        quantities,
        weightKg: weightEst,
        bagPhoto: photoUploaded,
        photoUrl: photoPreviewUrl || null,
        pickupHostel: store.currentUser.hostel,
        pickupRoom: store.currentUser.roomNumber,
      },
      statusHistory: [
        { status: "REQUESTED", changedAt: "Just now", changedBy: store.currentUser.name, note: "Laundry request submitted" },
      ],
      createdAt: new Date().toISOString(),
    };

    setStore((prev) => ({
      ...prev,
      bookings: [newBooking, ...prev.bookings],
      notifications: [
        {
          id: `notif-${Date.now()}`,
          userId: store.currentUser.id,
          title: "Laundry Request Submitted",
          message: `FreshFold received your pickup request for ${store.currentUser.hostel} ${store.currentUser.roomNumber}.`,
          timestamp: "Just now",
          read: false,
          category: "booking",
          targetType: "booking",
          targetId: newId,
        },
        ...prev.notifications,
      ],
    }));

    setSelectedBookingId(newId);
    setModal("");

    if (withNegotiation) {
      toast("Request created! Starting direct negotiation chat with Rahul Verma...");
      openChatWithVendor(selectedVendor, newBooking);
    } else {
      toast("Laundry request submitted!");
      navigate("confirmation");
    }
  };

  const handleFoodSubmit = () => {
    const newId = `CCM-F-${Math.floor(1000 + Math.random() * 9000)}`;
    const activeItems = Object.entries(foodQty)
      .filter(([_, q]) => q > 0)
      .map(([name, quantity]) => ({ name, quantity }));

    const newBooking: BookingItem = {
      id: newId,
      customerId: store.currentUser.id,
      customerName: store.currentUser.name,
      customerPhone: store.currentUser.phone,
      hostel: store.currentUser.hostel,
      roomNumber: store.currentUser.roomNumber,
      vendorId: selectedVendor.id,
      vendorName: selectedVendor.name,
      category: "food",
      title: `${selectedVendor.name} Order`,
      summary: activeItems.map((i) => `${i.quantity}× ${i.name}`).join(", "),
      status: "RECEIVED",
      listedPrice: `₹${foodTotal}`,
      finalPrice: `₹${foodTotal}`,
      paymentNotice: "Payment is collected directly at delivery point.",
      date: "Today, Just now",
      bookingData: {
        items: activeItems,
        collectionPoint: foodCollectionPoint,
        dietary: selectedVendor.dietaryClassification,
      },
      statusHistory: [
        { status: "RECEIVED", changedAt: "Just now", changedBy: store.currentUser.name, note: "Order placed" },
      ],
      createdAt: new Date().toISOString(),
    };

    setStore((prev) => ({
      ...prev,
      bookings: [newBooking, ...prev.bookings],
      notifications: [
        {
          id: `notif-${Date.now()}`,
          userId: store.currentUser.id,
          title: "Food Order Received",
          message: `${selectedVendor.name} received your order of ₹${foodTotal}.`,
          timestamp: "Just now",
          read: false,
          category: "booking",
          targetType: "booking",
          targetId: newId,
        },
        ...prev.notifications,
      ],
    }));

    setSelectedBookingId(newId);
    setModal("");
    toast("Food order placed successfully!");
    navigate("confirmation");
  };

  const handleAssignRider = (bookingId: string, rider: Rider) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setStore((prev) => {
      const updated = prev.bookings.map((b) => {
        if (b.id === bookingId) {
          return {
            ...b,
            status: "ASSIGNED" as BookingStatus,
            rider,
            statusHistory: [
              ...b.statusHistory,
              { status: "ASSIGNED" as BookingStatus, changedAt: timeNow, changedBy: store.currentUser.name, note: `Rider ${rider.name} assigned` },
            ],
          };
        }
        return b;
      });

      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        userId: "customer",
        title: "Rider Assigned",
        message: `${rider.name} (${rider.vehicleIdentifier}) assigned to ride ${bookingId}.`,
        timestamp: "Just now",
        read: false,
        category: "booking",
        targetType: "booking",
        targetId: bookingId,
      };

      return { ...prev, bookings: updated, notifications: [newNotif, ...prev.notifications] };
    });
    toast(`Rider ${rider.name} assigned to ${bookingId}!`);
  };

  const handleUpdateStatus = (bookingId: string, nextStatus: BookingStatus) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setStore((prev) => {
      const updated = prev.bookings.map((b) => {
        if (b.id === bookingId) {
          return {
            ...b,
            status: nextStatus,
            statusHistory: [
              ...b.statusHistory,
              { status: nextStatus, changedAt: timeNow, changedBy: store.currentUser.name, note: `Status updated to ${nextStatus}` },
            ],
          };
        }
        return b;
      });

      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        userId: "customer",
        title: `Service Status: ${nextStatus}`,
        message: `Booking ${bookingId} has progressed to ${nextStatus}.`,
        timestamp: "Just now",
        read: false,
        category: "booking",
        targetType: "booking",
        targetId: bookingId,
      };

      return { ...prev, bookings: updated, notifications: [newNotif, ...prev.notifications] };
    });
    toast(`Status updated to ${nextStatus}`);
  };

  // Filter vendors (shared by Home search + Marketplace tabs/filters)
  // Marketplace tabs only apply when screen === "marketplace" so Home stays unfiltered.
  const isMarketplaceScreen = screen === "marketplace";
  const filteredVendors = useMemo(() => {
    return store.vendors.filter((v) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        v.name.toLowerCase().includes(q) ||
        v.tags.some((t) => t.toLowerCase().includes(q)) ||
        v.area.toLowerCase().includes(q);
      // Veg-only applies to food services only (Marketplace Food tab).
      const vegFilterActive = vegOnlyFilter && isMarketplaceScreen && marketplaceTab === "Food";
      const matchesDietary = !vegFilterActive || v.dietaryClassification === "VEG_ONLY" || v.category !== "food";
      const matchesVerified = !verifiedOnlyFilter || v.verified;
      const matchesNegotiable = !negotiableOnlyFilter || v.negotiationEnabled;
      // Tab filter applies in marketplace view only
      const matchesTab =
        !isMarketplaceScreen ||
        marketplaceTab === "All" ||
        (marketplaceTab === "Bike Ride" && v.category === "ride") ||
        (marketplaceTab === "Laundry" && v.category === "laundry") ||
        (marketplaceTab === "Food" && v.category === "food");
      return matchesSearch && matchesDietary && matchesVerified && matchesNegotiable && matchesTab;
    });
  }, [store.vendors, search, vegOnlyFilter, verifiedOnlyFilter, negotiableOnlyFilter, marketplaceTab, isMarketplaceScreen]);

  // Render Screens
  const renderHome = () => (
    <main>
      <section className="hero">
        <div className="hero-glow one" />
        <div className="hero-glow two" />
        <div className="hero-content">
          <div className="eyebrow"><span /> Campus Commerce Marketplace</div>
          <div className="hero-title">
            Campus services,<br /><em>centralized & trusted.</em>
          </div>
          <div className="hero-copy">
            Discover verified campus businesses, browse persistent service catalogues, chat directly with sellers, bargain where allowed, and track live status. Zero payment gateway middleman.
          </div>
          <div className="search-box">
            <Icon name="search" size={22} />
            <input
              aria-label="Search the marketplace"
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search laundry, bike rides, meals, snacks..."
              value={search}
            />
            <Button className="search-button" onClick={() => navigate("marketplace")}>
              Search
            </Button>
          </div>
          <div className="trust-row">
            <span><b>✓</b> Admin-verified campus businesses</span>
            <span><b>✓</b> Upfront prices & service rules</span>
            <span><b>✓</b> Direct buyer-seller chat & bargaining</span>
            <span><b>✓</b> Payment directly handled by vendor</span>
          </div>
        </div>
      </section>

      {/* Pilot Business Showcase Banner (PRD Section 1, 2, 57, 58) */}
      <div className="page-grid" style={{ paddingTop: 0 }}>
        <div style={{ gridColumn: "1 / -1" }}>
          <div className="pilot-banner">
            <div className="pilot-banner-copy">
              <span className="pilot-badge">Featured Pilot Business · PRD v1.2</span>
              <h3>FreshFold Laundry & Campus Wheels Validation</h3>
              <p>
                Validated against real campus business owner <strong>Rahul Verma</strong>. Discover why WhatsApp groups fail for campus commerce and see the 12-step pilot journey in action.
              </p>
            </div>
            <div className="pilot-banner-actions">
              <button className="button secondary" onClick={() => setModal("pilot-case-study")}>
                📋 View Owner Q&A (10 Qs)
              </button>
              <button className="button" onClick={() => { setCategory("laundry"); startFlow("laundry"); }}>
                🧺 Try Laundry Flow
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="page-grid">
        <div className="main-column">
          <section className="content-section">
            <div className="section-heading">
              <div>
                <div className="section-title">Explore campus services</div>
                <div className="section-subtitle">Categorized for everyday student living</div>
              </div>
              <button className="text-link" onClick={() => navigate("marketplace")}>
                View all <Icon name="arrow" size={17} />
              </button>
            </div>
            <div className="category-grid">
              {categoriesMeta.map((cat) => (
                <button
                  className={`category-card ${cat.className}`}
                  key={cat.id}
                  onClick={() => openCategory(cat.id)}
                >
                  <span className="category-icon">
                    <Icon name={cat.icon} size={27} />
                  </span>
                  <span className="category-copy">
                    <strong>{cat.name}</strong>
                    <small>{cat.description}</small>
                    <b>{cat.detail}</b>
                  </span>
                  <span className="category-arrow"><Icon name="arrow" size={18} /></span>
                </button>
              ))}
            </div>
          </section>

          <section className="content-section vendors-section">
            <div className="section-heading">
              <div>
                <div className="section-title">{search ? "Search results" : "Verified Campus Partners"}</div>
                <div className="section-subtitle">{filteredVendors.length} businesses actively serving campus</div>
              </div>
            </div>
            <div className="vendor-grid">
              {filteredVendors.map((vendor) => (
                <VendorCard
                  key={vendor.id}
                  vendor={vendor}
                  onBook={() => {
                    setVendorId(vendor.id);
                    openCategory(vendor.category);
                  }}
                  onDetails={() => {
                    setVendorId(vendor.id);
                    navigate("vendor-detail");
                  }}
                  onChat={() => openChatWithVendor(vendor)}
                />
              ))}
            </div>
          </section>
        </div>

        <aside className="side-column">
          <div className="side-label">ACTIVE SERVICE STATUS</div>
          {activeLaundryBooking ? (
            <div className="booking-card">
              <div className="booking-top">
                <span className="service-icon laundry"><Icon name="laundry" size={21} /></span>
                <div>
                  <strong>{activeLaundryBooking.title}</strong>
                  <small>{activeLaundryBooking.id}</small>
                </div>
                <StatusBadge value={activeLaundryBooking.status} />
              </div>
              <div className="summary-list compact" style={{ margin: "12px 0" }}>
                <div><span>Vendor</span><strong>{activeLaundryBooking.vendorName}</strong></div>
                <div><span>Agreed Price</span><strong>{activeLaundryBooking.agreedPrice || activeLaundryBooking.finalPrice}</strong></div>
                <div><span>Hostel</span><strong>{activeLaundryBooking.hostel} · {activeLaundryBooking.roomNumber}</strong></div>
              </div>
              <div className="booking-progress">
                <div className="progress-label">
                  <span>Current Step: {activeLaundryBooking.status}</span>
                  <strong>Live</strong>
                </div>
                <div className="progress-track">
                  <span
                    style={{
                      width:
                        activeLaundryBooking.status === "COMPLETED"
                          ? "100%"
                          : activeLaundryBooking.status === "READY"
                          ? "85%"
                          : activeLaundryBooking.status === "PROCESSING"
                          ? "60%"
                          : "30%",
                    }}
                  />
                </div>
              </div>
              <div className="booking-card-actions">
                <Button className="secondary" onClick={() => openChatWithVendor(store.vendors[0], activeLaundryBooking)}>
                  <Icon name="chat" size={14} /> Chat / Bargain
                </Button>
                <Button onClick={() => { setSelectedBookingId(activeLaundryBooking.id); navigate("booking-detail"); }}>
                  View details
                </Button>
              </div>
            </div>
          ) : activeRideBooking ? (
            <div className="booking-card">
              <div className="booking-top">
                <span className="service-icon ride"><Icon name="bike" size={21} /></span>
                <div>
                  <strong>{activeRideBooking.title}</strong>
                  <small>{activeRideBooking.id}</small>
                </div>
                <StatusBadge value={activeRideBooking.status} />
              </div>
              <div className="route">
                <div className="route-line"><span className="route-dot start" /><i /></div>
                <div className="route-content">
                  <small>PICKUP</small>
                  <strong>{activeRideBooking.bookingData?.pickup}</strong>
                  <small>DROP-OFF</small>
                  <strong>{activeRideBooking.bookingData?.dropoff}</strong>
                </div>
              </div>
              {activeRideBooking.rider && (
                <div className="rider">
                  <span className="rider-avatar">RD</span>
                  <div>
                    <small>Assigned Rider</small>
                    <strong>{activeRideBooking.rider.name} · {activeRideBooking.rider.vehicleIdentifier}</strong>
                  </div>
                </div>
              )}
              <div className="booking-card-actions">
                <Button className="secondary" onClick={() => openChatWithVendor(store.vendors.find((v) => v.id === activeRideBooking.vendorId) || store.vendors[1] || store.vendors[0], activeRideBooking)}>
                  <Icon name="chat" size={14} /> Chat
                </Button>
                <Button onClick={() => { setSelectedBookingId(activeRideBooking.id); navigate("booking-detail"); }}>
                  Track ride
                </Button>
              </div>
            </div>
          ) : (
            <div className="booking-card">
              <p>No active service requests right now.</p>
              <Button className="full" onClick={() => navigate("marketplace")}>Browse services</Button>
            </div>
          )}

          <div className="promo-card">
            <div className="promo-icon"><Icon name="offer" size={22} /></div>
            <div className="promo-copy">
              <small>FEATURED PILOT OFFER</small>
              <strong>Weekend Laundry: ₹60/kg</strong>
              <span>At FreshFold · Fri to Sun pickup</span>
            </div>
            <button aria-label="View offer" onClick={() => setModal("offer-pilot")}><Icon name="chevron" size={18} /></button>
          </div>

          <div className="payment-note">
            <div className="payment-icon">₹</div>
            <div>
              <strong>Vendor-Managed Direct Payment</strong>
              <span>Payment is collected directly by the service provider upon delivery. No payment gateway middleman.</span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );

  const renderMarketplace = () => (
    <main className="page">
      <PageHead
        title="Marketplace Catalogue"
        subtitle="Browse verified campus businesses and structured services"
        action={
          <div className="page-head-actions">
            <Button className="secondary" onClick={() => setModal("pilot-case-study")}>
              📋 Pilot Case Study
            </Button>
            <Button className="secondary" onClick={() => setFilterOpen(true)}>
              <Icon name="filter" size={16} /> Filters
            </Button>
          </div>
        }
      />

      <div className="market-toolbar">
        <div className="market-search">
          <Icon name="search" size={18} />
          <input
            aria-label="Search marketplace"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search services, vendors, or keywords (e.g. laundry, veg, bike)..."
            value={search}
          />
          {search && (
            <button aria-label="Clear search" className="search-clear" onClick={() => setSearch("")} type="button">
              <Icon name="close" size={14} />
            </button>
          )}
        </div>
        <div className="location-context">
          <Icon name="location" size={15} /> Student Hostel: {store.currentUser.hostel} · {store.currentUser.roomNumber}
        </div>
      </div>

      <div aria-label="Marketplace categories" className="tabs" role="tablist">
        {(["All", "Bike Ride", "Laundry", "Food"] as const).map((tab) => (
          <button
            aria-selected={marketplaceTab === tab}
            className={marketplaceTab === tab ? "active" : ""}
            key={tab}
            onClick={() => {
              setMarketplaceTab(tab);
              setSearch("");
              if (tab !== "Food") setVegOnlyFilter(false);
            }}
            role="tab"
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="listing-layout">
        <aside className="filter-panel">
          <div className="panel-title">Filters & Trust</div>
          {marketplaceTab === "Food" && (
            <Toggle
              checked={vegOnlyFilter}
              label="Veg-Only Vendors"
              detail="Show vegetarian food businesses"
              onChange={() => setVegOnlyFilter(!vegOnlyFilter)}
            />
          )}
          <Toggle
            checked={verifiedOnlyFilter}
            label="Admin-Verified Only"
            detail="Verified campus businesses"
            onChange={() => setVerifiedOnlyFilter(!verifiedOnlyFilter)}
          />
          <div style={{ marginTop: 16 }}>
            <div className="panel-title" style={{ fontSize: 12 }}>Bargaining Availability</div>
            <div className="chip-set">
              <button
                className={!negotiableOnlyFilter ? "active" : ""}
                onClick={() => setNegotiableOnlyFilter(false)}
                type="button"
              >
                All
              </button>
              <button
                className={negotiableOnlyFilter ? "active" : ""}
                onClick={() => setNegotiableOnlyFilter(true)}
                type="button"
              >
                Negotiable only
              </button>
            </div>
          </div>
        </aside>

        <div className="vendor-list">
          {filteredVendors.length === 0 ? (
            <div style={{ gridColumn: "1 / -1" }}>
              <EmptyState
                title="No vendors match these filters"
                text={`No ${marketplaceTab === "All" ? "" : `${marketplaceTab} `}vendors found${search ? ` for "${search}"` : ""}. Try a different category or clear filters.`}
                action={
                  <Button
                    className="secondary"
                    onClick={() => {
                      setMarketplaceTab("All");
                      setSearch("");
                      setVegOnlyFilter(false);
                      setNegotiableOnlyFilter(false);
                      setVerifiedOnlyFilter(false);
                    }}
                  >
                    Clear all filters
                  </Button>
                }
              />
            </div>
          ) : (
            filteredVendors.map((vendor) => (
              <VendorCard
                key={vendor.id}
                vendor={vendor}
                onBook={() => {
                  setVendorId(vendor.id);
                  openCategory(vendor.category);
                }}
                onDetails={() => {
                  setVendorId(vendor.id);
                  navigate("vendor-detail");
                }}
                onChat={() => openChatWithVendor(vendor)}
              />
            ))
          )}
        </div>
      </div>
    </main>
  );

  const renderServiceSelect = () => {
    const meta = categoriesMeta.find((c) => c.id === category) || categoriesMeta[0];
    const vendorsInCategory = store.vendors.filter((v) => v.category === category);

    return (
      <main className="page narrow">
        <PageHead back={() => navigate("marketplace")} title={`Select ${meta.name} Option`} subtitle={`${meta.description} · Verified campus providers`} />
        <div className="selection-list">
          {vendorsInCategory.map((v) => (
            <button
              className="selection-card"
              key={v.id}
              onClick={() => {
                setVendorId(v.id);
                startFlow(v.category);
              }}
            >
              <span className={`service-icon ${v.color}`}>
                <Icon name={meta.icon} />
              </span>
              <span>
                <strong>{v.name}</strong>
                <small>{v.description}</small>
                <b>{v.price} · {v.negotiationEnabled ? "Negotiation allowed" : "Fixed matrix fare"}</b>
              </span>
              <Icon name="chevron" />
            </button>
          ))}
        </div>
        <div className="info-note">
          <Icon name="location" /> Service pickup/delivery is restricted to campus boundaries and designated hostels.
        </div>
      </main>
    );
  };

  const renderVendorDetail = () => (
    <main className="page">
      <PageHead
        back={() => navigate("marketplace")}
        title={selectedVendor.name}
        subtitle={`${selectedVendor.type} · ${selectedVendor.status}`}
        action={
          <div style={{ display: "flex", gap: 8 }}>
            <Button className="secondary" onClick={() => openChatWithVendor(selectedVendor)}>
              <Icon name="chat" /> Chat & Bargain
            </Button>
            <Button onClick={() => startFlow(selectedVendor.category)}>
              {selectedVendor.category === "food" ? "View Menu" : "Book Service"}
            </Button>
          </div>
        }
      />

      <div className={`vendor-profile-hero ${selectedVendor.color}`}>
        <div className="vendor-logo large">{selectedVendor.mark}</div>
        <div>
          <div className="page-title">{selectedVendor.name}</div>
          <p>{selectedVendor.description}</p>
          <div className="tag-row" style={{ marginTop: 8 }}>
            {selectedVendor.tags.map((t) => <span key={t}>{t}</span>)}
            {selectedVendor.verified && <span className="verified-badge">✓ Admin Verified</span>}
            {selectedVendor.negotiationEnabled && <span className="tag-negotiable">Bargaining Supported</span>}
          </div>
        </div>
        <StatusBadge value={selectedVendor.status} />
      </div>

      <div className="detail-grid">
        <div className="detail-main">
          <section className="detail-card">
            <div className="panel-title">Business Information & Rules</div>
            <div className="summary-list">
              <div><span>Owner Name</span><strong>{selectedVendor.ownerName}</strong></div>
              <div><span>Service Area</span><strong>{selectedVendor.serviceArea}</strong></div>
              <div><span>Operating Hours</span><strong>{selectedVendor.operatingHours}</strong></div>
              <div><span>Bargaining Policy</span><strong>{selectedVendor.negotiationEnabled ? "Supported (Buyer offer → Seller counter → Agreed price)" : "Disabled (Fare matrix locked)"}</strong></div>
              <div><span>Payment Responsibility</span><strong>Directly handled with vendor at fulfillment</strong></div>
            </div>
          </section>

          {selectedVendor.isPilotBusiness && (
            <section className="detail-card" style={{ background: "#fbfcfb", borderColor: "#a9d5c4" }}>
              <div className="panel-title" style={{ color: "#165846" }}>⭐ Real Owner Validation Insights</div>
              <p>
                Rahul Verma operates FreshFold Laundry. His primary complaints with WhatsApp: buried offers, repeated pricing questions, and unrecorded discounts. Campus Commerce eliminates this with structured cataloguing and persistent agreed quotes.
              </p>
              <button className="text-link" onClick={() => setModal("pilot-case-study")}>
                Read full 10-question validation interview →
              </button>
            </section>
          )}

          {selectedVendor.category === "laundry" && (
            <section className="detail-card">
              <div className="panel-title">Clothing Rules & Restrictions</div>
              <div className="clothes-grid">
                {selectedVendor.allowedClothing?.map((item) => (
                  <div key={item} className="clothing">
                    <Icon name="laundry" />
                    <strong>{item}</strong>
                    <small>Accepted</small>
                  </div>
                ))}
                {selectedVendor.restrictedClothing?.map((item) => (
                  <div key={item} className="clothing restricted">
                    <Icon name="close" />
                    <strong>{item}</strong>
                    <small>Restricted</small>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="sticky-card">
          <div className="panel-title">Start a Conversation</div>
          <p>You can chat directly with {selectedVendor.name} to confirm timing, request pickup, or negotiate prices where supported.</p>
          <Button className="full secondary" onClick={() => openChatWithVendor(selectedVendor)}>
            <Icon name="chat" /> Open Chat & Bargain
          </Button>
          <div style={{ marginTop: 12 }}>
            <Button className="full" onClick={() => startFlow(selectedVendor.category)}>
              Proceed to Request Form
            </Button>
          </div>
          <div style={{ marginTop: 16 }}>
            <button
              className="text-link center"
              onClick={() => setReportTarget({ type: "VENDOR", id: selectedVendor.id, name: selectedVendor.name })}
            >
              <Icon name="shield" size={14} /> Report Vendor / Issue
            </button>
          </div>
        </aside>
      </div>
    </main>
  );

  // Bike Request Flow (Campus Wheels)
  const renderBikeFlow = () => {
    const locations = ["Main Gate", "Maple Hostel", "Hostel A", "Hostel B", "Academic Block", "Library", "Market Area"];
    const steps = [
      <>
        <div className="form-title">Pickup Location</div>
        <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>Select your departure campus point.</p>
        <div className="option-grid">
          {locations.map((item) => (
            <button className={pickup === item ? "option active" : "option"} key={item} onClick={() => setPickup(item)}>
              <Icon name="location" />{item}<span>{pickup === item && "✓"}</span>
            </button>
          ))}
        </div>
      </>,
      <>
        <div className="summary-chip">Pickup <strong>{pickup}</strong></div>
        <div className="form-title">Drop-off Destination</div>
        <div className="option-grid">
          {locations.filter((i) => i !== pickup).map((item) => (
            <button className={dropoff === item ? "option active" : "option"} key={item} onClick={() => setDropoff(item)}>
              <Icon name="location" />{item}<span>{dropoff === item && "✓"}</span>
            </button>
          ))}
        </div>
      </>,
      <>
        <div className="form-title">Passenger Count (Strict Max 2 Pax)</div>
        <div className="choice-cards">
          {[1, 2].map((count) => (
            <button className={passengers === count ? "choice active" : "choice"} key={count} onClick={() => setPassengers(count)}>
              <Icon name="users" size={26} />
              <strong>{count} Passenger{count > 1 ? "s" : ""}</strong>
              <small>Campus bike limit: Maximum 2</small>
            </button>
          ))}
        </div>
        <div className="info-note">
          🚲 <strong>Fare Matrix Policy:</strong> Fare is locked at ₹{calculatedFare} based on campus distance. Bargaining is disabled to prevent rider disputes.
        </div>
      </>,
      <>
        <div className="form-title">Schedule & Customer Details</div>
        <div className="two-fields">
          <Field label="Ride Date" onChange={setDate} value={date} />
          <Field label="Time" onChange={setTime} type="time" value={time} />
        </div>
        <div className="two-fields" style={{ marginTop: 12 }}>
          <Field label="Passenger Name" locked value={store.currentUser.name} />
          <Field label="Phone Number" locked value={store.currentUser.phone} />
        </div>
        <div className="price-card">
          <span>Authoritative Fare Matrix</span>
          <strong>₹{calculatedFare}</strong>
          <small>Payment collected directly by rider upon trip completion.</small>
        </div>
      </>,
    ];

    return (
      <main className="page flow-page">
        <PageHead back={() => flowStep ? setFlowStep(flowStep - 1) : navigate("marketplace")} title="Book Campus Bike Ride" subtitle={`Step ${flowStep + 1} of 4 · Campus Wheels`} />
        <div className="step-track"><span style={{ width: `${((flowStep + 1) / 4) * 100}%` }} /></div>
        <div className="flow-card">
          {steps[flowStep]}
          <Button className="full flow-next" onClick={() => flowStep === 3 ? handleBikeSubmit() : setFlowStep(flowStep + 1)}>
            {flowStep === 3 ? "Confirm Ride Request" : "Continue"} <Icon name="arrow" />
          </Button>
        </div>
      </main>
    );
  };

  // Laundry Request Flow (FreshFold - Pilot Business)
  const renderLaundryFlow = () => {
    const services = ["Wash + Iron", "Wash Only", "Iron Only"];
    const clothes = ["Shirt", "T-Shirt", "Pant", "Shorts", "Bedsheet", "Towel"];
    const totalItems = Object.values(quantities).reduce((a, b) => a + b, 0);
    const weightEst = Math.max(1, +(totalItems * 0.35).toFixed(1));
    const baseRate = service === "Wash Only" ? 60 : service === "Iron Only" ? 40 : 80;
    const fee = service === "Wash + Iron" ? 30 : 20;
    const estimatedTotal = Math.round(weightEst * baseRate + fee);

    const steps = [
      <>
        <div className="form-title">Select Laundry Service</div>
        <div className="selection-list compact">
          {services.map((item) => (
            <button className={service === item ? "selection-card active" : "selection-card"} key={item} onClick={() => setService(item)}>
              <span className="service-icon violet"><Icon name="laundry" /></span>
              <span>
                <strong>{item}</strong>
                <small>{item === "Wash + Iron" ? "₹80/kg + ₹30 service fee (Steam iron & fold)" : item === "Wash Only" ? "₹60/kg + ₹20 fee" : "₹40/kg + ₹15 fee"}</small>
              </span>
              <span>{service === item && "✓"}</span>
            </button>
          ))}
        </div>
      </>,
      <>
        <div className="form-title">Garment Quantities & Restricted Rules</div>
        <div className="warning-note">
          ⚠️ <strong>Vendor Rule:</strong> Underwear and heavy blankets are restricted and will not be washed.
        </div>
        {clothes.map((item) => (
          <div key={item} className="quantity-row">
            <span><strong>{item}</strong></span>
            <div className="quantity">
              <button onClick={() => changeQuantity(item, -1)}>−</button>
              <strong>{quantities[item] || 0}</strong>
              <button onClick={() => changeQuantity(item, 1)}>+</button>
            </div>
          </div>
        ))}
        <div className="summary-chip" style={{ marginTop: 14 }}>
          Estimated Total: <strong>{totalItems} garments · ~{weightEst} kg</strong>
        </div>
      </>,
      <>
        <div className="form-title">Laundry Bag Photo (Mandatory Verification)</div>
        <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>
          Attach a picture of your laundry bag to prevent misplaced items (solves the #1 owner annoyance).
        </p>
        {photoUploaded && photoPreviewUrl ? (
          <div className="photo-preview">
            <img src={photoPreviewUrl} alt="Laundry bag" className="bag-photo-img" />
            <div>
              <strong>{photoFile?.name || "laundry_bag_hostel.jpg"}</strong>
              <small>✓ Photo attached · Ready for pickup</small>
            </div>
            <Button className="secondary" onClick={() => {
              setPhotoUploaded(false);
              setPhotoFile(null);
              setPhotoPreviewUrl(null);
            }}>Retake</Button>
          </div>
        ) : (
          <div>
            <label className="upload-box" htmlFor="laundry-photo-input">
              <span><Icon name="upload" size={26} /></span>
              <strong>Tap to take or upload laundry bag photo</strong>
              <small>JPG, PNG, WebP accepted · Direct camera capture or file picker</small>
              <input
                id="laundry-photo-input"
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setPhotoFile(file);
                    const reader = new FileReader();
                    reader.onload = () => {
                      const dataUrl = reader.result as string;
                      setPhotoPreviewUrl(dataUrl);
                      setPhotoUploaded(true);
                      toast("Laundry bag photo attached!");
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
            <div style={{ marginTop: 10, textAlign: "center" }}>
              <button
                type="button"
                className="button tiny secondary"
                onClick={() => {
                  const sampleSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%23e8f4f0"/><circle cx="150" cy="90" r="45" fill="%23176b5b"/><rect x="120" y="130" width="60" height="40" rx="8" fill="%23176b5b"/><text x="150" y="98" font-size="28" text-anchor="middle" fill="white">🧺</text><text x="150" y="185" font-size="12" font-family="sans-serif" text-anchor="middle" fill="%23176b5b" font-weight="bold">HOSTEL LAUNDRY BAG VERIFIED</text></svg>`;
                  setPhotoPreviewUrl(sampleSvg);
                  setPhotoUploaded(true);
                  toast("Sample laundry bag photo loaded!");
                }}
              >
                📸 Use Demo Laundry Bag Photo
              </button>
            </div>
          </div>
        )}
      </>,
      <>
        <div className="form-title">Hostel Pickup & Rate Summary</div>
        <div className="two-fields">
          <Field label="Customer" locked value={store.currentUser.name} />
          <Field label="Phone" locked value={store.currentUser.phone} />
          <Field label="Hostel (Locked by vendor rule)" locked value={store.currentUser.hostel} />
          <Field label="Room Number" locked value={store.currentUser.roomNumber} />
        </div>
        <div className="price-card">
          <span>Estimated Total ({weightEst} kg @ ₹{baseRate}/kg + fee)</span>
          <strong>₹{estimatedTotal}</strong>
          <small>Final exact price confirmed upon physical weighing. Bargaining available!</small>
        </div>
        <div className="info-note">
          🤝 <strong>Bargaining Supported:</strong> You can submit this request at the listed price, or start a negotiation chat with Rahul Verma to agree on a custom discount.
        </div>
      </>,
    ];

    return (
      <main className="page flow-page">
        <PageHead back={() => flowStep ? setFlowStep(flowStep - 1) : navigate("marketplace")} title="FreshFold Laundry Request" subtitle={`Step ${flowStep + 1} of 4 · Pilot Business`} />
        <div className="step-track"><span style={{ width: `${((flowStep + 1) / 4) * 100}%` }} /></div>
        <div className="flow-card">
          {steps[flowStep]}
          {flowStep === 3 ? (
            <div className="button-pair" style={{ marginTop: 22 }}>
              <Button className="secondary" onClick={() => handleLaundrySubmit(true)}>
                <Icon name="chat" /> Submit & Negotiate Price
              </Button>
              <Button onClick={() => handleLaundrySubmit(false)}>
                Confirm at Listed ₹{estimatedTotal}
              </Button>
            </div>
          ) : (
            <Button className="full flow-next" onClick={() => setFlowStep(flowStep + 1)}>
              Continue <Icon name="arrow" />
            </Button>
          )}
        </div>
      </main>
    );
  };

  // Food Request Flow (Green Bowl)
  const renderFoodFlow = () => {
    const steps = [
      <>
        <div className="form-title">Select Menu Items</div>
        <div className="menu-list">
          {foodItems.map((item) => (
            <div className="menu-item" key={item.id}>
              <div className={`food-image ${item.color || "meal-one"}`}>
                <Icon name="food" size={28} />
              </div>
              <div>
                <span className="veg-dot">●</span> <strong>{item.name}</strong>
                <small>{item.description}</small>
                <b>₹{item.price}</b>
              </div>
              <div className="quantity">
                <button onClick={() => changeQuantity(item.name, -1, true)}>−</button>
                <strong>{foodQty[item.name] || 0}</strong>
                <button onClick={() => changeQuantity(item.name, 1, true)}>+</button>
              </div>
            </div>
          ))}
        </div>
      </>,
      <>
        <div className="form-title">Delivery Boundary & Student Details</div>
        <div className="boundary-card">
          <Icon name="location" />
          <div>
            <strong>Vendor Boundary: Gate Delivery Only</strong>
            <small>Green Bowl does not deliver inside hostel room corridors. Order will be handed over at designated gate.</small>
          </div>
        </div>
        <label className="field" style={{ marginTop: 14 }}>
          <span>Select Collection Point</span>
          <select
            className="select-field"
            value={foodCollectionPoint}
            onChange={(e) => setFoodCollectionPoint(e.target.value)}
          >
            {selectedVendor.deliveryBoundaries?.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </label>
        <div className="two-fields" style={{ marginTop: 12 }}>
          <Field label="Student Name" locked value={store.currentUser.name} />
          <Field label="Contact Phone" locked value={store.currentUser.phone} />
        </div>
        <div className="price-card">
          <span>Active Menu Basket Total</span>
          <strong>₹{foodTotal}</strong>
          <small>Direct payment collected at collection point.</small>
        </div>
      </>,
    ];

    return (
      <main className="page flow-page">
        <PageHead back={() => flowStep ? setFlowStep(flowStep - 1) : navigate("marketplace")} title="Order from Green Bowl" subtitle={`Step ${flowStep + 1} of 2`} />
        <div className="step-track"><span style={{ width: `${((flowStep + 1) / 2) * 100}%` }} /></div>
        <div className="flow-card">
          {steps[flowStep]}
          <Button
            className="full flow-next"
            disabled={flowStep === 0 && foodTotal === 0}
            onClick={() => flowStep === 1 ? handleFoodSubmit() : setFlowStep(flowStep + 1)}
          >
            {flowStep === 1 ? "Submit Food Order" : "Review Delivery Point"} <Icon name="arrow" />
          </Button>
        </div>
      </main>
    );
  };

  const renderConfirmation = () => {
    return (
      <main className="page success-page">
        <div className="success-mark"><Icon name="check" size={38} /></div>
        <div className="page-title">Service Request Submitted!</div>
        <p>The vendor has received your request. You can track progress and chat with the seller in real-time.</p>
        <div className="confirmation-id">
          <span>REQUEST ID</span>
          <strong>{selectedBooking?.id}</strong>
          <StatusBadge value={selectedBooking?.status || "REQUESTED"} />
        </div>
        <div className="button-pair" style={{ width: "100%", justifyContent: "center" }}>
          <Button className="secondary" onClick={() => navigate("home")}>Back to Home</Button>
          <Button onClick={() => navigate("booking-detail")}>View Live Status <Icon name="arrow" /></Button>
        </div>
      </main>
    );
  };

  const renderBookings = () => {
    const list = store.bookings.filter((b) => {
      if (bookingTab === "Active") return !["COMPLETED", "CANCELLED"].includes(b.status);
      if (bookingTab === "Completed") return b.status === "COMPLETED";
      if (bookingTab === "Cancelled") return b.status === "CANCELLED";
      return true;
    });

    return (
      <main className="page">
        <PageHead title="My Service Bookings" subtitle="All your campus requests, agreed prices, and live status" />
        <div className="tabs">
          {["All", "Active", "Completed", "Cancelled"].map((tab) => (
            <button key={tab} className={bookingTab === tab ? "active" : ""} onClick={() => setBookingTab(tab)}>
              {tab}
            </button>
          ))}
        </div>
        {list.length ? (
          <div className="booking-list">
            {list.map((booking) => (
              <button
                className="booking-row"
                key={booking.id}
                onClick={() => {
                  setSelectedBookingId(booking.id);
                  navigate("booking-detail");
                }}
              >
                <span className={`service-icon ${booking.category}`}>
                  <Icon name={booking.category === "ride" ? "bike" : booking.category} />
                </span>
                <span className="booking-row-main">
                  <small>{booking.id} · {booking.vendorName}</small>
                  <strong>{booking.title}</strong>
                  <span>{booking.summary}</span>
                </span>
                <span className="booking-row-end">
                  <StatusBadge value={booking.status} />
                  <strong>{booking.agreedPrice || booking.finalPrice}</strong>
                  <Icon name="chevron" />
                </span>
              </button>
            ))}
          </div>
        ) : (
          <EmptyState title="No bookings found" text="Submit a request from the marketplace to see it here." action={<Button onClick={() => navigate("marketplace")}>Browse Marketplace</Button>} />
        )}
      </main>
    );
  };

  const renderBookingDetail = () => {
    if (!selectedBooking) return <main className="page"><p>No booking selected.</p></main>;

    const timeline =
      selectedBooking.category === "ride"
        ? ["REQUESTED", "ASSIGNED", "COMPLETED"]
        : selectedBooking.category === "laundry"
        ? ["REQUESTED", "ACCEPTED", "RECEIVED", "PROCESSING", "READY", "COMPLETED"]
        : ["RECEIVED", "ACCEPTED", "PREPARING", "READY", "COMPLETED"];

    const activeIndex = Math.max(0, timeline.indexOf(selectedBooking.status));

    return (
      <main className="page">
        <PageHead
          back={() => navigate("bookings")}
          title={selectedBooking.title}
          subtitle={`Booking ${selectedBooking.id} · ${selectedBooking.vendorName}`}
          action={<StatusBadge value={selectedBooking.status} />}
        />

        <div className="detail-grid">
          <div className="detail-main">
            <section className="detail-card">
              <div className="panel-title">Service Details</div>
              <div className="summary-list">
                <div><span>Summary</span><strong>{selectedBooking.summary}</strong></div>
                <div><span>Date & Time</span><strong>{selectedBooking.date}</strong></div>
                <div><span>Listed Price</span><strong>{selectedBooking.listedPrice}</strong></div>
                <div><span>Agreed Price</span><strong>{selectedBooking.agreedPrice || selectedBooking.finalPrice}</strong></div>
                <div><span>Payment Method</span><strong>{selectedBooking.paymentNotice}</strong></div>
              </div>
            </section>

            {selectedBooking.rider && (
              <section className="detail-card">
                <div className="panel-title">Assigned Bike Rider</div>
                <div className="rider assigned">
                  <span className="rider-avatar">RD</span>
                  <div>
                    <small>Campus Rider</small>
                    <strong>{selectedBooking.rider.name}</strong>
                    <span>{selectedBooking.rider.phone} · {selectedBooking.rider.vehicleIdentifier}</span>
                  </div>
                </div>
              </section>
            )}

            {/* Laundry Bag Verification Photo */}
            {selectedBooking.category === "laundry" && (
              <section className="detail-card">
                <div className="panel-title">Laundry Bag Verification Photo</div>
                {selectedBooking.bookingData?.photoUrl ? (
                  <div className="bag-photo-card">
                    <img src={selectedBooking.bookingData.photoUrl} alt="Attached Laundry Bag" className="bag-photo-full" />
                    <div className="bag-photo-meta">
                      <span className="verified-badge">✓ Bag Photo Verified</span>
                      <small>Attached during booking to prevent misplaced items</small>
                    </div>
                  </div>
                ) : (
                  <div className="bag-photo-card placeholder">
                    <span style={{ fontSize: 28 }}>🧺</span>
                    <div>
                      <strong>laundry_bag_hostel_verified.jpg</strong>
                      <small>Mandatory photo attachment recorded on file</small>
                    </div>
                  </div>
                )}
              </section>
            )}

            <section className="detail-card">
              <div className="panel-title">Customer & Hostel Information</div>
              <div className="summary-list">
                <div><span>Name</span><strong>{role === "customer" ? store.currentUser.name : selectedBooking.customerName}</strong></div>
                <div><span>Phone</span><strong>{role === "customer" ? store.currentUser.phone : selectedBooking.customerPhone}</strong></div>
                <div><span>Hostel</span><strong>{role === "customer" ? store.currentUser.hostel : selectedBooking.hostel} · Room {role === "customer" ? store.currentUser.roomNumber : selectedBooking.roomNumber}</strong></div>
              </div>
            </section>
          </div>

          <aside className="sticky-card">
            <div className="panel-title">Status Timeline</div>
            <Timeline active={activeIndex} items={timeline} />
            <div className="action-stack" style={{ marginTop: 18 }}>
              <Button
                className="secondary-button full"
                onClick={() => {
                  const targetV = store.vendors.find((v) => v.id === selectedBooking.vendorId) || store.vendors[0];
                  openChatWithVendor(targetV, selectedBooking);
                }}
              >
                <Icon name="chat" /> Open Chat with Seller
              </Button>
              <button
                className="text-link center"
                onClick={() => setReportTarget({ type: "BOOKING", id: selectedBooking.id, name: `${selectedBooking.title} (${selectedBooking.id})` })}
              >
                <Icon name="shield" size={14} /> Report Issue / Dispute
              </button>
            </div>
          </aside>
        </div>
      </main>
    );
  };

  const renderOffers = () => (
    <main className="page">
      <PageHead title="Marketplace Offers" subtitle="Special promotions published directly by verified campus partners" />
      <div className="offer-grid">
        {store.offers.map((offer) => (
          <article className="offer-card" key={offer.id}>
            <div className="offer-art"><Icon name="offer" size={28} /></div>
            <small>{offer.vendorName}</small>
            <div className="panel-title">{offer.title}</div>
            <div className="offer-price">
              <del>₹{offer.originalPrice}</del>
              <strong>₹{offer.offerPrice}</strong>
            </div>
            <p>{offer.description}</p>
            <Button
              className="full"
              onClick={() => {
                const targetVendor = store.vendors.find((v) => v.id === offer.vendorId);
                if (targetVendor) {
                  setVendorId(targetVendor.id);
                  startFlow(targetVendor.category);
                }
              }}
            >
              Book with Offer →
            </Button>
          </article>
        ))}
      </div>
    </main>
  );

  const renderMessages = () => (
    <main className="page narrow">
      <PageHead title="In-Platform Messages & Negotiations" subtitle="Direct conversations and price bargaining records with vendors" />
      {store.conversations.length ? (
        <div className="selection-list">
          {store.conversations.map((conv) => (
            <button
              key={conv.id}
              className="selection-card"
              onClick={() => setActiveConversationId(conv.id)}
            >
              <span className="chat-avatar">{conv.vendorName.slice(0, 2).toUpperCase()}</span>
              <span>
                <strong>{conv.vendorName}</strong>
                <small>{conv.serviceTitle}</small>
                <b>
                  {conv.agreedPrice
                    ? `Agreed: ₹${conv.agreedPrice}`
                    : conv.negotiationStatus === "OFFER_MADE"
                    ? "Pending offer response"
                    : conv.listedPrice}
                </b>
              </span>
              <Icon name="chevron" />
            </button>
          ))}
        </div>
      ) : (
        <EmptyState title="No active chats" text="Start a conversation from any vendor profile." />
      )}
    </main>
  );

  const renderNotifications = () => (
    <main className="page narrow">
      <PageHead
        title="Notifications"
        subtitle="In-app operational alerts and negotiation updates"
        action={
          <button
            className="text-link"
            onClick={() => {
              setStore((prev) => ({
                ...prev,
                notifications: prev.notifications.map((n) => ({ ...n, read: true })),
              }));
              toast("All notifications marked read");
            }}
          >
            Mark all read
          </button>
        }
      />
      <div className="notification-list">
        {store.notifications.map((n) => (
          <button
            key={n.id}
            className={`notification-row ${!n.read ? "unread" : ""}`}
            onClick={() => {
              if (n.targetType === "booking" && n.targetId) {
                setSelectedBookingId(n.targetId);
                navigate("booking-detail");
              } else if (n.targetType === "chat" && n.targetId) {
                setActiveConversationId(n.targetId);
              }
            }}
          >
            <span className="notification-icon">
              <Icon name={n.category === "booking" ? "calendar" : n.category === "chat" ? "chat" : "bell"} />
            </span>
            <span>
              <strong>{n.title}</strong>
              <small>{n.message}</small>
              <b>{n.timestamp}</b>
            </span>
            {!n.read && <i />}
          </button>
        ))}
      </div>
    </main>
  );

  // Vendor Dashboard & Workspace
  const renderVendor = () => {
    const sub = screen.replace("vendor-", "");
    const vendorData = store.vendors.find((v) => v.id === (store.currentUser.vendorId || "fresh-fold")) || store.vendors[0];

    if (sub === "dashboard") {
      return (
        <div className="page workspace-page">
          <PageHead
            title={`Vendor Workspace · ${vendorData.name}`}
            subtitle="Manage requests, configure pricing, chat with students, and assign riders"
            action={<StatusBadge value={vendorData.accessStatus} />}
          />
          <div className="stats-grid">
            <div className="stat-card"><span>Active Requests</span><strong>{store.bookings.filter((b) => b.vendorId === vendorData.id).length}</strong><small>In progress</small></div>
            <div className="stat-card"><span>Agreed Negotiations</span><strong>{store.conversations.filter((c) => c.vendorId === vendorData.id && c.agreedPrice).length}</strong><small>Locked quotes</small></div>
            <div className="stat-card"><span>Active Plan</span><strong>{vendorData.plan}</strong><small>₹{vendorData.monthlyPrice}/mo</small></div>
            <div className="stat-card"><span>Partner Status</span><strong>{vendorData.verified ? "Verified" : "Pending"}</strong><small>Campus operator</small></div>
          </div>

          <section className="table-card" style={{ marginTop: 20 }}>
            <div className="card-head">
              <div className="panel-title">Incoming Customer Requests</div>
              <button className="text-link" onClick={() => navigate("vendor-requests")}>View all</button>
            </div>
            <div className="data-table">
              <div className="table-header">
                <span>ID</span><span>Customer</span><span>Summary</span><span>Price</span><span>Status</span><span>Action</span>
              </div>
              {store.bookings.filter((b) => b.vendorId === vendorData.id).map((b) => (
                <div key={b.id} className="table-row">
                  <span>{b.id}</span>
                  <span>{b.customerName} ({b.hostel})</span>
                  <span>{b.summary}</span>
                  <span>{b.agreedPrice || b.finalPrice}</span>
                  <StatusBadge value={b.status} />
                  <div>
                    {b.category === "ride" && b.status === "REQUESTED" ? (
                      <button className="button tiny" onClick={() => setAssignRiderBooking(b)}>Assign Rider</button>
                    ) : (
                      <button
                        className="button tiny secondary"
                        onClick={() => {
                          const next = b.status === "REQUESTED" || b.status === "RECEIVED" ? "ACCEPTED" : b.status === "ACCEPTED" ? "PROCESSING" : b.status === "PROCESSING" ? "READY" : "COMPLETED";
                          handleUpdateStatus(b.id, next as BookingStatus);
                        }}
                      >
                        Advance
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      );
    }

    if (sub === "requests") {
      return (
        <div className="page workspace-page">
          <PageHead title="Customer Requests & Order Board" subtitle="Advance order status and assign riders" />
          <div className="data-table">
            <div className="table-header">
              <span>ID</span><span>Customer</span><span>Summary</span><span>Price</span><span>Status</span><span>Action</span>
            </div>
            {store.bookings.map((b) => (
              <div key={b.id} className="table-row">
                <span>{b.id}</span>
                <span>{b.customerName} ({b.hostel})</span>
                <span>{b.summary}</span>
                <span>{b.agreedPrice || b.finalPrice}</span>
                <StatusBadge value={b.status} />
                <div style={{ display: "flex", gap: 6 }}>
                  {b.category === "ride" && (
                    <button className="button tiny" onClick={() => setAssignRiderBooking(b)}>Rider</button>
                  )}
                  <button
                    className="button tiny secondary"
                    onClick={() => {
                      const next = b.status === "REQUESTED" || b.status === "RECEIVED" ? "ACCEPTED" : b.status === "ACCEPTED" ? "PROCESSING" : b.status === "PROCESSING" ? "READY" : "COMPLETED";
                      handleUpdateStatus(b.id, next as BookingStatus);
                    }}
                  >
                    Advance
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (sub === "services") {
      return (
        <div className="page workspace-page">
          <PageHead title="Service & Pricing Builder" subtitle="Configure clothing types, fare matrix, and operating hours" />
          <div className="detail-card">
            <div className="panel-title">{vendorData.name} Pricing Engine</div>
            <div className="summary-list">
              <div><span>Service Type</span><strong>{vendorData.type}</strong></div>
              <div><span>Base Pricing</span><strong>{vendorData.price}</strong></div>
              <div><span>Operating Hours</span><strong>{vendorData.operatingHours}</strong></div>
              <div><span>Bargaining Allowed</span><strong>{vendorData.negotiationEnabled ? "YES (Student offer → Seller counter → Agreed price)" : "NO (Fixed matrix)"}</strong></div>
            </div>
          </div>
        </div>
      );
    }

    if (sub === "messages") {
      return renderMessages();
    }

    return (
      <div className="page workspace-page">
        <PageHead title="Vendor Account & Subscription" subtitle="Admin-managed subscription and verification state" />
        <div className="detail-card">
          <StatusBadge value={vendorData.accessStatus} />
          <div className="panel-title" style={{ marginTop: 12 }}>Marketplace Subscription</div>
          <div className="summary-list">
            <div><span>Plan</span><strong>{vendorData.plan} Partner Plan</strong></div>
            <div><span>Monthly Fee</span><strong>₹{vendorData.monthlyPrice} / month</strong></div>
            <div><span>Access Validity</span><strong>{vendorData.accessStart} to {vendorData.accessEnd}</strong></div>
            <div><span>Admin Verified</span><strong>{vendorData.verified ? "Yes (Verified Partner)" : "Pending Admin Review"}</strong></div>
          </div>
        </div>
      </div>
    );
  };

  // Admin Portal with full sub-navigation
  const renderAdmin = () => {
    const tab = adminTab;

    const adminNavTabs = [
      { id: "dashboard", label: "Dashboard", icon: "📊" },
      { id: "vendors", label: "Vendors", icon: "🏪" },
      { id: "services", label: "Services", icon: "⚙️" },
      { id: "users", label: "Users", icon: "👥" },
      { id: "bookings", label: "Bookings", icon: "📋" },
      { id: "reports", label: "Reports & Analytics", icon: "📈" },
      { id: "disputes", label: "Disputes & Audit", icon: "🛡️" },
    ];

    let tabContent: ReactNode = null;

    if (tab === "dashboard") {
      tabContent = (
        <div>
          <div className="stats-grid">
            <div className="stat-card"><span>Active Vendors</span><strong>{store.vendors.length}</strong><small>{store.vendors.filter(v => v.verified).length} Verified</small></div>
            <div className="stat-card"><span>Campus Bookings</span><strong>{store.bookings.length}</strong><small>Active transactions</small></div>
            <div className="stat-card"><span>Disputes / Reports</span><strong>{store.reports.length}</strong><small>Audited</small></div>
            <div className="stat-card"><span>Pilot Partner</span><strong>FreshFold</strong><small>Rahul Verma</small></div>
          </div>

          <section className="table-card" style={{ marginTop: 22 }}>
            <div className="card-head">
              <div className="panel-title">Active Campus Vendors</div>
              <button className="text-link" onClick={() => setAdminTab("vendors")}>View all</button>
            </div>
            <div className="data-table">
              <div className="table-header">
                <span>Business</span><span>Owner</span><span>Type</span><span>Verification</span><span>Plan</span><span>Actions</span>
              </div>
              {store.vendors.slice(0, 4).map((v) => (
                <div key={v.id} className="table-row">
                  <span>{v.name} {v.isPilotBusiness && <b style={{ color: "var(--orange)" }}>(Pilot)</b>}</span>
                  <span>{v.ownerName}</span>
                  <span>{v.category}</span>
                  <span>
                    <button
                      className={`button tiny ${v.verified ? "secondary" : ""}`}
                      onClick={() => {
                        setStore((prev) => ({
                          ...prev,
                          vendors: prev.vendors.map((item) => item.id === v.id ? { ...item, verified: !item.verified } : item),
                        }));
                        toast(`${v.name} verification toggled`);
                      }}
                    >
                      {v.verified ? "✓ Verified" : "Unverified"}
                    </button>
                  </span>
                  <span>{v.plan} (₹{v.monthlyPrice})</span>
                  <div>
                    <button className="button tiny secondary" onClick={() => setAdminTab("vendors")}>Manage</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="table-card" style={{ marginTop: 22 }}>
            <div className="card-head">
              <div className="panel-title">Recent Bookings</div>
              <button className="text-link" onClick={() => setAdminTab("bookings")}>View all</button>
            </div>
            <div className="data-table">
              <div className="table-header">
                <span>ID</span><span>Customer</span><span>Vendor</span><span>Type</span><span>Price</span><span>Status</span>
              </div>
              {store.bookings.slice(0, 4).map((b) => (
                <div key={b.id} className="table-row">
                  <span>{b.id}</span>
                  <span>{b.customerName}</span>
                  <span>{b.vendorName}</span>
                  <span>{b.category}</span>
                  <span>{b.agreedPrice || b.finalPrice}</span>
                  <StatusBadge value={b.status} />
                </div>
              ))}
            </div>
          </section>
        </div>
      );
    } else if (tab === "vendors") {
      tabContent = (
        <div>
          <div className="data-table">
            <div className="table-header">
              <span>Business</span><span>Owner</span><span>Type</span><span>Verification</span><span>Plan</span><span>Actions</span>
            </div>
            {store.vendors.map((v) => (
              <div key={v.id} className="table-row">
                <span>{v.name} {v.isPilotBusiness && <b style={{ color: "var(--orange)" }}>(Pilot)</b>}</span>
                <span>{v.ownerName}</span>
                <span>{v.category}</span>
                <span>
                  <button
                    className={`button tiny ${v.verified ? "secondary" : ""}`}
                    onClick={() => {
                      setStore((prev) => ({
                        ...prev,
                        vendors: prev.vendors.map((item) => item.id === v.id ? { ...item, verified: !item.verified } : item),
                      }));
                      toast(`${v.name} verification toggled`);
                    }}
                  >
                    {v.verified ? "✓ Verified" : "Unverified"}
                  </button>
                </span>
                <span>{v.plan} (₹{v.monthlyPrice})</span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="button tiny secondary" onClick={() => toast(`Editing ${v.name}`)}>Edit</button>
                  <button className="button tiny danger-button" onClick={() => {
                    setStore((prev) => ({
                      ...prev,
                      vendors: prev.vendors.map((item) => item.id === v.id ? { ...item, accessStatus: item.accessStatus === "SUSPENDED" ? "ACTIVE" : "SUSPENDED" } : item),
                    }));
                    toast(`${v.name} access toggled`);
                  }}>{v.accessStatus === "SUSPENDED" ? "Activate" : "Suspend"}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    } else if (tab === "services") {
      tabContent = (
        <div>
          <div className="category-admin-grid">
            {categoriesMeta.map((cat) => (
              <div key={cat.id} className={`detail-card ${cat.className}`} style={{ textAlign: "center" }}>
                <div className="category-icon" style={{ margin: "0 auto 13px" }}><Icon name={cat.icon} size={28} /></div>
                <div className="panel-title">{cat.name}</div>
                <p style={{ color: "var(--muted)", fontSize: 11, margin: "6px 0 12px" }}>{cat.description}</p>
                <div className="summary-list" style={{ textAlign: "left" }}>
                  <div><span>Base Price</span><strong>{cat.detail}</strong></div>
                  <div><span>Active Vendors</span><strong>{store.vendors.filter(v => v.category === cat.id).length}</strong></div>
                  <div><span>Active Bookings</span><strong>{store.bookings.filter(b => b.category === cat.id).length}</strong></div>
                </div>
              </div>
            ))}
          </div>
          <section className="table-card" style={{ marginTop: 22 }}>
            <div className="panel-title">Vendor Service Configurations</div>
            <div className="data-table">
              <div className="table-header">
                <span>Vendor</span><span>Category</span><span>Pricing</span><span>Hours</span><span>Negotiation</span><span>Status</span>
              </div>
              {store.vendors.map((v) => (
                <div key={v.id} className="table-row">
                  <span>{v.name}</span>
                  <span>{v.category}</span>
                  <span>{v.price}</span>
                  <span>{v.operatingHours}</span>
                  <span>{v.negotiationEnabled ? "✓ Enabled" : "✗ Disabled"}</span>
                  <StatusBadge value={v.accessStatus} />
                </div>
              ))}
            </div>
          </section>
        </div>
      );
    } else if (tab === "users") {
      const allUsers = [
        { id: store.currentUser.id, name: store.currentUser.name, email: store.currentUser.email, role: "ADMIN", hostel: store.currentUser.hostel, status: "ACTIVE" },
        { id: savedStudentUser.id, name: savedStudentUser.name, email: savedStudentUser.email, role: "CUSTOMER", hostel: savedStudentUser.hostel, status: "ACTIVE" },
        { id: "firebase_usr_rahul_freshfold", name: "Rahul Verma", email: "rahul@freshfold.in", role: "VENDOR_OWNER", hostel: "Vendor Annex", status: "ACTIVE" },
        { id: "firebase_usr_nisha_greenbowl", name: "Nisha Kapoor", email: "nisha@greenbowl.in", role: "VENDOR_OWNER", hostel: "Vendor Annex", status: "ACTIVE" },
        { id: "firebase_usr_amit_wheels", name: "Amit Singh", email: "amit@campuswheels.in", role: "VENDOR_OWNER", hostel: "Vendor Annex", status: "ACTIVE" },
      ];
      tabContent = (
        <div>
          <div className="stats-grid">
            <div className="stat-card"><span>Total Users</span><strong>{allUsers.length}</strong><small>Registered accounts</small></div>
            <div className="stat-card"><span>Students</span><strong>{allUsers.filter(u => u.role === "CUSTOMER").length}</strong><small>Active customers</small></div>
            <div className="stat-card"><span>Vendor Owners</span><strong>{allUsers.filter(u => u.role === "VENDOR_OWNER").length}</strong><small>Business accounts</small></div>
            <div className="stat-card"><span>Admins</span><strong>{allUsers.filter(u => u.role === "ADMIN").length}</strong><small>Platform operators</small></div>
          </div>
          <div className="data-table" style={{ marginTop: 20 }}>
            <div className="table-header">
              <span>Name</span><span>Email</span><span>Role</span><span>Hostel</span><span>Status</span><span>Actions</span>
            </div>
            {allUsers.map((u) => (
              <div key={u.id} className="table-row">
                <span><strong>{u.name}</strong></span>
                <span>{u.email}</span>
                <span><StatusBadge value={u.role.replace("_", " ")} /></span>
                <span>{u.hostel}</span>
                <span><StatusBadge value={u.status} /></span>
                <div>
                  <button className="button tiny secondary" onClick={() => toast(`Viewing ${u.name} profile`)}>View</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    } else if (tab === "bookings") {
      tabContent = (
        <div>
          <div className="stats-grid">
            <div className="stat-card"><span>Total Bookings</span><strong>{store.bookings.length}</strong><small>All time</small></div>
            <div className="stat-card"><span>Active</span><strong>{store.bookings.filter(b => !["COMPLETED", "CANCELLED"].includes(b.status)).length}</strong><small>In progress</small></div>
            <div className="stat-card"><span>Completed</span><strong>{store.bookings.filter(b => b.status === "COMPLETED").length}</strong><small>Fulfilled</small></div>
            <div className="stat-card"><span>Cancelled</span><strong>{store.bookings.filter(b => b.status === "CANCELLED").length}</strong><small>Cancelled</small></div>
          </div>
          <div className="data-table" style={{ marginTop: 20 }}>
            <div className="table-header">
              <span>ID</span><span>Customer</span><span>Vendor</span><span>Category</span><span>Price</span><span>Status</span>
            </div>
            {store.bookings.map((b) => (
              <div key={b.id} className="table-row">
                <span><strong>{b.id}</strong></span>
                <span>{b.customerName} ({b.hostel})</span>
                <span>{b.vendorName}</span>
                <span>{b.category}</span>
                <span>{b.agreedPrice || b.finalPrice}</span>
                <StatusBadge value={b.status} />
              </div>
            ))}
          </div>
        </div>
      );
    } else if (tab === "reports") {
      tabContent = (
        <div>
          <div className="stats-grid">
            <div className="stat-card"><span>Revenue (Est.)</span><strong>₹{store.bookings.reduce((sum, b) => sum + parseInt(b.finalPrice.replace(/[^0-9]/g, "") || "0"), 0)}</strong><small>From all bookings</small></div>
            <div className="stat-card"><span>Avg. Booking Value</span><strong>₹{store.bookings.length ? Math.round(store.bookings.reduce((sum, b) => sum + parseInt(b.finalPrice.replace(/[^0-9]/g, "") || "0"), 0) / store.bookings.length) : 0}</strong><small>Per transaction</small></div>
            <div className="stat-card"><span>Negotiation Rate</span><strong>{store.conversations.filter(c => c.agreedPrice).length}/{store.conversations.length}</strong><small>Deals closed</small></div>
            <div className="stat-card"><span>Active Offers</span><strong>{store.offers.filter(o => o.published).length}</strong><small>Published promotions</small></div>
          </div>
          <section className="table-card" style={{ marginTop: 22 }}>
            <div className="panel-title">Booking Distribution by Category</div>
            <div className="category-admin-grid" style={{ marginTop: 16 }}>
              {categoriesMeta.map(cat => {
                const catBookings = store.bookings.filter(b => b.category === cat.id);
                return (
                  <div key={cat.id} className={`detail-card ${cat.className}`}>
                    <div className="panel-title">{cat.name}</div>
                    <div className="summary-list">
                      <div><span>Total Bookings</span><strong>{catBookings.length}</strong></div>
                      <div><span>Active</span><strong>{catBookings.filter(b => !["COMPLETED","CANCELLED"].includes(b.status)).length}</strong></div>
                      <div><span>Revenue</span><strong>₹{catBookings.reduce((sum, b) => sum + parseInt(b.finalPrice.replace(/[^0-9]/g, "") || "0"), 0)}</strong></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
          <section className="table-card" style={{ marginTop: 22 }}>
            <div className="panel-title">Vendor Performance</div>
            <div className="data-table">
              <div className="table-header">
                <span>Vendor</span><span>Category</span><span>Bookings</span><span>Revenue</span><span>Rating</span><span>Status</span>
              </div>
              {store.vendors.map(v => {
                const vBookings = store.bookings.filter(b => b.vendorId === v.id);
                return (
                  <div key={v.id} className="table-row">
                    <span><strong>{v.name}</strong></span>
                    <span>{v.category}</span>
                    <span>{vBookings.length}</span>
                    <span>₹{vBookings.reduce((sum, b) => sum + parseInt(b.finalPrice.replace(/[^0-9]/g, "") || "0"), 0)}</span>
                    <span>⭐ {v.rating}</span>
                    <StatusBadge value={v.accessStatus} />
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      );
    } else if (tab === "disputes") {
      tabContent = (
        <div>
          <div className="stats-grid">
            <div className="stat-card"><span>Total Reports</span><strong>{store.reports.length}</strong><small>All time</small></div>
            <div className="stat-card"><span>Pending</span><strong>{store.reports.filter(r => r.status === "PENDING").length}</strong><small>Awaiting review</small></div>
            <div className="stat-card"><span>Resolved</span><strong>{store.reports.filter(r => r.status === "RESOLVED").length}</strong><small>Closed cases</small></div>
            <div className="stat-card"><span>Dismissed</span><strong>{store.reports.filter(r => r.status === "DISMISSED").length}</strong><small>No action needed</small></div>
          </div>
          {store.reports.length ? (
            <div className="data-table" style={{ marginTop: 20 }}>
              <div className="table-header">
                <span>Reporter</span><span>Target</span><span>Reason</span><span>Details</span><span>Status</span><span>Actions</span>
              </div>
              {store.reports.map((r) => (
                <div key={r.id} className="table-row">
                  <span>{r.reporterName}</span>
                  <span>{r.targetName}</span>
                  <span>{r.reason}</span>
                  <span style={{ fontSize: 9 }}>{r.details}</span>
                  <StatusBadge value={r.status} />
                  <div style={{ display: "flex", gap: 6 }}>
                    {r.status === "PENDING" && (
                      <>
                        <button className="button tiny" onClick={() => {
                          setStore(prev => ({ ...prev, reports: prev.reports.map(rep => rep.id === r.id ? { ...rep, status: "RESOLVED" } : rep) }));
                          toast(`Report ${r.id} resolved`);
                        }}>Resolve</button>
                        <button className="button tiny danger-button" onClick={() => {
                          setStore(prev => ({ ...prev, reports: prev.reports.map(rep => rep.id === r.id ? { ...rep, status: "DISMISSED" } : rep) }));
                          toast(`Report ${r.id} dismissed`);
                        }}>Dismiss</button>
                      </>
                    )}
                    {r.status !== "PENDING" && <span style={{ color: "var(--muted)", fontSize: 9 }}>Closed</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon="shield" title="No reports filed" text="No customer disputes or vendor complaints have been submitted." />
          )}
        </div>
      );
    } else {
      setAdminTab("dashboard");
      return null;
    }

    return (
      <div className="page workspace-page">
        <PageHead
          title="Marketplace Operations & Administrator Portal"
          subtitle="Vendor onboarding, verification toggles, disputes audit, and platform controls"
          action={
            <Button onClick={() => setModal("admin-onboard")}>+ Onboard New Vendor</Button>
          }
        />
        <div className="admin-subnav-bar">
          {adminNavTabs.map((t) => (
            <button
              key={t.id}
              className={`admin-subnav-btn ${tab === t.id ? "active" : ""}`}
              onClick={() => setAdminTab(t.id)}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>
        {tabContent}
      </div>
    );
  };

  let mainContent: ReactNode;
  if (role === "vendor") mainContent = renderVendor();
  else if (role === "admin") mainContent = renderAdmin();
  else {
    if (screen === "home") mainContent = renderHome();
    else if (screen === "marketplace") mainContent = renderMarketplace();
    else if (screen === "service-select") mainContent = renderServiceSelect();
    else if (screen === "vendor-detail") mainContent = renderVendorDetail();
    else if (screen === "bike-flow") mainContent = renderBikeFlow();
    else if (screen === "laundry-flow") mainContent = renderLaundryFlow();
    else if (screen === "food-flow") mainContent = renderFoodFlow();
    else if (screen === "confirmation") mainContent = renderConfirmation();
    else if (screen === "bookings") mainContent = renderBookings();
    else if (screen === "booking-detail") mainContent = renderBookingDetail();
    else if (screen === "messages") mainContent = renderMessages();
    else if (screen === "offers") mainContent = renderOffers();
    else if (screen === "notifications") mainContent = renderNotifications();
    else mainContent = renderHome();
  }

  const navItems = navByRole[role];

  return (
    <div className="app">
      {/* Top Header */}
      <header className="topbar">
        <button className="brand" onClick={() => navigate(role === "customer" ? "home" : `${role}-dashboard`)}>
          <span className="brand-mark"><Icon name="store" size={22} /></span>
          <span>
            <span className="brand-name">Campus Commerce</span>
            <span className="brand-subtitle">
              {role === "customer" ? "Centralized marketplace for campus businesses" : `${role[0].toUpperCase() + role.slice(1)} workspace`}
            </span>
          </span>
        </button>

        <nav className="desktop-nav" aria-label="Main navigation">
          {navItems.map((item) => {
            const itemKey = item.toLowerCase().replace(/ /g, "-");
            let isActive = false;
            if (role === "admin") {
              isActive = adminTab === itemKey;
            } else if (role === "customer") {
              // Keep parent nav highlighted on marketplace / bookings sub-screens
              // so the underline never disappears mid-flow (consistent navigation).
              const marketplaceScreens = ["marketplace", "service-select", "vendor-detail", "bike-flow", "laundry-flow", "food-flow", "confirmation"];
              const bookingsScreens = ["bookings", "booking-detail"];
              if (item === "Home") isActive = screen === "home";
              else if (item === "Marketplace") isActive = marketplaceScreens.includes(screen);
              else if (item === "Bookings") isActive = bookingsScreens.includes(screen);
              else if (item === "Messages") isActive = screen === "messages";
              else if (item === "Offers") isActive = screen === "offers";
            } else {
              isActive = screen === `${role}-${itemKey}` || screen === itemKey;
            }
            return (
              <button
                aria-current={isActive ? "page" : undefined}
                className={isActive ? "nav-link active" : "nav-link"}
                key={item}
                onClick={() => navigate(`${role}-${itemKey}`)}
              >
                {item}
              </button>
            );
          })}
        </nav>

        <div className="header-actions">
          <button
            className="button tiny secondary"
            onClick={() => setModal("pilot-case-study")}
            title="Read validation interview with Rahul Verma"
          >
            📋 Pilot Case Study
          </button>
          <button
            aria-label="Messages"
            className="icon-button"
            onClick={() => navigate(`${role}-messages`)}
            title="In-Platform Chat & Bargaining"
          >
            <Icon name="chat" />
          </button>
          <button
            aria-label="Notifications"
            className="icon-button"
            onClick={() => navigate(`${role}-notifications`)}
            title="In-App Notifications"
          >
            <Icon name="bell" />
            {unreadNotifCount > 0 && <span className="notification-dot" />}
          </button>
          <button
            className="profile-button"
            onClick={() => setModal("profile-onboard")}
            title="Firebase Authentication Profile"
          >
            <span className="avatar">
              {store.currentUser.name.slice(0, 2).toUpperCase()}
            </span>
            <span className="profile-copy">
              <strong>{store.currentUser.name}</strong>
              <small>{store.currentUser.hostel} · {store.currentUser.roomNumber}</small>
            </span>
            <Icon name="chevron" size={16} />
          </button>
        </div>
      </header>

      {/* Role / Workspace Switcher Bar */}
      <div className="workspace-bar">
        <span>
          Signed in as <strong>{store.currentUser.name}</strong>
        </span>
        <div>
          <button className={role === "customer" ? "active" : ""} onClick={() => switchRole("customer")}>
            🎓 Student View
          </button>
          <button className={role === "vendor" ? "active" : ""} onClick={() => switchRole("vendor")}>
            🧺 Pilot Vendor (FreshFold)
          </button>
          <button className={role === "admin" ? "active" : ""} onClick={() => switchRole("admin")}>
            🛡️ Admin Portal
          </button>
        </div>
      </div>

      {notice && <div className="toast">{notice}</div>}
      {mainContent}

      {/* Mobile Nav */}
      {role === "customer" && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {[
            ["Home", "home", ["home"]],
            ["Marketplace", "store", ["marketplace", "service-select", "vendor-detail", "bike-flow", "laundry-flow", "food-flow", "confirmation"]],
            ["Bookings", "calendar", ["bookings", "booking-detail"]],
            ["Messages", "chat", ["messages"]],
            ["Offers", "offer", ["offers"]],
          ].map(([label, icon, screens]) => (
            <button
              className={(screens as string[]).includes(screen) ? "active" : ""}
              key={label as string}
              onClick={() => navigate(`customer-${(label as string).toLowerCase()}`)}
            >
              <Icon name={icon as IconName} size={20} />
              <span>{label as string}</span>
            </button>
          ))}
        </nav>
      )}

      {/* In-Platform Chat Modal */}
      {activeConversation && (
        <ChatModal
          conversation={activeConversation}
          currentUser={store.currentUser}
          currentRole={role}
          vendor={store.vendors.find((v) => v.id === activeConversation.vendorId)}
          booking={store.bookings.find((b) => b.id === activeConversation.bookingId)}
          onClose={() => setActiveConversationId(null)}
          onSendMessage={handleSendMessage}
          onSendOffer={handleSendOffer}
          onRespondOffer={handleRespondOffer}
        />
      )}

      {/* Pilot Case Study Modal */}
      {modal === "pilot-case-study" && (
        <PilotCaseStudyModal
          onClose={() => setModal("")}
          onLaunchDemoFlow={(cat) => {
            setCategory(cat);
            startFlow(cat);
          }}
        />
      )}

      {/* Profile Onboarding Modal (Firebase Auth) */}
      <ProfileOnboardingModal
        user={store.currentUser}
        currentRole={role}
        isOpen={modal === "profile-onboard"}
        onClose={() => setModal("")}
        onSave={(updated) => {
          setStore((prev) => {
            const updatedUser = { ...prev.currentUser, ...updated };
            if (role === "customer") {
              setSavedStudentUser(updatedUser);
              try {
                localStorage.setItem("ccm_saved_student", JSON.stringify(updatedUser));
              } catch (e) {}
            }
            // Update all customer bookings
            const updatedBookings = prev.bookings.map((b) => {
              if (
                b.customerId === prev.currentUser.id ||
                b.customerId === "firebase_usr_aarav_987" ||
                b.customerName === prev.currentUser.name ||
                role === "customer"
              ) {
                return {
                  ...b,
                  customerId: updatedUser.id,
                  customerName: updatedUser.name,
                  customerPhone: updatedUser.phone,
                  hostel: updatedUser.hostel,
                  roomNumber: updatedUser.roomNumber,
                };
              }
              return b;
            });
            // Update customer conversations
            const updatedConversations = prev.conversations.map((c) => {
              if (
                c.customerId === prev.currentUser.id ||
                c.customerId === "firebase_usr_aarav_987" ||
                c.customerName === prev.currentUser.name ||
                role === "customer"
              ) {
                return {
                  ...c,
                  customerId: updatedUser.id,
                  customerName: updatedUser.name,
                };
              }
              return c;
            });

            return {
              ...prev,
              currentUser: updatedUser,
              bookings: updatedBookings,
              conversations: updatedConversations,
            };
          });
          toast(`Profile saved for ${updated.name || store.currentUser.name}!`);
        }}
        onQuickSwitch={(targetRole) => {
          if (targetRole === "CUSTOMER") {
            setStore((prev) => ({ ...prev, currentUser: savedStudentUser }));
            setRole("customer");
          } else if (targetRole === "VENDOR_OWNER") {
            setStore((prev) => ({ ...prev, currentUser: defaultPilotVendorUser }));
            setRole("vendor");
          } else {
            setStore((prev) => ({ ...prev, currentUser: defaultAdminUser }));
            setRole("admin");
          }
          setModal("");
          toast(`Switched session to ${targetRole}`);
        }}
      />

      {/* Assign Rider Modal */}
      {assignRiderBooking && (
        <AssignRiderModal
          booking={assignRiderBooking}
          availableRiders={store.vendors.find((v) => v.id === "campus-wheels")?.riders || []}
          onClose={() => setAssignRiderBooking(null)}
          onAssign={handleAssignRider}
        />
      )}

      {/* Report Modal */}
      {reportTarget && (
        <ReportModal
          targetType={reportTarget.type}
          targetId={reportTarget.id}
          targetName={reportTarget.name}
          reporterName={store.currentUser.name}
          onClose={() => setReportTarget(null)}
          onSubmit={(reportData) => {
            const newReport: ReportItem = {
              ...reportData,
              id: `rep-${Date.now()}`,
              status: "PENDING",
              createdAt: "Just now",
            };
            setStore((prev) => ({ ...prev, reports: [newReport, ...prev.reports] }));
            toast("Report submitted to Campus Administrator for audit.");
          }}
        />
      )}

      {/* Admin Onboard Vendor Wizard Modal */}
      {modal === "admin-onboard" && (
        <Modal onClose={() => setModal("")} title="Onboard New Campus Business" wide>
          <div className="modal-form two-col">
            <Field
              label="Business Name"
              placeholder="e.g. Campus Bike Express"
              value={onboardForm.name}
              onChange={(val) => setOnboardForm((f) => ({ ...f, name: val }))}
            />
            <Field
              label="Owner Name"
              placeholder="e.g. Vikram Joshi"
              value={onboardForm.owner}
              onChange={(val) => setOnboardForm((f) => ({ ...f, owner: val }))}
            />
            <Field
              label="Email"
              placeholder="vikram@campusexpress.in"
              value={onboardForm.email}
              onChange={(val) => setOnboardForm((f) => ({ ...f, email: val }))}
            />
            <Field
              label="Phone"
              placeholder="+91 98999 11223"
              value={onboardForm.phone}
              onChange={(val) => setOnboardForm((f) => ({ ...f, phone: val }))}
            />
            <label className="field">
              <span>Vendor Category</span>
              <select
                className="select-field"
                value={onboardForm.category}
                onChange={(e) => setOnboardForm((f) => ({ ...f, category: e.target.value as CategoryId }))}
              >
                <option value="ride">BIKE_RIDE</option>
                <option value="laundry">LAUNDRY</option>
                <option value="food">FOOD</option>
              </select>
            </label>
            <label className="field">
              <span>Access Plan</span>
              <select
                className="select-field"
                value={onboardForm.plan}
                onChange={(e) => setOnboardForm((f) => ({ ...f, plan: e.target.value }))}
              >
                <option value="PAID">PAID (₹1,500/mo)</option>
                <option value="FREE">FREE ACCESS (30 Days Trial)</option>
              </select>
            </label>
            <div style={{ gridColumn: "1 / -1" }}>
              <Button
                className="full"
                onClick={() => {
                  const newVendorId = `vendor-${Date.now().toString(36)}`;
                  const newVendorItem: VendorItem = {
                    id: newVendorId,
                    name: onboardForm.name,
                    category: onboardForm.category,
                    type: onboardForm.category === "ride" ? "Bike Ride Service" : onboardForm.category === "laundry" ? "Laundry & Ironing" : "Campus Food & Meals",
                    ownerName: onboardForm.owner,
                    ownerPhone: onboardForm.phone,
                    location: "Campus Central Area",
                    operatingHours: "08:00 AM - 10:00 PM",
                    rating: 5.0,
                    reviewCount: 1,
                    verified: true,
                    accessStatus: "ACTIVE",
                    plan: onboardForm.plan.includes("FREE") ? "FREE_TRIAL" : "PAID",
                    monthlyPrice: onboardForm.plan.includes("FREE") ? 0 : 1500,
                    accessStart: "Today",
                    accessEnd: "In 30 Days",
                    price: onboardForm.category === "ride" ? "From ₹30" : onboardForm.category === "laundry" ? "From ₹60/kg" : "From ₹70",
                    negotiationEnabled: onboardForm.category !== "ride",
                    services: [
                      onboardForm.category === "ride" ? "Campus Bike Ride" : onboardForm.category === "laundry" ? "Wash & Fold" : "Meal Delivery",
                    ],
                    tags: ["Campus Partner", "Admin Verified"],
                  };
                  setStore((prev) => ({
                    ...prev,
                    vendors: [newVendorItem, ...prev.vendors],
                  }));
                  setModal("");
                  setAdminTab("vendors");
                  toast(`🎉 ${onboardForm.name} onboarded successfully!`);
                }}
              >
                Complete Vendor Onboarding →
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Filter Modal — mirrors the desktop filter panel so mobile filtering stays consistent */}
      {filterOpen && (
        <Modal onClose={() => setFilterOpen(false)} title="Filter Services & Preferences">
          <div className="filter-modal">
            {marketplaceTab === "Food" && (
              <>
                <div className="panel-title">Dietary Preference</div>
                <Toggle
                  checked={vegOnlyFilter}
                  label="Veg-Only Businesses"
                  detail="Only show pure-vegetarian campus vendors"
                  onChange={() => setVegOnlyFilter(!vegOnlyFilter)}
                />
              </>
            )}
            <Toggle
              checked={verifiedOnlyFilter}
              label="Admin-Verified Only"
              detail="Verified campus businesses"
              onChange={() => setVerifiedOnlyFilter(!verifiedOnlyFilter)}
            />
            <div className="panel-title" style={{ marginTop: 14 }}>Bargaining Availability</div>
            <div className="chip-set">
              <button className={!negotiableOnlyFilter ? "active" : ""} onClick={() => setNegotiableOnlyFilter(false)} type="button">All Services</button>
              <button className={negotiableOnlyFilter ? "active" : ""} onClick={() => setNegotiableOnlyFilter(true)} type="button">Negotiable Only</button>
            </div>
            <div style={{ marginTop: 18 }}>
              <Button className="full" onClick={() => setFilterOpen(false)}>
                Apply Filters
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Featured Offer Modal */}
      {modal === "offer-pilot" && (
        <Modal onClose={() => setModal("")} title="Weekend Laundry Special">
          <div className="offer-detail">
            <div className="offer-art large"><Icon name="offer" size={36} /></div>
            <div className="page-title">FreshFold Weekend Wash Deal</div>
            <p>Save on wash & steam iron for your hostel laundry. Free collection at all hostels.</p>
            <div className="summary-list">
              <div><span>Vendor</span><strong>FreshFold Laundry (Rahul Verma)</strong></div>
              <div><span>Original Price</span><strong><del>₹80/kg</del></strong></div>
              <div><span>Offer Price</span><strong>₹60/kg</strong></div>
              <div><span>Validity</span><strong>Friday to Sunday</strong></div>
              <div><span>Eligibility</span><strong>All campus ID card holders</strong></div>
            </div>
            <Button
              className="full"
              onClick={() => {
                setModal("");
                setCategory("laundry");
                startFlow("laundry");
              }}
            >
              Use This Offer Now →
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
