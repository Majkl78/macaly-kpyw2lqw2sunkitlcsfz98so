"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PrintOrderContent({ orderId }: { orderId: string }) {
  const order = useQuery(api.orders.getOrder, { id: orderId as Id<"orders"> });

  if (order === undefined) return <div className="p-6">Načítám…</div>;
  if (!order) return <div className="p-6">Zakázka nenalezena.</div>;

  return (
    <div className="p-6 print:p-0">
      <div className="flex gap-2 mb-4 print:hidden">
        <Button onClick={() => window.print()}>Tisk / Uložit jako PDF</Button>
        <Link href={`/orders/${order._id}`}>
          <Button variant="outline">Zpět na detail</Button>
        </Link>
      </div>

      <div className="bg-white p-8 print:p-6 max-w-3xl mx-auto border print:border-0">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold">Zakázkový list</h1>
            <div className="text-slate-600 mt-1">Zakázka #{order.orderNumber}</div>
          </div>
          <div className="text-right text-sm">
            <div><span className="text-slate-500">Datum:</span> {order.date}</div>
            <div><span className="text-slate-500">Termín:</span> {order.deadline || "-"}</div>
            <div><span className="text-slate-500">Čas:</span> {order.time || "-"}</div>
          </div>
        </div>

        <hr className="my-6" />

        <div className="grid grid-cols-2 gap-6 text-sm">
          <div>
            <h2 className="font-semibold mb-2">Zákazník</h2>
            <div><span className="text-slate-500">Firma:</span> {order.company || "-"}</div>
            <div><span className="text-slate-500">Kontakt:</span> {order.contactName || "-"}</div>
            <div><span className="text-slate-500">Telefon:</span> {order.phone || "-"}</div>
            <div><span className="text-slate-500">Email:</span> {order.email || "-"}</div>
          </div>

          <div>
            <h2 className="font-semibold mb-2">Vozidlo</h2>
            <div><span className="text-slate-500">SPZ:</span> <span className="font-semibold">{order.licencePlate}</span></div>
            <div><span className="text-slate-500">Značka:</span> {order.brand || "-"}</div>
            <div><span className="text-slate-500">VIN:</span> {order.vin || "-"}</div>
            <div><span className="text-slate-500">Stav KM:</span> {order.kmState || "-"}</div>
          </div>
        </div>

        <hr className="my-6" />

        <div className="text-sm">
          <h2 className="font-semibold mb-2">Požadavek / práce</h2>
          <div className="whitespace-pre-wrap border rounded p-3">
            {order.repairRequest || "-"}
          </div>

          {order.note ? (
            <>
              <h2 className="font-semibold mt-4 mb-2">Poznámka</h2>
              <div className="whitespace-pre-wrap border rounded p-3">{order.note}</div>
            </>
          ) : null}
        </div>

        <hr className="my-6" />

        <div className="grid grid-cols-2 gap-6 text-sm">
          <div>
            <h2 className="font-semibold mb-2">Pick-up služba</h2>
            <div><span className="text-slate-500">Pick-up:</span> {order.pickUp || "-"}</div>
            <div><span className="text-slate-500">Adresa:</span> {order.pickUpAddress || "-"}</div>
            <div><span className="text-slate-500">Vyzvednutí:</span> {order.pickUpTimeCollection || "-"}</div>
            <div><span className="text-slate-500">Vrácení:</span> {order.pickUpTimeReturn || "-"}</div>
          </div>

          <div className="flex flex-col justify-end">
            <div className="mt-8">
              <div className="text-slate-500">Podpis zákazníka</div>
              <div className="mt-10 border-t" />
            </div>
          </div>
        </div>

        <style jsx global>{`
          @media print {
            body { background: white; }
          }
        `}</style>
      </div>
    </div>
  );
}
