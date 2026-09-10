import { useGetMyKitchenQuery } from "./kitchenApi";
import KitchenProfile from "./KitchenProfile";

export default function KitchenProfilePage() {
  const { data, isLoading, isError } = useGetMyKitchenQuery();
  if (isLoading) return <p className="max-w-5xl mx-auto px-4 py-8 text-gray-500">Loading kitchen profile...</p>;
  if (isError || !data?.kitchen) return <p className="max-w-5xl mx-auto px-4 py-8 text-red-600">Kitchen profile was not found.</p>;
  return <div className="max-w-5xl mx-auto px-4 py-8"><div className="max-w-2xl mx-auto"><KitchenProfile kitchen={data.kitchen} /></div></div>;
}
