import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Získat všechny zakázky s filtry
export const getOrders = query({
  args: {
    search: v.optional(v.string()),
    overdue: v.optional(v.boolean()),
    licencePlate: v.optional(v.string()),
    vehicleId: v.optional(v.id("vehicles")), // ✅ NEW
  },
  handler: async (ctx, args) => {
    let orders = await ctx.db.query("orders").collect();

    // ✅ NEW: Filtrování podle vehicleId
    if (args.vehicleId) {
      orders = orders.filter((order) => order.vehicleId === args.vehicleId);
    }

    // Filtrování podle hledání
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      orders = orders.filter(
        (order) =>
          order.licencePlate?.toLowerCase().includes(searchLower) ||
          order.company?.toLowerCase().includes(searchLower) ||
          order.contactName?.toLowerCase().includes(searchLower) ||
          order.orderNumber?.toString().includes(searchLower)
      );
    }

    // Filtrování po termínu
    if (args.overdue) {
      orders = orders.filter(
        (order) => order.overdue?.toLowerCase() === "ano" || order.overdue === "Ano"
      );
    }

    // Filtrování podle SPZ (fallback / kompatibilita)
    if (args.licencePlate) {
      orders = orders.filter((order) => order.licencePlate === args.licencePlate);
    }

    // Seřadit podle data (nejnovější první)
    orders.sort((a, b) => {
      const dateA = new Date(a.date.split(".").reverse().join("-"));
      const dateB = new Date(b.date.split(".").reverse().join("-"));
      return dateB.getTime() - dateA.getTime();
    });

    return orders;
  },
});

// Získat jednu zakázku podle ID
export const getOrder = query({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Přidat novou zakázku
export const addOrder = mutation({
  args: {
    orderNumber: v.number(),
    date: v.string(),
    licencePlate: v.string(),

    vehicleId: v.optional(v.id("vehicles")), // ✅ NEW

    company: v.optional(v.string()),
    contactName: v.optional(v.string()),
    contactCompany: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    kmState: v.optional(v.string()),
    repairRequest: v.optional(v.string()),
    deadline: v.optional(v.string()),
    time: v.optional(v.string()),
    note: v.optional(v.string()),
    pickUp: v.optional(v.string()),
    pickUpAddress: v.optional(v.string()),
    pickUpTimeCollection: v.optional(v.string()),
    pickUpTimeReturn: v.optional(v.string()),
    autoService: v.optional(v.string()),
    vin: v.optional(v.string()),
    brand: v.optional(v.string()),
    nv: v.optional(v.string()),
    confirmed: v.optional(v.string()),
    calculation: v.optional(v.string()),
    invoicing: v.optional(v.string()),
    overdue: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const orderId = await ctx.db.insert("orders", args);
    return orderId;
  },
});

// Aktualizovat zakázku
export const updateOrder = mutation({
  args: {
    id: v.id("orders"),
    orderNumber: v.optional(v.number()),
    date: v.optional(v.string()),
    licencePlate: v.optional(v.string()),

    vehicleId: v.optional(v.id("vehicles")), // ✅ NEW

    company: v.optional(v.string()),
    contactName: v.optional(v.string()),
    contactCompany: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    kmState: v.optional(v.string()),
    repairRequest: v.optional(v.string()),
    deadline: v.optional(v.string()),
    time: v.optional(v.string()),
    note: v.optional(v.string()),
    pickUp: v.optional(v.string()),
    pickUpAddress: v.optional(v.string()),
    pickUpTimeCollection: v.optional(v.string()),
    pickUpTimeReturn: v.optional(v.string()),
    autoService: v.optional(v.string()),
    vin: v.optional(v.string()),
    brand: v.optional(v.string()),
    nv: v.optional(v.string()),
    confirmed: v.optional(v.string()),
    calculation: v.optional(v.string()),
    invoicing: v.optional(v.string()),
    overdue: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return id;
  },
});

// Smazat zakázku
export const deleteOrder = mutation({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// zakázky podle ID auta
export const getOrdersByVehicleId = query({
  args: { vehicleId: v.id("vehicles") },
  handler: async (ctx, { vehicleId }) => {
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_vehicle_id", (q) => q.eq("vehicleId", vehicleId))
      .collect();

    orders.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
    return orders;
  },
});

// Statistiky
export const getOrderStats = query({
  handler: async (ctx) => {
    const orders = await ctx.db.query("orders").collect();

    const total = orders.length;
    const overdue = orders.filter((o) => o.overdue?.toLowerCase() === "ano").length;
    const confirmed = orders.filter((o) => o.confirmed?.toLowerCase() === "ano").length;
    const pickUpOrders = orders.filter((o) => o.pickUp?.toLowerCase() === "ano").length;

    return {
      total,
      overdue,
      confirmed,
      pickUpOrders,
    };
  },
});
export const backfillVehicleIdByPlate = mutation({
  args: {},
  handler: async (ctx) => {
    const orders = await ctx.db.query("orders").collect();
    const vehicles = await ctx.db.query("vehicles").collect();

    // map normalized SPZ -> vehicleId
    const map = new Map<string, any>();
    for (const v of vehicles) {
      const key = (v.licencePlate || "").replace(/\s/g, "").toUpperCase();
      if (key) map.set(key, v._id);
    }

    let updated = 0;
    let skipped = 0;

    for (const o of orders) {
      if (o.vehicleId) {
        skipped++;
        continue;
      }
      const key = (o.licencePlate || "").replace(/\s/g, "").toUpperCase();
      const vehicleId = map.get(key);
      if (!vehicleId) {
        skipped++;
        continue;
      }

      await ctx.db.patch(o._id, { vehicleId });
      updated++;
    }

    return { updated, skipped, total: orders.length };
  },
});
