import { useGetAvailableTasksQuery, useClaimTaskMutation, useGetMyTasksQuery, useUpdateTaskStatusMutation, useGetMyEarningsQuery } from "./deliveryApi";

const NEXT_STATUS = { assigned: "picked_up", picked_up: "in_transit", in_transit: "delivered" };
const money = (amount) => `Rs. ${amount || 0}`;
function EarningsCard({ label, value }) {
  return <div className="rounded-xl border border-gray-100 bg-white p-3"><p className="text-xs text-gray-500">{label}</p><p className="mt-1 text-lg font-bold text-brand-700">{money(value?.amount)}</p><p className="text-xs text-gray-400">{value?.count || 0} orders</p></div>;
}

export default function TaskList() {
  const { data: available, isLoading: loadingAvailable } = useGetAvailableTasksQuery();
  const { data: active, isLoading: loadingActive } = useGetMyTasksQuery();
  const { data: earnings } = useGetMyEarningsQuery();
  const [claimTask, { isLoading: isClaiming }] = useClaimTaskMutation();
  const [updateStatus, { isLoading: isUpdating }] = useUpdateTaskStatusMutation();
  if (loadingAvailable || loadingActive) return <p className="max-w-3xl mx-auto px-4 py-8 text-gray-500">Loading deliveries...</p>;

  return <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
    <section><h1 className="text-2xl font-bold text-gray-800">Delivery Partner Dashboard</h1><p className="mt-1 text-sm text-gray-500">The Rs. 20 delivery earning is recorded when you accept a ready pickup.</p><div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4"><EarningsCard label="All time" value={{ amount: earnings?.totalEarnings, count: earnings?.deliveryCount }} /><EarningsCard label="Today" value={earnings?.today} /><EarningsCard label="This week" value={earnings?.week} /><EarningsCard label="This month" value={earnings?.month} /></div></section>
    <section><h2 className="text-xl font-bold text-gray-800 mb-3">Available pickups</h2>{available?.orders.length === 0 && <p className="text-gray-500">No kitchen orders are ready for pickup.</p>}<div className="space-y-3">{available?.orders.map((order) => <div key={order._id} className="bg-white rounded-xl border border-gray-100 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-medium text-gray-800">{order.kitchen?.name}</p><p className="text-sm text-gray-500">Pickup: {order.kitchen?.location?.line1 || order.kitchen?.location?.city || "Kitchen location"}</p></div><span className="font-semibold text-brand-700">Earn {money(order.deliveryCharge)}</span></div><p className="text-sm text-gray-600 mt-2">Deliver to: {order.deliveryAddress?.line1}, {order.deliveryAddress?.city} - {order.deliveryAddress?.pincode}</p><button onClick={() => claimTask(order._id)} disabled={isClaiming} className="mt-3 text-sm bg-brand-600 hover:bg-brand-700 text-white px-3 py-1.5 rounded-md disabled:opacity-60">Accept pickup</button></div>)}</div></section>
    <section><h2 className="text-xl font-bold text-gray-800 mb-3">My active deliveries</h2>{active?.tasks.length === 0 && <p className="text-gray-500">You have no active deliveries.</p>}<div className="space-y-3">{active?.tasks.map((task) => { const nextStatus = NEXT_STATUS[task.status]; return <div key={task._id} className="bg-white rounded-xl border border-gray-100 p-4"><p className="font-medium text-gray-800">{task.order?.kitchen?.name}</p><p className="text-sm text-gray-500">Deliver to: {task.order?.deliveryAddress?.line1}, {task.order?.deliveryAddress?.city}</p><p className="mt-2 text-xs capitalize text-gray-400">Status: {task.status.replaceAll("_", " ")} · Earning: {money(task.earnings)}</p>{nextStatus && <button onClick={() => updateStatus({ taskId: task._id, status: nextStatus })} disabled={isUpdating} className="mt-3 text-sm bg-brand-600 hover:bg-brand-700 text-white px-3 py-1.5 rounded-md disabled:opacity-60">Mark as {nextStatus.replaceAll("_", " ")}</button>}</div>; })}</div></section>
    <section><h2 className="text-xl font-bold text-gray-800 mb-3">Order-wise earnings</h2><div className="space-y-2">{earnings?.orderEarnings?.map((task) => <div key={task._id} className="flex justify-between rounded-lg bg-white border border-gray-100 px-4 py-3 text-sm"><span>{task.order?.kitchen?.name || "Order"}<span className="block text-xs text-gray-400">{new Date(task.createdAt).toLocaleString()}</span></span><span className="font-semibold text-brand-700">{money(task.earnings)}</span></div>)}</div></section>
  </div>;
}
