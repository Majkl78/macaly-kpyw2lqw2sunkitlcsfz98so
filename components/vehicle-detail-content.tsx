"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function VehicleDetailContent({ vehicleId }: { vehicleId: string }) {
  const vehicle = useQuery(api.vehicles.getVehicle, { id: vehicleId as Id<"vehicles"> });
  const orders = useQuery(api.orders.getOrdersByVehicleId, { vehicleId: vehicleId as Id<"vehicles"> });

  if (vehicle === undefined) return <div className="p-6">Načítám…</div>;
  if (!vehicle) return <div className="p-6">Vozidlo nenalezeno.</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{vehicle.licencePlate}</h1>
          <p className="text-slate-600">
            {[vehicle.make, vehicle.modelLine, vehicle.trim].filter(Boolean).join(" ")}
          </p>
        </div>

        <Link href={`/orders/new?vehicleId=${vehicle._id}`}>
          <Button>Nová zakázka</Button>
        </Link>
      </div>

      <Card className="p-4">
        <h2 className="font-semibold mb-3">Zakázky k vozidlu</h2>

        {orders === undefined ? (
          <div className="text-slate-600">Načítám…</div>
        ) : orders.length === 0 ? (
          <div className="text-slate-600">Zatím žádné zakázky.</div>
        ) : (
          <div className="space-y-2">
            {orders.map((o) => (
              <Link key={o._id} href={`/orders/${o._id}`} className="block">
                <div className="rounded-md border p-3 hover:bg-slate-50">
                  <div className="flex justify-between gap-4">
                    <div className="font-medium">Zakázka #{o.orderNumber}</div>
                    <div className="text-slate-600">{o.date}</div>
                  </div>
                  {o.repairRequest ? (
                    <div className="text-slate-700 mt-1 line-clamp-2">{o.repairRequest}</div>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
