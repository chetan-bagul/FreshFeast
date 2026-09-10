import { useEffect, useState } from "react";
import { useUpdateKitchenMutation } from "./kitchenApi";

export default function KitchenProfile({ kitchen }) {
  const [form, setForm] = useState({ name: "", description: "", address: "", city: "", pincode: "", coverImageUrl: "", isOpen: true });
  const [message, setMessage] = useState("");
  const [updateKitchen, { isLoading }] = useUpdateKitchenMutation();
  useEffect(() => {
    setForm({
      name: kitchen.name || "", description: kitchen.description || "", address: kitchen.location?.address || "", city: kitchen.location?.city || "", pincode: kitchen.location?.pincode || "", coverImageUrl: kitchen.coverImageUrl || "", isOpen: kitchen.isOpen,
    });
  }, [kitchen]);
  const update = (event) => {
    const { name, value, checked, type } = event.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : name === "pincode" ? value.replace(/\D/g, "").slice(0, 6) : value });
  };
  const submit = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      await updateKitchen({ kitchenId: kitchen._id, name: form.name, description: form.description, coverImageUrl: form.coverImageUrl, isOpen: form.isOpen, location: { address: form.address, city: form.city, pincode: form.pincode } }).unwrap();
      setMessage("Kitchen profile updated.");
    } catch (error) { setMessage(error.data?.message || error.error || "Could not update kitchen profile."); }
  };
  return <section className="max-w-2xl bg-white rounded-xl border border-gray-100 p-5"><h2 className="text-lg font-semibold text-gray-800">Kitchen profile</h2><p className="text-sm text-gray-500 mt-1 mb-5">Control the information customers see and whether your kitchen is accepting orders.</p><form onSubmit={submit} className="grid sm:grid-cols-2 gap-4"><input name="name" value={form.name} onChange={update} placeholder="Kitchen name" required className="sm:col-span-2 border border-gray-300 rounded-md px-3 py-2" /><textarea name="description" value={form.description} onChange={update} placeholder="Kitchen description" rows="3" className="sm:col-span-2 border border-gray-300 rounded-md px-3 py-2" /><input name="address" value={form.address} onChange={update} placeholder="Address" required className="border border-gray-300 rounded-md px-3 py-2" /><input name="city" value={form.city} onChange={update} placeholder="City" required className="border border-gray-300 rounded-md px-3 py-2" /><input name="pincode" value={form.pincode} onChange={update} placeholder="6-digit delivery pincode" inputMode="numeric" pattern="\d{6}" required className="border border-gray-300 rounded-md px-3 py-2" /><input name="coverImageUrl" type="url" value={form.coverImageUrl} onChange={update} placeholder="Cover image URL (optional)" className="border border-gray-300 rounded-md px-3 py-2" /><label className="sm:col-span-2 flex items-center gap-2 text-sm text-gray-700"><input name="isOpen" type="checkbox" checked={form.isOpen} onChange={update} /> Kitchen is open and accepting orders</label>{message && <p className={`sm:col-span-2 text-sm ${message.includes("updated") ? "text-green-700" : "text-red-600"}`}>{message}</p>}<button disabled={isLoading} className="sm:col-span-2 bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-md font-medium disabled:opacity-60">{isLoading ? "Saving..." : "Save kitchen profile"}</button></form></section>;
}
