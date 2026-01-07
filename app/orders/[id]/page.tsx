import type { Metadata } from 'next';
import OrderDetailContent from '@/components/order-detail-content';

export const metadata: Metadata = {
  title: "Detail zakázky - Správa zakázek",
  description: "Detail zakázky a její úprava",
};

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <OrderDetailContent params={params} />;
}
