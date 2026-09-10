import { useState } from "react";
import { useGetMyKitchenQuery, useGetKitchenAnalyticsQuery } from "./kitchenApi";
import DishManager from "./DishManager";
import OrderQueue from "./OrderQueue";
import KitchenSetup from "./KitchenSetup";

export default function KitchenDashboard() {
  const [tab, setTab] = useState("orders");
  const { data, isLoading, isError } = useGetMyKitchenQuery();
  const myKitchen = data?.kitchen;

  if (isLoading) return <p className="max-w-5xl mx-auto px-4 py-8 text-gray-500">Loading...</p>;

  if (isError) return <p className="max-w-5xl mx-auto px-4 py-8 text-red-600">Could not load your kitchen.</p>;
  if (!myKitchen) return <KitchenSetup />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">{myKitchen.name}</h1>
      <p className="text-sm text-gray-500 mb-6">Kitchen Dashboard · Delivering to {myKitchen.location?.pincode}</p>

      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {["orders", "dishes", "analytics"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px ${
              tab === t ? "border-brand-600 text-brand-600" : "border-transparent text-gray-500"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "orders" && <OrderQueue kitchenId={myKitchen._id} />}
      {tab === "dishes" && <DishManager kitchenId={myKitchen._id} />}
      {tab === "analytics" && <AnalyticsPanel kitchenId={myKitchen._id} />}
    </div>
  );
}

function AnalyticsPanel({ kitchenId }) {
  const { data, isLoading } = useGetKitchenAnalyticsQuery(kitchenId);
  if (isLoading) return <p className="text-gray-500">Loading analytics...</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <p className="text-sm text-gray-500">Today</p>
        <p className="text-2xl font-bold text-gray-800">₹{data.daily.totalSales}</p>
        <p className="text-xs text-gray-400">{data.daily.orderCount} orders</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <p className="text-sm text-gray-500">This Month</p>
        <p className="text-2xl font-bold text-gray-800">₹{data.monthly.totalSales}</p>
        <p className="text-xs text-gray-400">{data.monthly.orderCount} orders</p>
      </div>
    </div>
  );
}
