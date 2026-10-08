import { prisma } from "../db/prisma.js";
import { AppError } from "../utils/errors.js";
import { BookingStatus, Role, VendorType, AccessStatus } from "@prisma/client";
import { notificationService } from "../notifications/notification.service.js";
import { logAudit } from "../utils/audit.js";

// Valid status transitions per service type
const RIDE_TRANSITIONS: Record<string, string[]> = {
  REQUESTED: ["ASSIGNED", "CANCELLED"],
  ASSIGNED: ["ON_THE_WAY", "COMPLETED", "CANCELLED"],
  ON_THE_WAY: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

const LAUNDRY_TRANSITIONS: Record<string, string[]> = {
  REQUESTED: ["ACCEPTED", "CANCELLED"],
  ACCEPTED: ["RECEIVED", "CANCELLED"],
  RECEIVED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["READY", "CANCELLED"],
  READY: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

const FOOD_TRANSITIONS: Record<string, string[]> = {
  RECEIVED: ["ACCEPTED", "CANCELLED"],
  ACCEPTED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

export class BookingService {
  /**
   * Authoritative Ride Quote Calculation
   * Checks preconfigured fare matrix or standard campus distance rule.
   */
  async calculateRideQuote(params: {
    serviceId?: string;
    pickup: string;
    dropoff: string;
    passengers: number;
  }): Promise<{ quotedFare: number; currency: string; breakdown: Record<string, unknown> }> {
    const { serviceId, pickup, dropoff, passengers } = params;

    if (passengers > 2) {
      throw new AppError(
        "INVALID_PASSENGER_COUNT",
        "A maximum of 2 passengers is permitted for bike rides.",
        400
      );
    }

    if (pickup === dropoff) {
      throw new AppError(
        "INVALID_LOCATION",
        "Pickup and drop-off locations cannot be identical.",
        400
      );
    }

    // Default campus fare matrix lookup
    let fare = 40; // Base fare for 1 passenger within campus
    if (passengers === 2) {
      fare = 60; // Base fare for 2 passengers
    }

    if (serviceId) {
      const customRule = await prisma.rideFareRule.findFirst({
        where: {
          serviceId,
          pickupLocation: pickup,
          dropoffLocation: dropoff,
          passengerCount: passengers,
        },
      });
      if (customRule) {
        fare = customRule.fare;
      }
    }

    return {
      quotedFare: fare,
      currency: "INR",
      breakdown: {
        baseFare: fare,
        passengers,
        pickup,
        dropoff,
      },
    };
  }

  /**
   * Create Bike Ride Booking
   */
  async createRideBooking(
    customerId: string,
    data: {
      serviceId: string;
      pickup: string;
      dropoff: string;
      date: string;
      time: string;
      passengers: number;
      idempotencyKey?: string;
    }
  ) {
    if (data.passengers > 2) {
      throw new AppError("INVALID_PASSENGER_COUNT", "Maximum 2 passengers permitted.", 400);
    }

    // 1. Check idempotency
    if (data.idempotencyKey) {
      const existing = await prisma.booking.findUnique({
        where: { idempotencyKey: data.idempotencyKey },
        include: { rider: true, vendor: true, service: true },
      });
      if (existing) {
        return existing;
      }
    }

    // 2. Fetch customer profile
    const customer = await prisma.user.findUnique({
      where: { id: customerId },
    });
    if (!customer) throw new AppError("NOT_FOUND", "Customer not found.", 404);

    // 3. Fetch service & vendor
    const service = await prisma.vendorService.findUnique({
      where: { id: data.serviceId },
      include: { vendor: true },
    });
    if (!service || !service.active) {
      throw new AppError("SERVICE_NOT_AVAILABLE", "Service is not currently available.", 400);
    }
    if (service.vendor.accessStatus !== AccessStatus.ACTIVE && service.vendor.accessStatus !== AccessStatus.TRIAL) {
      throw new AppError("SERVICE_NOT_AVAILABLE", "Vendor is currently inactive.", 400);
    }

    // 4. Server-side quote
    const quote = await this.calculateRideQuote({
      serviceId: service.id,
      pickup: data.pickup,
      dropoff: data.dropoff,
      passengers: data.passengers,
    });

    const bookingId = `CCM-R-${Math.floor(1000 + Math.random() * 9000)}`;

    // 5. Database transaction
    const booking = await prisma.$transaction(async (tx) => {
      const created = await tx.booking.create({
        data: {
          id: bookingId,
          customerId,
          vendorId: service.vendorId,
          serviceId: service.id,
          serviceType: VendorType.BIKE_RIDE,
          status: BookingStatus.REQUESTED,
          quotedPrice: quote.quotedFare,
          currency: "INR",
          summary: `${data.pickup} → ${data.dropoff}`,
          idempotencyKey: data.idempotencyKey,
          bookingData: {
            pickup: data.pickup,
            dropoff: data.dropoff,
            date: data.date,
            time: data.time,
            passengers: data.passengers,
            customerName: customer.name,
            customerPhone: customer.phone,
          },
        },
      });

      await tx.bookingStatusHistory.create({
        data: {
          bookingId: created.id,
          oldStatus: null,
          newStatus: BookingStatus.REQUESTED,
          changedBy: customerId,
          metadata: { initial: true },
        },
      });

      return created;
    });

    // 6. Notify vendor & customer
    await notificationService.sendNotification({
      userId: service.vendor.ownerId || service.vendorId,
      type: "NEW_RIDE_REQUEST",
      title: "New Ride Request",
      message: `New booking ${booking.id} from ${data.pickup} to ${data.dropoff}`,
    });

    await notificationService.sendNotification({
      userId: customerId,
      type: "BOOKING_RECEIVED",
      title: "Ride Request Submitted",
      message: `Your ride request ${booking.id} has been sent to ${service.vendor.businessName}.`,
    });

    return booking;
  }

  /**
   * Create Laundry Booking
   */
  async createLaundryBooking(
    customerId: string,
    data: {
      serviceId: string;
      laundryService: string;
      clothingItems: Record<string, number>;
      bagPhotoUrl?: string;
      idempotencyKey?: string;
    }
  ) {
    if (data.idempotencyKey) {
      const existing = await prisma.booking.findUnique({
        where: { idempotencyKey: data.idempotencyKey },
      });
      if (existing) return existing;
    }

    const customer = await prisma.user.findUnique({
      where: { id: customerId },
    });
    if (!customer) throw new AppError("NOT_FOUND", "Customer not found.", 404);

    const service = await prisma.vendorService.findUnique({
      where: { id: data.serviceId },
      include: {
        vendor: true,
        clothingTypes: true,
        laundryServiceTypes: true,
      },
    });

    if (!service || !service.active) {
      throw new AppError("SERVICE_NOT_AVAILABLE", "Laundry service is not available.", 400);
    }

    // Validate restricted clothing items
    const restrictedNames = service.clothingTypes
      .filter((c) => !c.allowed)
      .map((c) => c.name.toLowerCase());

    for (const [item, qty] of Object.entries(data.clothingItems)) {
      if (qty > 0 && restrictedNames.includes(item.toLowerCase())) {
        throw new AppError(
          "RESTRICTED_CLOTHING",
          `'${item}' is not accepted by this vendor.`,
          400
        );
      }
    }

    // Server-side laundry pricing calculation
    const laundryTypeRule = service.laundryServiceTypes.find(
      (st) => st.name.toLowerCase() === data.laundryService.toLowerCase()
    );
    const pricePerKg = laundryTypeRule?.pricePerKg || 60;
    const serviceFee = laundryTypeRule?.serviceFee || 30;

    // Estimate weight based on item counts (approx 0.35kg per garment avg)
    const totalItems = Object.values(data.clothingItems).reduce((a, b) => a + b, 0);
    const estimatedKg = Math.max(1.0, +(totalItems * 0.35).toFixed(1));
    const quotedPrice = Math.round(estimatedKg * pricePerKg + serviceFee);

    const bookingId = `CCM-L-${Math.floor(1000 + Math.random() * 9000)}`;
    const itemsSummary = Object.entries(data.clothingItems)
      .filter(([_, count]) => count > 0)
      .map(([name, count]) => `${count} ${name.toLowerCase()}`)
      .join(", ");

    const booking = await prisma.$transaction(async (tx) => {
      const created = await tx.booking.create({
        data: {
          id: bookingId,
          customerId,
          vendorId: service.vendorId,
          serviceId: service.id,
          serviceType: VendorType.LAUNDRY,
          status: BookingStatus.REQUESTED,
          quotedPrice,
          currency: "INR",
          summary: `${totalItems} items · ${customer.hostel || "Campus Hostel"}`,
          idempotencyKey: data.idempotencyKey,
          bookingData: {
            laundryService: data.laundryService,
            clothingItems: data.clothingItems,
            totalItems,
            estimatedKg,
            ratePerKg: pricePerKg,
            serviceFee,
            bagPhotoUrl: data.bagPhotoUrl,
            hostel: customer.hostel || "Maple Hostel",
            roomNumber: customer.roomNumber || "B-204",
            customerName: customer.name,
            customerPhone: customer.phone,
          },
        },
      });

      await tx.bookingStatusHistory.create({
        data: {
          bookingId: created.id,
          oldStatus: null,
          newStatus: BookingStatus.REQUESTED,
          changedBy: customerId,
        },
      });

      return created;
    });

    await notificationService.sendNotification({
      userId: service.vendor.ownerId || service.vendorId,
      type: "NEW_LAUNDRY_REQUEST",
      title: "New Laundry Request",
      message: `Pickup requested at ${customer.hostel} (${totalItems} items).`,
    });

    await notificationService.sendNotification({
      userId: customerId,
      type: "BOOKING_RECEIVED",
      title: "Laundry Request Submitted",
      message: `Your laundry request ${booking.id} has been submitted to ${service.vendor.businessName}.`,
    });

    return booking;
  }

  /**
   * Create Food Order Booking
   */
  async createFoodBooking(
    customerId: string,
    data: {
      serviceId: string;
      items: Array<{ name: string; quantity: number }>;
      collectionPoint?: string;
      idempotencyKey?: string;
    }
  ) {
    if (data.idempotencyKey) {
      const existing = await prisma.booking.findUnique({
        where: { idempotencyKey: data.idempotencyKey },
      });
      if (existing) return existing;
    }

    const customer = await prisma.user.findUnique({
      where: { id: customerId },
    });
    if (!customer) throw new AppError("NOT_FOUND", "Customer not found.", 404);

    const service = await prisma.vendorService.findUnique({
      where: { id: data.serviceId },
      include: {
        vendor: true,
        menuItems: true,
      },
    });

    if (!service || !service.active) {
      throw new AppError("SERVICE_NOT_AVAILABLE", "Food service is currently unavailable.", 400);
    }

    // Authoritative Server-Side Menu Pricing Snapshot
    let calculatedTotal = 0;
    const validatedItems: Array<{ name: string; quantity: number; unitPrice: number; subtotal: number }> = [];

    for (const requestedItem of data.items) {
      const menuItem = service.menuItems.find(
        (m) => m.name.toLowerCase() === requestedItem.name.toLowerCase() && m.available
      );

      if (!menuItem) {
        throw new AppError(
          "SERVICE_NOT_AVAILABLE",
          `Menu item '${requestedItem.name}' is currently unavailable.`,
          400
        );
      }

      const subtotal = menuItem.price * requestedItem.quantity;
      calculatedTotal += subtotal;
      validatedItems.push({
        name: menuItem.name,
        quantity: requestedItem.quantity,
        unitPrice: menuItem.price,
        subtotal,
      });
    }

    if (service.vendor.minimumOrder && calculatedTotal < service.vendor.minimumOrder) {
      throw new AppError(
        "PRICE_CHANGED",
        `Minimum order amount for this vendor is ₹${service.vendor.minimumOrder}.`,
        400
      );
    }

    const bookingId = `CCM-F-${Math.floor(1000 + Math.random() * 9000)}`;
    const itemsSummary = validatedItems
      .map((i) => `${i.quantity}× ${i.name}`)
      .join(", ");

    const booking = await prisma.$transaction(async (tx) => {
      const created = await tx.booking.create({
        data: {
          id: bookingId,
          customerId,
          vendorId: service.vendorId,
          serviceId: service.id,
          serviceType: VendorType.FOOD,
          status: BookingStatus.RECEIVED,
          quotedPrice: calculatedTotal,
          currency: "INR",
          summary: `${itemsSummary} · Collect at hostel gate`,
          idempotencyKey: data.idempotencyKey,
          bookingData: {
            items: validatedItems,
            totalPrice: calculatedTotal,
            collectionPoint: data.collectionPoint || "Maple Hostel Gate",
            hostel: customer.hostel || "Maple Hostel",
            roomNumber: customer.roomNumber || "B-204",
            customerName: customer.name,
            customerPhone: customer.phone,
            boundary: "Delivery until hostel gate",
          },
        },
      });

      await tx.bookingStatusHistory.create({
        data: {
          bookingId: created.id,
          oldStatus: null,
          newStatus: BookingStatus.RECEIVED,
          changedBy: customerId,
        },
      });

      return created;
    });

    await notificationService.sendNotification({
      userId: service.vendor.ownerId || service.vendorId,
      type: "NEW_FOOD_ORDER",
      title: "New Food Order",
      message: `New food order ${booking.id} (${itemsSummary}) totaling ₹${calculatedTotal}.`,
    });

    await notificationService.sendNotification({
      userId: customerId,
      type: "BOOKING_RECEIVED",
      title: "Order Placed",
      message: `Your food order ${booking.id} has been submitted to ${service.vendor.businessName}.`,
    });

    return booking;
  }

  /**
   * Get Bookings with filters and role-based ownership validation
   */
  async getBookings(params: {
    userId: string;
    role: Role;
    vendorId?: string;
    status?: string;
    serviceType?: VendorType;
    page?: number;
    limit?: number;
  }) {
    const { userId, role, vendorId, status, serviceType, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const whereClause: Record<string, unknown> = {};

    if (role === Role.CUSTOMER) {
      whereClause.customerId = userId;
    } else if (role === Role.VENDOR_OWNER) {
      if (vendorId) {
        whereClause.vendorId = vendorId;
      } else {
        const vendor = await prisma.vendor.findFirst({ where: { ownerId: userId } });
        if (vendor) whereClause.vendorId = vendor.id;
      }
    }
    // Admins have access to platform-wide records

    if (status) {
      whereClause.status = status as BookingStatus;
    }

    if (serviceType) {
      whereClause.serviceType = serviceType;
    }

    const [items, total] = await Promise.all([
      prisma.booking.findMany({
        where: whereClause,
        include: {
          vendor: { select: { id: true, businessName: true, vendorType: true, color: true } },
          service: { select: { id: true, name: true } },
          rider: true,
          customer: { select: { id: true, name: true, phone: true, hostel: true, roomNumber: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where: whereClause }),
    ]);

    return {
      items: items.map((b) => ({
        id: b.id,
        category:
          b.serviceType === VendorType.BIKE_RIDE
            ? "ride"
            : b.serviceType === VendorType.LAUNDRY
            ? "laundry"
            : "food",
        title: b.service?.name || "Service",
        vendor: b.vendor.businessName,
        date: new Date(b.createdAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          hour: "numeric",
          minute: "numeric",
        }),
        price: `₹${b.quotedPrice}`,
        status: b.status,
        summary: b.summary || "",
        rider: b.rider
          ? {
              name: b.rider.name,
              phone: b.rider.phone,
              vehicleIdentifier: b.rider.vehicleIdentifier,
            }
          : null,
        bookingData: b.bookingData,
        customer: b.customer,
      })),
      total,
      page,
      limit,
    };
  }

  async getBookingById(bookingId: string, userId: string, role: Role) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        vendor: true,
        service: true,
        rider: true,
        customer: { select: { id: true, name: true, phone: true, hostel: true, roomNumber: true } },
        history: { orderBy: { changedAt: "asc" } },
      },
    });

    if (!booking) {
      throw new AppError("BOOKING_NOT_FOUND", "Booking not found.", 404);
    }

    // Role-based ownership check
    if (role === Role.CUSTOMER && booking.customerId !== userId) {
      throw new AppError("FORBIDDEN", "You do not have access to this booking.", 403);
    }

    if (role === Role.VENDOR_OWNER) {
      const vendor = await prisma.vendor.findFirst({ where: { ownerId: userId } });
      if (!vendor || booking.vendorId !== vendor.id) {
        throw new AppError("FORBIDDEN", "You do not have access to this booking.", 403);
      }
    }

    return booking;
  }

  /**
   * Cancel Booking (Customer or Vendor)
   */
  async cancelBooking(bookingId: string, userId: string, role: Role) {
    const booking = await this.getBookingById(bookingId, userId, role);

    if (booking.status === BookingStatus.CANCELLED) {
      throw new AppError("BOOKING_ALREADY_CANCELLED", "This booking is already cancelled.", 400);
    }

    if (booking.status === BookingStatus.COMPLETED) {
      throw new AppError("INVALID_STATUS_TRANSITION", "Completed bookings cannot be cancelled.", 400);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.CANCELLED },
      });

      await tx.bookingStatusHistory.create({
        data: {
          bookingId,
          oldStatus: booking.status,
          newStatus: BookingStatus.CANCELLED,
          changedBy: userId,
        },
      });

      return b;
    });

    // Notify parties
    const targetUserId =
      role === Role.CUSTOMER
        ? booking.vendor.ownerId || booking.vendorId
        : booking.customerId;

    await notificationService.sendNotification({
      userId: targetUserId,
      type: "BOOKING_CANCELLED",
      title: "Booking Cancelled",
      message: `Booking ${booking.id} was cancelled.`,
    });

    return updated;
  }

  /**
   * Update Status with Finite State Machine Validation
   */
  async updateStatus(
    bookingId: string,
    newStatus: BookingStatus,
    userId: string,
    notes?: string
  ) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { vendor: true, customer: true },
    });

    if (!booking) {
      throw new AppError("BOOKING_NOT_FOUND", "Booking not found.", 404);
    }

    const machine =
      booking.serviceType === VendorType.BIKE_RIDE
        ? RIDE_TRANSITIONS
        : booking.serviceType === VendorType.LAUNDRY
        ? LAUNDRY_TRANSITIONS
        : FOOD_TRANSITIONS;

    const allowed = machine[booking.status] || [];
    if (!allowed.includes(newStatus)) {
      throw new AppError(
        "INVALID_STATUS_TRANSITION",
        `Invalid status transition from ${booking.status} to ${newStatus}. Allowed transitions: ${allowed.join(", ") || "none"}`,
        400
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.update({
        where: { id: bookingId },
        data: { status: newStatus },
      });

      await tx.bookingStatusHistory.create({
        data: {
          bookingId,
          oldStatus: booking.status,
          newStatus,
          changedBy: userId,
          metadata: notes ? { notes } : undefined,
        },
      });

      return b;
    });

    // Send notifications to customer
    await notificationService.sendNotification({
      userId: booking.customerId,
      type: `STATUS_${newStatus}`,
      title: `Status Update: ${newStatus}`,
      message: `Your booking ${booking.id} is now ${newStatus.toLowerCase()}.`,
    });

    return updated;
  }

  /**
   * Assign Rider to Bike Ride
   */
  async assignRider(bookingId: string, riderId: string, userId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { vendor: true },
    });

    if (!booking) {
      throw new AppError("BOOKING_NOT_FOUND", "Booking not found.", 404);
    }

    if (booking.serviceType !== VendorType.BIKE_RIDE) {
      throw new AppError("INVALID_SERVICE_CONFIGURATION", "Riders can only be assigned to bike rides.", 400);
    }

    const rider = await prisma.rider.findUnique({
      where: { id: riderId },
    });

    if (!rider || !rider.active || rider.vendorId !== booking.vendorId) {
      throw new AppError("NOT_FOUND", "Rider not found or not active for this vendor.", 400);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.update({
        where: { id: bookingId },
        data: {
          riderId,
          status: BookingStatus.ASSIGNED,
        },
        include: { rider: true },
      });

      await tx.bookingStatusHistory.create({
        data: {
          bookingId,
          oldStatus: booking.status,
          newStatus: BookingStatus.ASSIGNED,
          changedBy: userId,
          metadata: { riderName: rider.name, vehicle: rider.vehicleIdentifier },
        },
      });

      return b;
    });

    // Notify customer that rider is assigned
    await notificationService.sendNotification({
      userId: booking.customerId,
      type: "RIDER_ASSIGNED",
      title: "Rider Assigned",
      message: `${rider.name} (${rider.vehicleIdentifier}) has been assigned to your ride.`,
    });

    return updated;
  }
}

export const bookingService = new BookingService();
