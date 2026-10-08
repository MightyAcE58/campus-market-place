/**
 * Shared domain models for Campus Commerce.
 * These types describe every entity the UI renders (vendors, bookings, chats,
 * offers, notifications, reports) and are shared by the mock store, the API
 * layer (`src/api/*`), and all screens in `src/App.tsx`.
 */
export type Role = "customer" | "vendor" | "admin";
export type CategoryId = "ride" | "laundry" | "food";

export type BookingStatus =
  | "REQUESTED"
  | "ASSIGNED"
  | "ACCEPTED"
  | "RECEIVED"
  | "PREPARING"
  | "PROCESSING"
  | "READY"
  | "COMPLETED"
  | "CANCELLED"
  | "ON_THE_WAY";

export type MessageType =
  | "TEXT"
  | "OFFER"
  | "COUNTER_OFFER"
  | "OFFER_ACCEPTED"
  | "OFFER_REJECTED"
  | "SYSTEM_STATUS";

export type AccessStatus = "INVITED" | "ACTIVE" | "TRIAL" | "SUSPENDED" | "EXPIRED" | "REMOVED";
export type AccessPlan = "PAID" | "FREE" | "TRIAL" | "FREE_TRIAL";
export type DietaryClassification = "VEG_ONLY" | "VEG_AND_NON_VEG";

export interface UserProfile {
  id: string; // Firebase UID
  name: string;
  email: string;
  phone: string;
  hostel: string;
  roomNumber: string;
  role: "CUSTOMER" | "VENDOR_OWNER" | "ADMIN";
  isProfileComplete: boolean;
  authProvider: "google" | "firebase" | "demo";
  notificationPreferences?: {
    serviceUpdatesInApp: boolean;
    serviceUpdatesEmail?: boolean;
    promoInApp: boolean;
  };
  vendorId?: string;
  vendorName?: string;
}

export interface Rider {
  id: string;
  name: string;
  phone: string;
  vehicleIdentifier: string;
  active: boolean;
}

export interface VendorItem {
  id: string;
  name: string;
  ownerName: string;
  email: string;
  phone: string;
  type: string;
  category: CategoryId;
  description: string;
  area: string;
  status: string;
  price: string;
  color: string;
  mark: string;
  offer?: string;
  tags: string[];
  services: string[];
  verified: boolean;
  rating: number;
  operatingHours: string;
  serviceArea: string;
  dietaryClassification?: DietaryClassification;
  minimumOrder?: number;
  negotiationEnabled: boolean;
  accessStatus: AccessStatus;
  accessStart: string;
  accessEnd: string;
  plan: AccessPlan;
  monthlyPrice: number;
  isPilotBusiness?: boolean;
  // Optional contact / listing extras (e.g. set by the admin onboarding wizard)
  ownerPhone?: string;
  location?: string;
  reviewCount?: number;
  // Service-specific configurations
  fareMatrix?: Record<string, Record<string, Record<number, number>>>;
  riders?: Rider[];
  allowedClothing?: string[];
  restrictedClothing?: string[];
  serviceTypes?: Array<{ name: string; pricePerKg: number; serviceFee: number }>;
  menuItems?: Array<{
    id: string;
    name: string;
    price: number;
    category: string;
    dietary: "VEG" | "NON_VEG";
    description: string;
    color?: string;
    available: boolean;
  }>;
  deliveryBoundaries?: string[];
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: "customer" | "vendor" | "system";
  senderName: string;
  timestamp: string;
  type: MessageType;
  content: string;
  offerAmount?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Category-specific payload stored on a booking.
 * All fields are optional because each category only fills its own subset:
 * - ride: pickup / dropoff / passengers / scheduledTime
 * - laundry: serviceType / quantities / weightKg / bagPhoto / photoUrl / pickupHostel / pickupRoom
 * - food: items / collectionPoint / dietary
 */
export interface BookingData {
  // Bike ride fields
  pickup?: string;
  dropoff?: string;
  passengers?: number;
  scheduledTime?: string;
  // Laundry fields
  serviceType?: string;
  quantities?: Record<string, number>;
  weightKg?: number;
  bagPhoto?: boolean;
  photoUrl?: string | null;
  pickupHostel?: string;
  pickupRoom?: string;
  // Food fields
  items?: Array<{ name: string; quantity: number; price?: number }>;
  collectionPoint?: string;
  dietary?: DietaryClassification;
}

export interface Conversation {
  id: string;
  bookingId?: string | null;
  customerId: string;
  customerName: string;
  vendorId: string;
  vendorName: string;
  serviceType: CategoryId;
  serviceTitle: string;
  listedPrice: string;
  agreedPrice?: number | null;
  negotiationStatus: "NONE" | "OFFER_MADE" | "COUNTER_OFFERED" | "AGREED" | "REJECTED";
  currentOffer?: {
    by: "customer" | "vendor";
    amount: number;
    note?: string;
  } | null;
  messages: ChatMessage[];
  updatedAt: string;
}

export interface BookingItem {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  hostel: string;
  roomNumber: string;
  vendorId: string;
  vendorName: string;
  category: CategoryId;
  title: string;
  summary: string;
  status: BookingStatus;
  listedPrice: string;
  agreedPrice?: string;
  finalPrice: string;
  paymentNotice: string;
  date: string;
  time?: string;
  rider?: Rider | null;
  bookingData?: BookingData;
  conversationId?: string;
  statusHistory: Array<{
    status: BookingStatus;
    changedAt: string;
    changedBy: string;
    note?: string;
  }>;
  createdAt: string;
}

export interface OfferItem {
  id: string;
  vendorId: string;
  vendorName: string;
  title: string;
  description: string;
  applicableItem: string;
  originalPrice: number;
  offerPrice: number;
  startAt: string;
  endAt: string;
  validity: string;
  eligibility: string;
  location: string;
  published: boolean;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category: "booking" | "chat" | "offer" | "account";
  targetType?: "booking" | "chat" | "offer";
  targetId?: string;
}

export interface ReportItem {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: "VENDOR" | "BOOKING";
  targetId: string;
  targetName: string;
  reason: string;
  details: string;
  status: "PENDING" | "RESOLVED" | "DISMISSED";
  createdAt: string;
}
