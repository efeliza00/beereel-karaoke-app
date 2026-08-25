import BeereelRoom from "@/components/room/beereel-room";

export default async function Page({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  return <BeereelRoom roomId={roomId} />;
}
