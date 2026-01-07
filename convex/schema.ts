import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"
import { authTables } from "@convex-dev/auth/server"

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
    licencePlate: v.string(), // SPZ
    vehicleId: v.optional(v.id("vehicles")), // Relace na vozidlo
    
    // Firma a kontakt
    company: v.optional(v.string()), // Firma
    contactName: v.optional(v.string()), // Jméno
    contactCompany: v.optional(v.string()), // Společnost
    phone: v.optional(v.string()), // Telefon
    email: v.optional(v.string()), // Email
    
    // Detaily zakázky
    kmState: v.optional(v.string()), // Stav KM
    repairRequest: v.optional(v.string()), // Požadavek opravy
    deadline: v.optional(v.string()), // Termín
    time: v.optional(v.string()), // Čas
    note: v.optional(v.string()), // Poznámka
    
    // Pick-up služba
    pickUp: v.optional(v.string()), // ANO/NE
    pickUpAddress: v.optional(v.string()),
    pickUpTimeCollection: v.optional(v.string()), // Čas vyzvednutí
    pickUpTimeReturn: v.optional(v.string()), // Čas vrácení
    
    // Autoservis
    autoService: v.optional(v.string()), // Autoservis
    vin: v.optional(v.string()), // VIN
    brand: v.optional(v.string()), // Značka
    
    // Stavy
    nv: v.optional(v.string()), // NV
    confirmed: v.optional(v.string()), // Potvrzeno
    calculation: v.optional(v.string()), // Kalkulace
    invoicing: v.optional(v.string()), // Fakturace
    overdue: v.optional(v.string()), // Po termínu
  })
    .index("by_order_number", ["orderNumber"])
    .index("by_licence_plate", ["licencePlate"])
    .index("by_date", ["date"])
    .index("by_deadline", ["deadline"])
    .index("by_overdue", ["overdue"]),
})
