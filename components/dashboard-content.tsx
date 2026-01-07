"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { 
  ClipboardList, 
  Car, 
  AlertTriangle, 
  CheckCircle2,
  TrendingUp,
  Package
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardContent() {
  const stats = useQuery(api.orders.getOrderStats);
  const recentOrders = useQuery(api.orders.getOrders, { });

  if (stats === undefined || recentOrders === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Načítám data...</p>
        </div>
      </div>
    );
  }

  const recentOverdue = recentOrders.filter(o => o.overdue?.toLowerCase() === 'ano').slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Správa zakázek</h1>
              <p className="text-slate-600 mt-1">Systém pro správu autoservisních zakázek a vozidel</p>
            </div>
            <Link 
              href="/orders/new"
              className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg"
            >
              + Nová zakázka
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/orders">
            <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Všechny zakázky
                </CardTitle>
                <ClipboardList className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
                <p className="text-xs text-slate-500 mt-2">Celkem zakázek v systému</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/orders?overdue=true">
            <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-red-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Po termínu
                </CardTitle>
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{stats.overdue}</div>
                <p className="text-xs text-slate-500 mt-2">Vyžaduje okamžitou pozornost</p>
              </CardContent>
            </Card>
          </Link>

          <Card className="hover:shadow-lg transition-all border-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Potvrzené
              </CardTitle>
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.confirmed}</div>
              <p className="text-xs text-slate-500 mt-2">Potvrzené zakázky</p>
            </CardContent>
          </Card>

          <Link href="/vehicles">
            <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Pick-up služba
                </CardTitle>
                <Package className="h-5 w-5 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">{stats.pickUpOrders}</div>
                <p className="text-xs text-slate-500 mt-2">Zakázky s pick-up službou</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Rychlé akce
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link 
                href="/orders" 
                className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <span className="font-medium text-slate-700">Zobrazit všechny zakázky</span>
                <span className="text-blue-600">→</span>
              </Link>
              <Link 
                href="/orders/new" 
                className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <span className="font-medium text-slate-700">Vytvořit novou zakázku</span>
                <span className="text-green-600">+</span>
              </Link>
              <Link 
                href="/vehicles" 
                className="flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <span className="font-medium text-slate-700">Správa vozidel</span>
                <Car className="h-5 w-5 text-purple-600" />
              </Link>
            </CardContent>
          </Card>

          {/* Recent Overdue Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Zakázky po termínu
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentOverdue.length === 0 ? (
                <p className="text-slate-500 text-center py-8">Žádné zakázky po termínu ✓</p>
              ) : (
                <div className="space-y-3">
                  {recentOverdue.map((order) => (
                    <Link 
                      key={order._id}
                      href={`/orders/${order._id}`}
                      className="block p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900">#{order.orderNumber}</p>
                          <p className="text-sm text-slate-600">{order.licencePlate} - {order.company}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-red-600 font-medium">{order.deadline}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
