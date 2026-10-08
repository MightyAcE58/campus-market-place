import { PrismaClient, Role, VendorType, AccessStatus, AccessPlan, BookingStatus, DietaryClassification } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Campus Commerce database...");

  // Clean existing tables in order
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.bookingStatusHistory.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.rider.deleteMany();
  await prisma.foodMenuItem.deleteMany();
  await prisma.laundryServiceType.deleteMany();
  await prisma.laundryClothingType.deleteMany();
  await prisma.rideFareRule.deleteMany();
  await prisma.location.deleteMany();
  await prisma.serviceConfiguration.deleteMany();
  await prisma.vendorService.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.refreshSession.deleteMany();
  await prisma.otpRequest.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();

  // 1. Categories
  await prisma.category.createMany({
    data: [
      {
        id: "ride",
        name: "Bike Ride",
        description: "Quick rides across campus",
        detail: "From ₹40",
        icon: "bike",
        className: "blue",
      },
      {
        id: "laundry",
        name: "Laundry",
        description: "Pickup, wash and iron",
        detail: "From ₹80/kg",
        icon: "laundry",
        className: "violet",
      },
      {
        id: "food",
        name: "Food",
        description: "Fresh meals around campus",
        detail: "From ₹70",
        icon: "food",
        className: "orange",
      },
    ],
  });

  // 2. Users
  const defaultPasswordHash = await bcrypt.hash("Password@123", 10);
  const adminPasswordHash = await bcrypt.hash("Admin@123", 10);

  const customer = await prisma.user.create({
    data: {
      name: "Aarav Mehta",
      phone: "+919876543210",
      hostel: "Maple Hostel",
      roomNumber: "B-204",
      role: Role.CUSTOMER,
      notificationPreferences: {
        serviceUpdatesWhatsApp: true,
        serviceUpdatesInApp: true,
        promoWhatsApp: false,
        promoInApp: true,
      },
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: "System Admin",
      phone: "+919800000000",
      role: Role.ADMIN,
      passwordHash: adminPasswordHash,
    },
  });

  const greenBowlOwner = await prisma.user.create({
    data: {
      name: "Nisha Kapoor",
      phone: "+919811122334",
      role: Role.VENDOR_OWNER,
      passwordHash: defaultPasswordHash,
    },
  });

  const freshFoldOwner = await prisma.user.create({
    data: {
      name: "Rahul Verma",
      phone: "+919822233445",
      role: Role.VENDOR_OWNER,
      passwordHash: defaultPasswordHash,
    },
  });

  const campusWheelsOwner = await prisma.user.create({
    data: {
      name: "Amit Singh",
      phone: "+919833344556",
      role: Role.VENDOR_OWNER,
      passwordHash: defaultPasswordHash,
    },
  });

  // 3. Vendors
  const greenBowl = await prisma.vendor.create({
    data: {
      id: "green-bowl",
      businessName: "Green Bowl",
      ownerName: "Nisha Kapoor",
      email: "nisha@greenbowl.in",
      phone: "+919811122334",
      whatsappNumber: "+919811122334",
      description: "Fresh bowls, wraps and campus favourites made daily.",
      vendorType: VendorType.FOOD,
      dietaryClassification: DietaryClassification.VEG_ONLY,
      tags: ["Fresh daily", "Pickup & delivery"],
      color: "sage",
      mark: "GB",
      serviceArea: "North & South hostels",
      operatingHours: "11:00 AM – 9:30 PM",
      minimumOrder: 70,
      accessStatus: AccessStatus.ACTIVE,
      accessStart: new Date("2025-01-01"),
      accessEnd: new Date("2026-12-31"),
      plan: AccessPlan.PAID,
      monthlyPrice: 1500,
      ownerId: greenBowlOwner.id,
    },
  });

  const freshFold = await prisma.vendor.create({
    data: {
      id: "fresh-fold",
      businessName: "FreshFold Laundry",
      ownerName: "Rahul Verma",
      email: "rahul@freshfold.in",
      phone: "+919822233445",
      whatsappNumber: "+919822233445",
      description: "Reliable hostel pickup with careful wash and fold service.",
      vendorType: VendorType.LAUNDRY,
      tags: ["Hostel pickup", "48 hrs"],
      color: "lilac",
      mark: "FF",
      serviceArea: "All campus hostels",
      operatingHours: "8:00 AM – 8:00 PM",
      accessStatus: AccessStatus.ACTIVE,
      accessStart: new Date("2025-01-01"),
      accessEnd: new Date("2026-12-31"),
      plan: AccessPlan.PAID,
      monthlyPrice: 1500,
      ownerId: freshFoldOwner.id,
    },
  });

  const campusWheels = await prisma.vendor.create({
    data: {
      id: "campus-wheels",
      businessName: "Campus Wheels",
      ownerName: "Amit Singh",
      email: "amit@campuswheels.in",
      phone: "+919833344556",
      whatsappNumber: "+919833344556",
      description: "Safe, convenient rides between predefined campus points.",
      vendorType: VendorType.BIKE_RIDE,
      tags: ["Up to 2 riders", "Campus verified"],
      color: "sky",
      mark: "CW",
      serviceArea: "6 campus pickup points",
      operatingHours: "7:00 AM – 10:00 PM",
      accessStatus: AccessStatus.ACTIVE,
      accessStart: new Date("2025-01-01"),
      accessEnd: new Date("2026-12-31"),
      plan: AccessPlan.PAID,
      monthlyPrice: 1500,
      ownerId: campusWheelsOwner.id,
    },
  });

  // 4. Services & Configurations
  // Green Bowl Services
  const foodService = await prisma.vendorService.create({
    data: {
      vendorId: greenBowl.id,
      serviceType: VendorType.FOOD,
      name: "Browse Menu",
      description: "Fresh vegetarian campus meals and bowls.",
    },
  });

  await prisma.serviceConfiguration.create({
    data: {
      serviceId: foodService.id,
      configData: {
        fields: [
          { field: "items", required: true, autoFilled: false, editable: true },
          { field: "hostel", required: true, autoFilled: true, editable: false, locked: true },
          { field: "room", required: true, autoFilled: true, editable: false, locked: true },
        ],
        boundaries: ["Maple Hostel Gate", "Campus Gate"],
      },
    },
  });

  await prisma.foodMenuItem.createMany({
    data: [
      {
        serviceId: foodService.id,
        name: "Paneer Rice Bowl",
        description: "Grilled paneer, fragrant rice, greens and mint chutney.",
        price: 90,
        category: "Bowls",
        dietaryClassification: "VEG",
        color: "meal-one",
      },
      {
        serviceId: foodService.id,
        name: "Garden Wrap",
        description: "Crunchy vegetables, hummus and house dressing.",
        price: 70,
        category: "Wraps",
        dietaryClassification: "VEG",
        color: "meal-two",
      },
      {
        serviceId: foodService.id,
        name: "Masala Khichdi",
        description: "Comforting rice and lentils with seasonal vegetables.",
        price: 80,
        category: "Bowls",
        dietaryClassification: "VEG",
        color: "meal-three",
      },
    ],
  });

  // FreshFold Services
  const laundryService = await prisma.vendorService.create({
    data: {
      vendorId: freshFold.id,
      serviceType: VendorType.LAUNDRY,
      name: "Wash + Iron",
      description: "Complete wash, steam iron and fold hostel pickup service.",
    },
  });

  await prisma.serviceConfiguration.create({
    data: {
      serviceId: laundryService.id,
      configData: {
        fields: [
          { field: "serviceType", required: true, autoFilled: false, editable: true },
          { field: "clothingItems", required: true, autoFilled: false, editable: true },
          { field: "bagPhoto", required: true, autoFilled: false, editable: true },
          { field: "hostel", required: true, autoFilled: true, editable: false, locked: true },
          { field: "room", required: true, autoFilled: true, editable: false, locked: true },
        ],
      },
    },
  });

  await prisma.laundryServiceType.createMany({
    data: [
      { serviceId: laundryService.id, type: "WASH_ONLY", name: "Wash Only", pricePerKg: 60, serviceFee: 0 },
      { serviceId: laundryService.id, type: "WASH_AND_IRON", name: "Wash + Iron", pricePerKg: 80, serviceFee: 30 },
      { serviceId: laundryService.id, type: "IRON_ONLY", name: "Iron Only", pricePerKg: 40, serviceFee: 0 },
    ],
  });

  await prisma.laundryClothingType.createMany({
    data: [
      { serviceId: laundryService.id, name: "Shirt", allowed: true },
      { serviceId: laundryService.id, name: "T-Shirt", allowed: true },
      { serviceId: laundryService.id, name: "Pant", allowed: true },
      { serviceId: laundryService.id, name: "Shorts", allowed: true },
      { serviceId: laundryService.id, name: "Bedsheet", allowed: true },
      { serviceId: laundryService.id, name: "Towel", allowed: true },
      { serviceId: laundryService.id, name: "Blanket", allowed: false, restrictedReason: "Dry clean only" },
      { serviceId: laundryService.id, name: "Socks", allowed: false, restrictedReason: "Not accepted" },
    ],
  });

  // Campus Wheels Services
  const rideService = await prisma.vendorService.create({
    data: {
      vendorId: campusWheels.id,
      serviceType: VendorType.BIKE_RIDE,
      name: "Bike Ride",
      description: "Quick rides across designated campus points.",
    },
  });

  await prisma.serviceConfiguration.create({
    data: {
      serviceId: rideService.id,
      configData: {
        maxPassengers: 2,
        operatingHours: "7:00 AM – 10:00 PM",
      },
    },
  });

  const locations = ["Main Gate", "Hostel A", "Hostel B", "Academic Block", "Library"];
  for (const loc of locations) {
    await prisma.location.create({
      data: {
        serviceId: rideService.id,
        name: loc,
      },
    });
  }

  // Fare matrix rules
  await prisma.rideFareRule.createMany({
    data: [
      { serviceId: rideService.id, pickupLocation: "Main Gate", dropoffLocation: "Hostel B", passengerCount: 1, fare: 40 },
      { serviceId: rideService.id, pickupLocation: "Main Gate", dropoffLocation: "Hostel B", passengerCount: 2, fare: 60 },
      { serviceId: rideService.id, pickupLocation: "Main Gate", dropoffLocation: "Library", passengerCount: 1, fare: 40 },
      { serviceId: rideService.id, pickupLocation: "Main Gate", dropoffLocation: "Library", passengerCount: 2, fare: 60 },
      { serviceId: rideService.id, pickupLocation: "Library", dropoffLocation: "Main Gate", passengerCount: 1, fare: 40 },
      { serviceId: rideService.id, pickupLocation: "Library", dropoffLocation: "Main Gate", passengerCount: 2, fare: 60 },
    ],
  });

  // Riders
  const riderRohan = await prisma.rider.create({
    data: {
      vendorId: campusWheels.id,
      name: "Rohan Das",
      phone: "+919876500123",
      vehicleIdentifier: "Bike C-12",
      active: true,
    },
  });

  await prisma.rider.create({
    data: {
      vendorId: campusWheels.id,
      name: "Vikrant Sen",
      phone: "+919876500124",
      vehicleIdentifier: "Bike C-05",
      active: true,
    },
  });

  // 5. Offers
  await prisma.offer.createMany({
    data: [
      {
        vendorId: greenBowl.id,
        title: "Lunch Bowl Special",
        description: "15% off lunch bowls at Green Bowl.",
        applicableItem: "Paneer Rice Bowl",
        originalPrice: 120,
        offerPrice: 90,
        startAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        endAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        eligibility: "All registered students",
        location: "North Campus",
        published: true,
      },
      {
        vendorId: freshFold.id,
        title: "Weekend Laundry Offer",
        description: "Special weekend price for wash and iron.",
        applicableItem: "Wash + Iron",
        originalPrice: 80,
        offerPrice: 60,
        startAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        eligibility: "All campus hostels",
        location: "All hostels",
        published: true,
      },
      {
        vendorId: campusWheels.id,
        title: "First Campus Ride",
        description: "Flat ₹40 across all campus stops.",
        applicableItem: "Bike Ride",
        originalPrice: 50,
        offerPrice: 40,
        startAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        endAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        eligibility: "All students",
        location: "Campus-wide",
        published: true,
      },
    ],
  });

  // 6. Realistic Seed Bookings in various lifecycle states
  // Active Ride Booking
  const rideBooking = await prisma.booking.create({
    data: {
      id: "CCM-R-1042",
      customerId: customer.id,
      vendorId: campusWheels.id,
      serviceId: rideService.id,
      serviceType: VendorType.BIKE_RIDE,
      status: BookingStatus.ASSIGNED,
      quotedPrice: 40,
      summary: "Main Gate → North Hostel Gate",
      riderId: riderRohan.id,
      bookingData: {
        pickup: "Main Gate",
        dropoff: "North Hostel Gate",
        date: "Today",
        time: "6:30 PM",
        passengers: 1,
        customerName: customer.name,
        customerPhone: customer.phone,
      },
    },
  });

  await prisma.bookingStatusHistory.createMany({
    data: [
      {
        bookingId: rideBooking.id,
        oldStatus: null,
        newStatus: BookingStatus.REQUESTED,
        changedBy: customer.id,
        changedAt: new Date(Date.now() - 30 * 60 * 1000),
      },
      {
        bookingId: rideBooking.id,
        oldStatus: BookingStatus.REQUESTED,
        newStatus: BookingStatus.ASSIGNED,
        changedBy: campusWheelsOwner.id,
        changedAt: new Date(Date.now() - 10 * 60 * 1000),
      },
    ],
  });

  // Laundry Booking (PROCESSING)
  const laundryBooking = await prisma.booking.create({
    data: {
      id: "CCM-L-1042",
      customerId: customer.id,
      vendorId: freshFold.id,
      serviceId: laundryService.id,
      serviceType: VendorType.LAUNDRY,
      status: BookingStatus.PROCESSING,
      quotedPrice: 150,
      summary: "6 items · Maple Hostel",
      bookingData: {
        laundryService: "Wash + Iron",
        clothingItems: { Shirt: 3, Pant: 2, Bedsheet: 1 },
        totalItems: 6,
        estimatedKg: 2.1,
        hostel: "Maple Hostel",
        roomNumber: "B-204",
      },
    },
  });

  await prisma.bookingStatusHistory.createMany({
    data: [
      {
        bookingId: laundryBooking.id,
        oldStatus: null,
        newStatus: BookingStatus.REQUESTED,
        changedBy: customer.id,
        changedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      {
        bookingId: laundryBooking.id,
        oldStatus: BookingStatus.REQUESTED,
        newStatus: BookingStatus.ACCEPTED,
        changedBy: freshFoldOwner.id,
        changedAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
      },
      {
        bookingId: laundryBooking.id,
        oldStatus: BookingStatus.ACCEPTED,
        newStatus: BookingStatus.PROCESSING,
        changedBy: freshFoldOwner.id,
        changedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
    ],
  });

  // Food Booking (PREPARING)
  const foodBooking = await prisma.booking.create({
    data: {
      id: "CCM-F-1042",
      customerId: customer.id,
      vendorId: greenBowl.id,
      serviceId: foodService.id,
      serviceType: VendorType.FOOD,
      status: BookingStatus.PREPARING,
      quotedPrice: 180,
      summary: "2 items · Collect at hostel gate",
      bookingData: {
        items: [{ name: "Paneer Rice Bowl", quantity: 2, unitPrice: 90, subtotal: 180 }],
        collectionPoint: "Maple Hostel Gate",
        hostel: "Maple Hostel",
        roomNumber: "B-204",
      },
    },
  });

  await prisma.bookingStatusHistory.createMany({
    data: [
      {
        bookingId: foodBooking.id,
        oldStatus: null,
        newStatus: BookingStatus.RECEIVED,
        changedBy: customer.id,
        changedAt: new Date(Date.now() - 40 * 60 * 1000),
      },
      {
        bookingId: foodBooking.id,
        oldStatus: BookingStatus.RECEIVED,
        newStatus: BookingStatus.ACCEPTED,
        changedBy: greenBowlOwner.id,
        changedAt: new Date(Date.now() - 25 * 60 * 1000),
      },
      {
        bookingId: foodBooking.id,
        oldStatus: BookingStatus.ACCEPTED,
        newStatus: BookingStatus.PREPARING,
        changedBy: greenBowlOwner.id,
        changedAt: new Date(Date.now() - 10 * 60 * 1000),
      },
    ],
  });

  // Completed Ride Booking
  await prisma.booking.create({
    data: {
      id: "CCM-R-1008",
      customerId: customer.id,
      vendorId: campusWheels.id,
      serviceId: rideService.id,
      serviceType: VendorType.BIKE_RIDE,
      status: BookingStatus.COMPLETED,
      quotedPrice: 40,
      summary: "Library → Main Gate",
      bookingData: {
        pickup: "Library",
        dropoff: "Main Gate",
        date: "08 Jun",
        time: "4:00 PM",
        passengers: 1,
      },
    },
  });

  // Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: customer.id,
        type: "RIDER_ASSIGNED",
        title: "Your bike ride has been assigned",
        message: "Rohan Das is on the way to Main Gate.",
        createdAt: new Date(Date.now() - 2 * 60 * 1000),
      },
      {
        userId: customer.id,
        type: "SERVICE_PROCESSING",
        title: "Your laundry order is being processed",
        message: "FreshFold is processing your laundry batch.",
        createdAt: new Date(Date.now() - 60 * 60 * 1000),
      },
      {
        userId: customer.id,
        type: "OFFER_AVAILABLE",
        title: "Green Bowl has a new lunch offer",
        message: "Get a Paneer Rice Bowl for ₹90 today.",
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    ],
  });

  // Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        action: "VENDOR_ONBOARDED",
        entityType: "Vendor",
        entityId: greenBowl.id,
        userId: admin.id,
        metadata: { businessName: "Green Bowl" },
      },
      {
        action: "BOOKING_ACCEPTED",
        entityType: "Booking",
        entityId: foodBooking.id,
        userId: greenBowlOwner.id,
      },
      {
        action: "RIDER_ASSIGNED",
        entityType: "Booking",
        entityId: rideBooking.id,
        userId: campusWheelsOwner.id,
        metadata: { riderName: "Rohan Das" },
      },
    ],
  });

  console.log("Database seeded successfully with all required users, vendors, services, rules, and bookings!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
