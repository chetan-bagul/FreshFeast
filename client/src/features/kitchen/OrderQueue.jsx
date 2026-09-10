import { useState } from "react";
import { useGetKitchenOrdersQuery, useUpdateOrderStatusMutation } from "./kitchenApi";
import OrderStatusBadge from "../../components/OrderStatusBadge";

const NEXT_STATUS = { placed: "confirmed", confirmed: "preparing", preparing: "ready" };

export default function OrderQueue({ kitchenId }) {
  const { data, isLoading } = useGetKitchenOrdersQuery({ kitchenId });
  const [updateStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();
  const [message, setMessage] = useState("");
  if (isLoading) return <p className="text-gray-500">Loading orders...</p>;
  const activeOrders = data?.orders.filter((order) => !["delivered", "cancelled"].includes(order.status));
  const moveOrder = async (orderId, status) => {
    try { await updateStatus({ orderId, status }).unwrap(); setMessage(status === "ready" ? "Order is now visible to delivery partners for pickup." : "Order status updated."); }
    catch (error) { setMessage(error.data?.message || "Could not update order status."); }
  };
  return <div className="space-y-3">
    {message && <p className="text-sm text-brand-700">{message}</p>}
    {activeOrders?.length === 0 && <p className="text-gray-500">No active orders right now.</p>}
    {activeOrders?.map((order) => {
      const nextStatus = NEXT_STATUS[order.status];
      return <div key={order._id} className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-start justify-between mb-2"><div><p className="font-medium text-gray-800">{order.user?.name}</p><p className="text-xs text-gray-400">{order.user?.phone} - {order.deliveryAddress?.pincode}</p></div><OrderStatusBadge status={order.status} /></div>
        <div className="text-sm text-gray-600 mb-3">{order.items.map((item) => <div key={item.dish}>{item.name} x {item.qty}</div>)}</div>
        {nextStatus && <button onClick={() => moveOrder(order._id, nextStatus)} disabled={isUpdating} className="text-sm bg-brand-600 hover:bg-brand-700 text-white px-3 py-1.5 rounded-md disabled:opacity-60">Mark as {nextStatus.replaceAll("_", " ")}</button>}
        {order.status === "ready" && <p className="mt-3 text-sm text-purple-700 bg-purple-50 rounded-md px-3 py-2">Ready for pickup. A delivery partner can accept this order.</p>}
      </div>;
    })}
  </div>;
}
