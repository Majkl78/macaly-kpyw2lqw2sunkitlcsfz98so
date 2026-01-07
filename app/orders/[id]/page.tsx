import type { Metadata } from 'next';
import OrderDetailContent from "@/components/order-detail-content.tsx";
export default function OrderDetailPage({ params }: { params: { id: string } }) {
  return (
    <div style={{ padding: 40, color: "red", fontSize: 30 }}>
      DEBUG PAGE: {params.id}
    </div>
  );
}



export const metadata: Metadata = {
  title: "Detail zakázky - Správa zakázek",
  description: "Detail zakázky a její úprava",
};

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  return <OrderDetailContent orderId={params.id} />;
}

