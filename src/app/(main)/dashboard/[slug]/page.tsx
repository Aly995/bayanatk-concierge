import { notFound } from "next/navigation";
import { StaffInbox } from "@/components/StaffInbox";
import { getStore } from "@/lib/store";

export default async function DashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ key?: string }>;
}) {
  const { slug } = await params;
  const { key } = await searchParams;
  const hotel = await getStore().getHotelBySlug(slug);
  if (!hotel) notFound();
  return <StaffInbox slug={hotel.slug} hotelName={hotel.name} hotelNameAr={hotel.nameAr} staffKey={key ?? ""} />;
}
