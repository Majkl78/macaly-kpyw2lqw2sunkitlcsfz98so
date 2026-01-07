import type { Metadata } from 'next';
import OrderDetailContent from "@/components/order-detail-content.tsx";


export const metadata: Metadata = {
  title: "Detail zakázky - Správa zakázek",
  description: "Detail zakázky a její úprava",
};

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  return <OrderDetailContent orderId={params.id} />;
}

