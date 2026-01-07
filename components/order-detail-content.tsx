"use client";

import { use, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Phone,
  Mail,
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

export default function OrderDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const order = useQuery(api.orders.getOrder, { id: id as Id<"orders"> });
  console.log("ORDER DETAIL HEADER WITH ACTIONS LOADED", id);

  const printUrl = useMemo(() => `/orders/${id}/print`, [id]);

  const mailtoCustomer = useMemo(() => {
    if (!order?.email) return null;
    const subject = encodeURIComponent(`Zakázka #${order.orderNumber} – ${order.licencePlate}`);
    const body = encodeURIComponent(
      `Dobrý den,\n\nzasíláme zakázkový list k zakázce #${order.orderNumber} (${order.licencePlate}).\n\nOdkaz na zakázkový list:\n${typeof window !== "undefined" ? window.location.origin : ""}${printUrl}\n\nS pozdravem\nAutoservis`
    );
    return `mailto:${order.email}?subject=${subject}&body=${body}`;
  }, [order?.email, order?.orderNumber, order?.licencePlate, printUrl]);

  // klientský email zatím nemáš ve schématu -> připravené, ale bude disabled
  const clientEmail = (order as any)?.clientEmail as string | undefined;

  const mailtoClient = useMemo(() => {
    if (!clientEmail) return null;
    const subject = encodeURIComponent(`Zakázka #${order?.orderNumber} – ${order?.licencePlate}`);
    const body = encodeURIComponent(
      `Dobrý den,\n\nzasíláme zakázkový list k zakázce #${order?.orderNumber} (${order?.licencePlate}).\n\nOdkaz na zakázkový list:\n${typeof window !== "undefined" ? window.location.origin : ""}${printUrl}\n\nS pozdravem\nAutoservis`
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
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/orders" className="text-slate-600 hover:text-slate-900">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl font-bold text-slate-900">Zakázka #{order.orderNumber}</h1>

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

            {/* ✅ AKCE */}
            <div className="flex gap-2 flex-wrap justify-end">
              <Link href={printUrl}>
                <Button variant="outline" className="gap-2">
                  <Printer className="h-4 w-4" />
                  Zakázkový list
                </Button>
              </Link>

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Základní informace */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Základní informace
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Datum vytvoření</label>
                    <p className="text-slate-900 mt-1">{order.date || "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Číslo zakázky</label>
                    <p className="text-slate-900 mt-1 font-bold">#{order.orderNumber}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">SPZ</label>
                    <p className="text-slate-900 mt-1 font-bold text-lg">{order.licencePlate}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Stav KM</label>
                    <p className="text-slate-900 mt-1">{order.kmState || "-"}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-600">Požadavek opravy</label>
                  <p className="text-slate-900 mt-1 bg-slate-50 p-3 rounded-lg">
                    {order.repairRequest || "-"}
                  </p>
                </div>

                {order.note && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Poznámka</label>
                    <p className="text-slate-900 mt-1 bg-amber-50 border border-amber-200 p-3 rounded-lg">
                      {order.note}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Termín */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Termín zakázky
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Termín</label>
                    <p className="text-slate-900 mt-1 text-lg font-semibold">{order.deadline || "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Čas</label>
                    <p className="text-slate-900 mt-1 text-lg font-semibold">{order.time || "-"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pick-up služba */}
            {order.pickUp?.toLowerCase() === "ano" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Pick-up služba
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Adresa</label>
                    <p className="text-slate-900 mt-1">{order.pickUpAddress || "-"}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-600">Čas vyzvednutí</label>
                      <p className="text-slate-900 mt-1">{order.pickUpTimeCollection || "-"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Čas vrácení</label>
                      <p className="text-slate-900 mt-1">{order.pickUpTimeReturn || "-"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Kontakt */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Kontaktní údaje
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-slate-600">Jméno</label>
                  <p className="text-slate-900 mt-1">{order.contactName || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Firma</label>
                  <p className="text-slate-900 mt-1">{order.company || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Telefon</label>
                  <p className="text-slate-900 mt-1">
                    {order.phone ? (
                      <a href={`tel:${order.phone}`} className="text-primary hover:underline">
                        {order.phone}
                      </a>
                    ) : (
                      "-"
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Email</label>
                  <p className="text-slate-900 mt-1">
                    {order.email ? (
                      <a href={`mailto:${order.email}`} className="text-primary hover:underline break-all">
                        {order.email}
                      </a>
                    ) : (
                      "-"
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Vozidlo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Vozidlo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-slate-600">VIN</label>
                  <p className="text-slate-900 mt-1 font-mono text-sm">{order.vin || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Značka</label>
                  <p className="text-slate-900 mt-1">{order.brand || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Autoservis</label>
                  <p className="text-slate-900 mt-1">{order.autoService || "-"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Stavy */}
            <Card>
              <CardHeader>
                <CardTitle>Stavy zakázky</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                  <span className="text-sm text-slate-600">NV</span>
                  <Badge variant={order.nv?.toLowerCase() === "ano" ? "default" : "outline"}>
                    {order.nv || "NE"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                  <span className="text-sm text-slate-600">Potvrzeno</span>
                  <Badge variant={order.confirmed?.toLowerCase() === "ano" ? "default" : "outline"}>
                    {order.confirmed || "NE"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                  <span className="text-sm text-slate-600">Kalkulace</span>
                  <Badge variant={order.calculation?.toLowerCase() === "ano" ? "default" : "outline"}>
                    {order.calculation || "NE"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                  <span className="text-sm text-slate-600">Fakturace</span>
                  <Badge variant={order.invoicing?.toLowerCase() === "ano" ? "default" : "outline"}>
                    {order.invoicing || "NE"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
