"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { ArrowLeft, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ImportDataContent() {
  const [vehiclesFile, setVehiclesFile] = useState<File | null>(null);
  const [ordersFile, setOrdersFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const importVehicles = useMutation(api.importData.importVehicles);
  const importOrders = useMutation(api.importData.importOrders);

  const handleImport = async () => {
    if (!vehiclesFile && !ordersFile) {
      setResult({ type: 'error', message: 'Vyberte alespoň jeden JSON soubor' });
      return;
    }

    setImporting(true);
    setResult(null);

    try {
      let vehiclesCount = 0;
      let ordersCount = 0;

      // Import vozidel
      if (vehiclesFile) {
        const vehiclesText = await vehiclesFile.text();
        const vehiclesData = JSON.parse(vehiclesText);
        
        // Import po dávkách (100 najednou)
        for (let i = 0; i < vehiclesData.length; i += 100) {
          const batch = vehiclesData.slice(i, i + 100);
          const res = await importVehicles({ vehicles: batch });
          vehiclesCount += res.count;
        }
      }

      // Import zakázek
      if (ordersFile) {
        const ordersText = await ordersFile.text();
        const ordersData = JSON.parse(ordersText);
        
        // Import po dávkách (50 najednou)
        for (let i = 0; i < ordersData.length; i += 50) {
          const batch = ordersData.slice(i, i + 50);
          const res = await importOrders({ orders: batch });
          ordersCount += res.count;
        }
      }

      setResult({ 
        type: 'success', 
        message: `Import dokončen! Importováno ${vehiclesCount} vozidel a ${ordersCount} zakázek.` 
      });
      
      // Reset files
      setVehiclesFile(null);
      setOrdersFile(null);
    } catch (error) {
      console.error('Import error:', error);
      setResult({ 
        type: 'error', 
        message: `Chyba při importu: ${error instanceof Error ? error.message : 'Neznámá chyba'}` 
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-slate-600 hover:text-slate-900">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Import dat</h1>
              <p className="text-slate-600 mt-1">Nahrát data z JSON souborů do databáze</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Instructions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Návod k importu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600">
            <p>1. JSON soubory najdete ve složce <code className="bg-slate-100 px-2 py-1 rounded">/tmp/</code></p>
            <p>2. Soubory: <code className="bg-slate-100 px-2 py-1 rounded">vehicles-import.json</code> a <code className="bg-slate-100 px-2 py-1 rounded">orders-import.json</code></p>
            <p>3. Vyberte soubory níže a klikněte na "Importovat data"</p>
            <p className="text-amber-600 font-medium">⚠️ Import může trvat několik minut při velkém množství dat</p>
          </CardContent>
        </Card>

        {/* Upload Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Vozidla (vehicles)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => setVehiclesFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-primary file:text-white
                    hover:file:bg-primary/90"
                />
                {vehiclesFile && (
                  <p className="text-sm text-green-600 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    {vehiclesFile.name}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Zakázky (orders)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => setOrdersFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-primary file:text-white
                    hover:file:bg-primary/90"
                />
                {ordersFile && (
                  <p className="text-sm text-green-600 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    {ordersFile.name}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Import Button */}
        <Button 
          onClick={handleImport}
          disabled={importing || (!vehiclesFile && !ordersFile)}
          className="w-full h-14 text-lg"
        >
          {importing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Importuji data...
            </>
          ) : (
            <>
              <Upload className="h-5 w-5 mr-2" />
              Importovat data
            </>
          )}
        </Button>

        {/* Result Message */}
        {result && (
          <Card className={`mt-6 ${result.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                {result.type === 'success' ? (
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                )}
                <div>
                  <p className={`font-medium ${result.type === 'success' ? 'text-green-900' : 'text-red-900'}`}>
                    {result.message}
                  </p>
                  {result.type === 'success' && (
                    <Link href="/" className="text-sm text-green-700 hover:underline mt-2 inline-block">
                      Přejít na dashboard →
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
