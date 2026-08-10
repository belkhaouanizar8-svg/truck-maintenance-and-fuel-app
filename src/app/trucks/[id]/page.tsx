import TruckDetailClient from "./TruckDetailClient";

export default async function TruckDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TruckDetailClient truckId={id} />;
}
