import VehicleDetailContent from "@/components/vehicle-detail-content";

export default function VehicleDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <VehicleDetailContent vehicleId={params.id} />;
}
