import { useState } from "react";
import { useCreateKitchenMutation } from "./kitchenApi";

const EMPTY_FORM = { name: "", description: "", address: "", city: "", pincode: "", coverImageUrl: "" };

export default function KitchenSetup() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [createKitchen, { isLoading, error }] = useCreateKitchenMutation();
  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: name === "pincode" ? value.replace(/\D/g, "").slice(0, 6) : value }));
  };
  const submit = async (event) => {
    event.preventDefault();
    await createKitchen({ name: form.name, description: form.description, coverImageUrl: form.coverImageUrl, location: { address: form.address, city: form.city, pincode: form.pincode } }).unwrap();
  };
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800">Set up your kitchen</h1>
      <p className="text-sm text-gray-500 mt-1 mb-6">Your menu is visible only to customers whose delivery pincode matches your kitchen.</p>
      <form onSubmit={submit} className="bg-white rounded-xl border border-gray-100 p-5 grid sm:grid-cols-2 gap-4">
        <input name="name" value={form.name} onChange={update} placeholder="Kitchen name" required className="sm:col-span-2 border border-gray-300 rounded-md px-3 py-2" />
        <textarea name="description" value={form.description} onChange={update} placeholder="Short description" rows="3" className="sm:col-span-2 border border-gray-300 rounded-md px-3 py-2" />
        <input name="address" value={form.address} onChange={update} placeholder="Kitchen address" required className="border border-gray-300 rounded-md px-3 py-2" />
        <input name="city" value={form.city} onChange={update} placeholder="City" required className="border border-gray-300 rounded-md px-3 py-2" />
        <input name="pincode" value={form.pincode} onChange={update} placeholder="6-digit delivery pincode" inputMode="numeric" pattern="\d{6}" required className="border border-gray-300 rounded-md px-3 py-2" />
        <input name="coverImageUrl" value={form.coverImageUrl} onChange={update} placeholder="Cover image URL (optional)" className="border border-gray-300 rounded-md px-3 py-2" />
        {error && <p className="sm:col-span-2 text-sm text-red-600">{error.data?.message || "Could not create the kitchen"}</p>}
        <button disabled={isLoading} className="sm:col-span-2 bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-md font-medium disabled:opacity-60">{isLoading ? "Creating kitchen..." : "Create kitchen and start adding dishes"}</button>
      </form>
    </div>
  );
}
