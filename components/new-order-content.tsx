"use client";

import { useState, useEffect, useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Car, User, Calendar, FileText, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function NewOrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const vehicleIdFromUrl = searchParams.get("vehicleId"); // NEW
  const spzFromUrl = searchParams.get("spz") || ""; // fallback

  const addOrder = useMutation(api.orders.addOrder);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    orderNumber: Math.floor(Math.random() * 10000) + 5000,
    date: new Date().toLocaleDateString("cs-CZ"),
    licencePlate: spzFromUrl.toUpperCase(),

    company: "",
    contactName: "",
    contactCompany: "",
    phone: "",
    email: "",
    kmState: "",
    repairRequest: "",
    deadline: "",
    time: "",
    note: "",

    pickUp: false,
    pickUpAddress: "",
    pickUpTimeCollection: "",
    pickUpTimeReturn: "",

    autoService: "",
    vin: "",
    brand: "",
  });

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // --- NEW: když je vehicleId, načti vozidlo podle ID ---
  const vehicleById = useQuery(
    api.vehicles.getVehicle,
    vehicleIdFromUrl ? ({ id: vehicleIdFromUrl as Id<"vehicles"> } as any) : "skip"
  );

  // --- fallback: vyhledání podle SPZ (zůstává) ---
  const vehicleByPlate = useQuery(
    api.vehicles.getVehicleByPlate,
    !vehicleIdFromUrl && formData.licencePlate.length >= 2
      ? { licencePlate: formData.licencePlate.toUpperCase() }
      : "skip"
  );

  // Jednotný "vehicle" objekt pro UI (preferuje vehicleId)
  const vehicle = useMemo(() => {
    return vehicleIdFromUrl ? vehicleById : vehicleByPlate;
  }, [vehicleIdFromUrl, vehicleById, vehicleByPlate]);

  // --- NEW: když přijde vehicleById, předvyplň SPZ a údaje ---
  useEffect(() => {
    if (vehicleIdFromUrl && vehicleById) {
      setFormData((prev) => ({
        ...prev,
        licencePlate: (vehicleById.licencePlate || "").toUpperCase(),
        brand: vehicleById.make || prev.brand,
        company: vehicleById.lessor || prev.company,
        vin: vehicleById.vinCode || prev.vin,
        autoService: vehicleById.modelLine
          ? `${vehicleById.make || ""} ${vehicleById.modelLine}${vehicleById.trim ? " " + vehicleById.trim : ""}`.trim()
          : prev.autoService,
      }));
    }
  }, [vehicleIdFromUrl, vehicleById]);

  // původní auto-fill, když se najde podle SPZ (fallback)
  useEffect(() => {
    if (!vehicleIdFromUrl && vehicleByPlate) {
      setFormData((prev) => ({
        ...prev,
        brand: vehicleByPlate.make || "",
        company: vehicleByPlate.lessor || "",
        vin: vehicleByPlate.vinCode || "",
        autoService: vehicleByPlate.modelLine
          ? `${vehicleByPlate.make || ""} ${vehicleByPlate.modelLine}${vehicleByPlate.trim ? " " + vehicleByPlate.trim : ""}`.trim()
          : "",
      }));
    }
  }, [vehicleIdFromUrl, vehicleByPlate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.licencePlate) {
      setError("SPZ je povinné pole");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await addOrder({
        orderNumber: formData.orderNumber,
        date: formData.date,
        licencePlate: formData.licencePlate.toUpperCase(),

        // NEW: přidáme vehicleId pokud je v URL
        vehicleId: vehicleIdFromUrl ? (vehicleIdFromUrl as Id<"vehicles">) : undefined,

        company: formData.company || undefined,
        contactName: formData.contactName || undefined,
        contactCompany: formData.contactCompany || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        kmState: formData.kmState || undefined,
        repairRequest: formData.repairRequest || undefined,
        deadline: formData.deadline || undefined,
        time: formData.time || undefined,
        note: formData.note || undefined,
        pickUp: formData.pickUp ? "Ano" : "Ne",
        pickUpAddress: formData.pickUpAddress || undefined,
        pickUpTimeCollection: formData.pickUpTimeCollection || undefined,
        pickUpTimeReturn: formData.pickUpTimeReturn || undefined,
        autoService: formData.autoService || undefined,
        vin: formData.vin || undefined,
        brand: formData.brand || undefined,
        confirmed: "Ne",
        calculation: "Ne",
        invoicing: "Ne",
        overdue: "Ne",
      });

      router.push("/orders");
    } catch (err) {
      console.error("Error creating order:", err);
      setError("Nepodařilo se vytvořit zakázku. Zkuste to znovu.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link href="/orders" className="text-slate-600 hover:text-slate-900">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Nová zakázka</h1>
              <p className="text-slate-600 mt-1">Vyplňte údaje pro vytvoření nové zakázky</p>
              {vehicleIdFromUrl ? (
                <p className="text-sm text-slate-500 mt-1">
                  Zakázka bude navázaná na vozidlo (vehicleId)
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

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
                  <Label htmlFor="orderNumber">Číslo zakázky</Label>
                  <Input
                    id="orderNumber"
                    type="number"
                    value={formData.orderNumber}
                    onChange={(e) => handleChange("orderNumber", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="date">Datum</Label>
                  <Input
                    id="date"
                    value={formData.date}
                    onChange={(e) => handleChange("date", e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="licencePlate">SPZ *</Label>
                  <Input
                    id="licencePlate"
                    value={formData.licencePlate}
                    onChange={(e) => handleChange("licencePlate", e.target.value.toUpperCase())}
                    placeholder="např. 1AB 2345"
                    className="mt-1 font-bold uppercase"
                    required
                    // Když jdeš přes vehicleId, SPZ je odvozené z vozidla – můžeš nechat editovatelné,
                    // ale často je lepší ho zamknout, aby se nevytvořil nesoulad.
                    disabled={Boolean(vehicleIdFromUrl)}
                  />

                  {/* indikátory */}
                  {vehicle && (
                    <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                      <span className="inline-block w-2 h-2 bg-green-600 rounded-full"></span>
                      Vozidlo nalezeno: {vehicle.make} {vehicle.modelLine}
                    </p>
                  )}
                  {!vehicleIdFromUrl && formData.licencePlate.length >= 3 && vehicle === null && (
                    <p className="text-sm text-amber-600 mt-1 flex items-center gap-1">
                      <span className="inline-block w-2 h-2 bg-amber-600 rounded-full"></span>
                      Vozidlo není v databázi
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="kmState">Stav KM</Label>
                  <Input
                    id="kmState"
                    value={formData.kmState}
                    onChange={(e) => handleChange("kmState", e.target.value)}
                    placeholder="např. 125000"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="repairRequest">Požadavek opravy</Label>
                <Textarea
                  id="repairRequest"
                  value={formData.repairRequest}
                  onChange={(e) => handleChange("repairRequest", e.target.value)}
                  placeholder="Popište požadovanou opravu..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="note">Poznámka</Label>
                <Textarea
                  id="note"
                  value={formData.note}
                  onChange={(e) => handleChange("note", e.target.value)}
                  placeholder="Další poznámky..."
                  className="mt-1"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Kontaktní údaje */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Kontaktní údaje
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company" className="flex items-center gap-2">
                    Firma
                    {vehicle?.lessor && (
                      <span className="text-xs text-green-600 font-normal">(z databáze)</span>
                    )}
                  </Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleChange("company", e.target.value)}
                    className={`mt-1 ${vehicle?.lessor ? "bg-green-50" : ""}`}
                  />
                </div>
                <div>
                  <Label htmlFor="contactName">Jméno kontaktu</Label>
                  <Input
                    id="contactName"
                    value={formData.contactName}
                    onChange={(e) => handleChange("contactName", e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="+420 xxx xxx xxx"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="email@example.com"
                    className="mt-1"
                  />
                </div>
              </div>
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
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="deadline">Termín</Label>
                  <Input
                    id="deadline"
                    value={formData.deadline}
                    onChange={(e) => handleChange("deadline", e.target.value)}
                    placeholder="DD.MM.YYYY"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="time">Čas</Label>
                  <Input
                    id="time"
                    value={formData.time}
                    onChange={(e) => handleChange("time", e.target.value)}
                    placeholder="HH:MM"
                    className="mt-1"
                  />
                </div>
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
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="brand" className="flex items-center gap-2">
                    Značka
                    {vehicle?.make && (
                      <span className="text-xs text-green-600 font-normal">(z databáze)</span>
                    )}
                  </Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => handleChange("brand", e.target.value)}
                    className={`mt-1 ${vehicle?.make ? "bg-green-50" : ""}`}
                  />
                </div>
                <div>
                  <Label htmlFor="autoService">Autoservis</Label>
                  <Input
                    id="autoService"
                    value={formData.autoService}
                    onChange={(e) => handleChange("autoService", e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="vin" className="flex items-center gap-2">
                  VIN
                  {vehicle?.vinCode && (
                    <span className="text-xs text-green-600 font-normal">(z databáze)</span>
                  )}
                </Label>
                <Input
                  id="vin"
                  value={formData.vin}
                  onChange={(e) => handleChange("vin", e.target.value.toUpperCase())}
                  placeholder="17 znaků"
                  className={`mt-1 font-mono ${vehicle?.vinCode ? "bg-green-50" : ""}`}
                  maxLength={17}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pick-up služba */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Pick-up služba
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="pickUp"
                  checked={formData.pickUp}
                  onCheckedChange={(checked) => handleChange("pickUp", checked)}
                />
                <Label htmlFor="pickUp">Aktivovat pick-up službu</Label>
              </div>

              {formData.pickUp && (
                <>
                  <div>
                    <Label htmlFor="pickUpAddress">Adresa vyzvednutí</Label>
                    <Input
                      id="pickUpAddress"
                      value={formData.pickUpAddress}
                      onChange={(e) => handleChange("pickUpAddress", e.target.value)}
                      placeholder="Ulice, město, PSČ"
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pickUpTimeCollection">Čas vyzvednutí</Label>
                      <Input
                        id="pickUpTimeCollection"
                        value={formData.pickUpTimeCollection}
                        onChange={(e) => handleChange("pickUpTimeCollection", e.target.value)}
                        placeholder="HH:MM"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pickUpTimeReturn">Čas vrácení</Label>
                      <Input
                        id="pickUpTimeReturn"
                        value={formData.pickUpTimeReturn}
                        onChange={(e) => handleChange("pickUpTimeReturn", e.target.value)}
                        placeholder="HH:MM"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button type="submit" disabled={saving} className="flex-1 h-12 text-lg">
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Ukládám...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Vytvořit zakázku
                </>
              )}
            </Button>
            <Link href="/orders">
              <Button type="button" variant="outline" className="h-12">
                Zrušit
              </Button>
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
