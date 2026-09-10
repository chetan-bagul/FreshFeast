import { useGetMyOrdersQuery, useCancelOrderMutation } from "./userApi";
import OrderStatusBadge from "../../components/OrderStatusBadge";

export default function OrderHistory() {
  const { data, isLoading } = useGetMyOrdersQuery();
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();

  const handleCancel = async (orderId) => {
    try {
      await cancelOrder({ orderId, reason: "Changed my mind" }).unwrap();
    } catch (err) {
      // RTK Query surfaces this in `error` per-mutation if you want a toast here
    }
  };

  if (isLoading) return <p className="max-w-3xl mx-auto px-4 py-8 text-gray-500">Loading orders...</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Orders</h1>

      {data?.orders.length === 0 && <p className="text-gray-500">No orders yet.</p>}

      <div className="space-y-4">
        {data?.orders.map((order) => (
          <div key={order._id} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-gray-800">{order.kitchen?.name}</p>
                <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>

            <div className="mt-3 text-sm text-gray-600">
              {order.items.map((i) => (
                <div key={i.dish} className="flex justify-between">
                  <span>
                    {i.name} × {i.qty}
                  </span>
                  <span>₹{i.price * i.qty}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t">
              <span className="font-semibold text-gray-800">₹{order.totalAmount}</span>
              {["placed", "confirmed"].includes(order.status) && (
                <button
                  onClick={() => handleCancel(order._id)}
                  disabled={isCancelling}
                  className="text-sm text-red-600 hover:underline disabled:opacity-60"
                >
                  Cancel order
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
