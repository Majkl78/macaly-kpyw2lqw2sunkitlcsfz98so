import type { Metadata } from 'next';
import { Suspense } from 'react';
import NewOrderContent from '@/components/new-order-content';

export const metadata: Metadata = {
  title: "Nová zakázka - Správa zakázek",
  description: "Vytvořit novou zakázku",
};

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600">Načítám formulář...</p>
      </div>
    </div>
  );
}

export default function NewOrderPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <NewOrderContent />
    </Suspense>
  );
}
