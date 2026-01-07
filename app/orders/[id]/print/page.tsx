import PrintOrderContent from "@/components/print-order-content";

export default function PrintPage({ params }: { params: { id: string } }) {
  return <PrintOrderContent orderId={params.id} />;
}
