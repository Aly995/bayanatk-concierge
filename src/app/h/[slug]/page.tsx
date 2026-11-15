import { notFound } from "next/navigation";
import { GuestChat } from "@/components/GuestChat";
import { getStore } from "@/lib/store";

export default async function GuestChatPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const hotel = await getStore().getHotelBySlug(slug);
  if (!hotel) notFound();
  return <GuestChat slug={hotel.slug} name={hotel.name} nameAr={hotel.nameAr} />;
}
