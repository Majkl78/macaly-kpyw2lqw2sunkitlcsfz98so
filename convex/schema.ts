import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  orgs: defineTable({
    name: v.string(),
    createdAt: v.number(),
  }).index("by_name", ["name"]),

  profiles: defineTable({
    userId: v.id("users"),
    orgId: v.id("orgs"),
    role: v.union(
      v.literal("admin"),
      v.literal("reception"),
      v.literal("tech"),
      v.literal("viewer")
    ),
    displayName: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_org", ["orgId"])
    .index("by_org_role", ["orgId", "role"]),

  // Vozidla (SPZ list)
  vehicles: defineTable({
    licencePlate: v.string(), // SPZ
    make: v.optional(v.string()), // Výrobce (Značka)
    modelLine: v.optional(v.string()), // Model
    trim: v.optional(v.string()), // Výbava
    engineCapacity: v.optional(v.string()), // Obsah
    powerKw: v.optional(v.string()), // KW
    fuelType: v.optional(v.string()), // Palivo
    transmission: v.optional(v.string()), // Převodovka
    powertrain: v.optional(v.string()), // Motorizace (kombinované - legacy)
    vinCode: v.optional(v.string()), // VIN (vin_code)
    lessor: v.optional(v.string()), // Nájomce (Pronajímatel)
    ownershipType: v.optional(v.string()),
    permanentAddressCity: v.optional(v.string()),
  })
    .index("by_licence_plate", ["licencePlate"])
    .index("by_vin", ["vinCode"]),

  // Zakázky (Objednávky)
  orders: defineTable({
    orderNumber: v.number(), // Č. zakázky
    date: v.string(), // Datum vytvoření
    licencePlate: v.string(), // SPZ (snapshot)
    vehicleId: v.optional(v.id("vehicles")), // Relace na vozidlo

    // Firma a kontakt
    company: v.optional(v.string()),
    contactName: v.optional(v.string()),
    contactCompany: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),

    // Detaily zakázky
    kmState: v.optional(v.string()),
    repairRequest: v.optional(v.string()),
    deadline: v.optional(v.string()),
    time: v.optional(v.string()),
    note: v.optional(v.string()),

    // Pick-up služba
    pickUp: v.optional(v.string()), // ANO/NE
    pickUpAddress: v.optional(v.string()),
    pickUpTimeCollection: v.optional(v.string()),
    pickUpTimeReturn: v.optional(v.string()),

    // Autoservis
    autoService: v.optional(v.string()),
    vin: v.optional(v.string()),
    brand: v.optional(v.string()),

    // Stavy
    nv: v.optional(v.string()),
    confirmed: v.optional(v.string()),
    calculation: v.optional(v.string()),
    invoicing: v.optional(v.string()),
    overdue: v.optional(v.string()),
  })
    .index("by_order_number", ["orderNumber"])
    .index("by_licence_plate", ["licencePlate"])
    .index("by_vehicle_id", ["vehicleId"])
    .index("by_date", ["date"])
    .index("by_deadline", ["deadline"])
    .index("by_overdue", ["overdue"]),
    // =========================
  // V2: Vozidla (nový model)
  // =========================
  vehicles_v2: defineTable({
    orgId: v.id("orgs"),

    plateDisplay: v.string(), // např. "1AB 2345"
    plateNorm: v.string(), // např. "1AB2345" (normalizované pro vyhledávání)

    vinNorm: v.optional(v.string()),

    make: v.optional(v.string()),
    modelLine: v.optional(v.string()),
    notes: v.optional(v.string()),

    searchKey: v.string(), // pro jednoduché vyhledávání
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_org_plateNorm", ["orgId", "plateNorm"])
    .index("by_org_searchKey", ["orgId", "searchKey"]),

  // =========================
  // V2: Zakázky (nový model)
  // =========================
  orders_v2: defineTable({
    orgId: v.id("orgs"),

    orderNumberDisplay: v.string(),
    orderNoNorm: v.string(),

    vehicleId: v.optional(v.id("vehicles_v2")),

    plateSnapshotDisplay: v.optional(v.string()),
    plateSnapshotNorm: v.optional(v.string()),

    status: v.union(
      v.literal("open"),
      v.literal("in_progress"),
      v.literal("waiting_parts"),
      v.literal("ready"),
      v.literal("closed"),
      v.literal("canceled")
    ),

    openedAt: v.number(), // epoch ms
    deadlineAt: v.optional(v.number()), // epoch ms
    closedAt: v.optional(v.number()), // epoch ms

    confirmed: v.boolean(),
    pickup: v.boolean(),

    description: v.optional(v.string()),
    notes: v.optional(v.string()),

    searchKey: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_org_orderNoNorm", ["orgId", "orderNoNorm"])
    .index("by_org_deadlineAt", ["orgId", "deadlineAt"])
    .index("by_org_status_updatedAt", ["orgId", "status", "updatedAt"])
    .index("by_org_vehicleId_updatedAt", ["orgId", "vehicleId", "updatedAt"])
    .index("by_org_searchKey", ["orgId", "searchKey"]),

});
