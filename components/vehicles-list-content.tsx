"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { Search, ArrowLeft, Car, Plus, Pencil, Trash2, X, Save, Upload, FileSpreadsheet, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import * as XLSX from 'xlsx';

interface VehicleFormData {
  licencePlate: string;
  make: string;
  modelLine: string;
  trim: string;
  engineCapacity: string;
  powerKw: string;
  fuelType: string;
  transmission: string;
  vinCode: string;
  lessor: string;
}

const emptyForm: VehicleFormData = {
  licencePlate: "",
  make: "",
  modelLine: "",
  trim: "",
  engineCapacity: "",
  powerKw: "",
  fuelType: "",
  transmission: "",
  vinCode: "",
  lessor: "",
};

export default function VehiclesListContent() {
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<Id<"vehicles"> | null>(null);
  const [formData, setFormData] = useState<VehicleFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Id<"vehicles"> | null>(null);
  const [importResult, setImportResult] = useState<{ imported: number; updated: number; errors: number } | null>(null);
  
  const vehicles = useQuery(api.vehicles.getVehicles, {
    search: search || undefined,
  });

  const addVehicle = useMutation(api.vehicles.addVehicle);
  const updateVehicle = useMutation(api.vehicles.updateVehicle);
  const deleteVehicle = useMutation(api.vehicles.deleteVehicle);
  const bulkImportVehicles = useMutation(api.vehicles.bulkImportVehicles);

  const handleOpenNew = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (vehicle: {
    _id: Id<"vehicles">;
    licencePlate: string;
    make?: string;
    modelLine?: string;
    trim?: string;
    engineCapacity?: string;
    powerKw?: string;
    fuelType?: string;
    transmission?: string;
    vinCode?: string;
    lessor?: string;
  }) => {
    setFormData({
      licencePlate: vehicle.licencePlate || "",
      make: vehicle.make || "",
      modelLine: vehicle.modelLine || "",
      trim: vehicle.trim || "",
      engineCapacity: vehicle.engineCapacity || "",
      powerKw: vehicle.powerKw || "",
      fuelType: vehicle.fuelType || "",
      transmission: vehicle.transmission || "",
      vinCode: vehicle.vinCode || "",
      lessor: vehicle.lessor || "",
    });
    setEditingId(vehicle._id);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.licencePlate.trim()) {
      alert("SPZ je povinné pole");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await updateVehicle({
          id: editingId,
          licencePlate: formData.licencePlate.toUpperCase(),
          make: formData.make || undefined,
          modelLine: formData.modelLine || undefined,
          trim: formData.trim || undefined,
          engineCapacity: formData.engineCapacity || undefined,
          powerKw: formData.powerKw || undefined,
          fuelType: formData.fuelType || undefined,
          transmission: formData.transmission || undefined,
          vinCode: formData.vinCode || undefined,
          lessor: formData.lessor || undefined,
        });
      } else {
        await addVehicle({
          licencePlate: formData.licencePlate.toUpperCase(),
          make: formData.make || undefined,
          modelLine: formData.modelLine || undefined,
          trim: formData.trim || undefined,
          engineCapacity: formData.engineCapacity || undefined,
          powerKw: formData.powerKw || undefined,
          fuelType: formData.fuelType || undefined,
          transmission: formData.transmission || undefined,
          vinCode: formData.vinCode || undefined,
          lessor: formData.lessor || undefined,
        });
      }
      setIsDialogOpen(false);
      setFormData(emptyForm);
      setEditingId(null);
    } catch (error) {
      console.error("Error saving vehicle:", error);
      alert("Nepodařilo se uložit vozidlo");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: Id<"vehicles">) => {
    try {
      await deleteVehicle({ id });
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      alert("Nepodařilo se smazat vozidlo");
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportResult(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

      console.log("Parsed data:", jsonData.slice(0, 3)); // Debug first 3 rows

      const vehiclesToImport = jsonData.map((row) => ({
        licencePlate: String(row['SPZ'] || row['spz'] || '').trim().toUpperCase(),
        make: row['Výrobce'] ? String(row['Výrobce']).trim() : undefined,
        modelLine: row['Model'] ? String(row['Model']).trim() : undefined,
        trim: row['Výbava'] ? String(row['Výbava']).trim() : undefined,
        engineCapacity: row['Obsah'] ? String(row['Obsah']).trim() : undefined,
        powerKw: row['KW'] ? String(row['KW']).trim() : undefined,
        fuelType: row['Palivo'] ? String(row['Palivo']).trim() : undefined,
        transmission: row['Převodovka'] ? String(row['Převodovka']).trim() : undefined,
        vinCode: row['vin_code'] ? String(row['vin_code']).trim().toUpperCase() : undefined,
        lessor: row['Nájomce'] ? String(row['Nájomce']).trim() : undefined,
      })).filter(v => v.licencePlate && v.licencePlate.length > 0);

      console.log(`Importing ${vehiclesToImport.length} vehicles`);

      const result = await bulkImportVehicles({ vehicles: vehiclesToImport });
      setImportResult(result);
      
      // Reset file input
      event.target.value = '';
    } catch (error) {
      console.error("Error importing file:", error);
      alert("Chyba při importu souboru. Zkontrolujte formát XLS/XLSX.");
    } finally {
      setImporting(false);
    }
  };

  if (vehicles === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Načítám vozidla...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-slate-600 hover:text-slate-900">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Vozidla</h1>
                <p className="text-slate-600 mt-1">Celkem {vehicles.length} vozidel v databázi</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setIsImportDialogOpen(true)} 
                variant="outline"
                className="gap-2"
              >
                <Upload className="h-5 w-5" />
                Importovat XLS
              </Button>
              <Button onClick={handleOpenNew} className="gap-2">
                <Plus className="h-5 w-5" />
                Přidat vozidlo
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <Card className="p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Hledat podle SPZ, značky, VIN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        {/* Vehicles Grid */}
        {vehicles.length === 0 ? (
          <Card className="p-12 text-center">
            <Car className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">Žádná vozidla nenalezena</p>
            <p className="text-slate-400 mt-2">Zkuste změnit hledání nebo přidejte nové vozidlo</p>
            <Button onClick={handleOpenNew} className="mt-4 gap-2">
              <Plus className="h-5 w-5" />
              Přidat první vozidlo
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <Card key={vehicle._id} className="hover:shadow-lg transition-all group">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <Car className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(vehicle)}
                        className="h-8 w-8 p-0"
                      >
                        <Pencil className="h-4 w-4 text-slate-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirm(vehicle._id)}
                        className="h-8 w-8 p-0 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    {vehicle.licencePlate}
                  </h3>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-slate-600">Značka:</span>
                      <span className="ml-2 font-medium text-slate-900">
                        {vehicle.make || '-'}
                      </span>
                    </div>
                    
                    <div>
                      <span className="text-slate-600">Model:</span>
                      <span className="ml-2 font-medium text-slate-900">
                        {vehicle.modelLine || '-'}
                      </span>
                    </div>

                    {vehicle.trim && (
                      <div>
                        <span className="text-slate-600">Výbava:</span>
                        <span className="ml-2 font-medium text-slate-900">
                          {vehicle.trim}
                        </span>
                      </div>
                    )}

                    {(vehicle.engineCapacity || vehicle.powerKw || vehicle.fuelType || vehicle.transmission) && (
                      <div>
                        <span className="text-slate-600">Motorizace:</span>
                        <span className="ml-2 font-medium text-slate-900">
                          {[vehicle.engineCapacity, vehicle.powerKw && `${vehicle.powerKw}kW`, vehicle.fuelType, vehicle.transmission]
                            .filter(Boolean)
                            .join(' / ') || '-'}
                        </span>
                      </div>
                    )}
                    
                    {vehicle.vinCode && (
                      <div>
                        <span className="text-slate-600">VIN:</span>
                        <span className="ml-2 font-mono text-xs text-slate-900 break-all">
                          {vehicle.vinCode}
                        </span>
                      </div>
                    )}

                    {vehicle.lessor && (
                      <div>
                        <span className="text-slate-600">Firma:</span>
                        <span className="ml-2 font-medium text-slate-900">
                          {vehicle.lessor}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Link
                      href={`/orders/new?spz=${encodeURIComponent(vehicle.licencePlate)}`}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      <FileText className="h-4 w-4" />
                      Nová zakázka
                    </Link>
                    <Link
                      href={`/orders?licencePlate=${vehicle.licencePlate}`}
                      className="flex-1 text-center bg-purple-50 text-purple-700 py-2 px-4 rounded-lg hover:bg-purple-100 transition-colors font-medium"
                    >
                      Zakázky →
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              {editingId ? "Upravit vozidlo" : "Přidat nové vozidlo"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="licencePlate">SPZ *</Label>
              <Input
                id="licencePlate"
                value={formData.licencePlate}
                onChange={(e) => setFormData(prev => ({ ...prev, licencePlate: e.target.value.toUpperCase() }))}
                placeholder="např. 1AB 2345"
                className="mt-1 font-bold uppercase"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="make">Výrobce (Značka)</Label>
                <Input
                  id="make"
                  value={formData.make}
                  onChange={(e) => setFormData(prev => ({ ...prev, make: e.target.value }))}
                  placeholder="např. Škoda"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="modelLine">Model</Label>
                <Input
                  id="modelLine"
                  value={formData.modelLine}
                  onChange={(e) => setFormData(prev => ({ ...prev, modelLine: e.target.value }))}
                  placeholder="např. Octavia"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="trim">Výbava</Label>
              <Input
                id="trim"
                value={formData.trim}
                onChange={(e) => setFormData(prev => ({ ...prev, trim: e.target.value }))}
                placeholder="např. Ambition"
                className="mt-1"
              />
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Motorizace</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="engineCapacity">Obsah</Label>
                  <Input
                    id="engineCapacity"
                    value={formData.engineCapacity}
                    onChange={(e) => setFormData(prev => ({ ...prev, engineCapacity: e.target.value }))}
                    placeholder="např. 1968"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="powerKw">KW</Label>
                  <Input
                    id="powerKw"
                    value={formData.powerKw}
                    onChange={(e) => setFormData(prev => ({ ...prev, powerKw: e.target.value }))}
                    placeholder="např. 110"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="fuelType">Palivo</Label>
                  <Input
                    id="fuelType"
                    value={formData.fuelType}
                    onChange={(e) => setFormData(prev => ({ ...prev, fuelType: e.target.value }))}
                    placeholder="např. Nafta"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="transmission">Převodovka</Label>
                  <Input
                    id="transmission"
                    value={formData.transmission}
                    onChange={(e) => setFormData(prev => ({ ...prev, transmission: e.target.value }))}
                    placeholder="např. 6M"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div>
                <Label htmlFor="vinCode">VIN</Label>
                <Input
                  id="vinCode"
                  value={formData.vinCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, vinCode: e.target.value.toUpperCase() }))}
                  placeholder="17 znaků"
                  className="mt-1 font-mono"
                  maxLength={17}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="lessor">Nájomce (Firma)</Label>
              <Input
                id="lessor"
                value={formData.lessor}
                onChange={(e) => setFormData(prev => ({ ...prev, lessor: e.target.value }))}
                placeholder="např. LeasePlan"
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Zrušit
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Ukládám...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {editingId ? "Uložit změny" : "Přidat vozidlo"}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-600">Smazat vozidlo?</DialogTitle>
          </DialogHeader>
          <p className="text-slate-600 py-4">
            Opravdu chcete smazat toto vozidlo? Tato akce je nevratná.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Zrušit
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Smazat
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Importovat vozidla z XLS/XLSX
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">📋 Požadované sloupce:</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>SPZ</strong> - Registrační značka (povinné)</p>
                <p><strong>Výrobce</strong> - Značka vozidla</p>
                <p><strong>Model</strong> - Model vozidla</p>
                <p><strong>Výbava</strong> - Výbava vozidla</p>
                <p><strong>Obsah</strong> - Objem motoru</p>
                <p><strong>KW</strong> - Výkon v kilowattech</p>
                <p><strong>Palivo</strong> - Typ paliva</p>
                <p><strong>Převodovka</strong> - Typ převodovky</p>
                <p><strong>vin_code</strong> - VIN kód vozidla</p>
                <p><strong>Nájomce</strong> - Firma (pronajímatel)</p>
              </div>
            </div>

            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
              <Input
                type="file"
                accept=".xls,.xlsx"
                onChange={handleFileUpload}
                disabled={importing}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                  <Upload className={`h-12 w-12 ${importing ? 'text-slate-400' : 'text-purple-500'}`} />
                  <p className="text-lg font-medium text-slate-700">
                    {importing ? 'Importuji...' : 'Klikněte pro výběr souboru'}
                  </p>
                  <p className="text-sm text-slate-500">
                    Podporované formáty: XLS, XLSX
                  </p>
                </div>
              </label>
            </div>

            {importing && (
              <div className="flex items-center justify-center gap-3 p-4 bg-slate-50 rounded-lg">
                <div className="w-6 h-6 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-700 font-medium">Zpracovávám soubor...</p>
              </div>
            )}

            {importResult && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">✅ Import dokončen!</h4>
                <div className="text-sm text-green-800 space-y-1">
                  <p>✨ <strong>Nově přidáno:</strong> {importResult.imported} vozidel</p>
                  <p>🔄 <strong>Aktualizováno:</strong> {importResult.updated} vozidel</p>
                  {importResult.errors > 0 && (
                    <p className="text-red-700">⚠️ <strong>Chyby:</strong> {importResult.errors} záznamů</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-end">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsImportDialogOpen(false);
                setImportResult(null);
              }}
            >
              {importResult ? 'Zavřít' : 'Zrušit'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
