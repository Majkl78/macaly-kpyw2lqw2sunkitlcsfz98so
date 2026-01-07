import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Získat všechna vozidla
export const getVehicles = query({
  args: {
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let vehicles = await ctx.db.query("vehicles").collect();
    
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      vehicles = vehicles.filter(vehicle => 
        vehicle.licencePlate?.toLowerCase().includes(searchLower) ||
        vehicle.make?.toLowerCase().includes(searchLower) ||
        vehicle.modelLine?.toLowerCase().includes(searchLower) ||
        vehicle.vinCode?.toLowerCase().includes(searchLower)
      );
    }
    
    return vehicles;
  },
});

// vozidlo query
export const getVehicle = query({
  args: { id: v.id("vehicles") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

// Získat vozidlo podle ID
export const getVehicle = query({
  args: { id: v.id("vehicles") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Získat vozidlo podle SPZ (case-insensitive)
export const getVehicleByPlate = query({
  args: { licencePlate: v.string() },
  handler: async (ctx, args) => {
    // Normalizace SPZ - odstranění mezer a převod na velká písmena
    const normalizedPlate = args.licencePlate.replace(/\s/g, '').toUpperCase();
    
    // Nejprve zkusíme přesnou shodu s indexem
    let vehicle = await ctx.db
      .query("vehicles")
      .withIndex("by_licence_plate", (q) => q.eq("licencePlate", normalizedPlate))
      .first();
    
    // Pokud nenajdeme, zkusíme case-insensitive vyhledávání
    if (!vehicle) {
      const allVehicles = await ctx.db.query("vehicles").collect();
      vehicle = allVehicles.find(v => 
        v.licencePlate?.replace(/\s/g, '').toUpperCase() === normalizedPlate
      ) || null;
    }
    
    console.log('Hledám SPZ:', args.licencePlate, '-> normalizováno:', normalizedPlate, '-> nalezeno:', vehicle ? 'ANO' : 'NE');
    
    return vehicle;
  },
});

// Přidat nové vozidlo
export const addVehicle = mutation({
  args: {
    licencePlate: v.string(),
    make: v.optional(v.string()),
    modelLine: v.optional(v.string()),
    trim: v.optional(v.string()),
    engineCapacity: v.optional(v.string()),
    powerKw: v.optional(v.string()),
    fuelType: v.optional(v.string()),
    transmission: v.optional(v.string()),
    powertrain: v.optional(v.string()),
    vinCode: v.optional(v.string()),
    lessor: v.optional(v.string()),
    ownershipType: v.optional(v.string()),
    permanentAddressCity: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const vehicleId = await ctx.db.insert("vehicles", args);
    return vehicleId;
  },
});

// Aktualizovat vozidlo
export const updateVehicle = mutation({
  args: {
    id: v.id("vehicles"),
    licencePlate: v.optional(v.string()),
    make: v.optional(v.string()),
    modelLine: v.optional(v.string()),
    trim: v.optional(v.string()),
    engineCapacity: v.optional(v.string()),
    powerKw: v.optional(v.string()),
    fuelType: v.optional(v.string()),
    transmission: v.optional(v.string()),
    powertrain: v.optional(v.string()),
    vinCode: v.optional(v.string()),
    lessor: v.optional(v.string()),
    ownershipType: v.optional(v.string()),
    permanentAddressCity: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return id;
  },
});

// Smazat vozidlo
export const deleteVehicle = mutation({
  args: { id: v.id("vehicles") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Bulk import vozidel z XLS
export const bulkImportVehicles = mutation({
  args: {
    vehicles: v.array(v.object({
      licencePlate: v.string(),
      make: v.optional(v.string()),
      modelLine: v.optional(v.string()),
      trim: v.optional(v.string()),
      engineCapacity: v.optional(v.string()),
      powerKw: v.optional(v.string()),
      fuelType: v.optional(v.string()),
      transmission: v.optional(v.string()),
      vinCode: v.optional(v.string()),
      lessor: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    let imported = 0;
    let updated = 0;
    let errors = 0;

    for (const vehicle of args.vehicles) {
      try {
        // Kontrola, zda vozidlo už existuje
        const existing = await ctx.db
          .query("vehicles")
          .withIndex("by_licence_plate", (q) => q.eq("licencePlate", vehicle.licencePlate))
          .first();

        if (existing) {
          // Aktualizovat existující
          await ctx.db.patch(existing._id, vehicle);
          updated++;
        } else {
          // Vložit nové
          await ctx.db.insert("vehicles", vehicle);
          imported++;
        }
      } catch (error) {
        console.error(`Error importing vehicle ${vehicle.licencePlate}:`, error);
        errors++;
      }
    }

    return { imported, updated, errors };
  },
});
