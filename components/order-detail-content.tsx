"use client";

import { useEffect, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Phone,
  Car,
  MapPin,
  FileText,
  AlertTriangle,
  Printer,
  Send,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function OrderDetailContent({ orderId }: { orderId: string }) {
  const id = orderId;

  const order = useQuery(api.orders.getOrder, { id: id as Id<"orders"> });

  // ✅ debug do konzole (uvidíš v DevTools -> Console)
  useEffect(() => {
    console.log("DEBUG OrderDetailContent render", { id, order });
  }, [id, order]);

  const printUrl = useMemo(() => `/orders/${id}/print`, [id]);

  const mailtoCustomer = useMemo(() => {
    if (!order?.email) return null;
    const subject = encodeURIComponent(`Zakázka #${order.orderNumber} – ${order.licencePlate}`);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const body = encodeURIComponent(
      `Dobrý den,\n\nzasíláme zakázkový list k zakázce #${order.orderNumber} (${order.licencePlate}).\n\nOdkaz na zakázkový list:\n${origin}${printUrl}\n\nS pozdravem\nAutoservis`
    );
    return `mailto:${order.email}?subject=${subject}&body=${body}`;
  }, [order?.email, order?.orderNumber, order?.licencePlate, printUrl]);

  const clientEmail = (order as any)?.clientEmail as string | undefined;

  const mailtoClient = useMemo(() => {
    if (!clientEmail) return null;
    const subject = encodeURIComponent(`Zakázka #${order?.orderNumber} – ${order?.licencePlate}`);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const body = encodeURIComponent(
      `Dobrý den,\n\nzasíláme zakázkový list k zakázce #${order?.orderNumber} (${order?.licencePlate}).\n\nOdkaz na zakázkový list:\n${origin}${printUrl}\n\nS pozdravem\nAutoservis`
    );
    return `mailto:${clientEmail}?subject=${subject}&body=${body}`;
  }, [clientEmail, order?.orderNumber, order?.licencePlate, printUrl]);

  if (order === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Načítám detail zakázky...</p>
        </div>
      </div>
    );
  }

  if (order === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 text-lg">Zakázka nenalezena</p>
          <Link href="/orders" className="text-primary hover:underline mt-4 inline-block">
            ← Zpět na seznam
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Link href="/orders" className="text-slate-600 hover:text-slate-900">
                <ArrowLeft className="h-6 w-6" />
              </Link>

              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl font-bold text-slate-900">
                    Zakázka #{order.orderNumber}
                  </h1>

                  {/* ✅ DEBUG uvidíš v UI */}
                  <span className="text-xs text-red-600">DEBUG: NOVÁ VERZE</span>

                  {order.overdue?.toLowerCase() === "ano" && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Po termínu
                    </Badge>
                  )}

                  {order.confirmed?.toLowerCase() === "ano" && (
                    <Badge variant="default" className="bg-green-600">
                      Potvrzeno
                    </Badge>
                  )}
                </div>

                <p className="text-slate-600 mt-1">{order.company || "Bez firmy"}</p>
              </div>
            </div>

            {/* AKCE */}
            <div className="flex flex-wrap gap-2 md:justify-end">
              <Button asChild variant="outline" className="gap-2">
                <Link href={printUrl}>
                  <Printer className="h-4 w-4" />
                  Zakázkový list
                </Link>
              </Button>

              <Button
                variant="outline"
                className="gap-2"
                disabled={!mailtoCustomer}
                asChild={Boolean(mailtoCustomer)}
              >
                {mailtoCustomer ? (
                  <a href={mailtoCustomer}>
                    <Send className="h-4 w-4" />
                    Odeslat zákazníkovi
                  </a>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Odeslat zákazníkovi
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                className="gap-2"
                disabled={!mailtoClient}
                asChild={Boolean(mailtoClient)}
                title={!mailtoClient ? "Doplň clientEmail (email klienta) do zakázky" : ""}
              >
                {mailtoClient ? (
                  <a href={mailtoClient}>
                    <Send className="h-4 w-4" />
                    Odeslat klientovi
                  </a>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Odeslat klientovi
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* ... zbytek stránky může zůstat jak ho máš */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* sem si nech svůj zbytek kódu */}
        <div className="text-sm text-slate-500">
          (Zbytek komponenty nech beze změny.)
        </div>
      </main>
    </div>
  );
}
