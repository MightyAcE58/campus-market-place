import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";
import { prisma } from "../src/db/prisma.js";

describe("Campus Commerce Marketplace API Test Suite", () => {
  let customerToken: string;
  let adminToken: string;
  let vendorToken: string;
  let bikeServiceId: string;
  let laundryServiceId: string;
  let foodServiceId: string;
  let greenBowlId: string;

  beforeAll(async () => {
    // Clear test OTPs so throttling doesn't block fast test re-runs
    await prisma.otpRequest.deleteMany({
      where: { phone: "+919876543210" },
    });

    // 1. Authenticate Customer with OTP
    await request(app)
      .post("/api/v1/auth/customer/request-otp")
      .send({ phone: "+919876543210" });

    const customerRes = await request(app)
      .post("/api/v1/auth/customer/verify-otp")
      .send({ phone: "+919876543210", code: "123456" });

    expect(customerRes.status).toBe(200);
    expect(customerRes.body.success).toBe(true);
    customerToken = customerRes.body.data.accessToken;

    // 2. Authenticate Admin
    const adminRes = await request(app)
      .post("/api/v1/auth/admin/login")
      .send({ phone: "+919800000000", password: "Admin@123" });

    expect(adminRes.status).toBe(200);
    expect(adminRes.body.success).toBe(true);
    adminToken = adminRes.body.data.accessToken;

    // 3. Authenticate Vendor
    const vendorRes = await request(app)
      .post("/api/v1/auth/vendor/login")
      .send({ emailOrPhone: "nisha@greenbowl.in", password: "Password@123" });

    expect(vendorRes.status).toBe(200);
    vendorToken = vendorRes.body.data.accessToken;
  });

  describe("Health & Readiness Checks", () => {
    it("should return UP on /health", async () => {
      const res = await request(app).get("/health");
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("UP");
    });

    it("should return READY on /ready with connected database", async () => {
      const res = await request(app).get("/ready");
      expect(res.status).toBe(200);
      expect(res.body.data.database).toBe("CONNECTED");
    });
  });

  describe("Authentication & Throttling", () => {
    it("should reject invalid OTP", async () => {
      const res = await request(app)
        .post("/api/v1/auth/customer/verify-otp")
        .send({ phone: "+919999999999", code: "000000" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("INVALID_OTP");
    });

    it("should reject unauthenticated access to protected routes", async () => {
      const res = await request(app).get("/api/v1/bookings");
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe("UNAUTHORIZED");
    });

    it("should return profile for authenticated user on /api/v1/auth/me", async () => {
      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.phone).toBe("+919876543210");
      expect(res.body.data.name).toBe("Aarav Mehta");
    });
  });

  describe("Role-Based Access Control (RBAC)", () => {
    it("should reject customer accessing admin routes", async () => {
      const res = await request(app)
        .get("/api/v1/admin/stats")
        .set("Authorization", `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe("FORBIDDEN");
    });

    it("should reject vendor accessing admin routes", async () => {
      const res = await request(app)
        .get("/api/v1/admin/stats")
        .set("Authorization", `Bearer ${vendorToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe("FORBIDDEN");
    });

    it("should allow admin accessing admin routes", async () => {
      const res = await request(app)
        .get("/api/v1/admin/stats")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("activeVendors");
    });
  });

  describe("Marketplace & Catalog Discovery", () => {
    it("should list active categories", async () => {
      const res = await request(app).get("/api/v1/categories");
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);
    });

    it("should list vendors and allow search filtering", async () => {
      const res = await request(app).get("/api/v1/vendors?search=Green");
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].name).toBe("Green Bowl");
      greenBowlId = res.body.data[0].id;
    });

    it("should fetch vendor details with services", async () => {
      const res = await request(app).get(`/api/v1/vendors/${greenBowlId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.businessName).toBe("Green Bowl");
      expect(res.body.data.services.length).toBeGreaterThan(0);
      foodServiceId = res.body.data.services[0].id;
    });

    it("should fetch bike ride and laundry services", async () => {
      const allVendors = await request(app).get("/api/v1/vendors");
      const rideVendor = allVendors.body.data.find((v: any) => v.category === "ride");
      const laundryVendor = allVendors.body.data.find((v: any) => v.category === "laundry");

      const rideDetail = await request(app).get(`/api/v1/vendors/${rideVendor.id}`);
      bikeServiceId = rideDetail.body.data.services[0].id;

      const laundryDetail = await request(app).get(`/api/v1/vendors/${laundryVendor.id}`);
      laundryServiceId = laundryDetail.body.data.services[0].id;

      expect(bikeServiceId).toBeDefined();
      expect(laundryServiceId).toBeDefined();
    });
  });

  describe("Bike Ride Workflow", () => {
    it("should calculate bike fare quote server-side", async () => {
      const res = await request(app)
        .post("/api/v1/bookings/ride/quote")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({
          serviceId: bikeServiceId,
          pickup: "Main Gate",
          dropoff: "Hostel B",
          passengers: 1,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.quotedFare).toBe(40);
    });

    it("should reject bike ride quote with more than 2 passengers", async () => {
      const res = await request(app)
        .post("/api/v1/bookings/ride/quote")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({
          pickup: "Main Gate",
          dropoff: "Hostel B",
          passengers: 3,
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("INVALID_PASSENGER_COUNT");
    });

    it("should create bike ride booking and return authoritative fare", async () => {
      const res = await request(app)
        .post("/api/v1/bookings")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({
          serviceType: "BIKE_RIDE",
          serviceId: bikeServiceId,
          pickup: "Main Gate",
          dropoff: "Hostel B",
          date: "Today",
          time: "7:00 PM",
          passengers: 1,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.quotedPrice).toBe(40);
      expect(res.body.data.status).toBe("REQUESTED");
    });
  });

  describe("Laundry Workflow", () => {
    it("should reject booking containing restricted clothing (e.g. Blanket)", async () => {
      const res = await request(app)
        .post("/api/v1/bookings")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({
          serviceType: "LAUNDRY",
          serviceId: laundryServiceId,
          laundryService: "Wash + Iron",
          clothingItems: {
            Shirt: 2,
            Blanket: 1, // Restricted
          },
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("RESTRICTED_CLOTHING");
    });

    it("should create valid laundry booking with accepted clothing items", async () => {
      const res = await request(app)
        .post("/api/v1/bookings")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({
          serviceType: "LAUNDRY",
          serviceId: laundryServiceId,
          laundryService: "Wash + Iron",
          clothingItems: {
            Shirt: 3,
            Pant: 2,
          },
        });

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe("REQUESTED");
      expect(res.body.data.quotedPrice).toBeGreaterThan(0);
    });
  });

  describe("Food Order Workflow", () => {
    it("should calculate order total server-side from menu prices", async () => {
      const res = await request(app)
        .post("/api/v1/bookings")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({
          serviceType: "FOOD",
          serviceId: foodServiceId,
          items: [
            { name: "Paneer Rice Bowl", quantity: 2 }, // 2 * 90 = 180
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.data.quotedPrice).toBe(180);
      expect(res.body.data.status).toBe("RECEIVED");
    });
  });

  describe("Idempotency Protection", () => {
    it("should return the same booking when idempotency key is re-submitted", async () => {
      const idempotencyKey = `idem-${Date.now()}`;

      const first = await request(app)
        .post("/api/v1/bookings")
        .set("Authorization", `Bearer ${customerToken}`)
        .set("Idempotency-Key", idempotencyKey)
        .send({
          serviceType: "BIKE_RIDE",
          serviceId: bikeServiceId,
          pickup: "Main Gate",
          dropoff: "Library",
          date: "Today",
          time: "8:00 PM",
          passengers: 1,
        });

      expect(first.status).toBe(201);

      const second = await request(app)
        .post("/api/v1/bookings")
        .set("Authorization", `Bearer ${customerToken}`)
        .set("Idempotency-Key", idempotencyKey)
        .send({
          serviceType: "BIKE_RIDE",
          serviceId: bikeServiceId,
          pickup: "Main Gate",
          dropoff: "Library",
          date: "Today",
          time: "8:00 PM",
          passengers: 1,
        });

      expect(second.status).toBe(201);
      expect(second.body.data.id).toBe(first.body.data.id);
    });
  });

  describe("Status Transitions & State Machine Validation", () => {
    it("should reject invalid status transition (e.g. REQUESTED -> COMPLETED directly for ride)", async () => {
      // Create a new ride booking
      const created = await request(app)
        .post("/api/v1/bookings")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({
          serviceType: "BIKE_RIDE",
          serviceId: bikeServiceId,
          pickup: "Main Gate",
          dropoff: "Library",
          date: "Today",
          time: "9:00 PM",
          passengers: 1,
        });

      const bookingId = created.body.data.id;

      // Try illegal direct transition to COMPLETED
      const invalid = await request(app)
        .patch(`/api/v1/bookings/${bookingId}/status`)
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ status: "COMPLETED" });

      expect(invalid.status).toBe(400);
      expect(invalid.body.error.code).toBe("INVALID_STATUS_TRANSITION");
    });
  });

  describe("Admin Vendor Onboarding", () => {
    it("should onboard a new vendor and return an activation token", async () => {
      const email = `cafe_${Date.now()}@campus.in`;
      const phone = `+9198${Math.floor(10000000 + Math.random() * 90000000)}`;

      const res = await request(app)
        .post("/api/v1/admin/vendors")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          businessName: "Campus Bistro",
          ownerName: "Mira Sen",
          email,
          phone,
          whatsappNumber: phone,
          vendorType: "FOOD",
          accessPlan: "PAID",
          accessStartDate: "2025-07-01",
          accessEndDate: "2025-12-31",
          monthlyPrice: 1500,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.vendor.businessName).toBe("Campus Bistro");
      expect(res.body.data.activationToken).toBeDefined();
    });
  });
});
