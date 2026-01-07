import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Import vozidel
export const importVehicles = mutation({
  args: {
    vehicles: v.array(v.object({
      licencePlate: v.string(),
      make: v.optional(v.string()),
      modelLine: v.optional(v.string()),
      trim: v.optional(v.string()),
      powertrain: v.optional(v.string()),
      vinCode: v.optional(v.string()),
      lessor: v.optional(v.string()),
      ownershipType: v.optional(v.string()),
      permanentAddressCity: v.optional(v.string()),
    }))
  },
  handler: async (ctx, args) => {
    let count = 0;
    for (const vehicle of args.vehicles) {
      await ctx.db.insert("vehicles", vehicle);
      count++;
    }
    return { count };
  },
});

// Import zakázek
export const importOrders = mutation({
  args: {
    orders: v.array(v.object({
      orderNumber: v.number(),
      date: v.string(),
      licencePlate: v.string(),
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
    }))
  },
  handler: async (ctx, args) => {
    let count = 0;
    for (const order of args.orders) {
      await ctx.db.insert("orders", order);
      count++;
    }
    return { count };
  },
});
